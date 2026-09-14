const Joi = require('joi');

const createFaxContact = {
  body: Joi.object().keys({
    name: Joi.string().allow(''),
    faxNo: Joi.string().allow(''),
    isDeleted: Joi.boolean(),
    email: Joi.string().email(),
    address: Joi.object().allow(''),
  }),
};

const getFaxContacts = {
  query: Joi.object().keys({
    name: Joi.string(),
    faxNo: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
  }),
};

const getFaxContact = {
  params: Joi.object().keys({
    faxContactId: Joi.number().integer(),
  }),
};

const updateFaxContact = {
  params: Joi.object().keys({
    faxContactId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().allow(''),
      faxNo: Joi.string().allow(''),
      isDeleted: Joi.boolean(),
      email: Joi.string().email(),
      address: Joi.object().allow(''),
    })
    .min(1),
};

const deleteFaxContact = {
  params: Joi.object().keys({
    faxContactId: Joi.number().integer(),
  }),
};

module.exports = {
  createFaxContact,
  getFaxContacts,
  getFaxContact,
  updateFaxContact,
  deleteFaxContact,
};
