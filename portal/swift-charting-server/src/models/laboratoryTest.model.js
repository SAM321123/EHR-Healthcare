const { DataTypes } = require('sequelize');
const models = require('../config/models'); 
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const LaboratoryTest = sequelize.define(
    models.LABORATORY_TEST,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cptCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      loincCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT('long'),
        // allowNull: false,
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name:'test_name',
          fields: ['name']
        },
        {
          name:'test_cpt_code',
          fields: ['cptCode']
        },
        {
          name:'test_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(LaboratoryTest);

  return LaboratoryTest;
};
