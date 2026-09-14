const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const TrialSubscription = sequelize.define(
    models.TRIAL_SUBSCRIPTION,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Assuming practiceId should be unique
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      practitionerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      rnCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      prescriberCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      cost: {
        type: DataTypes.DECIMAL,
        defaultValue: 0
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
  );

  paginate(TrialSubscription);

  return TrialSubscription;
};