/**
 * Create MongoDB Test Data for Parent Authentication System
 * This script creates test data for parent-student relationships and sample grades in MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import MongoDB models
const { 
  Parent, 
  Student, 
  ParentStudentRelation, 
  Grade, 
  IdSequence 
} = require('./models/mongodb-models');

async function connectToMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gdc_learning_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function initializeIdSequences() {
  console.log('Initializing ID sequences...');
  
  // Initialize sequences for different entity types
  const sequences = [
    { sequenceType: 'parent', currentValue: 1000, description: 'Parent ID sequence' },
    { sequenceType: 'student', currentValue: 10000, description: 'Student ID sequence' },
    { sequenceType: 'course', currentValue: 100, description: 'Course ID sequence' }
  ];

  for (const seq of sequences) {
    await IdSequence.findOneAndUpdate(
      { sequenceType: seq.sequenceType },
      seq,
      { upsert: true, new: true }
    );
  }
  
  console.log('ID sequences initialized');
}

async function createTestStudents() {
  console.log('Creating test students...');
  const students = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@school.edu',
      password: '$2a$10$hashedpassword123', // Pre-hashed password
      studentId: '10001',
      grade: '10th Grade',
      dateOfBirth: new Date('2008-05-15'),
      parentName: 'Sarah Johnson',
      parentEmail: 'sarah.johnson@email.com',
      parentPhone: '+1234567890',
      address: '123 Oak Street, City',
      enrollmentDate: new Date('2023-09-01'),
      isActive: true
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@school.edu',
      password: '$2a$10$hashedpassword456', // Pre-hashed password
      studentId: '10002',
      grade: '9th Grade',
      dateOfBirth: new Date('2009-03-22'),
      parentName: 'Michael Smith',
      parentEmail: 'michael.smith@email.com',
      parentPhone: '+1234567891',
      address: '456 Pine Avenue, City',
      enrollmentDate: new Date('2023-09-01'),
      isActive: true
    },
    {
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@school.edu',
      password: '$2a$10$hashedpassword789', // Pre-hashed password
      studentId: '10003',
      grade: '10th Grade',
      dateOfBirth: new Date('2008-08-10'),
      parentName: 'Emma Brown',
      parentEmail: 'emma.brown@email.com',
      parentPhone: '+1234567892',
      address: '789 Elm Drive, City',
      enrollmentDate: new Date('2023-09-01'),
      isActive: true
    },
    {
      firstName: 'Diana',
      lastName: 'Wilson',
      email: 'diana.wilson@school.edu',
      password: '$2a$10$hashedpassword101', // Pre-hashed password
      studentId: '10004',
      grade: '11th Grade',
      dateOfBirth: new Date('2007-12-03'),
      parentName: 'James Wilson',
      parentEmail: 'james.wilson@email.com',
      parentPhone: '+1234567893',
      address: '321 Maple Lane, City',
      enrollmentDate: new Date('2023-09-01'),
      isActive: true
    }
  ];

  const createdStudents = [];
  for (const studentData of students) {
    try {
      const student = new Student(studentData);
      await student.save();
      createdStudents.push(student);
      console.log(`Created student: ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
    } catch (error) {
      console.error(`Error creating student ${studentData.firstName}:`, error.message);
    }
  }

  return createdStudents;
}

async function createTestParents() {
  console.log('Creating test parents...');
  const parents = [
    {
      parentId: 'PAR001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phoneNumber: '+1234567890',
      address: '123 Oak Street, City',
      occupation: 'Engineer',
      relationToStudent: 'Mother',
      isVerified: true,
      isActive: true
    },
    {
      parentId: 'PAR002',
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'michael.smith@email.com',
      phoneNumber: '+1234567891',
      address: '456 Pine Avenue, City',
      occupation: 'Doctor',
      relationToStudent: 'Father',
      isVerified: true,
      isActive: true
    },
    {
      parentId: 'PAR003',
      firstName: 'Emma',
      lastName: 'Brown',
      email: 'emma.brown@email.com',
      phoneNumber: '+1234567892',
      address: '789 Elm Drive, City',
      occupation: 'Teacher',
      relationToStudent: 'Mother',
      isVerified: true,
      isActive: true
    },
    {
      parentId: 'PAR004',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@email.com',
      phoneNumber: '+1234567893',
      address: '321 Maple Lane, City',
      occupation: 'Business Owner',
      relationToStudent: 'Father',
      isVerified: true,
      isActive: true
    }
  ];

  const createdParents = [];
  for (const parentData of parents) {
    try {
      const parent = new Parent(parentData);
      await parent.save();
      createdParents.push(parent);
      console.log(`Created parent: ${parent.firstName} ${parent.lastName} (ID: ${parent.parentId})`);
    } catch (error) {
      console.error(`Error creating parent ${parentData.firstName}:`, error.message);
    }
  }

  return createdParents;
}

async function createParentStudentRelations(parents, students) {
  console.log('Creating parent-student relationships...');
  const relations = [
    // Sarah Johnson -> Alice Johnson
    {
      parentId: parents[0]._id,
      studentId: students[0]._id,
      relationship: 'Mother',
      isPrimary: true
    },
    // Michael Smith -> Bob Smith
    {
      parentId: parents[1]._id,
      studentId: students[1]._id,
      relationship: 'Father',
      isPrimary: true
    },
    // Emma Brown -> Charlie Brown
    {
      parentId: parents[2]._id,
      studentId: students[2]._id,
      relationship: 'Mother',
      isPrimary: true
    },
    // James Wilson -> Diana Wilson
    {
      parentId: parents[3]._id,
      studentId: students[3]._id,
      relationship: 'Father',
      isPrimary: true
    },
    // Sarah Johnson also has another child (Charlie Brown) - step relationship
    {
      parentId: parents[0]._id,
      studentId: students[2]._id,
      relationship: 'Guardian',
      isPrimary: false
    }
  ];

  const createdRelations = [];
  for (const relationData of relations) {
    try {
      const relation = new ParentStudentRelation(relationData);
      await relation.save();
      createdRelations.push(relation);      
      const parent = await Parent.findById(relationData.parentId);
      const student = await Student.findById(relationData.studentId);
      console.log(`Created relationship: ${parent.firstName} ${parent.lastName} -> ${student.firstName} ${student.lastName} (${relationData.relationship})`);
    } catch (error) {
      console.error('Error creating parent-student relation:', error.message);
    }
  }

  return createdRelations;
}

async function createTestGrades(students) {
  console.log('Creating test grades...');

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
  const assessmentTypes = ['Quiz', 'Assignment', 'Midterm', 'Final Exam', 'Project'];

  const allGrades = [];

  for (const student of students) {
    // Create 3-5 grades per subject for each student
    for (const subject of subjects) {
      const numGrades = Math.floor(Math.random() * 3) + 3; // 3-5 grades
      
      for (let i = 0; i < numGrades; i++) {        const gradeData = {
          gradeId: await IdSequence.getNextId('grades'),
          studentId: student._id,
          subject: subject,
          assignmentName: `${assessmentTypes[Math.floor(Math.random() * assessmentTypes.length)]} ${i + 1}`,
          maxScore: 100,
          score: Math.floor(Math.random() * 40) + 60, // 60-100 marks
          gradeDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
          feedback: `Good work on this ${subject.toLowerCase()} assessment. Keep it up!`
        };

        try {
          const grade = new Grade(gradeData);
          await grade.save();
          allGrades.push(grade);
        } catch (error) {
          console.error(`Error creating grade for ${student.firstName}:`, error.message);
        }
      }
    }
    
    console.log(`Created grades for student: ${student.firstName} ${student.lastName}`);
  }

  console.log(`Total grades created: ${allGrades.length}`);
  return allGrades;
}

async function createTestData() {
  try {
    await connectToMongoDB();
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await Promise.all([
      Grade.deleteMany({}),
      ParentStudentRelation.deleteMany({}),
      Parent.deleteMany({}),
      Student.deleteMany({}),
      IdSequence.deleteMany({})
    ]);
    console.log('Existing data cleared');

    // Initialize ID sequences
    await initializeIdSequences();

    // Create test data
    const students = await createTestStudents();
    const parents = await createTestParents();
    const relations = await createParentStudentRelations(parents, students);
    const grades = await createTestGrades(students);

    console.log('\n=== Test Data Creation Summary ===');
    console.log(`Students created: ${students.length}`);
    console.log(`Parents created: ${parents.length}`);
    console.log(`Parent-Student relations created: ${relations.length}`);
    console.log(`Grades created: ${grades.length}`);
    
    console.log('\n=== Test Parent Login Credentials ===');
    parents.forEach(parent => {
      console.log(`Parent: ${parent.firstName} ${parent.lastName}`);
      console.log(`Phone: ${parent.phoneNumber}`);
      console.log(`Use this phone number to request OTP for login\n`);
    });

    console.log('Test data creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
