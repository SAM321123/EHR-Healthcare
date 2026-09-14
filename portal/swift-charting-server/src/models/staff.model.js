/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Staff = sequelize.define(
    models.STAFF,
    {
      titleCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otherTitle: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
        trim: true,
      },
      middleName: {
        type: DataTypes.STRING,
        trim: true,
        defaultValue: '',
      },
      lastName: {
        type: DataTypes.STRING,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      pronounsCode: {
        type: DataTypes.STRING,
      },
      anotherGenderIdentity: {
        type: DataTypes.STRING,
      },
      genderIdentityCode: {
        type: DataTypes.STRING,
      },
      languagesSpoken: {
        type: DataTypes.STRING,
      },
      facebook: {
        type: DataTypes.STRING,
      },
      whatsapp: {
        type: DataTypes.STRING,
      },
      instagram: {
        type: DataTypes.STRING,
      },
      linkedin: {
        type: DataTypes.STRING,
      },
      bio: {
        type: DataTypes.TEXT,
      },
      phone: {
        type: DataTypes.STRING,
      },
      preferredPhone: {
        type: DataTypes.STRING,
      },
      fileId: {
        type: DataTypes.INTEGER,
      },
      npiNo: {
        type: DataTypes.STRING,
        unique: true,
      },
      stateLicenseNo: {
        type: DataTypes.STRING,
      },
      deaNo: {
        type: DataTypes.STRING,
      },
      fedralTaxId: {
        type: DataTypes.STRING,
      },
      socialSecurityNo: {
        type: DataTypes.STRING,
      },
      experience: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.JSONB,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      timezone: {
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
      signature: {
        type: DataTypes.TEXT('long'),
      },
      conditionsTreated: {
        type: DataTypes.TEXT('medium'),
      },
      clientFocusAges: {
        type: DataTypes.TEXT('medium'),
      },
      insurancesAccepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      education: {
        type: DataTypes.TEXT('medium'),
      },
      professionalAssociations: {
        type: DataTypes.TEXT('medium'),
      },
      hospitalAffiliations: {
        type: DataTypes.TEXT('medium'),
      },
      additionalCertifications: {
        type: DataTypes.TEXT('medium'),
      },
      deactivatedDate: {
        type: DataTypes.DATE
      },
      isPrescriber: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      prescribeDate: {
        type: DataTypes.DATE
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'staff_first_name',
          fields: ['firstName'],
        },
        {
          name: 'staff_middle_name',
          fields: ['middleName'],
        },
        {
          name: 'staff_last_name',
          fields: ['lastName'],
        },
        {
          name: 'staff_is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'staff_email',
          fields: ['email'],
        },
        {
          name: 'npi_no',
          fields: ['npiNo'],
        },
        {
          name: 'state_license_no',
          fields: ['stateLicenseNo'],
        },
        {
          name: 'staff_user_id',
          fields: ['userId'],
        },
      ],
    }
  );
  paginate(Staff);
  return Staff;
};
