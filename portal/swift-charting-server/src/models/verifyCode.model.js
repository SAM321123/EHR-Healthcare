const { DataTypes } = require('sequelize');
const models = require('../config/models');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Code = sequelize.define(
    models.VERIFICATION_CODE,
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'verification_code',
          fields: ['code']
        },
        {
          name: 'code_email',
          fields: ['email']
        },
        {
          name: 'code_expires',
          fields: ['expires']
        },      
      ]
    }
  );

  /**
   * Check if code matches the enter code
   * @param {string} code
   * @returns {Promise<boolean>}
  */
  Code.prototype.isCodeMatch = async function (code) {
    return bcrypt.compare(code, this.code);
  };
  
  Code.beforeCreate(async (code) => {
    code.code = await bcrypt.hash(String(code.code), 12);
  });

  return Code;
};
