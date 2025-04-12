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
  apiKey: QDRANT_API_KEY
});

/**
 * Initialize QDrant collection for positive feedback
 */
async function initializeQdrant() {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!collectionExists) {
      console.log(`Creating QDrant collection: ${COLLECTION_NAME}`);
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine"
        },
        optimizers_config: {
          default_segment_number: 2
        }
      });
      
      // Create necessary payload indexes for faster filtering
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "schema",
        field_schema: "Keyword"
      });
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "timestamp",
        field_schema: "Integer"
      });
      
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: "conversationId",
        field_schema: "Keyword"
      });
      
      console.log(`QDrant collection ${COLLECTION_NAME} created successfully`);
    } else {
      console.log(`QDrant collection ${COLLECTION_NAME} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing QDrant:', error);
    return false;
  }
}

/**
 * Generate embeddings for a conversation
 * @param {object} conversation - Conversation object
 * @returns {Promise<Float32Array>} - Vector embedding
 */
async function generateEmbedding(conversation) {
  try {
    // For the initial implementation, we'll use a simple method
    // In a production environment, use a proper embedding model
    
    // Extract text content from conversation
    let text = '';
    
    if (Array.isArray(conversation.conversation)) {
      text = conversation.conversation
        .map(msg => `${msg.role}: ${msg.message}`)
        .join('\n');
    } else {
      // Fallback to question if conversation is not available
      text = conversation.question || '';
    }
    
    // Generate a simple hash-based embedding - this is a placeholder
    // In production, use a real embedding model
    const simpleEmbedding = new Array(VECTOR_SIZE).fill(0);
    
    // Create a simple hashing function to generate vector values
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      simpleEmbedding[i % VECTOR_SIZE] += charCode / 255;
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(simpleEmbedding.reduce((sum, val) => sum + val * val, 0));
    return simpleEmbedding.map(val => val / (magnitude || 1));
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Save a positive conversation to QDrant
 * @param {object} conversation - Conversation object to save
 * @returns {Promise<boolean>} - Success status
 */
async function savePositiveConversation(conversation) {
  try {
    // Only save if feedback is positive
    if (conversation.feedback !== 'positive') {
      console.log(`Skipping non-positive conversation: ${conversation.id}`);
      return false;
    }
    
    // Generate embedding for conversation
    const embedding = await generateEmbedding(conversation);
    
    // Prepare payload
    const payload = {
      id: conversation.id,
      schema: conversation.schema || '',
      question: conversation.question || '',
      timestamp: conversation.timestamp || Date.now(),
      userName: conversation.userName || '',
      type: conversation.type || '',
      conversationId: conversation.originalData?.conversationId || '',
      conversation: conversation.conversation || []
    };
    
    // Upsert the point in QDrant
    await qdrantClient.upsert(COLLECTION_NAME, {
      points: [{
        id: conversation.id,
        vector: embedding,
        payload: payload
      }]
    });
    
    console.log(`Saved positive conversation to QDrant: ${conversation.id}`);
    return true;
  } catch (error) {
    console.error('Error saving to QDrant:', error);
    return false;
  }
}

/**
 * Update existing conversation in QDrant (for schema or message updates)
 * @param {string} id - Conversation ID
 * @param {object} updates - Updated fields
 * @returns {Promise<boolean>} - Success status
 */
async function updateConversationInQdrant(id, updates) {
  try {
    // First check if this point exists in QDrant
    const searchResult = await qdrantClient.retrieve(COLLECTION_NAME, {
      ids: [id]
    });
    
    // If point doesn't exist or empty result, no update needed
    if (!searchResult || searchResult.length === 0) {
      console.log(`Conversation ${id} not found in QDrant, no update needed`);
      return false;
    }
    
    // If updating messages, we need to regenerate the embedding
    if (updates.conversation) {
      // Fetch the full conversation from MongoDB to ensure we have all data
      const fullConversation = await getConversationFromMongoDB(id);
      
      if (!fullConversation) {
        console.error(`Failed to fetch full conversation ${id} from MongoDB`);
        return false;
      }
      
      // Only proceed if this is a positive conversation
      if (fullConversation.feedback !== 'positive') {
        console.log(`Conversation ${id} is no longer positive, removing from QDrant`);
        await qdrantClient.delete(COLLECTION_NAME, {
          points: [id]
        });
        return true;
      }
      
      // Update conversation with new messages
      fullConversation.conversation = updates.conversation;
      
      // Generate new embedding
      const newEmbedding = await generateEmbedding(fullConversation);
      
      // Update both vector and payload
      await qdrantClient.upsert(COLLECTION_NAME, {
        points: [{
          id: id,
          vector: newEmbedding,
          payload: {
            ...fullConversation,
            conversation: updates.conversation
          }
        }]
      });
    } else {
      // For schema or other metadata updates, just update the payload
      await qdrantClient.setPayload(COLLECTION_NAME, {
        points: [id],
        payload: updates
      });
    }
    
    console.log(`Updated conversation ${id} in QDrant`);
    return true;
  } catch (error) {
    console.error(`Error updating conversation ${id} in QDrant:`, error);
    return false;
  }
}

/**
 * Remove conversation from QDrant if feedback changes from positive
 * @param {string} id - Conversation ID
 * @param {string} feedback - New feedback status
 * @returns {Promise<boolean>} - Success status
 */
async function handleFeedbackChange(id, feedback) {
  try {
    // If feedback is positive, get the full conversation and save to QDrant
    if (feedback === 'positive') {
      const conversation = await getConversationFromMongoDB(id);
      if (conversation) {
        return await savePositiveConversation(conversation);
      }
      return false;
    }
    
    // If feedback is no longer positive, remove from QDrant
    if (feedback !== 'positive') {
      // Check if point exists in QDrant
      const searchResult = await qdrantClient.retrieve(COLLECTION_NAME, {
        ids: [id]
      });
      
      // If point exists, delete it
      if (searchResult && searchResult.length > 0) {
        await qdrantClient.delete(COLLECTION_NAME, {
          points: [id]
        });
        console.log(`Removed non-positive conversation ${id} from QDrant`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error handling feedback change for ${id}:`, error);
    return false;
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

// Simplified set of functions for the initial integration
// Update the module.exports at the end of the file
module.exports = {
  initializeQdrant,
  savePositiveConversation,
  updateConversationInQdrant,
  handleFeedbackChange,
  searchSimilarConversations,
  saveConversationToQdrant // Add this new function
};