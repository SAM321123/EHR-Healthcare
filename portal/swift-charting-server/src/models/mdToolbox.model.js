/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const MdToolbox = sequelize.define(
    models.MD_TOOLBOX,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status:{
        type:DataTypes.INTEGER,
      },
      message: {
        type: DataTypes.STRING,
      },
      triggerFrom : {
        type: DataTypes.STRING,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  paginate(MdToolbox);
  return MdToolbox;
};
