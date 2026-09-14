/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const linkedConsentFromPatient = sequelize.define(
    models.LINKED_CONSENT_FROM_PATIENT,
    {
        questionnaireId: {
        type: DataTypes.INTEGER,
      },
      consentFormId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'patient_questionnaire_id',
          fields: ['questionnaireId']
        },
        {
          name: 'patient_consent_form_id',
          fields: ['consentFormId']
        },
      ]
    }
  );
  paginate(linkedConsentFromPatient);
  return linkedConsentFromPatient;
};
