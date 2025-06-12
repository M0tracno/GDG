// Script to verify admin user
const mongoose = require('mongoose');
require('dotenv').config();
const { Faculty } = require('./models/mongodb-models');

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const admin = await Faculty.findOne({ email: 'admin@gdc.edu' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    // Display admin details
    console.log('Admin user found:');
    console.log({
      id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      employeeId: admin.employeeId,
      isAdmin: admin.isAdmin,
      active: admin.active,
      passwordLength: admin.password ? admin.password.length : 0
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyAdmin();
