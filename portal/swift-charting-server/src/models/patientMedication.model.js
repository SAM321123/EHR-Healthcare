/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const PatientMedication = sequelize.define(
    models.PATIENTMEDICATION,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      prescriberId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      prescriptionDate: {
        type: DataTypes.DATE,
        // allowNull: false
      },
      signature: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      clinicalNotes: {
        type: DataTypes.TEXT('long'),
      },
      patientEncounterId: {
        type: DataTypes.INTEGER,
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
          name: 'prescriber_id',
          fields: ['prescriberId'],
        },
      ],
    }
  );
  paginate(PatientMedication);
  watchChanges(PatientMedication);
  return PatientMedication;
};
