/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
// const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const RoleAndPermissions = sequelize.define(
    models.ROLE_AND_PERMISSIONS,
    {
      roleId: {
        type: DataTypes.INTEGER,
      },
      moduleId: {
        type: DataTypes.INTEGER,
      },
      permissionId: {
        type: DataTypes.INTEGER,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'permission_role_id',
          fields: ['roleId']
        },
        {
          name: 'permission_module_id',
          fields: ['moduleId']
        },
        {
          name: 'permission_id',
          fields: ['permissionId']
        },
      ]
    }
  );

  // paginate(RoleAndPermissions);
  
  return RoleAndPermissions;
};
