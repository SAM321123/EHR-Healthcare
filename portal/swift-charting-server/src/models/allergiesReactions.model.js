const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const AllergiesReactions = sequelize.define(models.ALLERGYREACTIONS, {
    // No additional attributes needed for the junction table itself
    reactionCode: { type: DataTypes.STRING },
  });
  return AllergiesReactions;
};
