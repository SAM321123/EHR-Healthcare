/* eslint-disable no-console */
// Define models and their associations
const { sequelize } = require('./src/config/database');
const { initializeModels } = require('./src/models');

// Sync all models with database
initializeModels(sequelize);
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Error synchronizing models:', error);
  });
