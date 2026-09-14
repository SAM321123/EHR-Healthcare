2; /* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const LabReport = sequelize.define(
    models.LAB_REPORT,
    {
      labRadiologyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hl7LabResult: {   // hl7LabResult
        type:DataTypes.TEXT('long')
      },
      labResult: {
        type: DataTypes.JSONB
      },
      clinicNote: {
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'lab_radiology_id',
          fields: ['labRadiologyId']
        },
        {
          name: 'hl7_lab_result',
          fields: ['hl7LabResult']
        },
        {
          name: 'lab_result',
          fields: ['labResult']
        },
        {
          name: 'report_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );
  paginate(LabReport);

  return LabReport;
};
