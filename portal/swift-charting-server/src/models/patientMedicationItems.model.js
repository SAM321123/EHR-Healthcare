/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientMedicationItems = sequelize.define(
    models.PATIENTMEDICATIONIEMS,
    {
      medicineStatusCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genericDrug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brandNameDrug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unitCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      doseFormCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      diagnosesOther: {
        type: DataTypes.JSONB
      },
      routeCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      routeOther: {
        type: DataTypes.STRING,
      },
      frequencyCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frequencyOther: {
        type: DataTypes.STRING,
      },
      directionCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      directionOther: {
        type: DataTypes.STRING,
      },
      durationAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      durationCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refill: {
        type: DataTypes.INTEGER,
        // allowNull: false,
      },
      refillDate: {
        type: DataTypes.DATE,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      dispenseAsWritten: {
        type: DataTypes.BOOLEAN,
      },
      substitutions:{
        type: DataTypes.BOOLEAN,
      },
      additionalInstruction: {
        type: DataTypes.TEXT('long'),
      },
      patientSpecificInstructions:{
        type: DataTypes.TEXT('long'),
      },
      allergiesWarnings:{
        type: DataTypes.TEXT('long'),
      },
      reasonForChanges: {
        type: DataTypes.TEXT('long'),
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      filled: {
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
      updatedById: {
        type: DataTypes.INTEGER,
      },
      deletedById: {
        type: DataTypes.INTEGER,
      },
      medicineStatusReason:{
        type: DataTypes.TEXT('long'),
      },
      discontinueDate:{
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'medicine_item_status_code',
          fields: ['medicineStatusCode'],
        },
      ],
    }
  );
  paginate(PatientMedicationItems);
  return PatientMedicationItems;
};
