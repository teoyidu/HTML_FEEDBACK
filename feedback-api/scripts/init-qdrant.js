// scripts/init-qdrant.js
// Initialize QDrant and seed it with existing positive feedback conversations

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
let qdrantService;

try {
  qdrantService = require('../qdrant-service');
} catch (error) {
  console.error('Failed to load qdrant-service:', error.message);
  console.error('Please make sure qdrant-service.js exists in the project root directory');
  process.exit(1);
}

const BATCH_SIZE = 50;

// MongoDB connection details
const mongoURI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'chatbot_feedback';
const collectionName = process.env.COLLECTION_NAME || 'conversations';

async function initializeQdrantWithExistingData() {
  console.log('Starting QDrant initialization with existing positive feedback...');

  let mongoClient;

  try {
    // Connect to MongoDB
    mongoClient = new MongoClient(mongoURI);
    await mongoClient.connect();
    console.log('Connected to MongoDB');

    const db = mongoClient.db(dbName);
    global.db = db; // Make db available globally for qdrantService

    // Initialize QDrant
    const initialized = await qdrantService.initializeQdrant();
    if (!initialized) {
      throw new Error('Failed to initialize QDrant');
    }

    // Get total count of positive feedback conversations
    const collection = db.collection(collectionName);
    const totalPositive = await collection.countDocuments({ feedback: 'positive' });

    console.log(`Found ${totalPositive} positive feedback conversations to import`);

    if (totalPositive === 0) {
      console.log('No positive feedback found. Nothing to import.');
      return;
    }

    // Process in batches
    let processed = 0;
    let imported = 0;
    let cursor = collection.find({ feedback: 'positive' }).batchSize(BATCH_SIZE);

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      processed++;

      try {
        // Convert MongoDB document to app format
        const conversation = {
          id: doc._id.toString(),
          schema: doc.schema || '',
          question: extractQuestion(doc),
          feedback: doc.feedback,
          conversation: parseMessages(doc.messages),
          timestamp: doc.timestamp || Date.now(),
          type: doc.type || 'Unknown',
          userName: doc.userName || '',
          originalData: doc
        };

        // Save to QDrant
        const success = await qdrantService.savePositiveConversation(conversation);

        if (success) {
          imported++;
        }

        // Log progress
        if (processed % 10 === 0 || processed === totalPositive) {
          console.log(`Progress: ${processed}/${totalPositive} processed, ${imported} imported`);
        }
      } catch (convError) {
        console.error(`Error processing conversation ${doc._id}:`, convError);
      }
    }

    console.log(`Import complete: ${imported}/${totalPositive} conversations imported to QDrant`);

  } catch (error) {
    console.error('Error initializing QDrant with data:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }

    // Exit the process when done
    process.exit(0);
  }
}

/**
 * Helper function to extract question from MongoDB document
 */
function extractQuestion(doc) {
  try {
    if (!doc.messages) return 'No messages';

    const parsedMessages = parseMessages(doc.messages);
    const firstUserMessage = parsedMessages.find(msg => msg.role === 'user');
    return firstUserMessage ? firstUserMessage.message : 'No question found';
  } catch (error) {
    console.error('Error extracting question:', error);
    return 'Error extracting question';
  }
}

/**
 * Helper function to parse messages from MongoDB format
 */
function parseMessages(messagesString) {
  try {
    // Check if messages is already an object/array
    if (typeof messagesString === 'object') {
      return messagesString.map(msg => ({
        role: msg.role || 'unknown',
        message: typeof msg.content === 'object' ?
            JSON.stringify(msg.content) :
            msg.content || 'No content'
      }));
    }

    // If it's not a string, return default message
    if (typeof messagesString !== 'string') {
      console.warn('Messages is not a string:', messagesString);
      return [
        { role: 'user', message: 'Message parsing error' },
        { role: 'assistant', message: 'Unable to parse messages' }
      ];
    }

    // Replace = with : to make it valid JSON-like
    let jsonLikeString = messagesString.replace(/([a-zA-Z]+)=/g, '"$1":');

    // Replace single quotes with double quotes
    jsonLikeString = jsonLikeString.replace(/'/g, '"');

    // Try to parse as JSON first
    try {
      const parsedJson = JSON.parse(jsonLikeString);
      return parsedJson.map(msg => ({
        role: msg.role || 'unknown',
        message: typeof msg.content === 'object' ?
            JSON.stringify(msg.content) :
            msg.content || 'No content'
      }));
    } catch (jsonError) {
      console.warn('Failed to parse as JSON, trying fallback approach');
    }

    // Try fallback parsing logic with regex
    try {
      const matches = messagesString.match(/\{role=(.*?), content=(.*?)\}/g);
      if (matches) {
        return matches.map(match => {
          const roleMatch = match.match(/role=(.*?),/);
          const contentMatch = match.match(/content=(.*?)(\}|$)/);

          return {
            role: roleMatch ? roleMatch[1].trim() : 'unknown',
            message: contentMatch ?
                contentMatch[1].replace(/^\{|\}$/g, '').trim() :
                'Error parsing message'
          };
        });
      }
    } catch (e) {
      console.error("Fallback parsing also failed:", e);
    }

    // Last resort: return default message
    return [
      { role: 'user', message: 'Error parsing message' },
      { role: 'assistant', message: 'Error parsing message' }
    ];
  } catch (error) {
    console.error("Critical error parsing messages:", error);
    return [
      { role: 'user', message: 'Error parsing message' },
      { role: 'assistant', message: 'Error parsing message' }
    ];
  }
}

// Run the initialization
initializeQdrantWithExistingData();