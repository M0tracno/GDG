require('dotenv').config({ path: '../.env' }); // Adjust path if your .env is elsewhere
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Faculty = require('../models/mongo/Faculty'); // Assuming admin is a type of Faculty
const { connectDB } = require('../config/mongodb'); // Correctly import connectDB

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'securePassword123'; // This will be hashed
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'User';
const ADMIN_EMPLOYEE_ID = 'ADMIN001';
const ADMIN_DEPARTMENT = 'Administration';

const seedAdminUser = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for seeding...');

    // Check if admin user already exists
    const existingAdmin = await Faculty.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user object
    const adminUser = new Faculty({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: 'admin', // Crucial for admin role
      employeeId: ADMIN_EMPLOYEE_ID,
      department: ADMIN_DEPARTMENT,
      isActive: true, // Assuming new admins should be active
      // Add any other fields required by your Faculty model for an admin
    });

    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log(adminUser);

  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedAdminUser();
