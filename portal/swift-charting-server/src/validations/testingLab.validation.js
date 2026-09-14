const Joi = require("joi");

const getTestingLabs = {
    query: Joi.object().keys({
      searchText: Joi.string(),
      subscribeSocket: Joi.bool(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
      isActive:Joi.boolean(),
    }),
  };

const createTestingLab = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    labId: Joi.string().required(),
    ftpUser:Joi.string().required(),
    ftpPassword: Joi.string().required(),
    ftpHost:Joi.string().required(),
    ftpPath:Joi.string().required(),
    hl7VersionCode:Joi.string().required(),
  }),
}   

const updateTestingLab = {
  params: Joi.object().keys({
    testingLabId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      labId:  Joi.string(),
      ftpUser: Joi.string(),
      ftpPassword: Joi.string(),
      ftpHost: Joi.string(),
      ftpPath:Joi.string(),
      hl7VersionCode:Joi.string(),
      isDeleted: Joi.boolean(),
      isActive:Joi.boolean(),
    })
    .min(1),
};


  
module.exports = {
  getTestingLabs,
  createTestingLab,
  updateTestingLab,
}