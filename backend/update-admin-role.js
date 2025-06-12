const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');

async function updateAdminRoles() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await Faculty.find({ isAdmin: true });
    
    console.log(`Found ${admins.length} admin users`);
    
    for (const admin of admins) {
      console.log(`Updating admin: ${admin.email}`);
      
      // Set the role field to 'admin'
      admin.role = 'admin';
      await admin.save();
      
      console.log(`✓ Updated ${admin.email} with role 'admin'`);
    }

    // Verify the updates
    const updatedAdmins = await Faculty.find({ isAdmin: true });
    
    console.log('\nVerification of updated admin users:');
    updatedAdmins.forEach(admin => {
      console.log(`- ${admin.email}: role = ${admin.role}, isAdmin = ${admin.isAdmin}`);
    });

    console.log('\nAll admin users have been updated with role field');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdminRoles();
