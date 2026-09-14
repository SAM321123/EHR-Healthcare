/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const StripeEvent = sequelize.define(
    models.STRIPE_EVENT,
    {
      eventId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'event_id',
          fields: ['eventId']
        }
      ]
    }
  );

  paginate(StripeEvent);
  return StripeEvent;
};
