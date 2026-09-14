/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const RoleAndModule = sequelize.define(
    models.ROLE_AND_MODULE,
    {
      roleId: {
        type: DataTypes.INTEGER,
      },
      moduleId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'module_role_id',
          fields: ['roleId']
        },
        {
          name: 'module_id',
          fields: ['moduleId']
        }
      ]
    }
  );

  
  return RoleAndModule;
};
