const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const mongoose = require('mongoose');

async function fixAdminAccounts() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Step 1: Find all admin users
    console.log('Finding admin users...');
    const adminUsers = await Faculty.find({ isAdmin: true });
    
    console.log(`Found ${adminUsers.length} admin users:`);
    for (const admin of adminUsers) {
      console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
      
      // Update the role field for each admin
      admin.role = 'admin';
      await admin.save();
      console.log(`  Updated ${admin.email} with role = admin`);
    }
    
    // Step 2: Find specifically the two known admin users
    const knownAdmins = [
      { email: 'admin@gdc.edu', password: 'admin123' },
      { email: 'superadmin@gdc.edu', password: 'superadmin123' }
    ];
    
    console.log('\nVerifying specific admin accounts:');
    for (const adminData of knownAdmins) {
      const admin = await Faculty.findOne({ email: adminData.email });
      if (admin) {
        console.log(`Found ${admin.email}:`);
        console.log(`  - role = ${admin.role || 'undefined'}`);
        console.log(`  - isAdmin = ${admin.isAdmin}`);
        
        // Ensure the admin has both isAdmin=true and role='admin'
        if (!admin.isAdmin || admin.role !== 'admin') {
          console.log(`  Updating ${admin.email} with isAdmin=true and role=admin`);
          admin.isAdmin = true;
          admin.role = 'admin';
          await admin.save();
        }
      } else {
        console.log(`\nAdmin account ${adminData.email} not found. Creating it...`);
        // Create the admin account if it doesn't exist
        const newAdmin = new Faculty({
          firstName: adminData.email.split('@')[0],
          lastName: 'Admin',
          email: adminData.email,
          password: adminData.password,
          employeeId: `EMP${Date.now()}`,
          department: 'Administration',
          title: 'Administrator',
          isAdmin: true,
          role: 'admin',
          active: true
        });
        
        await newAdmin.save();
        console.log(`Created new admin account: ${adminData.email}`);
      }
    }
    
    // Step 3: Final verification
    console.log('\nFinal verification of admin accounts:');
    const verifiedAdmins = await Faculty.find({ isAdmin: true });
    for (const admin of verifiedAdmins) {
      console.log(`- ${admin.email}: isAdmin = ${admin.isAdmin}, role = ${admin.role || 'undefined'}`);
    }
    
    console.log('\nAdmin accounts have been fixed!');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fixAdminAccounts();
