const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model to track sequential ID generation
const IdSequence = sequelize.define('IdSequence', {
  type: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  lastNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10000, // Start from 10001 for 5-digit IDs
  }
}, {
  tableName: 'id_sequences',
  timestamps: true
});

// Static method to get next sequential ID
IdSequence.getNextId = async function(type) {
  const transaction = await sequelize.transaction();
  
  try {
    const [sequence, created] = await IdSequence.findOrCreate({
      where: { type },
      defaults: { lastNumber: 10000 },
      transaction
    });
    
    const nextNumber = sequence.lastNumber + 1;
    await sequence.update({ lastNumber: nextNumber }, { transaction });
    
    await transaction.commit();
    
    // Return 5-digit formatted ID
    return nextNumber.toString().padStart(5, '0');
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = IdSequence;
