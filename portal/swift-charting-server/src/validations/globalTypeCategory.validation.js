const Joi = require('joi');

const createGlobalTypeCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    discription: Joi.string().allow(null),
    metaData: Joi.string().allow(),
  }),
};

const getGlobalTypeCategory = {
  query: Joi.object().keys({
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
    parentCode: Joi.string(),
    ids: Joi.array(),
  }),
};


module.exports = {
  createGlobalTypeCategory,
  getGlobalTypeCategory,
};
