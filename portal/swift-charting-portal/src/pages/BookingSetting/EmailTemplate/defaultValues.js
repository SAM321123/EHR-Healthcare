import { REQUEST_METHOD } from 'src/api/constants';

export const durationTypeOptions = [
  { name: 'Days', code: 'day' },
  { name: 'Minutes', code: 'minute' },
  { name: 'Hours', code: 'hour' },
];
export const relativeTimeOptions = [
  { name: 'After', code: 'after' },
  { name: 'Before', code: 'before' },
];
export const specificFieldOptions = [
  { name: 'Appointment Date', code: 'APPOINTMENT_DATE' },
];

export const initialTemplateTokens = JSON.stringify([
  { label: 'First Name', token: 'firstName' },
  { label: 'Last Name', token: 'lastName' },
]);
export const initialSuperadminTemplateTokens = JSON.stringify([
  { label: 'First Name', token: 'firstName' },
  { label: 'Middle Name', token: 'middleName' },
  { label: 'Last Name', token: 'lastName' },
  { label: 'Clinic Name', token: 'clinicName' },
]);

export const initialFormState = {
  open: false,
  defaultValue: {},
  id: '',
  type: REQUEST_METHOD.CREATE,
};
