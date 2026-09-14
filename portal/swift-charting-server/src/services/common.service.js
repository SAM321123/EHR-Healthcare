const { initializeModels } = require('../models');

const syncClinicDB = async (dbConnect) => {
  initializeModels(dbConnect);
  await dbConnect.sync({ alter: true });
};

module.exports = {
  syncClinicDB,
};
