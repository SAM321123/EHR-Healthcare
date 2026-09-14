/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplate = sequelize.define(
    models.TREATMENTPLANTEMPLATE,
    {
      templateName: {
        type:DataTypes.STRING,
      },
      templateDescription: {
        type:DataTypes.TEXT,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'template_name',
          fields: ['templateName']
        },
        {
          name: 'plan_template_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(TreatmentPlanTemplate);
  return TreatmentPlanTemplate;
};
