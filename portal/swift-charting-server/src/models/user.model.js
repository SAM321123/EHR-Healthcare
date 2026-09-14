/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const models = require('../config/models');
const { errorMessages } = require('../config/error');
const { regex } = require('../config/regex');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const User = sequelize.define(
    models.USER,
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      middleName: {
        type: DataTypes.STRING,
        trim: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      loginAttempt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
       twoFaEnable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blockedDateTime: {
        type: DataTypes.DATE,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          len: [8, Infinity],
          customValidator(value) {
            if (!/\d/.test(value) || !/[a-zA-Z]/.test(value)) {
              throw new Error('Password must contain at least one letter and one number');
            }
          },
        },
      },
      tenantId: {
        type: DataTypes.INTEGER,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
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
      lastActivity: {
        type: DataTypes.DATE,
      },
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'user_first_name',
          fields: ['firstName']
        },
        {
          name: 'user_middle_name',
          fields: ['middleName']
        },
        {
          name: 'user_last_name',
          fields: ['lastName']
        },
        {
          name: 'user_email',
          fields: ['email']
        },
        {
          name: 'tenant_id',
          fields: ['tenantId']
        },
        {
          name: 'is_delete',
          fields: ['isDeleted']
        },
      ]
    }
  );

  /**
   * Check if password matches the user's password
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  User.prototype.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.beforeCreate(async (user) => {
    if (!user.password.match(regex.PASSWORD)) {
      throw new Error(errorMessages.INVALID_PASSWORD_PATTERN);
    }
    user.password = await bcrypt.hash(user.password, 12);
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      if (!user.password.match(regex.PASSWORD)) {
        throw new Error(errorMessages.INVALID_PASSWORD_PATTERN);
      }
      user.password = await bcrypt.hash(user.password, 12);
      user.passwordChangedAt = new Date();
    }
  });
  paginate(User);
  watchChanges(User);

  return User;
};
