/* eslint-disable no-console */
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { sequelize } = require('./config/database');
const { bootstrap } = require('./utils/connection');

let server;
sequelize
  .authenticate()
  .then(async () => {
    bootstrap()
      .then(() => {
        console.log('Bootstrap successful. Server starting...');
        logger.info('Connected to the database.');
        server = app.listen(config.port, () => {
          logger.info(`Server running on port ${config.port}`);
        });
        // Start your server or execute other initialization code here
      })
      .catch((error) => {
        console.error('Bootstrap error:', error);
        process.exit(1); // Exit the application if bootstrap fails
      });
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
