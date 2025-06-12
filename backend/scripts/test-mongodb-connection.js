/**
 * Test MongoDB Connection
 * 
 * This script tests the MongoDB connection and performs basic CRUD operations
 * to verify that the MongoDB setup is working correctly.
 */
const mongoose = require('mongoose');
const config = require('../config/config');
const { connectDB } = require('../config/mongodb');
const { Faculty } = require('../models/mongodb-models');

async function testMongoDBSetup() {
  console.log('Testing MongoDB Setup...');
  console.log('Using MongoDB URI:', config.db.uri.replace(/(mongodb\+srv:\/\/[^:]+):[^@]+(@.+)/, '$1:****$2'));
  
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connection successful');
    
    // Test creating a faculty document
    const testFaculty = await Faculty.create({
      firstName: 'Test',
      lastName: 'Faculty',
      email: 'test-faculty-' + Date.now() + '@example.com',
      password: 'testpassword',
      employeeId: 'TEST-' + Date.now(),
      department: 'Testing'
    });
    
    console.log('✅ Created test faculty:', testFaculty._id);
    
    // Test reading faculty document
    const foundFaculty = await Faculty.findById(testFaculty._id);
    console.log('✅ Retrieved faculty by ID:', foundFaculty._id);
    
    // Test updating faculty document
    foundFaculty.title = 'Test Professor';
    await foundFaculty.save();
    console.log('✅ Updated faculty title to:', foundFaculty.title);
    
    // Test deleting faculty document
    await Faculty.findByIdAndDelete(foundFaculty._id);
    console.log('✅ Deleted test faculty');
    
    // Verify deletion
    const deleted = await Faculty.findById(foundFaculty._id);
    if (!deleted) {
      console.log('✅ Verified deletion successful');
    } else {
      console.error('❌ Deletion verification failed');
    }
    
    console.log('\n✅ MongoDB setup verification completed successfully!');
  } catch (error) {
    console.error('\n❌ MongoDB setup verification failed:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
testMongoDBSetup();
