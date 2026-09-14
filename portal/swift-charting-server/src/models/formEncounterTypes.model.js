const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const FormEncounterTypes = sequelize.define(models.FORM_ENCOUNTER_TYPES, {
    // No additional attributes needed for the junction table itself
      encounterTypeCode: { type: DataTypes.STRING },
  });
  return FormEncounterTypes;
};
