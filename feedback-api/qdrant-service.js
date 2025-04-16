// qdrant-service.js - QDrant vector database integration for positive feedback
const { QdrantClient } = require('@qdrant/js-client-rest');
require('dotenv').config();

// Environment variables for QDrant configuration
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'positive_feedback';
const VECTOR_SIZE = 384; // Default for MiniLM model

// Initialize QDrant Client
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  checkCompatibility: false // Disable version compatibility check
});

/**
 * Get all QDrant data
 * @param {number} limit - Max number of results (default: 100)
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} - Array of QDrant records
 */
async function getAllQdrantData(limit = 100, filters = {}) {
  try {
    // Build filter conditions
    let filterConditions = {};

    if (filters.schema) {
      filterConditions.must = filterConditions.must || [];
      filterConditions.must.push({
        key: 'schema',
        match: {
          value: filters.schema
        }
      });
    }

    // Get data from QDrant collection
    const result = await qdrantClient.scroll(COLLECTION_NAME, {
      limit: limit,
      with_payload: true,
      with_vectors: false,
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
    });

    // Transform points to a more convenient format
    return result.points.map(point => ({
      id: point.id,
      ...point.payload
    }));
  } catch (error) {
    console.error('Error fetching data from QDrant:', error);
    return [];
  }
}

/**
 * Search similar conversations in QDrant
 * @param {string} query - Search query
 * @param {object} filters - Optional filters
 * @param {number} limit - Max number of results
 * @returns {Promise<Array>} - Similar conversations
 */
async function searchSimilarConversations(query, filters = {}, limit = 10) {
  try {
    const embedding = await generateEmbedding({question: query});
    
    // Build filter conditions
    let filterConditions = {};
    
    if (filters.schema) {
      filterConditions.must = filterConditions.must || [];
      filterConditions.must.push({
        key: 'schema',
        match: {
          value: filters.schema
        }
      });
    }
    
    if (filters.type) {
      filterConditions.must = filterConditions.must || [];
      filterConditions.must.push({
        key: 'type',
        match: {
          value: filters.type
        }
      });
    }
    
    // Search QDrant
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: limit,
      filter: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
    });
    
    return searchResult.map(result => ({
      id: result.id,
      score: result.score,
      ...result.payload
    }));
  } catch (error) {
    console.error('Error searching similar conversations:', error);
    return [];
  }
}

/**
 * Helper function to get full conversation from MongoDB
 * @param {string} id - Conversation ID
 * @returns {Promise<object>} - Full conversation object
 */
async function getConversationFromMongoDB(id) {
  // This function would need to be implemented based on your MongoDB setup
  // Here's a placeholder implementation assuming you have mongodb client available
  try {
    const { MongoClient, ObjectId } = require('mongodb');
    const db = global.db; // Assuming you store db connection globally
    
    if (!db) {
      throw new Error('MongoDB connection not available');
    }
    
    const collection = db.collection(process.env.COLLECTION_NAME || 'conversations');
    
    // Try to find by ObjectId first, but handle string IDs gracefully
    let conversation;
    try {
      // Try as ObjectId first
      conversation = await collection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      // If that fails, try as string ID
      conversation = await collection.findOne({ id: id });
    }
    
    if (!conversation) {
      return null;
    }
    
    // Convert to app format
    return {
      id: conversation._id.toString(),
      schema: conversation.schema || '',
      question: extractQuestion(conversation),
      feedback: conversation.feedback,
      conversation: parseMessages(conversation.messages),
      timestamp: conversation.timestamp || '',
      type: conversation.type || 'Unknown',
      userName: conversation.userName || '',
      originalData: conversation
    };
  } catch (error) {
    console.error(`Error fetching conversation ${id} from MongoDB:`, error);
    return null;
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
 * This should match your existing parseMessages function
 */
function parseMessages(messagesString) {
  // Copy of your existing parseMessages logic
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
      console.warn('Failed to parse as JSON, trying another approach');
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
/**
 * Save a conversation directly to QDrant with user-provided data
 * @param {object} conversationData - Conversation data to save
 * @returns {Promise<boolean>} - Success status
 */
async function saveConversationToQdrant(conversationData) {
  try {
    // Generate embedding for conversation
    const embedding = await generateEmbedding(conversationData);

    // Prepare payload
    const payload = {
      id: conversationData.id,
      schema: conversationData.schema || '',
      question: conversationData.question || '',
      timestamp: conversationData.timestamp || Date.now(),
      userName: conversationData.userName || '',
      type: conversationData.type || '',
      conversation: conversationData.conversation || [],
      sql_query: conversationData.sql_query || ''
    };

    // Upsert the point in QDrant
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: [{
        id: conversationData.id,
        vector: embedding,
        payload: payload
      }]
    });

    console.log(`Saved conversation to QDrant: ${conversationData.id}`);
    return true;
  } catch (error) {
    console.error('Error saving to QDrant:', error);
    return false;
  }
}


// Add these functions to qdrant-service.js before the module.exports block (around line 221)

/**
 * Initialize QDrant collection
 * @returns {Promise<boolean>} Success status
 */
async function initializeQdrant() {
  try {
    console.log(`Initializing QDrant collection: ${COLLECTION_NAME}`);

    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (collectionExists) {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
      return true;
    }

    // Create collection with specified vector size
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine"
      }
    });

    console.log(`Created QDrant collection: ${COLLECTION_NAME}`);
    return true;
  } catch (error) {
    console.error('Error initializing QDrant:', error);
    return false;
  }
}

