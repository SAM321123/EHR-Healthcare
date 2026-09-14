import { getTimezonesForCountry } from 'countries-and-timezones';
import {
  dateFormats,
  inputLength,
  minDOB,
  regEmail,
  regFirstname,
  requiredField,
} from 'src/lib/constants';
import { getGendersForm } from 'src/lib/utils';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';

const editPatientOverviewFormGroups = () => [
  {
    inputType: 'text',
    name: 'firstName',
    textLabel: 'First Name',
    required: requiredField,
    gridProps: { md: 12 },
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    minLength: { value: 3 },
  },
  {
    inputType: 'text',
    name: 'lastName',
    textLabel: 'Last Name',
    required: requiredField,
    gridProps: { md: 12 },
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email',
    gridProps: { md: 12 },
    required: requiredField,
    pattern: regEmail,
    maxLength: { ...inputLength.email },
  },
  {
    inputType: 'phoneInput',
    name: 'contact',
    textLabel: 'Phone',
    gridProps: { md: 12 },
  },
  {
    inputType: 'date',
    name: 'dob',
    label: 'DOB',
    required: requiredField,
    gridProps: { md: 12 },
    disableFuture: true,
    minDate: minDOB,
    format: dateFormats.MMDDYYYY,
  },
  {
    name: 'height',
    inputType: 'select',
    label: 'Height(ft)',
    labelAccessor: 'height',
    valueAccessor: 'code',
    options: [
      ...Array.from({ length: 10 }, (_, i) => ({
        height: String(i + 1),
        code: String(i + 1),
      })),
    ],
    colSpan: 0.5,
    gridProps: { md: 4, sm: 4 },
  },
  {
    name: 'inches',
    inputType: 'select',
    label: 'Height(inches)',
    labelAccessor: 'inch',
    valueAccessor: 'code',
    options: [
      ...Array.from({ length: 12 }, (_, i) => ({
        inch: String(i+1 ),
        code: String(i +1),
      })),
    ],
    colSpan: 0.5,
    gridProps: { md: 4, sm: 4 },
  },
  {
    inputType: 'radio',
    name: 'gender',
    textLabel: 'Gender',
    required: requiredField,
    gridProps: { md: 12 },
    options: getGendersForm(),
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    required:requiredField
  },
  {
    inputType: 'select',
    name: 'timezone',
    label: 'Timezone',
    valueAccessor: 'name',
    labelAccessor: 'displayLabel',
    required: requiredField,
    dependencies: {
      keys: ['address'],
      calc: (data, form, { isValueChanged } = {}) => {
        const { setValue = () => {} } = form || {};
        const { address: { countryCode: code } = {} } = data;
        if (isValueChanged) setValue('timezone', '');
        const rawTimezones = getTimezonesForCountry(code || 'US');
        const formattedTimezones = formatTimezonesForDisplay(rawTimezones);
        return {
          reFetch: true,
          options: formattedTimezones,
        };
      },
    },
  },
];

export default editPatientOverviewFormGroups;
