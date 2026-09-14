const httpStatus = require('http-status');
const { default: slugify } = require('slugify');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const createGlobalTypeCategory = catchAsync(async (req, res) => {
  const { name } = req.body || {};
  const { user: { id: userId } = {} } = req || {};

  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const code = slugify(name, '_');
  const doc = await db.GlobalCategoryType.create({ name, code, createdBy: userId });
  res.status(httpStatus.CREATED).send(doc);
});

const getGlobalTypeCategory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const enumMasters = await dbService.getPaginated({
      model: db.GlobalCategoryType,
      req,
      allowedFilters: ['isActive'],
      searchFilter: ['name'],
      // applySorting:false,
      // customOrder:[['sortOrder','ASC']],
      attributes:['id','name','code','description','metaData','isActive', 'isColorCode']
    });
  res.status(httpStatus.OK).send(enumMasters);
});

module.exports = {
  createGlobalTypeCategory,
  getGlobalTypeCategory,
};
