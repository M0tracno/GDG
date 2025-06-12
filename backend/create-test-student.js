const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import the Student model
const Student = require('./models/mongo/Student');

async function createTestStudent() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if test student already exists
        const existingStudent = await Student.findOne({ email: 'test.student@example.com' });
        if (existingStudent) {
            console.log('Test student already exists, deleting and recreating...');
            await Student.deleteOne({ email: 'test.student@example.com' });
        }        // Hash the password// Create test student (password will be hashed by the model's pre-save hook)
        const testStudent = new Student({
            firstName: 'Test',
            lastName: 'Student',
            email: 'test.student@example.com',
            password: 'password123',
            studentId: 'TEST123',
            grade: '10',
            dateOfBirth: new Date('2008-01-01'),
            parentName: 'Test Parent',
            parentEmail: 'test.parent@example.com',
            parentPhone: '9876543210',
            address: 'Test Address',
            active: true
        });

        const savedStudent = await testStudent.save();
        console.log('Test student created successfully:');
        console.log('Email:', savedStudent.email);
        console.log('Student ID:', savedStudent.studentId);
        console.log('Roll Number:', savedStudent.rollNumber);
        console.log('Role:', savedStudent.role);

        mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error creating test student:', error);
        mongoose.connection.close();
    }
}

createTestStudent();
