const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Define super admin details
    const superAdminEmail = 'superadmin@gdc.edu';
    const superAdminPassword = 'superadmin123';

    // Check if the super admin already exists
    const existingAdmin = await Faculty.findOne({ email: superAdminEmail });
    
    if (existingAdmin) {
      console.log('Super admin already exists. Updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(superAdminPassword, salt);
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✓ Super admin ${superAdminEmail} password updated to: ${superAdminPassword}`);
    } else {
      console.log(`Creating new super admin user: ${superAdminEmail}...`);
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(superAdminPassword, salt);
      
      // Generate a unique employee ID
      const employeeId = `SUPER${Date.now().toString().slice(-6)}`;
      
      const newAdmin = new Faculty({
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        password: hashedPassword,
        employeeId: employeeId,
        department: 'Administration',
        title: 'System Administrator',
        isAdmin: true,
        role: 'admin',
        active: true
      });
      
      await newAdmin.save();
      console.log(`✓ New super admin user created with email: ${superAdminEmail} and password: ${superAdminPassword}`);
    }

    console.log('\nSuper Admin credentials:');
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Password: ${superAdminPassword}`);

    // List all admin users
    const allAdmins = await Faculty.find({ isAdmin: true });
    console.log(`\nTotal Admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`\nAdmin ${index + 1}:`);
      console.log(`Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Employee ID: ${admin.employeeId}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin();
