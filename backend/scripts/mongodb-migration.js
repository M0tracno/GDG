/**
 * MongoDB Migration Script
 * Transfers data from SQLite to MongoDB
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { sequelize } = require('../config/database');
const { connectDB } = require('../config/mongodb');
const { Faculty, Student, Course } = require('../models/index');
const MongoModels = require('../models/mongodb-models');

async function migrateData() {
  try {
    console.log('🔄 Starting migration from SQLite to MongoDB...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Confirm SQLite connection
    await sequelize.authenticate();
    console.log('✅ Connected to SQLite database');
    
    // Migrate Faculty data
    console.log('🔄 Migrating Faculty data...');
    const sqliteFaculties = await Faculty.findAll();
    
    for (const faculty of sqliteFaculties) {
      await MongoModels.Faculty.create({
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        password: faculty.password, // Already hashed in SQLite
        employeeId: faculty.employeeId,
        department: faculty.department,
        title: faculty.title || 'Instructor',
        phone: faculty.phone,
        bio: faculty.bio,
        avatar: faculty.avatar,
        active: true
      });
    }
    console.log(`✅ Migrated ${sqliteFaculties.length} faculty records`);
    
    // Migrate Student data
    console.log('🔄 Migrating Student data...');
    const sqliteStudents = await Student.findAll();
    
    for (const student of sqliteStudents) {
      await MongoModels.Student.create({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        password: student.password, // Already hashed in SQLite
        studentId: student.studentId,
        grade: student.grade,
        dateOfBirth: student.dateOfBirth,
        parentName: student.parentName,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        address: student.address,
        avatar: student.avatar,
        active: true
      });
    }
    console.log(`✅ Migrated ${sqliteStudents.length} student records`);
    
    // Migrate Course data (this is more complex due to relations)
    console.log('🔄 Migrating Course data...');
    const sqliteCourses = await Course.findAll({ include: ['faculty'] });
    
    for (const course of sqliteCourses) {
      // Find the MongoDB faculty that corresponds to the SQLite faculty
      const faculty = await MongoModels.Faculty.findOne({ 
        employeeId: course.faculty?.employeeId 
      });
      
      if (!faculty) {
        console.warn(`⚠️ Couldn't find MongoDB faculty for course: ${course.title}`);
        continue;
      }
      
      await MongoModels.Course.create({
        title: course.title,
        code: course.code,
        description: course.description,
        faculty: faculty._id,
        startDate: course.startDate,
        endDate: course.endDate,
        credits: course.credits || 3,
        maxStudents: course.maxStudents || 30,
        active: true
      });
    }
    console.log(`✅ Migrated ${sqliteCourses.length} course records`);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Start the migration
migrateData();
