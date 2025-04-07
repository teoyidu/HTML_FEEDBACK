// app.js - Backend API server for AI Chatbot Feedback System
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import QDrant Service (if available, otherwise handle gracefully)
let qdrantService;
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

        // Handle QDrant integration for feedback changes
        try {
            if (qdrantService && typeof qdrantService.handleFeedbackChange === 'function') {
                await qdrantService.handleFeedbackChange(req.params.id, feedback);
            }
        } catch (qdrantError) {
            console.error('QDrant feedback update error:', qdrantError);
            // Don't fail the request if QDrant update fails
        }

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
app.get('/api/similar-conversations', async (req, res) => {
    try {
        if (!db) await connectToMongo();

        if (!qdrantService || typeof qdrantService.searchSimilarConversations !== 'function') {
            return res.status(501).json({ error: 'Similar search feature not available' });
        }

        const { query, schema, type, limit } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Build filters object
        const filters = {};
        if (schema) filters.schema = schema;
        if (type) filters.type = type;

        // Search for similar conversations
        const results = await qdrantService.searchSimilarConversations(
            query,
            filters,
            limit ? parseInt(limit) : 10
        );

        res.json(results);
    } catch (error) {
        console.error('Error searching similar conversations:', error);
        res.status(500).json({ error: 'Failed to search similar conversations' });
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

// Start server
connectToMongo().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});