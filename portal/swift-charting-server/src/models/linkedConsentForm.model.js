/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const linkedConsentFrom = sequelize.define(
    models.LINKED_CONSENT_FROM,
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
          name: 'questionnaire_id',
          fields: ['questionnaireId']
        },
        {
          name: 'consent_form_id',
          fields: ['consentFormId']
        },
      ]
    }
  );
  paginate(linkedConsentFrom);
  return linkedConsentFrom;
};
