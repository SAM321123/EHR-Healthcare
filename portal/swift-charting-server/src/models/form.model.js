/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Form = sequelize.define(
    models.FORM,
    {
      name: {
        type: DataTypes.STRING,
      },
      formCategoryCode: {
        type: DataTypes.STRING,
      },
      formTypeCode: {
        type: DataTypes.STRING,
      },
      consentForm: {
        type: DataTypes.TEXT('long'),
      },
      enablePatientSignature: {
        type: DataTypes.BOOLEAN,
      },
      signatureLabel: {
        type: DataTypes.STRING,
      },
      enablePractitionerSignature: {
        type: DataTypes.BOOLEAN,
      },
      makeSignatureOptional: {
        type: DataTypes.BOOLEAN,
      },
      questions: {
        type: DataTypes.TEXT('long'),
      },
      rules: {
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
    }
  );
  paginate(Form);
  return Form;
};
