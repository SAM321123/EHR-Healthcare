const { sequelize } = require('../src/config/database');
const { errorMessages } = require('../src/config/error');
const { initializeModels } = require('../src/models');
const GlobalTypeCategoryData = require('./mastersData/globalTypeCategory');

const createGlobalTypeCategoryFixtures = async () => {
  try {
    const masterDB = initializeModels(sequelize);

    const promises = [];
    GlobalTypeCategoryData.forEach((master) => {
      promises.push(masterDB.GlobalCategoryType.upsert({...master}));
    });
    await Promise.all(promises);
  } catch (err) {
    if (err.message.indexOf(errorMessages.DUPLICATE_RECORD) < 0) {
      throw err;
    }
  }
};

module.exports = createGlobalTypeCategoryFixtures;
