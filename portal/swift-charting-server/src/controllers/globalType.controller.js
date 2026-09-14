const httpStatus = require('http-status');
const { default: slugify } = require('slugify');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const { errorMessages } = require('../config/error');
const ApiError = require('../utils/ApiError');

const createGlobalType = catchAsync(async (req, res) => {
  const { name } = req.body || {};
  const {globalCategoryTypeCode} = req?.params || {};
  const { user: { id: userId } = {} } = req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const code = slugify(`${name}_${globalCategoryTypeCode}`, '_');
  const isExist = await dbService.getOne({model:db.GlobalType,filter:{where:{globalCategoryTypeCode ,sortOrder: req.body.sortOrder }}});
  if(isExist){
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessages._EXIST(`Global type with this sort order`));
  }
  const doc =  await dbService.createOne({model:db.GlobalType,reqParams:{...req.body, name, code, globalCategoryTypeCode, createdBy: userId }});
  res.status(httpStatus.CREATED).send(doc);
});

const getGlobalTypes = catchAsync(async (req, res) => {
  const { globalCategoryTypeCode } = req.params || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const enumMasters = await dbService.getPaginated({
    model: db.GlobalType,
    req,
    allowedFilters: ['isActive','parentCode'],
    searchFilter: ['name'],
    addOnFilter: { globalCategoryTypeCode },
    applySorting:false,
    customOrder:[['sortOrder','ASC']],
    include:[{model:db.GlobalType,as:'parent'}],
    attributes:['id','name','code','description','parentCode','globalCategoryTypeCode','metaData','colorCode','isActive']
  });
  res.status(httpStatus.OK).send(enumMasters);
});

const getAllGlobalTypes = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const enumMasters = await dbService.getPaginated({
        model: db.GlobalType,
        req,
        allowedFilters: ['isActive','parentCode', 'globalCategoryTypeCode'],
        searchFilter: ['name'],
        include:[{model:db.GlobalType,as:'parent'}, {model: db.GlobalCategoryType, as: 'globalCategoryType' }],
        attributes:['id','name','code','description','parentCode','sortOrder','globalCategoryTypeCode','metaData','colorCode','isActive']
      });
  res.status(httpStatus.OK).send(enumMasters);
});
const getGlobalTypeSortList = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { globalCategoryTypeCode } = req.query;
  let result =[]
  let filter = {
    where: { isActive: true }
  };

  if (globalCategoryTypeCode) {
    filter.where.globalCategoryTypeCode = globalCategoryTypeCode;
    
      result = await db.GlobalType.findAll({
        where: { ...filter.where }, 
        include: [
          { model: db.GlobalType, as: 'parent' },
          { model: db.GlobalCategoryType, as: 'globalCategoryType' }
        ],
        attributes: [
          'id', 'name', 'code', 'description', 'parentCode',
          'sortOrder', 'globalCategoryTypeCode', 'metaData', 'colorCode', 'isActive'
        ],
        order: [['sortOrder', 'ASC']] 
      });
  }

  res.status(httpStatus.OK).send(result);
});



const updateGlobalType = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { globalTypeId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingGlobalType = await dbService.getOneById({ model: db.GlobalType, id: globalTypeId });
  if (!existingGlobalType) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Global type`));
  }

  const updatedGlobalType = await dbService.updateOne({
    model: db.GlobalType,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: globalTypeId } },
  });
  res.status(httpStatus.OK).send(updatedGlobalType);
});

const updateSortOrder = catchAsync(async (req, res) => {
  const { user,  body } = req;
  const userId = user.id;
  const {reorderedArray} = body
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const bulkUpdates = reorderedArray.map((item, index) =>
    db.GlobalType.update(
      { sortOrder: index + 1 , updatedById: userId},
      { where: { id: item.id } }
    )
  );

  const updatedGlobalType= await Promise.all(bulkUpdates);
 
  res.status(httpStatus.OK).send(updatedGlobalType);
});


module.exports = {
  createGlobalType,
  getGlobalTypes,
  updateGlobalType,
  getAllGlobalTypes,
  getGlobalTypeSortList,
  updateSortOrder,
};
