/**
 * Direct MongoDB Atlas Connection Test
 * 
 * This script bypasses the config system and tests a direct connection to MongoDB Atlas.
 */
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('Testing direct connection to MongoDB Atlas...');
  
  try {
    // Connect directly to MongoDB Atlas
    const uri = 'mongodb+srv://M0tracno:Karan2004@cluster0.r81e4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
    
    // Test creating a collection
    const testCollection = conn.connection.db.collection('connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Created test document');
    
    // Verify document was created
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ Retrieved test document:', doc._id);
    
    // Delete test document
    await testCollection.deleteOne({ _id: doc._id });
    console.log('✅ Deleted test document');
    
    console.log('✅ MongoDB Atlas connection test successful!');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testAtlasConnection();
