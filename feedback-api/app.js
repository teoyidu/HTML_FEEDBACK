// app.js - Backend API server for AI Chatbot Feedback System
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import QDrant Service (if available, otherwise handle gracefully)
/*let qdrantService;
try {
    qdrantService = require('./qdrant-service');
    console.log('QDrant service loaded successfully');
} catch (error) {
    console.warn('QDrant service not available:', error.message);
    qdrantService = {
        initializeQdrant: async () => false,
        handleFeedbackChange: async () => false,
        updateConversationInQdrant: async () => false
    };
}
*/

// Disable QDrant service temporarily
let qdrantService = {
    initializeQdrant: async () => false,
    handleFeedbackChange: async () => false,
    updateConversationInQdrant: async () => false,
    searchSimilarConversations: async () => []
};
console.log('QDrant service disabled temporarily');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection String
const mongoURI = process.env.MONGODB_URI; // Add to .env file: MONGODB_URI=your_connection_string
const dbName = process.env.DB_NAME || 'chatbot_feedback';
const collectionName = process.env.COLLECTION_NAME || 'conversations';

// Connect to MongoDB
let db;

async function connectToMongo() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect();
        console.log('Connected to MongoDB');

        db = client.db(dbName);

        // Make db available globally for other modules
        global.db = db;

        // Initialize QDrant after MongoDB is connected
        if (qdrantService && typeof qdrantService.initializeQdrant === 'function') {
            await qdrantService.initializeQdrant();
        }

        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
}

// API Routes

