const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const bcrypt = require('bcryptjs');

async function createSecondAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Define new admin details
    const newAdminEmail = 'supervisor@gdc.edu';
    const newAdminPassword = 'supervisor123';

    // Check if the new admin already exists
    const existingAdmin = await Faculty.findOne({ email: newAdminEmail });
    
    if (existingAdmin) {
      console.log('Supervisor admin already exists. Updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newAdminPassword, salt);
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✓ Admin ${newAdminEmail} password updated to: ${newAdminPassword}`);
    } else {
      console.log(`Creating new admin user: ${newAdminEmail}...`);
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newAdminPassword, salt);
      
      // Generate a unique employee ID
      const employeeId = `SUPER${Date.now().toString().slice(-6)}`;
      
      const newAdmin = new Faculty({
        firstName: 'Supervisor',
        lastName: 'Admin',
        email: newAdminEmail,
        password: hashedPassword,
        employeeId: employeeId,
        department: 'Administration',
        title: 'Department Supervisor',
        isAdmin: true,
        active: true
      });
      
      await newAdmin.save();
      console.log(`✓ New admin user created with email: ${newAdminEmail} and password: ${newAdminPassword}`);
    }

    console.log('New Admin credentials:');
    console.log(`Email: ${newAdminEmail}`);
    console.log(`Password: ${newAdminPassword}`);

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

createSecondAdmin();
