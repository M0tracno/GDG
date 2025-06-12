const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');

async function fixAdminLogin() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Step 1: Find admin accounts
    console.log('\nStep 1: Finding admin accounts...');
    const adminUsers = await Faculty.find({ isAdmin: true });
    
    if (adminUsers.length === 0) {
      console.log('No admin accounts found. Creating default admin account...');
      
      // Create default admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new Faculty({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gdc.edu',
        password: hashedPassword,
        employeeId: `ADMIN${Date.now()}`,
        department: 'Administration',
        title: 'Administrator',
        isAdmin: true,
        role: 'admin',
        active: true
      });
      
      await newAdmin.save();
      console.log('Created default admin account: admin@gdc.edu with password: admin123');
      adminUsers.push(newAdmin);
    }
    
    console.log(`\nFound ${adminUsers.length} admin accounts:`);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
    });

    // Step 2: Update the schema in the database to include role field and set it properly
    console.log('\nStep 2: Updating admin accounts with proper role field...');
    for (const admin of adminUsers) {
      // Update the role field directly
      admin.role = 'admin';
      await admin.save();
      console.log(`Updated ${admin.email} with role = admin`);
    }

    // Step 3: Verify the schema update
    console.log('\nStep 3: Verifying admin accounts...');
    const verifiedAdmins = await Faculty.find({ isAdmin: true });
    
    console.log(`Found ${verifiedAdmins.length} admin accounts after update:`);
    verifiedAdmins.forEach(admin => {
      console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
    });

    // Step 4: Test admin login
    console.log('\nStep 4: Testing admin login API...');
    
    try {
      const baseUrl = 'http://localhost:5000/api/auth';
      
      // Test specific admin accounts
      const adminCredentials = [
        { email: 'admin@gdc.edu', password: 'admin123', role: 'admin' },
        { email: 'superadmin@gdc.edu', password: 'superadmin123', role: 'admin' }
      ];
      
      for (const creds of adminCredentials) {
        try {
          console.log(`\nAttempting login with ${creds.email}...`);
          
          const response = await axios.post(`${baseUrl}/login`, creds);
          
          if (response.data.success) {
            console.log('✓ Login successful!');
            console.log(`User: ${response.data.user.firstName} ${response.data.user.lastName}`);
            console.log(`Role: ${response.data.user.role}`);
            console.log(`Token: ${response.data.token.substring(0, 20)}...`);
          } else {
            console.log('✗ Login failed:', response.data.message);
          }
        } catch (err) {
          console.error('✗ Login API error:', err.response?.data?.message || err.message);
        }
      }
    } catch (err) {
      console.log('Could not test API (server may be down):', err.message);
    }

    console.log('\nAdmin login fix process completed!');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fixAdminLogin();