// Get all conversations with pagination and filtering
app.get('/api/conversations', async (req, res) => {
    try {
        if (!db) {
            const connected = await connectToMongo();
            if (!connected) {
                return res.status(500).json({ error: 'Database connection failed' });
            }
        }

        const collection = db.collection(collectionName);

        // Pagination parameters
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 100;
        const skip = page * limit;

        // Build filter object for MongoDB query
        const filter = {};

        // Add schema filter
        if (req.query.schema) {
            filter.schema = req.query.schema;
        }

        // Add type filter
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // Add feedback filter
        if (req.query.feedback) {
            filter.feedback = req.query.feedback;
        }

        // Add hidden filter
        if (req.query.hidden !== undefined) {
            filter.hidden = req.query.hidden === 'true';
        }

        // Add search filter - simple text search in messages field
        if (req.query.search) {
            const searchQuery = req.query.search.toLowerCase();
            filter['$or'] = [
                { messages: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        try {
            // Get total count
            const totalCount = await collection.countDocuments(filter);

            // Get paginated data
            const conversations = await collection.find(filter)
                .skip(skip)
                .limit(limit)
                .toArray();

            console.log(`Fetched ${conversations.length} conversations for page ${page}`);

            res.json({
                data: conversations,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            // Fall back to returning an empty array with pagination info
            res.json({
                data: [],
                pagination: {
                    page,
                    limit,
                    totalCount: 0,
                    totalPages: 0
                }
            });
        }
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get a single conversation by ID
app.get('/api/conversations/:id', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const collection = db.collection(collectionName);

        // Handle both string IDs and ObjectId formats
        let conversation;
        try {
            conversation = await collection.findOne({ _id: new ObjectId(req.params.id) });
        } catch (idError) {
            // If not a valid ObjectId, try as a string ID
            conversation = await collection.findOne({ id: req.params.id });
        }

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// Update conversation feedback
app.patch('/api/conversations/:id/feedback', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const { feedback } = req.body;
        const collection = db.collection(collectionName);

        // Try to find the conversation first
        let conversation;
        let queryId;

        try {
            // Try as ObjectId
            queryId = new ObjectId(req.params.id);
            conversation = await collection.findOne({ _id: queryId });
        } catch (idError) {
            // If not a valid ObjectId, try as a string ID
            queryId = req.params.id;
            conversation = await collection.findOne({ id: queryId });
        }

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Now update with the correct ID format
        const updateResult = await collection.updateOne(
            conversation._id ? { _id: conversation._id } : { id: conversation.id },
            { $set: { feedback } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Remove QDrant integration here - don't call handleFeedbackChange

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});
// Update conversation schema
app.patch('/api/conversations/:id/schema', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const { schema } = req.body;
        const collection = db.collection(collectionName);

        // Try to find the conversation first
        let conversation;
        let queryId;

        try {
            // Try as ObjectId
            queryId = new ObjectId(req.params.id);
            conversation = await collection.findOne({ _id: queryId });
        } catch (idError) {
            // If not a valid ObjectId, try as a string ID
            queryId = req.params.id;
            conversation = await collection.findOne({ id: queryId });
        }

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Now update with the correct ID format
        const updateResult = await collection.updateOne(
            conversation._id ? { _id: conversation._id } : { id: conversation.id },
            { $set: { schema } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Update schema in QDrant if it's a positive conversation
        if (conversation.feedback === 'positive') {
            try {
                if (qdrantService && typeof qdrantService.updateConversationInQdrant === 'function') {
                    await qdrantService.updateConversationInQdrant(req.params.id, { schema });
                }
            } catch (qdrantError) {
                console.error('QDrant schema update error:', qdrantError);
                // Don't fail the request if QDrant update fails
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating schema:', error);
        res.status(500).json({ error: 'Failed to update schema' });
    }
});

// Update conversation archived status
app.patch('/api/conversations/:id/archive', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const { hidden } = req.body;
        const collection = db.collection(collectionName);

        // Try to find the conversation first
        let conversation;
        let queryId;

        try {
            // Try as ObjectId
            queryId = new ObjectId(req.params.id);
            conversation = await collection.findOne({ _id: queryId });
        } catch (idError) {
            // If not a valid ObjectId, try as a string ID
            queryId = req.params.id;
            conversation = await collection.findOne({ id: queryId });
        }

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Now update with the correct ID format
        const updateResult = await collection.updateOne(
            conversation._id ? { _id: conversation._id } : { id: conversation.id },
            { $set: { hidden } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Update archive status in QDrant if it's a positive conversation
        if (conversation.feedback === 'positive') {
            try {
                if (qdrantService && typeof qdrantService.updateConversationInQdrant === 'function') {
                    await qdrantService.updateConversationInQdrant(req.params.id, { hidden });
                }
            } catch (qdrantError) {
                console.error('QDrant archive update error:', qdrantError);
                // Don't fail the request if QDrant update fails
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating archive status:', error);
        res.status(500).json({ error: 'Failed to update archive status' });
    }
});

// Update conversation messages
app.patch('/api/conversations/:id/messages', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const { messages } = req.body;
        const collection = db.collection(collectionName);

        // Try to find the conversation first
        let conversation;
        let queryId;

        try {
            // Try as ObjectId
            queryId = new ObjectId(req.params.id);
            conversation = await collection.findOne({ _id: queryId });
        } catch (idError) {
            // If not a valid ObjectId, try as a string ID
            queryId = req.params.id;
            conversation = await collection.findOne({ id: queryId });
        }

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Now update with the correct ID format
        const updateResult = await collection.updateOne(
            conversation._id ? { _id: conversation._id } : { id: conversation.id },
            { $set: { messages } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Update messages in QDrant if it's a positive conversation
        if (conversation.feedback === 'positive') {
            try {
                if (qdrantService && typeof qdrantService.updateConversationInQdrant === 'function') {
                    // Parse the messages string into conversation format
                    const parsedMessages = parseMessages(messages);

                    await qdrantService.updateConversationInQdrant(req.params.id, {
                        conversation: parsedMessages
                    });
                }
            } catch (qdrantError) {
                console.error('QDrant messages update error:', qdrantError);
                // Don't fail the request if QDrant update fails
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating messages:', error);
        res.status(500).json({ error: 'Failed to update messages' });
    }
});

// New endpoint for searching similar conversations (if QDrant is available)
// Enhanced similar-conversations endpoint with better error handling
// Replace the existing endpoint in app.js with this implementation

// New endpoint for searching similar conversations with improved error handling
app.get('/api/similar-conversations', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        // Check if QDrant service is available
        if (!qdrantService || typeof qdrantService.searchSimilarConversations !== 'function') {
            return res.status(501).json({
                error: 'Similar search feature not available',
                details: 'The QDrant service is not properly initialized or the searchSimilarConversations function is missing'
            });
        }

        // Validate required parameters
        const { query, schema, type, limit = 10, hidden } = req.query;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid query parameter',
                details: 'The query parameter is required and must be a non-empty string'
            });
        }

        console.log(`Processing similar-conversations request: query="${query}", schema=${schema}, type=${type}, limit=${limit}, hidden=${hidden}`);

        // Build filters object
        const filters = {};
        if (schema) filters.schema = schema;
        if (type) filters.type = type;
        if (hidden) filters.hidden = hidden === 'true';

        // Add request timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
        });

        // Search for similar conversations with timeout
        const searchPromise = qdrantService.searchSimilarConversations(
            query,
            filters,
            limit ? parseInt(limit) : 10
        );

        // Race between search and timeout
        const results = await Promise.race([searchPromise, timeoutPromise]);

        // Log success
        console.log(`Found ${results.length} similar conversations`);

        // Return the results
        res.json(results);
    } catch (error) {
        console.error('Error searching similar conversations:', error);

        // Specific error handling based on error type
        if (error.message && error.message.includes('dimension')) {
            return res.status(400).json({
                error: 'Vector dimension error',
                details: error.message,
                suggestion: 'Run the init-qdrant.js script to rebuild the collection with the correct vector dimensions'
            });
        }

        if (error.message && error.message.includes('timeout')) {
            return res.status(504).json({
                error: 'Request timeout',
                details: 'The similar conversations search took too long to complete',
                suggestion: 'Try a simpler query or add more specific filters'
            });
        }

        if (error.name === 'AbortError') {
            return res.status(504).json({
                error: 'Request aborted',
                details: 'The request to the vector database was aborted',
                suggestion: 'Check if the QDrant service is responding and try again'
            });
        }

        // Generic error response
        res.status(500).json({
            error: 'Failed to search similar conversations',
            details: error.message || 'Unknown error'
        });
    }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongoConnected: !!db,
        qdrantAvailable: !!qdrantService && typeof qdrantService.initializeQdrant === 'function',
        version: '1.0.0'
    });
});

// Add a new endpoint for manual QDrant additions
app.post('/api/qdrant/add', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        const { id, conversation, cypherQuery } = req.body;

        // Validate input
        if (!id || !conversation || !cypherQuery) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'id, conversation, and cypherQuery are required'
            });
        }

        // Find the conversation in MongoDB to get additional details
        const collection = db.collection(collectionName);
        let mongoConversation;

        try {
            // Try as ObjectId
            try {
                mongoConversation = await collection.findOne({ _id: new ObjectId(id) });
            } catch (idError) {
                // If not a valid ObjectId, try as a string ID
                mongoConversation = await collection.findOne({ id: id });
            }

            if (!mongoConversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Database error', details: dbError.message });
        }

        // Check if QDrant service is available
        if (!qdrantService || typeof qdrantService.saveConversationToQdrant !== 'function') {
            return res.status(501).json({ error: 'QDrant service is not available' });
        }

        // Prepare the conversation data for QDrant
        const qdrantData = {
            id: id,
            schema: mongoConversation.schema || '',
            question: extractQuestion(mongoConversation),
            feedback: 'positive', // Always positive for manual additions
            conversation: parseConversation(conversation),  // Parse the user-provided conversation
            timestamp: mongoConversation.timestamp || Date.now(),
            type: mongoConversation.type || '',
            userName: mongoConversation.userName || '',
            sql_query: cypherQuery // User-provided cypher query
        };

        // Save to QDrant
        const success = await qdrantService.saveConversationToQdrant(qdrantData);

        if (!success) {
            return res.status(500).json({ error: 'Failed to save to QDrant' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to QDrant:', error);
        res.status(500).json({ error: 'Failed to add to QDrant', details: error.message });
    }
});

// Helper function to parse conversation text
function parseConversation(conversationText) {
    // Try to parse the conversation text into a structured format
    try {
        // First try: See if it's already JSON
        try {
            const parsed = JSON.parse(conversationText);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (jsonError) {
            // Not JSON, continue to next approach
        }

        // Simple parsing: Split by newlines and alternate roles
        const lines = conversationText.split('\n').filter(line => line.trim() !== '');
        const conversation = [];
        let currentRole = 'user'; // Start with user

        for (let line of lines) {
            conversation.push({
                role: currentRole,
                content: line.trim()
            });
            // Toggle role for next line
            currentRole = currentRole === 'user' ? 'assistant' : 'user';
        }

        return conversation;
    } catch (error) {
        console.error('Error parsing conversation text:', error);
        return [{
            role: 'user',
            content: 'Error parsing conversation'
        }];
    }
}


// Helper function to parse messages
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

        // Fallback parsing logic with regex
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

// New endpoint to get all QDrant data
app.get('/api/qdrant/data', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        // Check if QDrant service is available
        if (!qdrantService || typeof qdrantService.getAllQdrantData !== 'function') {
            return res.status(501).json({
                error: 'QDrant service not available',
                details: 'The QDrant service is not properly initialized or the getAllQdrantData function is missing'
            });
        }

        // Get query parameters
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const schema = req.query.schema || '';

        // Build filter object
        const filters = {};
        if (schema) filters.schema = schema;

        // Get data from QDrant
        const data = await qdrantService.getAllQdrantData(limit, filters);

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error('Error fetching QDrant data:', error);
        res.status(500).json({
            error: 'Failed to fetch QDrant data',
            details: error.message || 'Unknown error'
        });
    }
});

// Start server
connectToMongo().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});