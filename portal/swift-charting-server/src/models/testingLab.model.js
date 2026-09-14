const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const { hl7Versions } = require('../../seed-script/mastersData/hl7Versions');
module.exports = (sequelize) => {
  const TestingLab = sequelize.define(
    models.TESTING_LAB,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      labId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
      },
      ftpUser: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ftpPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ftpPath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hl7VersionCode: {
        type: DataTypes.STRING,
      },
      ftpHost: {
        type: DataTypes.STRING,
        allowNull: false,
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'testing_lab_name',
          fields: ['name']
        },
        {
          name: 'lab_id',
          fields: ['labId']
        },
        {
          name: 'ftp_user',
          fields: ['ftpUser']
        },
        {
          name: 'ftp_password',
          fields: ['ftpPassword']
        },
        {
          name: 'ftp_path',
          fields: ['ftpPath']
        },
        {
          name: 'ftp_host',
          fields: ['ftpHost']
        },
        {
          name: 'testing_lab_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(TestingLab);

  return TestingLab;
};
