/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const EncounterNote = sequelize.define(
    models.ENCOUNTER_NOTE,
    {
      encounterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      noteType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'note',
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  paginate(EncounterNote);
  return EncounterNote;
};
