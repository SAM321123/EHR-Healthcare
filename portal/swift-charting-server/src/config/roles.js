const roles = {
  CLINIC_ADMIN: 'clinicAdmin',
  SUPER_ADMIN: 'superAdmin',
  ASSISTANT: 'assistant',
  PRACTITIONER: 'practitioner',
  PATIENT: 'patient',
};

const allRoles = {
  [roles.SUPER_ADMIN]: [],
  [roles.CLINIC_ADMIN]: [],
  [roles.PATIENT]: [],
};

const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
