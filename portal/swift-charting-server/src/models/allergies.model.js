/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Allergies = sequelize.define(
    models.ALLERGIES,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      allergy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      severitiesCode: {
        type: DataTypes.STRING,
      },
      dateOfOnSet: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      patientEncounterId: {
        type: DataTypes.INTEGER,
      },
      comment: {
        type: DataTypes.TEXT('long'),
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
          name: 'allergy',
          fields: ['allergy']
        },
        {
          name: 'allergy_patient_id',
          fields: ['patientId'] 
        },
        {
          name: 'allergy_patient_encounter_id',
          fields: ['patientEncounterId'] 
        },
        {
          name: 'allergy_is_deleted',
          fields: ['isDeleted'],
        },

      ]
    }
  );
  paginate(Allergies);
  watchChanges(Allergies);
  return Allergies;
};
