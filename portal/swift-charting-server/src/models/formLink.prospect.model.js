/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const FormLinkProspect = sequelize.define(
    models.FORMLINKPROSPECT,
    {
      firstName: {
        type: DataTypes.STRING,
      },

      lastName: {
        type: DataTypes.STRING,
      },

      preferredName: {
        type: DataTypes.STRING,
      },

      email: {
        type: DataTypes.STRING,
      },

      preferredContactNumber: {
        type: DataTypes.STRING,
      },

      optInTextReminder: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
      },

      sexAtBirth: {
        type: DataTypes.ENUM('Male', 'Female'),
      },

      race: {
        type: DataTypes.STRING,
      },

      ethnicity: {
        type: DataTypes.STRING,
      },

      genderIdentity: {
        type: DataTypes.STRING,
      },

      pronoun: {
        type: DataTypes.STRING,
      },

      preferredLanguage: {
        type: DataTypes.STRING,
      },

      streetAddress: {
        type: DataTypes.STRING,
      },

      city: {
        type: DataTypes.STRING,
      },

      state: {
        type: DataTypes.STRING,
      },

      zip: {
        type: DataTypes.STRING,
      },

      personalId: {
        type: DataTypes.STRING,
      },

      service: {
        type: DataTypes.STRING,
      },

      clinicId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      staffIds: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      route: {
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'prospect_email',
          fields: ['email'],
        },
        {
          name: 'prospect_route',
          fields: ['route'],
        },
        {
          name: 'prospect_is_deleted',
          fields: ['isDeleted'],
        },
      ],
    }
  );

  paginate(FormLinkProspect);

  return FormLinkProspect;
};
