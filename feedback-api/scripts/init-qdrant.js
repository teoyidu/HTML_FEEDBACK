// scripts/init-qdrant.js
// Initialize QDrant and seed it with existing positive feedback conversations

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { QdrantClient } = require('@qdrant/js-client-rest');
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

// QDrant connection details
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION_NAME || 'cypher-query-all-schemas';

// Direct QDrant client for collection operations
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY
});

async function checkAndRebuildCollection() {
  console.log('Checking QDrant collection...');

  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(c => c.name === QDRANT_COLLECTION);

    if (collectionExists) {
      // Check vector size
      const collectionInfo = await qdrantClient.getCollection(QDRANT_COLLECTION);
      const currentVectorSize = collectionInfo.config.params.vectors.size;

      if (currentVectorSize !== qdrantService.VECTOR_SIZE) {
        console.log(`⚠️ Vector size mismatch: Collection has ${currentVectorSize} dimensions, but service expects ${qdrantService.VECTOR_SIZE}`);

        const confirm = process.argv.includes('--force') || await promptUser(
            `Do you want to recreate the collection with ${qdrantService.VECTOR_SIZE} dimensions? All existing vectors will be lost. (y/n): `
        );

        if (confirm) {
          console.log(`Deleting collection ${QDRANT_COLLECTION}...`);
          await qdrantClient.deleteCollection(QDRANT_COLLECTION);
          console.log('Collection deleted successfully');
          return false; // Collection doesn't exist anymore
        } else {
          console.log('Keeping existing collection. Please update the VECTOR_SIZE in qdrant-service.js to match the collection.');
          process.exit(1);
        }
      } else {
        console.log(`✓ Collection exists with correct vector size (${currentVectorSize})`);

        // Ask if user wants to clear and reimport
        const clearAndReimport = process.argv.includes('--reimport') || await promptUser(
            'Do you want to clear the collection and reimport all positive feedback? (y/n): '
        );

        if (clearAndReimport) {
          console.log('Clearing all points from collection...');

          try {
            // Delete all points using a scroll search and batch delete
            let scrollId = null;
            let batchCount = 0;

            do {
              // Get batch of points
              const points = await qdrantClient.scroll(QDRANT_COLLECTION, {
                limit: 100,
                with_payload: false,
                with_vectors: false,
                scroll_id: scrollId
              });

              scrollId = points.next_page_offset;

              if (points.points.length > 0) {
                batchCount++;
                console.log(`Deleting batch ${batchCount} with ${points.points.length} points...`);

                // Delete this batch
                await qdrantClient.delete(QDRANT_COLLECTION, {
                  points: points.points.map(p => p.id)
                });
              }

            } while (scrollId);

            console.log('All points deleted successfully');
          } catch (deleteError) {
            console.error('Error clearing points:', deleteError);
            console.log('Continuing with import anyway...');
          }
        }

        return true; // Collection exists with correct dimensions
      }
    } else {
      console.log(`Collection ${QDRANT_COLLECTION} does not exist, will create it`);
      return false;
    }
  } catch (error) {
    console.error('Error checking collection:', error);
    return false;
  }
}

// Helper function to prompt user
function promptUser(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === 'y' || answer === 'yes');
    });
  });
}

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

    // Check if collection needs to be rebuilt
    const collectionExists = await checkAndRebuildCollection();

    // Initialize QDrant
    if (!collectionExists) {
      const initialized = await qdrantService.initializeQdrant();
      if (!initialized) {
        throw new Error('Failed to initialize QDrant collection');
      }
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
    let errors = 0;
    let cursor = collection.find({ feedback: 'positive' }).batchSize(BATCH_SIZE);

    const startTime = Date.now();
    let lastProgressUpdate = startTime;

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
          hidden: doc.hidden || false,
          originalData: doc
        };

        // Save to QDrant
        const success = await qdrantService.savePositiveConversation(conversation);

        if (success) {
          imported++;
        } else {
          errors++;
        }

        // Log progress every second or every 10 items
        const currentTime = Date.now();
        if (processed % 10 === 0 || currentTime - lastProgressUpdate > 1000) {
          const percent = (processed / totalPositive * 100).toFixed(1);
          const elapsed = (currentTime - startTime) / 1000;
          const rate = processed / elapsed;
          const remaining = (totalPositive - processed) / rate;

          console.log(`Progress: ${processed}/${totalPositive} (${percent}%) processed, ${imported} imported, ${errors} errors | Rate: ${rate.toFixed(1)}/sec | Est. remaining: ${formatTime(remaining)}`);
          lastProgressUpdate = currentTime;
        }
      } catch (convError) {
        errors++;
        console.error(`Error processing conversation ${doc._id}:`, convError);
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\nImport complete: ${imported}/${totalPositive} conversations imported to QDrant (${errors} errors) in ${formatTime(totalTime)}`);

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

// Helper function to format time in minutes and seconds
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
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

// Check for command line flags
if (process.argv.includes('--help')) {
  console.log(`
QDrant Initialization Script
Usage: node init-qdrant.js [options]

Options:
  --force      Skip confirmation prompts and force collection recreation
  --reimport   Clear and reimport all data even if collection exists
  --help       Show this help message
  `);
  process.exit(0);
}

// Run the initialization
initializeQdrantWithExistingData();