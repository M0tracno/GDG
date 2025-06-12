const { connectDB } = require('./config/mongodb');
const { Faculty } = require('./models/mongodb-models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find the admin user
    const admin = await Faculty.findOne({ email: 'admin@gdc.edu' });
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new Faculty({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gdc.edu',
        password: hashedPassword,
        employeeId: 'ADMIN001',
        department: 'Administration',
        isAdmin: true,
        active: true
      });
      
      await newAdmin.save();
      console.log('✓ Admin user created with password: admin123');
    } else {
      console.log('Admin user found. Updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin.password = hashedPassword;
      await admin.save();
      console.log('✓ Admin password updated to: admin123');
    }

    console.log('Admin credentials:');
    console.log('Email: admin@gdc.edu');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
