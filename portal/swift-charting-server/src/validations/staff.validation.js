const Joi = require('joi');

const createStaff = {
  body: Joi.object().keys({
    titleCode: Joi.string().required(),
    otherTitle: Joi.string().allow(''),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow(''),
    lastName: Joi.string().required(),
    roleIds: Joi.array().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    preferredPhone: Joi.string().allow(''),
    npiNo: Joi.number().allow(''),
    address: Joi.object().allow(''),
    timezone: Joi.string().required(),
    genderIdentityCode: Joi.string().allow(''),
    anotherGenderIdentity: Joi.string().allow(''),
    stateLicenseNo: Joi.string().allow(''),
    deaNo: Joi.string().allow(''),
    fedralTaxId: Joi.string().allow(''),
    socialSecurityNo: Joi.string().allow(''),
    experience: Joi.string().allow(''),
    file: Joi.object().allow(''),
    languagesSpoken: Joi.string().allow(''),
    whatsapp: Joi.string().allow(''),
    facebook: Joi.string().allow(''),
    linkedin: Joi.string().allow(''),
    instagram: Joi.string().allow(''),
    bio: Joi.string().allow(''),
    conditionsTreated:Joi.string().allow(''),
    clientFocusAges:Joi.string().allow(''),
    insurancesAccepted:Joi.bool(),
    education:Joi.string().allow(''),
    professionalAssociations:Joi.string().allow(''),
    hospitalAffiliations:Joi.string().allow(''),
    additionalCertifications:Joi.string().allow(''),
    pronounsCode: Joi.string().allow(''),
    isPrescriber: Joi.bool(),
  }),
};

const getStaff = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    role: Joi.string(),
    isActive: Joi.boolean().default(true),
  }),
};

const getStaffById = {
  params: Joi.object().keys({
    staffId: Joi.string(),
  }),
  query: Joi.object().keys({
    subscribeSocket: Joi.boolean(),
  }),
};

const updateStaff = {
  params: Joi.object().keys({
    staffId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      titleCode: Joi.string(),
      otherTitle: Joi.string().allow(''),
      firstName: Joi.string(),
      middleName: Joi.string().allow(''),
      lastName: Joi.string(),
      roleIds: Joi.array(),
      npiNo: Joi.number().allow(''),
      email: Joi.string().email(),
      phone: Joi.string().allow(''),
      preferredPhone: Joi.string(),
      address: Joi.object().allow(''),
      isDeleted: Joi.boolean(),
      timezone: Joi.string(),
      signature: Joi.string().allow(''),
      genderIdentityCode: Joi.string().allow(''),
      anotherGenderIdentity: Joi.string().allow(''),
      stateLicenseNo: Joi.string().allow(''),
      deaNo: Joi.string().allow(''),
      fedralTaxId: Joi.string().allow(''),
      socialSecurityNo: Joi.string().allow(''),
      experience: Joi.string().allow(''),
      file: Joi.object().allow(''),
      languagesSpoken: Joi.string().allow(''),
      whatsapp: Joi.string().allow(''),
      facebook: Joi.string().allow(''),
      linkedin: Joi.string().allow(''),
      instagram: Joi.string().allow(''),
      bio: Joi.string().allow(''),
      conditionsTreated:Joi.string().allow(''),
      clientFocusAges:Joi.string().allow(''),
      insurancesAccepted:Joi.bool(),
      education:Joi.string().allow(''),
      professionalAssociations:Joi.string().allow(''),
      hospitalAffiliations:Joi.string().allow(''),
      additionalCertifications:Joi.string().allow(''),
      pronounsCode: Joi.string().allow(''),
      isActive: Joi.bool(),
      isPrescriber: Joi.bool(),
      twoFaEnable: Joi.bool(),
    })
    .min(1),
};

module.exports = {
  createStaff,
  getStaff,
  updateStaff,
  getStaffById,

};
