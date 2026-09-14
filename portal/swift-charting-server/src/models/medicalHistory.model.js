2; /* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const MedicalHistory = sequelize.define(
    models.MEDICAL_HISTORY,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      underPhysician: {
        type: DataTypes.INTEGER,
      },
      underPhysicianComment: {
        type: DataTypes.STRING,
      },
      everUnderPhysician: {
        type: DataTypes.INTEGER,
      },
      everUnderPhysicianComment: {
        type: DataTypes.STRING,
      },
      injury: {
        type: DataTypes.INTEGER,
      },
      injuryComment: {
        type: DataTypes.STRING,
      },
      takingDrugs: {
        type: DataTypes.INTEGER,
      },
      takingDrugsComment: {
        type: DataTypes.STRING,
      },
      takenRedux: {
        type: DataTypes.INTEGER,
      },
      takenReduxComment: {
        type: DataTypes.INTEGER,
      },
      takenFosamax: {
        type: DataTypes.INTEGER,
      },
      takenFosamaxComment: {
        type: DataTypes.STRING,
      },
      onDiet: {
        type: DataTypes.INTEGER,
      },
      onDietComment: {
        type: DataTypes.STRING,
      },
      useTobacco: {
        type: DataTypes.INTEGER,
      },
      useTobaccoComment: {
        type: DataTypes.STRING,
      },
      useSubstances: {
        type: DataTypes.INTEGER,
      },
      useSubstancesComment: {
        type: DataTypes.STRING,
      },
      condition: {
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
      questions: {
        type: DataTypes.TEXT('long'),
      },
      rules: {
        type: DataTypes.TEXT('long'),
      },
      response :{
        type: DataTypes.TEXT('long'),
      }
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'medical_history_patient_id',
          fields: ['patientId']
        },
      ]
    }
  );
  paginate(MedicalHistory);
  return MedicalHistory;
};
