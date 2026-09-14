const { sequelize } = require('../config/database');
const { syncClinicDB } = require('../services/common.service');
const { bootstrap, getClinicConnection } = require('./connection');

const createDatabaseIfNotExists=async (tenantName)=> {
  try {
      // Check if the database exists
      const [results, metadata] = await sequelize.query(`
          SELECT 1 FROM pg_database WHERE datname = ?
      `, {
          replacements: [tenantName]
      });

      // If the database does not exist, create it
      if (results.length === 0) {
          await sequelize.query(`CREATE DATABASE ${tenantName};`);
          console.log(`Database ${tenantName} created.`);
      } else {
          console.log(`Database ${tenantName} already exists.`);
      }
  } catch (error) {
      console.error('Error checking or creating database:', error);
  }
}


const up = async (params) => {
  try {
    // Create the database for the tenant
    await createDatabaseIfNotExists(params.tenantName);
    // Refresh tenant connections to include the new one as available
    await bootstrap();

    // Get the connection for the new tenant
    const tenant = getClinicConnection(params.uuid);

    // Run migrations for the new tenant
    await syncClinicDB(tenant);

    // Seed data for the new tenant
    // await seed(tenant);
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  up,
};
