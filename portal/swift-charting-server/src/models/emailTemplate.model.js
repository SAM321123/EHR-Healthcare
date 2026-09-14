/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const EmailTemplate = sequelize.define(
    models.EMAILTEMPLATE,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emailTypeCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      replyTo: {
        type: DataTypes.STRING,
      },
      typeCode: {
        type: DataTypes.STRING,
      },
      template: {
        type: DataTypes.TEXT('long'),
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
  paginate(EmailTemplate);
  return EmailTemplate;
};
