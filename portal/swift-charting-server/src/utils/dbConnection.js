const { Sequelize } = require('sequelize');

const createDBConnection = ({ dbConfig }) => {
  const dbConnect = new Sequelize(dbConfig.databaseName, dbConfig.databaseUser, dbConfig.databasePassword, {
    host: dbConfig.databaseHost,
    dialect: dbConfig.databaseDialect,
    port: dbConfig.databasePort,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
  return dbConnect;
};

module.exports = {
  createDBConnection,
};
