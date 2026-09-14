const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientEncounterBillingProcedureCode = sequelize.define(
    models.PATIENT_ENCOUNTER_BILLING_PROCEDURE_CODE,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      serviceDate: {
        type: DataTypes.DATE,
      },
      discAmt: { 
        type:DataTypes.INTEGER
      },
      discPer: {
        type:DataTypes.INTEGER
      },
      taxAmt: { 
        type:DataTypes.INTEGER
      },
      taxPer: {
        type:DataTypes.INTEGER
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
          name: 'id',
          fields: ['id']
        },
        {
          name: 'billing_procedure_code_price',
          fields: ['price']
        },
        {
          name: 'billing_procedure_code_qty',
          fields: ['qty']
        },
        {
          name: 'billing_procedure_code_total',
          fields: ['total']
        },
        {
          name: 'service_date',
          fields: ['serviceDate']
        },
        {
          name: 'disc_amt',
          fields: ['discAmt']
        },
        {
          name: 'disc_per',
          fields: ['discPer']
        },
        {
          name: 'tax_amt',
          fields: ['taxAmt']
        },
        {
          name: 'tax_per',
          fields: ['taxPer']
        },
        {
          name: 'billing__procedure_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientEncounterBillingProcedureCode);
  return PatientEncounterBillingProcedureCode;
};