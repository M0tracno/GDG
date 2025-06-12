const { Parent, ParentStudentRelation } = require('./models/mongodb-models');

async function checkTestData() {
  try {
    console.log('Checking parent test data...');
    
    const parents = await Parent.find({}, 'parentId phoneNumber firstName lastName');
    console.log('\nAvailable parents:');
    parents.forEach(p => console.log(`- ID: ${p.parentId}, Phone: ${p.phoneNumber}, Name: ${p.firstName} ${p.lastName}`));
    
    const relations = await ParentStudentRelation.find({}).populate('parentId', 'phoneNumber').populate('studentId', 'studentId firstName lastName');
    console.log('\nParent-Student relationships:');
    relations.forEach(r => console.log(`- Parent Phone: ${r.parentId.phoneNumber}, Student ID: ${r.studentId.studentId}, Student: ${r.studentId.firstName} ${r.studentId.lastName}`));
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTestData();
