/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const AdminEmailComposed = sequelize.define(
    models.ADMINEMAILCOMPOSED,
    {
      clinicName: {
        // Use DataTypes.ARRAY for PostgreSQL
        type: DataTypes.JSONB,
        allowNull: true, // or false, depending on your needs
      },

      // ✅ Use JSONB (recommended for PostgreSQL)
      role: {
        type: DataTypes.JSONB,
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      emailName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      selectionMode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['all', 'manual']],
        },
      },
      dateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      createdById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updatedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      deletedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'admin_email_composeds',

      indexes: [{ fields: ['clinicName'] }, { fields: ['isActive'] }, { fields: ['isDeleted'] }],
    }
  );

  paginate(AdminEmailComposed);

  return AdminEmailComposed;
};
