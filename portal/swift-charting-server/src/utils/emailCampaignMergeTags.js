const he = require('he');
const moment = require('moment');
const { getAddress, getFullName, getPatientPhone } = require('./index');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const normalizeTemplateKey = (value = '') =>
  he
    .decode(`${value}`)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = moment(value);
  return date.isValid() ? date.format('MM/DD/YYYY') : '';
};

const formatAge = (value) => {
  if (!value) {
    return '';
  }

  const date = moment(value);
  return date.isValid() ? `${moment().diff(date, 'years')}` : '';
};

const formatGender = (patient = {}) => {
  if (patient.otherSexAtBirth) {
    return patient.otherSexAtBirth;
  }

  return patient.sexAtBirthCode || patient.genderIdentityCode || '';
};

const buildEmailCampaignTemplateParams = ({ patient = {}, clinic = {}, clinicLocation = {} } = {}) => {
  const patientName = getFullName(patient);
  const patientAddress = getAddress(patient);
  const clinicAddress = getAddress(clinic);
  const clinicLocationAddress = getAddress(clinicLocation);
  const patientPhone = getPatientPhone(patient);
  const patientGender = formatGender(patient);

  return {
    patientId: patient.patientId || patient.id || '',
    firstName: patient.firstName || '',
    middleName: patient.middleName || '',
    lastName: patient.lastName || '',
    fullName: patientName === 'N/A' ? '' : patientName,
    patientFullName: patientName === 'N/A' ? '' : patientName,
    patientName: patientName === 'N/A' ? '' : patientName,
    patientFirstName: patient.firstName || '',
    patientMiddleName: patient.middleName || '',
    patientLastName: patient.lastName || '',
    patientPreferredName: patient.preferredName || '',
    patientEmail: patient.email || '',
    patientPhone: patientPhone === 'N/A' ? '' : patientPhone,
    patientPhoneNumber: patientPhone === 'N/A' ? '' : patientPhone,
    patientContact: patientPhone === 'N/A' ? '' : patientPhone,
    patientDob: formatDate(patient.dob),
    patientAge: formatAge(patient.dob),
    patientGender,
    patientTimezone: patient.timezone || '',
    patientAddress: patientAddress || '',
    clinicName: clinic.name || '',
    clinicEmail: clinic.email || '',
    clinicContactEmail: clinic.email || '',
    clinicPhone: clinic.contact || '',
    clinicPhoneNumber: clinic.contact || '',
    clinicContact: clinic.contact || '',
    clinicAddress: clinicAddress || '',
    clinicDomain: clinic.domainName || '',
    clinicDomainName: clinic.domainName || '',
    clinicPrimaryContactName: clinic.primaryContactName || '',
    clinicPrimaryContactPhone: clinic.primaryContactPhone || '',
    clinicTimezone: clinic.timezone || '',
    clinicLocationName: clinicLocation.name || '',
    clinicLocationPhone: clinicLocation.phoneNo || '',
    clinicLocationPhoneNumber: clinicLocation.phoneNo || '',
    clinicLocationFax: clinicLocation.faxNo || '',
    clinicLocationEmail: clinicLocation.contactPersonEmail || '',
    clinicLocationContactPerson: clinicLocation.contactPersonName || '',
    clinicLocationContactName: clinicLocation.contactPersonName || '',
    clinicLocationContactPersonName: clinicLocation.contactPersonName || '',
    clinicLocationContactPersonEmail: clinicLocation.contactPersonEmail || '',
    clinicLocationContactPersonPhone: clinicLocation.contactPersonNo || '',
    clinicLocationContactEmail: clinicLocation.contactPersonEmail || '',
    clinicLocationContactPhone: clinicLocation.contactPersonNo || '',
    clinicLocationAddress: clinicLocationAddress || '',
  };
};

const renderEmailCampaignTemplate = ({ text = '', params = {} } = {}) => {
  if (!text) {
    return '';
  }

  return `${text}`.replace(/\[([\s\S]*?)\]/g, (match, key) => {
    const normalizedKey = normalizeTemplateKey(key);

    if (!normalizedKey) {
      return match;
    }

    if (hasOwn(params, normalizedKey)) {
      return params[normalizedKey] ?? '';
    }

    return match;
  });
};

module.exports = {
  buildEmailCampaignTemplateParams,
  renderEmailCampaignTemplate,
};
