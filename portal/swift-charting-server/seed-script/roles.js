const { sequelize } = require('../src/config/database');
const { errorMessages } = require('../src/config/error');
const { initializeModels } = require('../src/models');
const { roles } = require('./mastersData/roles');

const createDefaultRoles = async () => {
  try {
    const masterDB = initializeModels(sequelize);

    const promises = [];
    roles.forEach((role) => {
      promises.push(masterDB.Role.upsert({ ...role }));
    });
    await Promise.all(promises);
  } catch (err) {
    if (err.message.indexOf(errorMessages.DUPLICATE_RECORD) < 0) {
      throw err;
    }
  }
};

module.exports = createDefaultRoles;
