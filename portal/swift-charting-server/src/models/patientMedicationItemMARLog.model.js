/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const PatientMedicationItemMARLog = sequelize.define(
    models.PATIENTMEDICATIONITEMMARLOG,
    {
      patientMedicationItemId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      slotDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actionCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overrideReason: {
        type: DataTypes.TEXT,
      },
      refusedReason: {
        type: DataTypes.TEXT,
      },
      clinicianId:{
        type:DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
      },
      clinicianInitial: {
        type: DataTypes.STRING,
      },
      givenByCaregiver:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      },     
      isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'action_code',
          fields: ['actionCode'],
        },
        {
          name: 'mar_log_date',
          fields: ['date'],
        },
        {
          name: 'slot_date',
          fields: ['slotDate'],
        },
        {
          name: 'clinician_id',
          fields: ['clinicianId'],
        },
      ],
    }
  );
  paginate(PatientMedicationItemMARLog);
  watchChanges(PatientMedicationItemMARLog);
  return PatientMedicationItemMARLog;
};
