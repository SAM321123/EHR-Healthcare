/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const OfficeallyConfig = sequelize.define(
    models.OFFICE_ALLY_CONFIG,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      appName:{
        type:DataTypes.STRING,
        allowNull: false,
      },
      officeallyKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
        type: DataTypes.INTEGER,
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
          name: 'practice_id',
          fields: ['practiceId']
        },
        {
          name: 'officeally_key',
          fields: ['officeallyKey']
        },
        {
          name: 'officeallay_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );
  paginate(OfficeallyConfig);
  return OfficeallyConfig;
};
