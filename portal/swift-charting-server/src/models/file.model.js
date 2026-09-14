/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const File = sequelize.define(
    models.FILE,
    {
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageType: {
        type: DataTypes.STRING,
      },
      thumbnail: {
        type: DataTypes.STRING,
      },
      mimetype: {
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
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
    },

    {
      timestamps: true,
    }
  );

  return File;
};
