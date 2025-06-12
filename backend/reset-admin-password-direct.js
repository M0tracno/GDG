const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    console.log('\nStarting admin password reset...');
    
    // Generate a new password hash manually
    const password = 'gdc-admin-2023';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log(`Generated new password hash for: ${password}`);
    
    // Find both admin users and update their passwords
    const adminEmails = ['admin@gdc.edu', 'superadmin@gdc.edu'];
    
    for (const email of adminEmails) {
      // Skip the pre-save hook by updating directly in the database
      const result = await Faculty.findOneAndUpdate(
        { email },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin', 
            isAdmin: true 
          } 
        },
        { new: true }
      );
      
      if (result) {
        console.log(`Updated password for ${email}`);
      } else {
        console.log(`Admin ${email} not found, creating...`);
        
        const newAdmin = new Faculty({
          firstName: email === 'admin@gdc.edu' ? 'Admin' : 'Super Admin',
          lastName: 'User',
          email: email,
          password: hashedPassword, // Use our manually hashed password
          employeeId: `ADMIN-${Date.now()}`,
          department: 'Administration',
          title: 'System Administrator',
          isAdmin: true,
          role: 'admin',
          active: true
        });
        
        // Save without letting Mongoose hash the password again
        newAdmin.isNew = true;
        newAdmin.$isNew = false; // This tricks Mongoose to skip some hooks
        
        await Faculty.collection.insertOne(newAdmin);
        console.log(`Created new admin: ${email}`);
      }
    }
    
    // Verify passwords
    console.log('\nVerifying password hashes:');
    
    for (const email of adminEmails) {
      const admin = await Faculty.findOne({ email }).select('+password');
      
      if (admin) {
        console.log(`\n${email}:`);
        console.log(`Password hash: ${admin.password.substring(0, 20)}...`);
        
        // Test password verification
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log(`Password verification: ${isMatch ? '✓ MATCHES' : '✗ No match'}`);
        
        console.log(`\n>>> You can now log in with: ${email} / ${password}`);
      } else {
        console.log(`Admin ${email} not found!`);
      }
    }
    
    console.log('\nAdmin password reset completed!');
    console.log('Please try logging in with the new credentials.');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

resetAdminPassword();