/**
 * Generate embedding for text using a simple hashing technique
 * This is a placeholder for a real ML-based embedding function
 * @param {object} data - Data to generate embedding for
 * @returns {Promise<number[]>} - Vector embedding
 */
async function generateEmbedding(data) {
  // This is a placeholder function - in a real application, you would use
  // a proper embedding model like OpenAI's text-embedding API or a local model
  try {
    const text = data.question || data.message || '';
    if (!text) {
      throw new Error('No text provided for embedding');
    }

    // Create a simple deterministic vector from the text
    // NOT FOR PRODUCTION - just a demo implementation
    const vector = new Array(VECTOR_SIZE).fill(0);

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = i % VECTOR_SIZE;
      vector[index] = (vector[index] + (charCode / 255)) % 1; // Normalize to 0-1
    }

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = vector.map(val => val / (magnitude || 1));

    return normalizedVector;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a random vector as fallback
    return Array.from({length: VECTOR_SIZE}, () => Math.random());
  }
}

// Simplified set of functions for the initial integration
// Update the module.exports at the end of the file
module.exports = {
  initializeQdrant,
  searchSimilarConversations,
  saveConversationToQdrant,
  getAllQdrantData, // Add the new function
  VECTOR_SIZE // Export the vector size constant for initialization scripts
};

// Add these functions to qdrant-service.js after the module.exports line

/**
 * Initialize QDrant collection
 * @returns {Promise<boolean>} Success status
 */
async function initializeQdrant() {
  try {
    console.log(`Initializing QDrant collection: ${COLLECTION_NAME}`);

    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (collectionExists) {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
      return true;
    }

    // Create collection with specified vector size
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine"
      }
    });

    console.log(`Created QDrant collection: ${COLLECTION_NAME}`);
    return true;
  } catch (error) {
    console.error('Error initializing QDrant:', error);
    return false;
  }
}

/**
 * Generate embedding for text using a simple hashing technique
 * This is a placeholder for a real ML-based embedding function
 * @param {object} data - Data to generate embedding for
 * @returns {Promise<number[]>} - Vector embedding
 */
async function generateEmbedding(data) {
  // This is a placeholder function - in a real application, you would use
  // a proper embedding model like OpenAI's text-embedding API or a local model
  try {
    const text = data.question || data.message || '';
    if (!text) {
      throw new Error('No text provided for embedding');
    }

    // Create a simple deterministic vector from the text
    // NOT FOR PRODUCTION - just a demo implementation
    const vector = new Array(VECTOR_SIZE).fill(0);

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = i % VECTOR_SIZE;
      vector[index] = (vector[index] + (charCode / 255)) % 1; // Normalize to 0-1
    }

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = vector.map(val => val / (magnitude || 1));

    return normalizedVector;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a random vector as fallback
    return Array.from({length: VECTOR_SIZE}, () => Math.random());
  }
}