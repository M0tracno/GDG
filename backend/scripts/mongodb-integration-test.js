/**
 * MongoDB Integration Test Script
 * 
 * This script performs comprehensive testing of the MongoDB implementation,
 * including CRUD operations, relationships, and specific business logic.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/mongodb');
const {
  Faculty,
  Student,
  Course,
  Enrollment,
  Attendance,
  Mark
} = require('../models/mongodb-models');

// Test data
const testData = {
  faculty: {
    firstName: 'Test',
    lastName: 'Professor',
    email: `test.professor.${Date.now()}@example.com`,
    password: 'password123',
    employeeId: `EMP-${Date.now()}`,
    department: 'Computer Science',
    title: 'Associate Professor'
  },
  student: {
    firstName: 'Test',
    lastName: 'Student',
    email: `test.student.${Date.now()}@example.com`,
    password: 'password123',
    studentId: `STU-${Date.now()}`,
    grade: '10th'
  },  course: {
    title: 'Test Course',
    code: `COURSE-${Date.now()}`,
    description: 'Test course description',
    credits: 3,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    faculty: null, // Will be set during test
    maxStudents: 30,
    active: true
  }
};

// Add mark test data
testData.mark = {
    title: 'Midterm Exam',
    description: 'Test exam description',
    date: new Date(),
    type: 'exam',
    score: 85,
    maxScore: 100,
    weight: 30,
    status: 'graded'
};

// Store created document IDs
const ids = {};

/**
 * Run all tests sequentially
 */
async function runTests() {
  try {
    console.log('🔄 Starting MongoDB integration tests...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connection successful');
    
    // Run tests in order
    await testFaculty();
    await testStudent();
    await testCourse();
    await testEnrollment();
    await testAttendance();
    await testMarks();
    await testRelationships();
    
    console.log('✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Tests failed:', error);
  } finally {
    // Cleanup test data and close connection
    await cleanupTestData();
    await mongoose.connection.close();
    console.log('✅ Cleanup complete, connection closed');
  }
}

/**
 * Test Faculty CRUD operations
 */
async function testFaculty() {
  console.log('\n🔄 Testing Faculty operations...');
  
  // Create
  const faculty = await Faculty.create(testData.faculty);
  ids.faculty = faculty._id;
  console.log('✅ Created faculty');
  
  // Read
  const foundFaculty = await Faculty.findById(faculty._id);
  if (!foundFaculty) throw new Error('Failed to retrieve faculty');
  console.log('✅ Retrieved faculty');
  
  // Update
  foundFaculty.title = 'Full Professor';
  await foundFaculty.save();
  const updatedFaculty = await Faculty.findById(faculty._id);
  if (updatedFaculty.title !== 'Full Professor') {
    throw new Error('Faculty update failed');
  }
  console.log('✅ Updated faculty');
  
  // Password verification
  const passwordMatch = await faculty.matchPassword('password123');
  if (!passwordMatch) throw new Error('Password verification failed');
  console.log('✅ Password verification works');
}

/**
 * Test Student CRUD operations
 */
async function testStudent() {
  console.log('\n🔄 Testing Student operations...');
  
  // Create
  const student = await Student.create(testData.student);
  ids.student = student._id;
  console.log('✅ Created student');
  
  // Read
  const foundStudent = await Student.findById(student._id);
  if (!foundStudent) throw new Error('Failed to retrieve student');
  console.log('✅ Retrieved student');
  
  // Update
  foundStudent.grade = '11th';
  await foundStudent.save();
  const updatedStudent = await Student.findById(student._id);
  if (updatedStudent.grade !== '11th') {
    throw new Error('Student update failed');
  }
  console.log('✅ Updated student');
  
  // Virtual field test
  if (foundStudent.fullName !== 'Test Student') {
    throw new Error('Student virtual field failed');
  }
  console.log('✅ Virtual field works');
}

/**
 * Test Course CRUD operations
 */
async function testCourse() {
  console.log('\n🔄 Testing Course operations...');
  
  // Create
  testData.course.faculty = ids.faculty;
  const course = await Course.create(testData.course);
  ids.course = course._id;
  console.log('✅ Created course');
  
  // Read
  const foundCourse = await Course.findById(course._id);
  if (!foundCourse) throw new Error('Failed to retrieve course');
  console.log('✅ Retrieved course');
  
  // Update
  foundCourse.credits = 4;
  await foundCourse.save();
  const updatedCourse = await Course.findById(course._id);
  if (updatedCourse.credits !== 4) {
    throw new Error('Course update failed');
  }
  console.log('✅ Updated course');
  
  // Verify faculty relationship
  if (!foundCourse.faculty.equals(ids.faculty)) {
    throw new Error('Course faculty relationship failed');
  }
  console.log('✅ Course faculty relationship works');
}

