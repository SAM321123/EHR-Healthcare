const { sequelize } = require('../../src/config/database');
const { errorMessages } = require('../../src/config/error');
const { initializeModels } = require('../../src/models');
const {formType} = require('./formType.js')
const {formCategories} = require('./formCategories.js');
const { subscriptionCancelReason } = require('../mastersData/subscriptionCancelReason.js');


const mastersData = [
  ...formType,
  ...formCategories,
  ...subscriptionCancelReason,
];

const createGlobalTypeFixtures = async () => {
  const masterDB = initializeModels(sequelize);
  try {
    for(const master of mastersData){
      await masterDB.GlobalType.upsert({ ...master })
    }

  } catch (err) {
    if (err.message.indexOf(errorMessages.DUPLICATE_RECORD) < 0) {
      throw err;
    }
  }
};

module.exports = {createGlobalTypeFixtures,mastersData};
