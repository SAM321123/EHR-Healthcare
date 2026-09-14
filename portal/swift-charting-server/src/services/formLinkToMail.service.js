const patientFormService = require('./patientForm.service');
const { getModels } = require('../utils/connection');
const { isUserExist: isStaffExist } = require('./user.service');
const config = require('../config/config');

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') return null;

  try {
    return new URL(value).origin.replace(/\/$/, '');
  } catch (error) {
    return null;
  }
};

const formLinkToMail = async (template, patient, user, uuid, practitionerId, baseUrl) => {
  const { clientURL } = config;
  const db = getModels(uuid);
  let templateString = template;
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl) || normalizeBaseUrl(clientURL);

  if (!practitionerId) {
    if (patient?.primaryProviderId) {
      practitionerId = patient.primaryProviderId;
    } else {
      const existingStaff = await isStaffExist(db.Staff, {
        where: { userId: user.userId, isDeleted: false },
      });
      practitionerId = existingStaff?.id;
    }
  }

  // Extract the numbers (3, 4) using a regular expression
  let formIds = [...templateString.matchAll(/FORMCODE_(\d+)/g)].map((match) => match[1]);

  for (const id of formIds) {
    const patientForm = await patientFormService.createPatientForm(
      { formId: id, patientId: patient.id, practitionerId, submittedBy: user.userId },
      { user, tenantId: uuid }
    );
    const replacementURL = `${resolvedBaseUrl}/patient-form/${patientForm.id}`;
    templateString = templateString.replace(`FORMCODE_${id}`, replacementURL);
  }

  return templateString;
};

module.exports = {
  formLinkToMail,
};
