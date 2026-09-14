/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ProblemBehavior = sequelize.define(
    models.PROBLEMBEHAVIOR,
    {
      problemId: {
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
          name: 'problem_behavior_problem_id',
          fields: ['problemId']
        },
        {
          name: 'problem_behavior_name',
          fields: ['name']
        },
        {
          name: 'problem_behavior_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(ProblemBehavior);
  return ProblemBehavior;
};
