/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ClinicStaff = sequelize.define(
    models.CLINIC_STAFF,
    {
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clinicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      clinicName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      staffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      middleName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPrescriber: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // creates createdAt & updatedAt
      paranoid: true, // creates deletedAt
      indexes: [
        {
          name: 'idx_clinic_staff_clinic_id',
          fields: ['clinicId'],
        },
        {
          name: 'idx_clinic_staff_staff_id',
          fields: ['staffId'],
        },
        {
          name: 'idx_clinic_staff_clinic_name',
          fields: ['clinicName'],
        },
        {
          name: 'idx_clinic_staff_email',
          fields: ['email'],
        },
        {
          name: 'idx_clinic_staff_is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'idx_clinic_staff_created_at',
          fields: ['createdAt'],
        },
      ],
    }
  );
  paginate(ClinicStaff);
  return ClinicStaff;
};
