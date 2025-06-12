const { connectDB } = require('./config/mongodb');
const mongoose = require('mongoose');

async function updateFacultySchema() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Get the Faculty collection directly to bypass schema restrictions
    const db = mongoose.connection.db;
    const facultyCollection = db.collection('faculties');
    
    // Step 1: Check all faculty documents with isAdmin=true
    console.log('Checking admin users...');
    const adminUsers = await facultyCollection.find({ isAdmin: true }).toArray();
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
    });
    
    // Step 2: Update admin users with the role field explicitly
    if (adminUsers.length > 0) {
      console.log('\nUpdating admin users with role field...');
      const updateResult = await facultyCollection.updateMany(
        { isAdmin: true },
        { $set: { role: 'admin' } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} admin user documents`);
      
      // Verify the updates
      const verifyAdmins = await facultyCollection.find({ isAdmin: true }).toArray();
      
      console.log('\nVerification of updated admin users:');
      verifyAdmins.forEach(admin => {
        console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
      });
    }
    
    console.log('\nSchema update complete');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

updateFacultySchema();
