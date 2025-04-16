// Save this as debug-qdrant.js in your project directory

require('dotenv').config();
const { QdrantClient } = require('@qdrant/js-client-rest');

// QDrant connection details
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'cypher-query-all-schemas';

console.log('QDrant URL:', QDRANT_URL);
console.log('Collection name:', COLLECTION_NAME);

// Initialize QDrant Client with checkCompatibility set to false
const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
    checkCompatibility: false // Disable version compatibility check
});

async function debugQdrant() {
    console.log('Starting QDrant debug...');

    try {
        // Step 1: List collections
        console.log('\nListing collections...');
        const collections = await qdrantClient.getCollections();
        console.log('Collections:', JSON.stringify(collections, null, 2));

        // Step 2: Get collection info if it exists
        const collectionExists = collections.collections &&
            collections.collections.some(c => c.name === COLLECTION_NAME);
        console.log(`Collection ${COLLECTION_NAME} exists: ${collectionExists}`);

        if (collectionExists) {
            console.log(`\nGetting info for collection: ${COLLECTION_NAME}`);
            const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
            console.log('Collection info:', JSON.stringify(collectionInfo, null, 2));

            // Step 3: Try to fetch some points
            console.log(`\nFetching points from collection: ${COLLECTION_NAME}`);
            try {
                const points = await qdrantClient.scroll(COLLECTION_NAME, {
                    limit: 5,
                    with_payload: true,
                    with_vectors: false
                });
                console.log(`Found ${points.points.length} points`);
                if (points.points.length > 0) {
                    console.log('First point:', JSON.stringify(points.points[0], null, 2));
                } else {
                    console.log('No points found in the collection.');
                }
            } catch (scrollError) {
                console.error('Error scrolling collection:', scrollError);
            }
        }

        console.log('\nQDrant debug completed');
    } catch (error) {
        console.error('QDrant debug error:', error);
    }
}

// Run the debug function
debugQdrant();