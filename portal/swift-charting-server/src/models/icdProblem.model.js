/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const IcdProblem = sequelize.define(
    models.ICDPROBLEM,
    {
      icdId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
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
      timestamps: true,
      indexes: [
        {
          name: 'icd_problem_id',
          fields: ['icdId']
        },
        {
          name: 'icd_problem_name',
          fields: ['name']
        },
        {
          name: 'icd_problem_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );
  paginate(IcdProblem);
  return IcdProblem;
};
