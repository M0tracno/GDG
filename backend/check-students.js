const { Student } = require('./models/mongodb-models');

Student.find({}, 'studentId firstName lastName')
  .then(students => {
    console.log('Available students:');
    students.forEach(s => console.log(`- ID: ${s.studentId}, Name: ${s.firstName} ${s.lastName}`));
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
