/**
 * Test script to check if students exist and create test data if needed
 */

const mongoose = require('mongoose');
const config = require('./config/config');

// Import MongoDB models
const { Student, Parent, ParentStudentRelation } = require('./models/mongodb-models');

async function checkAndCreateTestData() {
  try {    // Connect to MongoDB
    await mongoose.connect(config.db.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if any students exist
    const studentCount = await Student.countDocuments();
    console.log(`Found ${studentCount} students in database`);

    if (studentCount === 0) {
      console.log('No students found. Creating test student...');
      
      // Create a test student
      const testStudent = await Student.create({
        studentId: 'STU2025001',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        password: 'password123', // In real scenario, this would be hashed
        dateOfBirth: new Date('2005-01-15'),
        gender: 'Male',
        classId: 'Grade 10',
        section: 'A',
        rollNumber: 'TES001',
        guardianName: 'Test Parent',
        guardianPhone: '1234567890',
        guardianEmail: 'test.parent@example.com',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      console.log('Created test student:', {
        studentId: testStudent.studentId,
        name: `${testStudent.firstName} ${testStudent.lastName}`,
        email: testStudent.email
      });
    } else {
      // Display existing students
      const students = await Student.find({}, 'studentId firstName lastName email').limit(5);
      console.log('Existing students:');
      students.forEach(student => {
        console.log(`- ${student.studentId}: ${student.firstName} ${student.lastName} (${student.email})`);
      });
    }

    // Check parent-student relations
    const relationCount = await ParentStudentRelation.countDocuments();
    console.log(`Found ${relationCount} parent-student relations`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndCreateTestData();
