/* eslint-disable no-console */
// Define models and their associations

const { sequelize } = require('../src/config/database');
const { initializeModels } = require('../src/models');
const { createGlobalTypeFixtures } = require('./masterScript/globalType');
const createGlobalTypeCategoryFixtures = require('./masterScript/globalTypeCategory');
const createDefaultPractices = require('./practices');
const createDefaultRoles = require('./roles');
const createDefaultUsers = require('./users');

// Sync all models with database
// initializeModels(sequelize);
initializeModels(sequelize, master=true);   // to set only master db
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('All models were synchronized successfully.');
    await createGlobalTypeCategoryFixtures();

    await createGlobalTypeFixtures()

    console.log('<<<<<<<<<<<<<<<<<<< ROLE SEED : START >>>>>>>>>>>>>');
    await createDefaultRoles();
    console.log('<<<<<<<<<<<<<<<<<<< ROLE SEED : END >>>>>>>>>>>>>');

    console.log('<<<<<<<<<<<<<<<<<<< USERS SEED : START >>>>>>>>>>>>>');
    await createDefaultUsers();
    console.log('<<<<<<<<<<<<<<<<<<< USERS SEED : END >>>>>>>>>>>>>');

    console.log('<<<<<<<<<<<<<<<<<<< PRACTICES SEED : START >>>>>>>>>>>>>');
    await createDefaultPractices();
    console.log('<<<<<<<<<<<<<<<<<<< PRACTICES SEED : END >>>>>>>>>>>>>');
  })
  .catch((error) => {
    console.error('Error synchronizing models:', error);
  });
