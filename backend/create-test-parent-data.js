/**
 * Create Test Parent-Student Data
 * This script creates test data for parent-student relationships and sample grades
 */

const { sequelize } = require('./config/database');
const { Parent, Student, ParentStudentRelation, Grade, IdSequence } = require('./models');

async function createTestData() {
  try {
    console.log('Creating test parent-student data...');

    // Ensure database is synced
    await sequelize.sync();    // Create test students first (sequentially to avoid database locks)
    const student1 = await Student.findOrCreate({
      where: { email: 'student1@test.com' },
      defaults: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'student1@test.com',
        password: 'hashedpassword', // In real app, this would be properly hashed
        studentId: '10001',
        rollNumber: 'ROLL001',
        classId: '10th Grade',
        section: 'A'
      }
    });

    const student2 = await Student.findOrCreate({
      where: { email: 'student2@test.com' },
      defaults: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'student2@test.com',
        password: 'hashedpassword',
        studentId: '10002',
        rollNumber: 'ROLL002',
        classId: '9th Grade',
        section: 'B'
      }
    });

    const testStudents = [student1, student2];

    console.log('Test students created:', testStudents.map(([student]) => `${student.firstName} ${student.lastName} (ID: ${student.studentId})`));    // Create test parents (sequentially to avoid database locks)
    const parent1 = await Parent.findOrCreate({
      where: { phoneNumber: '+1234567890' },
      defaults: {
        parentId: 'PAR001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phoneNumber: '+1234567890',
        email: 'sarah.johnson@email.com',
        relationToStudent: 'Mother',
        isVerified: true
      }
    });

    const parent2 = await Parent.findOrCreate({
      where: { phoneNumber: '+1234567891' },
      defaults: {
        parentId: 'PAR002',
        firstName: 'Mike',
        lastName: 'Smith',
        phoneNumber: '+1234567891',
        email: 'mike.smith@email.com',
        relationToStudent: 'Father',
        isVerified: true
      }
    });

    const testParents = [parent1, parent2];    console.log('Test parents created:', testParents.map(([parent]) => `${parent.firstName} ${parent.lastName} (${parent.phoneNumber})`));

    // Create parent-student relationships (sequentially to avoid database locks)
    const relationship1 = await ParentStudentRelation.findOrCreate({
      where: {
        parentId: testParents[0][0].parentId,
        studentId: testStudents[0][0].studentId
      },
      defaults: {
        parentId: testParents[0][0].parentId,
        studentId: testStudents[0][0].studentId,
        relationship: 'Mother'
      }
    });

    const relationship2 = await ParentStudentRelation.findOrCreate({
      where: {
        parentId: testParents[1][0].parentId,
        studentId: testStudents[1][0].studentId
      },
      defaults: {
        parentId: testParents[1][0].parentId,
        studentId: testStudents[1][0].studentId,
        relationship: 'Father'
      }
    });    // Sarah Johnson is also connected to Bob Smith (blended family scenario)
    const relationship3 = await ParentStudentRelation.findOrCreate({
      where: {
        parentId: testParents[0][0].parentId,
        studentId: testStudents[1][0].studentId
      },
      defaults: {
        parentId: testParents[0][0].parentId,
        studentId: testStudents[1][0].studentId,
        relationship: 'Guardian'
      }
    });

    const relationships = [relationship1, relationship2, relationship3];

    console.log('Parent-student relationships created:', relationships.length);    // Create sample grades for the students
    const sampleGrades = [
      // Alice Johnson's grades
      {
        studentId: testStudents[0][0].id,  // Use database ID, not studentId string
        subject: 'Mathematics',
        assignmentName: 'Algebra Quiz 1',
        score: 85,
        maxScore: 100,
        letterGrade: 'B',
        feedback: 'Good understanding of basic concepts. Work on complex problems.'
      },
      {
        studentId: testStudents[0][0].id,
        subject: 'Science',
        assignmentName: 'Chemistry Lab Report',
        score: 92,
        maxScore: 100,
        letterGrade: 'A-',
        feedback: 'Excellent lab technique and detailed observations.'
      },
      {
        studentId: testStudents[0][0].id,
        subject: 'English',
        assignmentName: 'Essay on Shakespeare',
        score: 88,
        maxScore: 100,
        letterGrade: 'B+',
        feedback: 'Well-structured essay with good analysis.'
      },
      // Bob Smith's grades
      {
        studentId: testStudents[1][0].id,
        subject: 'Mathematics',
        assignmentName: 'Geometry Test',
        score: 78,
        maxScore: 100,
        letterGrade: 'C+',
        feedback: 'Needs improvement in problem-solving strategies.'
      },
      {
        studentId: testStudents[1][0].id,
        subject: 'Science',
        assignmentName: 'Physics Assignment',
        score: 95,
        maxScore: 100,
        letterGrade: 'A',
        feedback: 'Outstanding work! Shows deep understanding of physics concepts.'
      },
      {
        studentId: testStudents[1][0].id,
        subject: 'History',
        assignmentName: 'World War II Project',
        score: 91,
        maxScore: 100,
        letterGrade: 'A-',
        feedback: 'Comprehensive research and excellent presentation.'
      }
    ];

    for (const gradeData of sampleGrades) {
      await Grade.findOrCreate({
        where: {
          studentId: gradeData.studentId,
          subject: gradeData.subject,
          assignmentName: gradeData.assignmentName
        },
        defaults: gradeData
      });
    }

    console.log('Sample grades created:', sampleGrades.length);

    console.log('\n=== TEST DATA SUMMARY ===');
    console.log('Students:');
    testStudents.forEach(([student]) => {
      console.log(`  - ${student.firstName} ${student.lastName} (ID: ${student.studentId}, Email: ${student.email})`);
    });
      console.log('\nParents:');
    testParents.forEach(([parent]) => {
      console.log(`  - ${parent.firstName} ${parent.lastName} (Phone: ${parent.phoneNumber}, Email: ${parent.email})`);
    });

    console.log('\nTest Login Credentials:');
    console.log('Parent 1 (Sarah Johnson):');
    console.log('  Phone: +1234567890');
    console.log('  Student ID: 10001 (for Alice) or 10002 (for Bob)');
    console.log('\nParent 2 (Mike Smith):');
    console.log('  Phone: +1234567891');
    console.log('  Student ID: 10002 (for Bob)');
    
    console.log('\n✅ Test data created successfully!');
    console.log('You can now test the parent authentication and dashboard with the above credentials.');

  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createTestData()
    .then(() => {
      console.log('Test data creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create test data:', error);
      process.exit(1);
    });
}

module.exports = { createTestData };
