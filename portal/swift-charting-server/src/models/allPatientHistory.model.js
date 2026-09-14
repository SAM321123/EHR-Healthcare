2; /* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const AllPatientHistory = sequelize.define(
    models.ALL_PATIENT_HISTORY,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
        type: DataTypes.INTEGER,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
      response :{
        type: DataTypes.TEXT('long'),
      },
      typeCode:{
        type:DataTypes.STRING,
        allowNull:false,
      }
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'history_patient_id',
          fields: ['patientId']
        },
        {
          name: 'history_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'history_is_active',
          fields: ['isActive']
        }
      ]
    }
  );
  paginate(AllPatientHistory);
  return AllPatientHistory;
};
