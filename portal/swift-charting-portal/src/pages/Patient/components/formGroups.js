import { getAllTimezones, getTimezonesForCountry } from 'countries-and-timezones';
import {
  inputLength,
  minDOB,
  onlyNumber,
  regEmail,
  regexCustomText,
  regFirstname,
  regTextArea,
  requiredField,
  roleTypes,
} from 'src/lib/constants';
import { WiredMasterField, WiredStaffField } from 'src/wiredComponent/Form/FormFields';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';

const showOtherTitle = (data) => {
  console.log("🚀 ~ showOtherTitle ~ data:", data)
  if (data?.titleCode === 'name_prefixes_other') {
    return { hide: false };
  }
  return { hide: true };
};
const showOtherSexAtBirth = (data) => {
  if (data?.sexAtBirthCode === 'gender_at_birth_other') {
    return { hide: false };
  }
  return { hide: true };
};
const showOtherMaritalStatus = (data) => {
  if (data?.maritalStatusCode === 'marital_status_other') {
    return { hide: false };
  }
  return { hide: true };
};

const showAnotherGenderIdentity = (data) => {
  if (data?.genderIdentityCode === 'another_gender_identity') {
    return { hide: false };
  }
  return { hide: true };
};
const showAnotherOrientation = (data)=>{
  if (data?.sexualOrientationCode === 'another_orientation_not_listed') {
    return { hide: false };
  }
  return { hide: true };
}
const showRaceUnknown = (data)=>{
  if (data?.raceCode === 'unknown') {
    return { hide: false };
  }
  return { hide: true };
}
const patientFormGroups = [
  {
    ...WiredMasterField({
      code: 'name_prefixes',
      filter:{limit:20},
      name: 'titleCode',
      label:"Title",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.15,
      placeholder:'Select ',
      // required: requiredField,
      cache:false,

    }),
  },
  {
    inputType: 'text',
    name: 'otherTitle',
    textLabel: 'Title (Other)',
    colSpan: 0.15,
    pattern: regexCustomText,
    dependencies: {
      keys: ['titleCode'],
      calc: showOtherTitle,
    },
  },
  {
    inputType: 'text',
    name: 'firstName',
    textLabel: 'First Name',
    required: requiredField,
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    minLength: { value: 3 },
    colSpan: 0.233,
  },
  {
    inputType: 'text',
    name: 'middleName',
    textLabel: 'Middle Name',
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    colSpan: 0.233,
  },
  {
    inputType: 'text',
    name: 'lastName',
    textLabel: 'Last Name',
    required: requiredField,
    pattern: {
      value: regFirstname.value,
      message: `Lastname ${regFirstname?.message}`,
    },
    maxLength: { ...inputLength.firstName },
    colSpan: 0.233,
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email',
    required: requiredField,
    pattern: regEmail,
    maxLength: { ...inputLength.email },
    colSpan:0.25
  },
  {
    inputType: 'date',
    name: 'dob',
    required: requiredField,
    textLabel: 'Date of Birth',
    minDate: minDOB,
    disableFuture: true,
    colSpan:0.25,
    
  },
  {
    inputType: 'phoneInput',
    name: 'phone',
    textLabel: 'Phone No.',
    pattern:onlyNumber,
    colSpan:0.25,
    required: requiredField,
    
  },
  {
    inputType: 'phoneInput',
    name: 'workPhone',
    textLabel: 'Work Phone No.',
    pattern:onlyNumber,
    colSpan:0.25
  },
  {
    inputType: 'phoneInput',
    name: 'homePhone',
    textLabel: 'Home Phone No.',
    pattern:onlyNumber,
    colSpan:0.25
  },
  {
    inputType: 'phoneInput',
    name: 'textMessagePhone',
    textLabel: 'Text Message No.',
    pattern:onlyNumber,
    colSpan:0.25
  },
  {
    inputType: 'phoneInput',
    name: 'preferredPhone',
    textLabel: 'Preferred Phone No.',
    pattern:onlyNumber,
    colSpan:0.25
  },
  {
    inputType: 'phoneInput',
    name: 'alternativePhone',
    textLabel: 'Alternative Phone No.',
    pattern:onlyNumber,
    colSpan:0.25
  },
  {
    ...WiredMasterField({
      code: 'contact_methods',
      filter:{limit:20},
      name: 'preferredContactMethodCode',
      label:"Preferred Contact Method",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.25,
      placeholder:'Select',

    }),
  },
  {
    inputType: 'text',
    name: 'preferredName',
    textLabel: 'Preferred Name',
    pattern: {
      value: regFirstname.value,
      message: `Preferred name ${regFirstname?.message}`,
    },
    colSpan:0.25
  },
  {
    ...WiredMasterField({
      code: 'gender_at_birth',
      filter:{limit:20},
      name: 'sexAtBirthCode',
      label:"Sex at birth",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.25,
      cache:false,
      required: requiredField,
  }),
  },
  {
    inputType: 'text',
    name: 'otherSexAtBirth',
    textLabel: 'Sex at birth (Other)',
    colSpan: 0.25,
    pattern: regexCustomText,
    dependencies: {
      keys: ['sexAtBirthCode'],
      calc: showOtherSexAtBirth,
    },
  },
  {
    ...WiredMasterField({
      code: 'gender',
      filter:{limit:20},
      name: 'genderIdentityCode',
      label:"Gender Identity",
      labelAccessor:"name",
      valueAccessor:"code",
      colSpan:0.25,
    }),
  },
  {
    inputType: 'text',
    name: 'anotherGenderIdentity',
    textLabel: 'Another gender identity',
    colSpan: 0.25,
    pattern: regexCustomText,
    dependencies: {
      keys: ['genderIdentityCode'],
      calc: showAnotherGenderIdentity,
    },
  },
  {
    ...WiredMasterField({
      code: 'sexual_orientation',
      filter:{limit:20},
      name: 'sexualOrientationCode',
      label:"Sexual Orientation",
      labelAccessor:"name",
      valueAccessor:"code",
      colSpan:0.25,
    }),
  },
  {
    inputType: 'text',
    name: 'anotherOrientation',
    textLabel: 'Another Orientation',
    colSpan: 0.25,
    pattern: regexCustomText,
    dependencies: {
      keys: ['sexualOrientationCode'],
      calc: showAnotherOrientation,
    },
  },
  {
    ...WiredMasterField({
      code: 'pronouns',
      filter:{limit:20},
      name: 'pronounsCode',
      label:"Pronouns",
      labelAccessor:"name",
      valueAccessor:"code",
      colSpan:0.25,
    }),
  },
  {
    ...WiredMasterField({
      code: 'race_code',
      filter:{limit:20},
      name: 'raceCode',
      label:"Race",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.25,
    })
  },
  {
    inputType: 'text',
    name: 'raceUnknown',
    textLabel: 'Race (Unknown)',
    colSpan: 0.25,
    pattern: regexCustomText,
    dependencies: {
      keys: ['raceCode'],
      calc: showRaceUnknown,
    },
  },
  {
    inputType: 'text',
    name: 'religion',
    textLabel: 'Religion',
    colSpan: 0.25,
    pattern: regexCustomText,
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    required: requiredField,
    itemProps:{
      address:{colSpan:1},
      countryCode:{colSpan:0.25},
      stateCode:{colSpan:0.25},
      city:{colSpan:0.25},
      postalCode:{colSpan:0.25},

    }
  },

  {
    inputType: 'select',
    name: 'timezone',
    label: 'Timezone',
    valueAccessor: 'name',
    labelAccessor: 'displayLabel',
    required: requiredField,
    colSpan:0.5,
    dependencies: {
      keys: ['address','address.countryCode'],
      calc: (data, form, { isValueChanged } = {}) => {
        const { setValue = () => {} } = form || {};
        const allTimezones = getAllTimezones()
        const allTimezonesArray = Object.values(allTimezones);
        // const { address: { countryCode: code } = {} } = data;
        const code = data?.address?.countryCode;
        if (isValueChanged) setValue('timezone', '');
        const rawTimezones = code ? getTimezonesForCountry(code) : allTimezonesArray;
        const formattedTimezones = formatTimezonesForDisplay(rawTimezones);
        return {
          reFetch: true,
          options: formattedTimezones,
        };
      },
    },
  },
  {
    ...WiredMasterField({
      code: 'marital_status',
      filter:{limit:20},
      name: 'maritalStatusCode',
      label:"Marital Status",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.5,
    }),
  },
  {
    inputType: 'text',
    name: 'otherMaritalStatus',
    textLabel: 'Marital Status (Other)',
    colSpan: 0.5,
    dependencies: {
      keys: ['maritalStatusCode'],
      calc: showOtherMaritalStatus,
    },
  },
  {
    ...WiredStaffField({
      name: 'primaryProviderId',
      label:"Primary Provider",
      colSpan:0.5,
      placeholder:'Select',
    }),
  },
  {
    inputType: 'text',
    name: 'primaryCareProvider',
    textLabel:"Primary Care Provider",
    colSpan:0.5,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'guardian',
    textLabel: 'Guardian',
    colSpan:0.5
  },
  {
    inputType: 'text',
    name: 'education',
    textLabel: 'Education',
    colSpan: 0.5,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'occupation',
    textLabel: 'Occupation',
    colSpan:0.5,
    pattern: regexCustomText,
  },
  // {
  //   inputType: 'text',
  //   name: 'occupationDetail',
  //   textLabel: 'Occupation Details',
  //   colSpan:0.5,
  //   pattern: regexCustomText,
  // },
  {
    inputType: 'text',
    name: 'languagesSpoken',
    textLabel: 'Languages Spoken',
    colSpan: 0.5,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'ssn',
    textLabel: 'SSN',
    colSpan: 0.5,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'driversLicensNo',
    textLabel: `Driver's License Number`,
    colSpan: 0.5,
    pattern: regexCustomText,
  },

  {
    inputType: 'text',
    name: 'medicalAttorney',
    textLabel: 'Medical Power of Attorney',
    colSpan: 0.5,
    pattern: regexCustomText,
  },
  {
    inputType: 'text',
    name: 'preferredPharmacy',
    textLabel: 'Preferred Pharmacy',
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    inputType: 'mapAutoComplete',
    name: 'pharmacyAddress',
    label: 'Preferred Pharmacy Address',
    itemProps:{
      address:{colSpan:1 , label: 'PreferredPharmacy Address' ,},
      countryCode:{colSpan:0.5 , label: 'Preferred Pharmacy Country' },
      stateCode:{colSpan:0.5 , label: 'Preferred Pharmacy State'},
      city:{colSpan:0.5 , label: 'Preferred Pharmacy City'},
      postalCode:{colSpan:0.5 , label: 'Preferred Pharmacy ZIP code'},

    }
  },

  {
    inputType: 'text',
    name: 'employer',
    textLabel: 'Employer',
    colSpan:0.5
  },  
  //   {
  //   inputType: 'nestedForm',
  //   name: 'emergencyContactDetail',
  //   label: 'Dosage details for active ingredients',
  //   textButton: 'Add New',
  //   required: requiredField,
  //   columnsPerRow: 1,
  //   colSpan: 2,
  //   gridGap: 2,
  //   formGroups: [
  //     {
  //       inputType: 'text',
  //       name: 'name',
  //       textLabel: 'Emergency Contact Name',
  //       colSpan: 0.333,
  //     },
  //     {
  //       inputType: 'text',
  //       type: 'number',
  //       name: 'phone',
  //       textLabel: 'Emergency Contact No.',
  //       colSpan: 0.333,
  //     },
  //     {
  //       inputType: 'text',
  //       name: 'relation',
  //       textLabel: 'Relation with Patient',
  //       colSpan: 0.333,
  //     },

  //   ],
  // },

  {
    inputType: 'text',
    name: 'financialResponsibilityParty',
    textLabel: 'Financial Responsible Party',
    colSpan:0.5,
  },
  {
    inputType: 'text',
    name: 'financialResponsibleRelation',
    textLabel: 'Relationship of Financial Responsible Party to Patient',
    colSpan:0.5,
  },
  {
    inputType: 'text',
    name: 'referredBy',
    textLabel: 'Referred By',
    colSpan: 0.5,
  },
  {
    inputType: 'textArea',
    name: 'notes',
    textLabel: 'Patient Notes',
    colSpan: 1,
    pattern:regTextArea,
  },
];

export default patientFormGroups;
