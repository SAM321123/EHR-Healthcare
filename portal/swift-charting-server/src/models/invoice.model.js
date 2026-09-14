2; /* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    models.INVOICE,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      encounterId: {
        type: DataTypes.INTEGER,
      },
      totalAmount:{
        type: DataTypes.DECIMAL,
      },
      totalPayment:{
        type: DataTypes.INTEGER,
      },
      totalDiscount: {
        type: DataTypes.DECIMAL,
      },
      due: {
        type: DataTypes.DECIMAL,
      },
      status: {
        type: DataTypes.STRING,
      },
      paymentType: {
        type: DataTypes.STRING,
      },
      refrenceId: {
        type: DataTypes.STRING,
      },
      paymentMode: {
        type: DataTypes.STRING,
      },
      paymentAmount: {
        type: DataTypes.DECIMAL,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      comment: {
        type: DataTypes.STRING,
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
      indexes: [
        {
          name: 'invoice_patient_id',
          fields: ['patientId']
        },
        {
          name: 'invoice_encounter_id',
          fields: ['encounterId']
        },
        {
          name: 'total_amount',
          fields: ['totalAmount']
        },
        {
          name: 'total_payment',
          fields: ['totalPayment']
        },
        {
          name: 'due',
          fields: ['due']
        },
        {
          name: 'invoice_status',
          fields: ['status']
        },
        {
          name: 'payment_type',
          fields: ['paymentType']
        },
        {
          name: 'payment_amount',
          fields: ['paymentAmount']
        },
        {
          name: 'invoice_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(Invoice);

  return Invoice;
};
