/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const { billingType } = require('../utils');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Patient = sequelize.define(
    models.PATIENT,
    {
      titleCode: {
        type: DataTypes.STRING,
      },
      otherTitle: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      middleName: {
        type: DataTypes.STRING,
        trim: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      mdToolboxPatientId: {
        type: DataTypes.INTEGER,
      },
      phone: {
        type: DataTypes.STRING,
      },
      workPhone: {
        type: DataTypes.STRING,
      },
      homePhone: {
        type: DataTypes.STRING,
      },
      textMessagePhone: {
        type: DataTypes.STRING,
      },
      preferredPhone: {
        type: DataTypes.STRING,
      },
      alternativePhone: {
        type: DataTypes.STRING,
      },
      preferredContactMethodCode: {
        type: DataTypes.STRING,
      },
      preferredName: {
        type: DataTypes.STRING,
      },
      sexAtBirthCode: {
        type: DataTypes.STRING,
      },
      otherSexAtBirth: {
        type: DataTypes.STRING,
      },
      genderIdentityCode: {
        type: DataTypes.STRING,
      },
      anotherGenderIdentity: {
        type: DataTypes.STRING,
      },
      sexualOrientationCode: {
        type: DataTypes.STRING,
      },
      anotherOrientation: {
        type: DataTypes.STRING,
      },
      pronounsCode: {
        type: DataTypes.STRING,
      },
      maritalStatusCode: {
        type: DataTypes.STRING,
      },
      otherMaritalStatus: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.JSON,
      },
      pharmacyAddress: {
        type: DataTypes.JSON,
      },
      religion: {
        type: DataTypes.STRING,
      },
      raceCode: {
        type: DataTypes.STRING,
      },
      raceUnknown: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATE,
      },
      primaryProviderId: {
        type: DataTypes.INTEGER,
      },
      primaryCareProvider: {
        type: DataTypes.STRING,
      },
      financialResponsibleRelation:{
        type: DataTypes.STRING,
      },
      languagesSpoken: {
        type: DataTypes.STRING,
      },
    ssn: {
      type: DataTypes.STRING,
    },
    driversLicensNo: {
      type: DataTypes.STRING,
    },
    education: {
      type: DataTypes.STRING,
    },
    medicalAttorney: {
      type: DataTypes.STRING,
    },
    preferredPharmacy: {
      type: DataTypes.STRING,
    },
      guardian: {
        type: DataTypes.STRING,
      },
      occupation: {
        type: DataTypes.STRING,
      },
      occupationDetail: {
        type: DataTypes.STRING,
      },
      employer: {
        type: DataTypes.STRING,
      },
      referredBy: {
        type: DataTypes.STRING,
      },
      financialResponsibilityParty: {
        type: DataTypes.STRING,
      },
      diagnosisCode: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.TEXT('long'),
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      fileId: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
        type: DataTypes.INTEGER,
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
      timezone:{
        type: DataTypes.STRING,
      },
      billingType:{
        type:DataTypes.STRING,
        defaultValue:billingType.SELF,
      },
      balance:{
        type:DataTypes.DECIMAL,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'patient_first_name',
          fields: ['firstName'],
        },
        {
          name: 'patient_middle_name',
          fields: ['middleName'],
        },
        {
          name: 'patient_last_name',
          fields: ['lastName'],
        },
        {
          name: 'is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'sex_at_birth_code',
          fields: ['sexAtBirthCode'],
        },
        {
          name: 'race_code',
          fields: ['raceCode'],
        },
        {
          name: 'dob',
          fields: ['dob'],
        },
      ],
    }
  );
  paginate(Patient);
  watchChanges(Patient);
  return Patient;
};
