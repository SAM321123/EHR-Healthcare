const { DataTypes } = require('sequelize');
const models = require('../config/models');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const VerifyCode = sequelize.define(
    models.EMAIL_VERIFY_CODE,
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
          name: 'code',
          fields: ['code']
        },
        {
          name: 'verify_code_email',
          fields: ['email']
        },
        {
          name: 'verify_code_expires',
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
  VerifyCode.prototype.isCodeMatch = async function (code) {
    return bcrypt.compare(code, this.code);
  };

  VerifyCode.beforeCreate(async (code) => {
    code.code = await bcrypt.hash(String(code.code), 12);
  });

  return VerifyCode;
};
