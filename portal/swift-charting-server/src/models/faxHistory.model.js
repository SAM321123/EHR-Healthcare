/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const FaxHistory = sequelize.define(
    models.FAX_HISTORY,
    {
      faxContactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      faxType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      patientMedicationId: {
        type: DataTypes.INTEGER,
      },
      patientFormId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.STRING,
      },
      result: {
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    {
      timestamps: true,
    }
  );
  paginate(FaxHistory);
  return FaxHistory;
};
