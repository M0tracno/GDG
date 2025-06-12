require('dotenv').config();
const mongoose = require('mongoose');
const { Student, Parent, ParentStudentRelation } = require('./models/mongodb-models');

async function checkTestData() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-lms';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n--- Student Data ---');
    const students = await Student.find({}).select('_id studentId firstName lastName');
    console.log('Students:', students.map(s => ({ id: s._id, studentId: s.studentId, name: `${s.firstName} ${s.lastName}` })));

    console.log('\n--- Parent Data ---');
    const parents = await Parent.find({}).select('_id parentId phoneNumber firstName lastName');
    console.log('Parents:', parents.map(p => ({ id: p._id, parentId: p.parentId, phone: p.phoneNumber, name: `${p.firstName} ${p.lastName}` })));

    console.log('\n--- Parent-Student Relations ---');
    const relations = await ParentStudentRelation.find({}).select('parentId studentId relationship');
    console.log('Relations:', relations.map(r => ({ parentId: r.parentId, studentId: r.studentId, relationship: r.relationship })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTestData();
