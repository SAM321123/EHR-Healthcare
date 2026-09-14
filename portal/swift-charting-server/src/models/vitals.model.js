/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Vitals = sequelize.define(
    models.VITALS,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recordDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recordTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recordDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lsb: {
        type: DataTypes.STRING,
      },
      oz: {
        type: DataTypes.STRING,
      },
      ft: {
        type: DataTypes.STRING,
      },
      in: {
        type: DataTypes.STRING,
      },
      weightUnit: {
        type: DataTypes.STRING,
      },
      tempreature: {
        type: DataTypes.STRING,
      },
      respiratoryRate:{
        type:DataTypes.STRING
      },
      bmi:{
        type:DataTypes.STRING
      },
      bloodPressure:{
        type:DataTypes.STRING
      },
      diastolic:{
        type:DataTypes.STRING
      },
      respiratoryRate:{
        type:DataTypes.STRING
      },
      pulse:{
        type:DataTypes.STRING
      },
      bloodSugar:{
        type:DataTypes.STRING
      },
      fasting:{
        type:DataTypes.STRING
      },
      saturation2:{
        type:DataTypes.STRING
      },
      headCircumference:{
        type:DataTypes.STRING
      },
      neck:{
        type:DataTypes.STRING
      },
      shoulders:{
        type:DataTypes.STRING
      },
      chest:{
        type:DataTypes.STRING
      },
      waist:{
        type:DataTypes.STRING
      },
      hips:{
        type:DataTypes.STRING
      },
      leanBodyMass:{
        type:DataTypes.STRING
      },
      leftForearm:{
        type:DataTypes.STRING
      },
      leftWrist:{
        type:DataTypes.STRING
      },
      rightForearm:{
        type:DataTypes.STRING
      },
      rightWrist:{
        type:DataTypes.STRING
      },
      leftBicep:{
        type:DataTypes.STRING
      },
      rightBicep:{
        type:DataTypes.STRING
      },
      leftThigh:{
        type:DataTypes.STRING
      },
      rightThigh:{
        type:DataTypes.STRING
      },
      leftCalf:{
        type:DataTypes.STRING
      },
      rightCalf:{
        type:DataTypes.STRING
      },
      bodyFat:{
        type:DataTypes.STRING
      },
      patientEncounterId: {
        type: DataTypes.INTEGER,
      },
      comment:{
        type:DataTypes.CHAR(500),
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
          name: 'vital_patient_id',
          fields: ['patientId']
        },
        {
          name: 'record_date',
          fields: ['recordDate']
        },
        {
          name: 'vitals_is_deleted',
          fields: ['isDeleted']
        },      
      ]
    }
  );
  paginate(Vitals);
  return Vitals;
};
