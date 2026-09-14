const Joi = require('joi');
const { password } = require('./custom.validation');

const createPractice = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    // logo: Joi.string().allow(null),
    address: Joi.object()
      .keys({
        addressLine1: Joi.string().allow(''),
        addressLine2: Joi.string().allow(''),
        stateCode: Joi.string().required(),
        postalCode: Joi.string().required(),
        placeId: Joi.string().allow(''),
        country: Joi.string().allow(''),
        city: Joi.string().allow(''),
        state: Joi.string().allow(''),
        description: Joi.string().allow(''),
        latitude: Joi.number().allow(''),
        longitude: Joi.number().allow(''),
        countryCode: Joi.string().required(),
        locality: Joi.string().allow(''),
      })
      .required(),
      // signature: Joi.string().allow(null),
      contact: Joi.string().required(),
      // taxId: Joi.string().allow(null),
      // clinicAdminName: Joi.string().required(),
      // clinicAdminEmail: Joi.string().required(),
      // clinicAdminContact: Joi.string().required(),
      staffFirstName: Joi.string().required(),
      staffMiddleName: Joi.string(),
      staffLastName: Joi.string().required(),
      staffEmail: Joi.string().required(),
      staffContact: Joi.string().required(),
      domainName: Joi.string().required(),
      staffPassword: Joi.string().required(),
  }),
};

const updatePractice = {
  params: Joi.object().keys({
    practiceId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      name: Joi.string(),
      address: Joi.object().allow(''),
      isActive: Joi.bool(),
      isDeleted: Joi.bool(),
    })
    .min(1),
};

const createSubscription = {
  body: Joi.object().keys({
    // tempPracticeId: Joi.number().required(),
    practitionerCount: Joi.number().required(),
    rnCount: Joi.number().required(),
    prescriberCount: Joi.number().required(),
    cardNo: Joi.number().required(),
    cost: Joi.number().required(),
    paymentMethodId: Joi.string().required(),
    amount: Joi.number().required(),
    customerName: Joi.string().required(),
    cardExpire: Joi.object().allow(''),
    cvc: Joi.object().allow(''),
    customerZip: Joi.number().required(),
  }),
};

module.exports = {
  createPractice,
  updatePractice,
  createSubscription
};
