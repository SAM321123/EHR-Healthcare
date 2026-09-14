const Joi = require('joi');

const createGlobalType = {
  params: Joi.object().keys({
    globalCategoryTypeCode: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    metaData: Joi.array().allow(),
    parentCode:Joi.string(),
    code:Joi.string(),
    sortOrder:Joi.number().required(),
    colorCode:Joi.string().allow(''),
    isActive:Joi.boolean(),
  }),
};
const getGlobalTypes = {
  query: Joi.object().keys({
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
    parentCode: Joi.string(),
    globalCategoryTypeCode: Joi.string(),
    ids: Joi.array(),
  }),
};
const getGlobalTypeSortList = {
  query: Joi.object().keys({
    globalCategoryTypeCode: Joi.string(),
  }),
};

const updateGlobalType = {
  params: Joi.object().keys({
    globalTypeId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(), 
      globalCategoryTypeCode: Joi.string(), 
      sortOrder: Joi.number(),
      colorCode:Joi.string(),
      metaData: Joi.array(),
      description: Joi.string(),
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),


    })
    .min(1),
};
const sortOrder = {
  body: Joi.object().keys({
    reorderedArray: Joi.array().required(),
  }),
}

module.exports = {
  createGlobalType,
  getGlobalTypes,
  updateGlobalType,
  getGlobalTypeSortList,
  sortOrder,
};
