const { DataTypes } = require('sequelize');
const { tokenTypes } = require('../config/tokens');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PracticeInfo = sequelize.define(
    models.TEMP,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      address: {
        type: DataTypes.JSON,
      },
      contact: {
        type: DataTypes.STRING,
      },
      domainName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      staffFirstName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      staffMiddleName: {
        type: DataTypes.STRING,
        trim: true,
      },
      staffLastName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      staffEmail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      staffContact: {
        type: DataTypes.STRING,
      },
      staffPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'practice_info_name',
          fields: ['name']
        },
        {
          name: 'practice_info_email',
          fields: ['email']
        },
        {
          name: 'temp_domain_name',
          fields: ['domainName']
        },
        {
          name: 'temp_staff_first_name',
          fields: ['staffFirstName']
        },
        {
          name: 'temp_staff_middle_name',
          fields: ['staffMiddleName']
        },
        {
          name: 'temp_staff_last_name',
          fields: ['staffLastName']
        },
        {
          name: 'temp_staff_email',
          fields: ['staffEmail']
        },
      ]
    }
  );

  return PracticeInfo;
};
