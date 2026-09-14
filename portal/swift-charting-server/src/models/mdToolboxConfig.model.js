/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const MdToolboxConfig = sequelize.define(
    models.MD_TOOLBOX_CONFIG,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      appName:{
        type:DataTypes.STRING,
        allowNull: false,
      },
      mdToolboxKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
        type: DataTypes.INTEGER,
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
          name: 'md_practice_id',
          fields: ['practiceId']
        },
        {
          name: 'md_toolbox_key',
          fields: ['mdToolboxKey']
        },
        {
          name: 'md_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(MdToolboxConfig);
  return MdToolboxConfig;
};
