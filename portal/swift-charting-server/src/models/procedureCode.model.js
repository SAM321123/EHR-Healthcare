/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ProcedureCode = sequelize.define(
    models.PROCEDURE_CODE,
    {
      name: {
        type: DataTypes.TEXT('long'),
      },
      cptCode: {
        type: DataTypes.STRING,
      },
      useForBillingCode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT('long'),
      },
      modifier1:{
        type:DataTypes.INTEGER
      },
      modifier2:{
        type:DataTypes.INTEGER
      },
      modifier3:{
        type:DataTypes.INTEGER
      },
      modifier4:{
        type:DataTypes.INTEGER
      },
      price:{
        type:DataTypes.INTEGER
      },
      qty:{
        type:DataTypes.INTEGER
      },
      total:{
        type:DataTypes.INTEGER
      },
      metaData: {
        type: DataTypes.JSONB,
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'procedure_code_name',
          fields: ['name']
        },
        {
          name: 'cpt_code',
          fields: ['cptCode']
        },
        {
          name: 'procedure_code_use_for_billing_code',
          fields: ['useForBillingCode']
        },
        {
          name: 'price',
          fields: ['price']
        },
        {
          name: 'qty',
          fields: ['qty']
        },
        {
          name: 'procedure_code_total',
          fields: ['total']
        },
        {
          name: 'procedure_code_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(ProcedureCode);
  return ProcedureCode;
};
