/**
 * Quick MongoDB Test
 * This script tests the MongoDB connection and does a simple CRUD operation,
 * with simplified error handling and console output.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables directly
dotenv.config({
  path: path.join(__dirname, '..', '.env')
});

const MONGODB_URI = process.env.MONGODB_URI;

async function quickTest() {
  console.log('Starting quick MongoDB connection test...');
  console.log(`Connection string: ${MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+):[^@]+(@.+)/, '$1:****$2')}`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Create a test collection
    const collection = mongoose.connection.collection('test_collection');
    
    // Insert a document
    const result = await collection.insertOne({
      test: true,
      name: 'Test Document',
      createdAt: new Date()
    });
    console.log(`Inserted document with ID: ${result.insertedId}`);
    
    // Find the document
    const foundDoc = await collection.findOne({ _id: result.insertedId });
    console.log(`Found document: ${JSON.stringify(foundDoc)}`);
    
    // Delete the document
    await collection.deleteOne({ _id: result.insertedId });
    console.log(`Deleted test document`);
    
    console.log('MongoDB test completed successfully!');
  } catch (error) {
    console.error('MongoDB test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

// Run the test
quickTest();
