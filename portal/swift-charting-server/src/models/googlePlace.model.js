const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const GooglePlace = sequelize.define(models.GOOGLE_PLACE, {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    addressLine2: {
      type: DataTypes.STRING,
      trim: true,
    },
    placeId: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },
    country: {
      type: DataTypes.STRING,
      trim: true,
    },
    city: {
      type: DataTypes.STRING,
      trim: true,
    },
    locality: {
      type: DataTypes.STRING,
      trim: true,
    },
    state: {
      type: DataTypes.STRING,
      trim: true,
    },
    stateCode: {
      type: DataTypes.STRING,
      trim: true,
    },
    latitude: {
      type: DataTypes.STRING,
      trim: true,
    },
    longitude: {
      type: DataTypes.STRING,
      trim: true,
    },
    countryCode: {
      type: DataTypes.STRING,
      trim: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      trim: true,
    },
  });

  return GooglePlace;
};
