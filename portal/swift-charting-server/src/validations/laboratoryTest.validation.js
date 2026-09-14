const Joi = require("joi");

const getLaboratoryTests = {
    query: Joi.object().keys({
      searchText: Joi.string(),
      subscribeSocket: Joi.bool(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
      isActive:Joi.boolean(),
    }),
  };


const createLaboratoryTests = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    cptCode:  Joi.string().allow(''),
    loincCode: Joi.string().allow(''),
    // description: Joi.string(),
  }),
}  

const updateLaboratoryTest = {
  params: Joi.object().keys({
    laboratoryTestId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      cptCode:  Joi.string().allow(''),
      loincCode: Joi.string().allow(''),
      description: Joi.string(),
      isDeleted: Joi.boolean(),
      isActive:Joi.boolean(),
    })
    .min(1),
};


module.exports = {
  getLaboratoryTests,
  createLaboratoryTests,
  updateLaboratoryTest,
}