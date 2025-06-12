// Script to update admin user
const mongoose = require('mongoose');
require('dotenv').config();
const { Faculty } = require('./models/mongodb-models');

async function updateAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Update the admin user
    const result = await Faculty.updateOne(
      { email: 'admin@gdc.edu' },
      { $set: { isAdmin: true } }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const admin = await Faculty.findOne({ email: 'admin@gdc.edu' });
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Updated admin user:');
    console.log({
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      employeeId: admin.employeeId,
      isAdmin: admin.isAdmin
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateAdminUser();
