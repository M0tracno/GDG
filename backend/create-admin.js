// Create admin user script
const { Faculty } = require('./models/mongodb-models');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const mongoose = require('mongoose');

async function createAdminUser() {
  try {
    // Log MongoDB URI (with password masked)
    const maskedURI = process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 
      'MONGODB_URI is undefined';
    console.log('Connecting to MongoDB with URI:', maskedURI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
      // Find all admin users
    const existingAdmins = await Faculty.find({ role: 'admin' });
    
    console.log('Existing admin users:', existingAdmins.map(admin => ({
      id: admin._id,
      email: admin.email,
      name: `${admin.firstName} ${admin.lastName}`,
      employeeId: admin.employeeId,
      role: admin.role
    })));
    
    // Check if our specific admin already exists
    const existingAdmin = await Faculty.findOne({ email: 'admin@gdc.edu' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin user details:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        name: `${existingAdmin.firstName} ${existingAdmin.lastName}`,
        employeeId: existingAdmin.employeeId,
        role: existingAdmin.role
      });
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);    const admin = new Faculty({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gdc.edu',
      password: hashedPassword,
      employeeId: `ADMIN${Date.now()}`, // Use timestamp to ensure uniqueness
      department: 'Administration',
      title: 'System Administrator',
      isAdmin: true, // Mark as admin
      active: true
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
