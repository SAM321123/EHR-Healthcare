/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PayerList = sequelize.define(
    models.PAYER_LIST,
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Correct spelling
    },
      payerId:{
        type:DataTypes.STRING,
      },
      payerName: {
        type: DataTypes.STRING,
      },
      transaction : {
        type: DataTypes.STRING,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    
    {
        timestamps: true,
        indexes: [
          {
            name: 'payerId_index',  // Custom index name (optional)
            fields: ['payerId'],  // Field to index
          },
        ],
      }
    
  );
  paginate(PayerList);
  return PayerList;
};
