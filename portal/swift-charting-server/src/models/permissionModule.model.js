/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PermissionModule = sequelize.define(
    models.PERMISSION_MODULE,
    {
      // moduleId: {
      //   type: DataTypes.INTEGER,
      //   // allowNull: false,
      // },
      // permissionId: {
      //   type: DataTypes.INTEGER,
      //   // allowNull: false,
      // },
      // globalTypeCategoryId: {
      //   type: DataTypes.INTEGER,
      //   // allowNull: false,
      // },
      // isDeleted: {
      //   type: DataTypes.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: false,
      // },
      // isActive: {
      //   type: DataTypes.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: true,
      // },
      // createdBy: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      // updatedBy: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
    },
    {
      timestamps: true,
    }
  );
  return PermissionModule;
};
