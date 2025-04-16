// Save as test-get-data.js
require('dotenv').config();
const qdrantService = require('./qdrant-service');

async function testGetAllQdrantData() {
    try {
        console.log('Testing getAllQdrantData function...');
        const data = await qdrantService.getAllQdrantData(10);
        console.log(`Retrieved ${data.length} records from QDrant`);
        if (data.length > 0) {
            console.log('First record:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No records found in QDrant collection');
        }
    } catch (error) {
        console.error('Error testing getAllQdrantData:', error);
    }
}

testGetAllQdrantData();