/**
 * Test Enrollment operations
 */
async function testEnrollment() {
  console.log('\n🔄 Testing Enrollment operations...');
  
  // Create enrollment
  const enrollment = await Enrollment.create({
    student: ids.student,
    course: ids.course,
    enrollmentDate: new Date(),
    status: 'active'
  });
  
  ids.enrollment = enrollment._id;
  console.log('✅ Created enrollment');
  
  // Read with population
  const foundEnrollment = await Enrollment.findById(enrollment._id)
    .populate('student')
    .populate('course');
    
  if (!foundEnrollment) throw new Error('Failed to retrieve enrollment');
  console.log('✅ Retrieved enrollment with populated references');
  
  // Verify population worked
  if (!foundEnrollment.student || !foundEnrollment.course) {
    throw new Error('Enrollment population failed');
  }
  
  if (foundEnrollment.student.firstName !== 'Test') {
    throw new Error('Student population in enrollment failed');
  }
    if (foundEnrollment.course.title !== 'Test Course') {
    throw new Error('Course population in enrollment failed');
  }
  
  console.log('✅ Enrollment references work correctly');
}

/**
 * Test Attendance operations
 */
async function testAttendance() {
  console.log('\n🔄 Testing Attendance operations...');
  
  // Create attendance
  const attendance = await Attendance.create({
    enrollment: ids.enrollment,
    date: new Date(),
    status: 'present',
    comments: 'Test attendance'
  });
  
  ids.attendance = attendance._id;
  console.log('✅ Created attendance record');
  
  // Read with population
  const foundAttendance = await Attendance.findById(attendance._id)
    .populate({
      path: 'enrollment',
      populate: [
        { path: 'student' },
        { path: 'course' }
      ]
    });
    
  if (!foundAttendance) throw new Error('Failed to retrieve attendance');
  console.log('✅ Retrieved attendance with deep populated references');
  
  // Verify deep population
  if (!foundAttendance.enrollment.student || !foundAttendance.enrollment.course) {
    throw new Error('Attendance deep population failed');
  }
  
  console.log('✅ Attendance deep population works correctly');
}

/**
 * Test Marks operations
 */
async function testMarks() {
  console.log('\n🔄 Testing Marks operations...');
    // Create mark
  const mark = await Mark.create({
    enrollment: ids.enrollment,
    title: 'Test Exam',
    type: 'exam',
    score: 85,
    maxScore: 100,
    weight: 1,
    dueDate: new Date(),
    submissionDate: new Date(),
    feedback: 'Good work!'
  });
  
  ids.mark = mark._id;
  console.log('✅ Created mark record');
  
  // Read with population
  const foundMark = await Mark.findById(mark._id)
    .populate({
      path: 'enrollment',
      populate: [
        { path: 'student' },
        { path: 'course' }
      ]
    });
    
  if (!foundMark) throw new Error('Failed to retrieve mark');
  console.log('✅ Retrieved mark with deep populated references');
  
  // Verify grade calculation (should be in model)
  if (foundMark.percentage !== 85) {
    throw new Error('Mark percentage calculation failed');
  }
  
  console.log('✅ Mark calculations work correctly');
}

/**
 * Test model relationships
 */
async function testRelationships() {
  console.log('\n🔄 Testing model relationships...');
  
  // Test faculty courses
  const faculty = await Faculty.findById(ids.faculty).populate('courses');
  if (!faculty.courses || faculty.courses.length === 0) {
    throw new Error('Faculty courses virtual failed');
  }
  console.log('✅ Faculty courses relationship works');
  
  // Test student enrollments
  const student = await Student.findById(ids.student).populate('enrollments');
  if (!student.enrollments || student.enrollments.length === 0) {
    throw new Error('Student enrollments virtual failed');
  }
  console.log('✅ Student enrollments relationship works');
  
  // Test course enrollments
  const course = await Course.findById(ids.course).populate('enrollments');
  if (!course.enrollments || course.enrollments.length === 0) {
    throw new Error('Course enrollments virtual failed');
  }
  console.log('✅ Course enrollments relationship works');
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('\n🔄 Cleaning up test data...');
  
  // Delete test data in reverse order to handle dependencies
  if (ids.mark) await Mark.findByIdAndDelete(ids.mark);
  if (ids.attendance) await Attendance.findByIdAndDelete(ids.attendance);
  if (ids.enrollment) await Enrollment.findByIdAndDelete(ids.enrollment);
  if (ids.course) await Course.findByIdAndDelete(ids.course);
  if (ids.student) await Student.findByIdAndDelete(ids.student);
  if (ids.faculty) await Faculty.findByIdAndDelete(ids.faculty);
  
  console.log('✅ Test data cleanup complete');
}

// Run the tests
runTests();
