const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { sequelize } = require('../config/database');

const getPractices = catchAsync(async (req, res) => {
  const db = getModels(sequelize);
  const practices = await db.Practice.findAll({ include: [{ model: db.DatabaseConfig, as: 'databaseConfig' }] });
  res.send({ results: practices });
});

const getPracticeById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const practiceSetting = await db.PracticeSetting.findOne();
  res.send(practiceSetting);
});

module.exports = {
  getPractices,
  getPracticeById,
};
