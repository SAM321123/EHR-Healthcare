const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientEncounterForm = sequelize.define(
    models.PATIENT_ENCOUNTER_FORM,
    {
      patientEncounterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      formId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      formData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      responses: {
        type: DataTypes.TEXT('long'), // Stringified JSON for form responses
        allowNull: true,
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'form_patient_encounter_id',
          fields: ['patientEncounterId']
        },
        {
          name: 'encounter_form_id',
          fields: ['formId']
        },
        {
          name: 'responses',
          fields: ['responses']
        },
        {
          name: 'encounter_form_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientEncounterForm);
  return PatientEncounterForm;
};
