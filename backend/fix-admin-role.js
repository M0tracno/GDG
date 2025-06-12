const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const mongoose = require('mongoose');

async function fixAdminRoles() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Update all admin users directly with updateMany
    const result = await Faculty.updateMany(
      { isAdmin: true }, 
      { $set: { role: 'admin' } }
    );
    
    console.log(`Updated ${result.nModified || result.modifiedCount} admin users`);

    // Verify the updates
    const updatedAdmins = await Faculty.find({ isAdmin: true });
    
    console.log('\nVerification of updated admin users:');
    updatedAdmins.forEach(admin => {
      console.log(`- ${admin.email}: role = ${admin.role}, isAdmin = ${admin.isAdmin}`);
    });

    console.log('\nAll admin users have been updated with role field');
    
    // Wait a moment before exiting to ensure changes are saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdminRoles();
