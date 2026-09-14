export const emailCampaignTemplateTokens = [
  { label: 'Patient Full Name', token: 'patientName', group: 'Patient' },
  { label: 'Patient First Name', token: 'patientFirstName', group: 'Patient' },
  { label: 'Patient Middle Name', token: 'patientMiddleName', group: 'Patient' },
  { label: 'Patient Last Name', token: 'patientLastName', group: 'Patient' },
  { label: 'Patient Preferred Name', token: 'patientPreferredName', group: 'Patient' },
  { label: 'Patient Email', token: 'patientEmail', group: 'Patient' },
  { label: 'Patient Phone', token: 'patientPhone', group: 'Patient' },
  { label: 'Patient Contact', token: 'patientContact', group: 'Patient' },
  { label: 'Patient DOB', token: 'patientDob', group: 'Patient' },
  { label: 'Patient Age', token: 'patientAge', group: 'Patient' },
  { label: 'Patient ID', token: 'patientId', group: 'Patient' },
  { label: 'Patient Gender', token: 'patientGender', group: 'Patient' },
  { label: 'Patient Address', token: 'patientAddress', group: 'Patient' },
  { label: 'Patient Timezone', token: 'patientTimezone', group: 'Patient' },
  { label: 'Clinic Name', token: 'clinicName', group: 'Clinic' },
  { label: 'Clinic Email', token: 'clinicEmail', group: 'Clinic' },
  { label: 'Clinic Phone', token: 'clinicPhone', group: 'Clinic' },
  { label: 'Clinic Primary Contact Name', token: 'clinicPrimaryContactName', group: 'Clinic' },
  { label: 'Clinic Primary Contact Phone', token: 'clinicPrimaryContactPhone', group: 'Clinic' },
  { label: 'Clinic Address', token: 'clinicAddress', group: 'Clinic' },
  { label: 'Clinic Domain', token: 'clinicDomain', group: 'Clinic' },
  { label: 'Clinic Timezone', token: 'clinicTimezone', group: 'Clinic' },
  { label: 'Location Name', token: 'clinicLocationName', group: 'Clinic' },
  { label: 'Location Phone', token: 'clinicLocationPhone', group: 'Clinic' },
  { label: 'Location Fax', token: 'clinicLocationFax', group: 'Clinic' },
  { label: 'Location Email', token: 'clinicLocationEmail', group: 'Clinic' },
  { label: 'Location Contact Person', token: 'clinicLocationContactPerson', group: 'Clinic' },
  { label: 'Location Address', token: 'clinicLocationAddress', group: 'Clinic' },
];

export const emailCampaignTemplateDropDownOptions = JSON.stringify(
  emailCampaignTemplateTokens.map(({ label, token }) => ({ label, token }))
);
