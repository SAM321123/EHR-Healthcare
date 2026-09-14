/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const DatabaseConfig = sequelize.define(
    models.DATABASE_CONFIG,
    {
      databaseName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databaseUser: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databasePassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databasePort: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databaseHost: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databaseDialect: {
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'database_name',
          fields: ['databaseName']
        },
        {
          name: 'db_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );

  return DatabaseConfig;
};
