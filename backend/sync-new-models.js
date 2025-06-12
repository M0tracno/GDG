const { sequelize } = require('./config/database');
const Parent = require('./models/Parent');
const IdSequence = require('./models/IdSequence');
const ParentStudentRelation = require('./models/ParentStudentRelation');

async function syncNewModels() {
  try {
    console.log('Syncing new models for parent authentication...');
    
    // Sync individual models
    await IdSequence.sync({ alter: true });
    console.log('✅ IdSequence table synced');
    
    await Parent.sync({ alter: true });
    console.log('✅ Parent table synced');
    
    await ParentStudentRelation.sync({ alter: true });
    console.log('✅ ParentStudentRelation table synced');
    
    console.log('🎉 All new models synced successfully!');
    
    // Test the ID generation
    console.log('Testing ID generation...');
    const studentId = await IdSequence.getNextId('STUDENT');
    const employeeId = await IdSequence.getNextId('EMPLOYEE');
    
    console.log(`Generated Student ID: ${studentId}`);
    console.log(`Generated Employee ID: ${employeeId}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('Error syncing models:', error);
    process.exit(1);
  }
}

syncNewModels();
