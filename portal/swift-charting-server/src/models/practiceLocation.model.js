/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const PracticeLocation = sequelize.define(
    models.PRACTICE_LOCATION,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      address: {
        type: DataTypes.JSONB,
      },
      faxNo: {
        type: DataTypes.STRING,
      },
      phoneNo: {
        type: DataTypes.STRING,
      },
      contactPersonNo: {
        type: DataTypes.STRING,
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
      schedule: {
        type: DataTypes.JSONB
      },
      contactPersonName: {
        type: DataTypes.STRING,
      },
      contactPersonEmail: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'practice_location_name',
          fields: ['name']
        },
        {
          name: 'fax_no',
          fields: ['faxNo']
        },
        {
          name: 'phone_no',
          fields: ['phoneNo']
        },
      ]
    }
  );
  
  paginate(PracticeLocation);
  
  return PracticeLocation;
};
