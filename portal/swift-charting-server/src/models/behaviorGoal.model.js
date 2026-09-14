/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const BehaviorGoal = sequelize.define(
    models.BEHAVIORGOAL,
    {
      behaviorId: {
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
      indexes:[
        {
          name: 'behavior_id',
          fields: ['behaviorId']
        },
        {
          name: 'behaviour_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(BehaviorGoal);
  return BehaviorGoal;
};
