const Joi = require("joi");

const getBrandNameDrugs = {
    query: Joi.object().keys({
      searchText: Joi.string(),
      name: Joi.string(),
      genericDrugId: Joi.number().integer(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    }),
  };

  module.exports={
    getBrandNameDrugs
  }