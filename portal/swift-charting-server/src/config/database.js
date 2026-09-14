const { createDBConnection } = require('../utils/dbConnection');
const config = require('./config');

const sequelize = createDBConnection({
  dbConfig: {
    databaseName: config.sequelize.database,
    databaseUser: config.sequelize.username,
    databasePassword: config.sequelize.password,
    databasePort: config.sequelize.port,
    databaseHost: config.sequelize.host,
    databaseDialect: config.sequelize.dialect,
  },
});

module.exports = { sequelize };
