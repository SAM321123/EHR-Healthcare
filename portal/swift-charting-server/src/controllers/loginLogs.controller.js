/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { Op } = require('sequelize');
const { dbService } = require('../services');
const { getStartOfTheDayWithTZ, getEndOfTheDayWithTZ } = require('../utils/dateUtility');

const getLoginLogs = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { from, to, timezone } = req?.query || {};

  let whereClause = {};

  if (from && to) {
    whereClause = {
      ...whereClause,
      loginTime: {
        [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
      },
    };
  }

  const result = await dbService.getPaginated({
    model: db.LoginLogs,
    req,
    allowedFilters: ['email'],
    searchFilter: ['email'],
    addOnFilter: whereClause,
  });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getLoginLogs,
};
