2/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const FamilyHistory = sequelize.define(
    models.FAMILY_HISTORY,
    {
      relationshipCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conditionCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      conditionOther:{
        type:DataTypes.STRING,
      },
      statusCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT('long'),
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

  paginate(FamilyHistory);
  return FamilyHistory;
};
