const { connectDB } = require('../config/mongodb');
const { Parent, Student, ParentStudentRelation } = require('../models/mongodb-models');
const mongoose = require('mongoose');

async function createDemoParent() {
  try {
    console.log('🔄 Creating demo parent account...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if demo student exists (we'll use the existing one)
    const student = await Student.findOne().sort({ createdAt: -1 });
    if (!student) {
      console.log('❌ No students found. Please create a student first.');
      process.exit(1);
    }
    console.log(`✅ Found student: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);    // Check if demo parent already exists (by email or phone)
    let existingParent = await Parent.findOne({ 
      $or: [
        { email: 'parent@demo.com' },
        { phoneNumber: '+1234567890' }
      ]
    });
    
    if (existingParent) {
      console.log('⚠️  Demo parent already exists. Updating credentials...');
      
      // Update existing parent
      existingParent.email = 'parent@demo.com';
      existingParent.password = 'parent123';
      existingParent.firstName = 'Demo';
      existingParent.lastName = 'Parent';
      existingParent.isActive = true;
      existingParent.isVerified = true;
      await existingParent.save();
      
      console.log('✅ Demo parent updated successfully!');
      console.log('📧 Email: parent@demo.com');
      console.log('🔐 Password: parent123');
      console.log('📱 Phone: +1234567890');
      
      process.exit(0);
    }    // Create demo parent account
    const demoParent = new Parent({
      parentId: `PAR${Date.now()}`,
      firstName: 'Demo',
      lastName: 'Parent',
      email: 'parent@demo.com',
      password: 'parent123',
      phoneNumber: null, // Don't set phone number to avoid conflicts
      isVerified: true,
      isActive: true,
      relationToStudent: 'Guardian'
    });

    await demoParent.save();
    console.log('✅ Demo parent created successfully!');

    // Create parent-student relationship
    const relationship = new ParentStudentRelation({
      parentId: demoParent._id,
      studentId: student._id,
      relationship: 'Guardian',
      isActive: true
    });

    await relationship.save();
    console.log('✅ Parent-student relationship created!');

    // Display credentials
    console.log('\n🎉 Demo Parent Account Created Successfully!');
    console.log('===========================================');
    console.log('📧 Email: parent@demo.com');
    console.log('🔐 Password: parent123');
    console.log('👨‍👩‍👧‍👦 Linked Student:', `${student.firstName} ${student.lastName} (${student.studentId})`);
    console.log('🔗 Parent ID:', demoParent.parentId);
    console.log('===========================================');
    console.log('\n📱 You can now use these credentials to login at:');
    console.log('🌐 http://localhost:3000/parent-login');

  } catch (error) {
    console.error('❌ Error creating demo parent:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createDemoParent();
