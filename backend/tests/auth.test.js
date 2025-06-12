const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

// Flag to track if MongoDB connection is successful
let isMongoConnected = false;

// Before all tests
beforeAll(async () => {
  // Try to connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    
    // Clear test collections
    await Faculty.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Student.deleteMany({ email: { $regex: /@test\.com$/ } });
  } catch (err) {
    console.log('MongoDB connection failed, tests will be skipped:', err.message);
    isMongoConnected = false;
  }
}, 5000);

// After all tests
afterAll(async () => {
  if (isMongoConnected) {
    // Clean up test data
    await Faculty.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Student.deleteMany({ email: { $regex: /@test\.com$/ } });
    
    // Close database connection
    await mongoose.connection.close();
  }
}, 5000);

describe('Authentication API', () => {
  // Test data
  const testFaculty = {
    email: 'faculty@test.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Faculty',
    employeeId: 'EMP12345',
    department: 'Computer Science'
  };
  
  const testStudent = {
    email: 'student@test.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Student',
    rollNumber: 'R12345',
    classId: 'Class10',
    section: 'A'
  };
  
  let facultyToken;
  let studentToken;

  // Skip tests if MongoDB is not connected
  beforeEach(() => {
    if (!isMongoConnected) {
      console.log('Skipping test due to MongoDB connection failure');
      return test.skip();
    }
  });

  // Test faculty registration
  test('Should register a new faculty', async () => {
    const res = await request(app)
      .post('/api/auth/register/faculty')
      .send(testFaculty);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testFaculty.email);
    
    facultyToken = res.body.token;
  });

  // Test student registration
  test('Should register a new student', async () => {
    const res = await request(app)
      .post('/api/auth/register/student')
      .send(testStudent);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testStudent.email);
    
    studentToken = res.body.token;
  });

  // Test duplicate email registration failure
  test('Should not register faculty with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register/faculty')
      .send(testFaculty);
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  // Test login with faculty credentials
  test('Should login with faculty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testFaculty.email,
        password: testFaculty.password
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testFaculty.email);
  });

  // Test login with student credentials
  test('Should login with student credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: testStudent.password
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testStudent.email);
  });

  // Test login with invalid credentials
  test('Should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testFaculty.email,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });

  // Test login with non-existent email
  test('Should not login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
  });
}); 