/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const EmergencyContact = sequelize.define(
    models.EMERGENCYCONTACT,
    {
      emergencyContactName: {
        type: DataTypes.STRING,
      },
      emergencyContactNo: {
        type: DataTypes.STRING,
      },
      patientRelationCode: {
        type: DataTypes.STRING,
      },
      patientRelationOther: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT('long'),
      },
      address: {
        type: DataTypes.JSON,
      },
      patientId: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      deletedById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  paginate(EmergencyContact);
  return EmergencyContact;
};
