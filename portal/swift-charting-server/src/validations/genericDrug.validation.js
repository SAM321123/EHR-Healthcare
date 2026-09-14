const Joi = require("joi");

const getGenricDrugs = {
    query: Joi.object().keys({
      searchText: Joi.string(),
      name: Joi.string(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
    }),
  };

  module.exports={
    getGenricDrugs
  }