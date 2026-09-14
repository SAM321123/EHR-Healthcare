import {useMemo} from 'react';
import {
    WiredLocationField,
    WiredMasterAutoComplete,
    WiredMasterField,
    WiredSelect,
    WiredStaffField,
  } from 'src/wiredComponent/Form/FormFields';
  import {
    hourOptions,
    inputLength,
    maxLength,
    meridianOptions,
    minDOB,
    minuteOptions,
    onlyNumber,
    regEmail,
    regexCustomText,
    regFirstname,
    requiredField,
    roleTypes,
    regTextArea,
  } from 'src/lib/constants';
import { API_URL } from 'src/api/constants';
import { isEmpty } from 'lodash';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { responseModifierRoles } from 'src/api/helper';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';

const showOtherTitle = (data) => {
    if (data?.titleCode === 'name_prefixes_other') {
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

export const formFields = [
    {
        ...WiredMasterField({
          code: 'name_prefixes',
          filter:{limit:20},
          name: 'titleCode',
          label:"Title",
          labelAccessor:'name',
          valueAccessor:'code',
          colSpan:0.15,
          // placeholder:'Mr.',
          required: requiredField,
          cache:false,
    
        }),
      },
    {
      inputType: 'text',
      name: 'otherTitle',
      textLabel: 'Title (Other)',
      colSpan: 0.15,
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
        colSpan:0.5
      },
      {
        ...WiredMasterField({
          url: API_URL.role,
          filter: { limit: 20 },
          name: 'roleIds',
          label: 'Role',
          labelAccessor: 'name',
          valueAccessor: 'id',
          colSpan: 0.5,
          multiple: true,
          required: requiredField,
          placeholder: 'Select the Role',
          cache: false,
          responseModifier: responseModifierRoles
        }),
      },
      {
        inputType: 'checkBox',
        name: 'isPrescriber',
        label: 'Prescriber ($37.99)',
        colSpan: 0.5,
      },
      {
        ...WiredMasterField({
          code: 'gender',
          filter:{limit:20},
          name: 'genderIdentityCode',
          label:"Gender Identity",
          labelAccessor:"name",
          valueAccessor:"code",
          colSpan:0.5,
        }),
      },
      {
        inputType: 'text',
        name: 'anotherGenderIdentity',
        textLabel: 'Another gender identity',
        colSpan: 0.5,
        dependencies: {
          keys: ['genderIdentityCode'],
          calc: showAnotherGenderIdentity,
        },
      },
      {
        inputType: 'phoneInput',
        name: 'phone',
        textLabel: 'Phone No.',
        pattern:onlyNumber,
        required: requiredField,
        colSpan:0.5,  
      },
      {
        inputType: 'phoneInput',
        name: 'preferredPhone',
        textLabel: 'Preferred Phone No.',
        pattern:onlyNumber,
        colSpan:0.5
      },
      {
        ...WiredMasterField({
          code: 'pronouns',
          filter:{limit:20},
          name: 'pronounsCode',
          label:"Pronouns",
          labelAccessor:"name",
          valueAccessor:"code",
          colSpan:0.5,
        }),
      },
      {
        inputType: 'mapAutoComplete',
        name: 'address',
        label: 'Address',
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
      {
        inputType: 'number',
        name: 'npiNo',
        // minLength: { value: 10 },
        // maxLength: { ...inputLength.amountLength },
        // pattern: "\d{10}",
        textLabel: 'National Provider Identifier number',
        colSpan: 0.5,
      },

      {
        inputType: 'text',
        name: 'stateLicenseNo',
        textLabel: 'State License Number',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'deaNo',
        textLabel: 'DEA Number',
        colSpan: 0.5,
        pattern: regexCustomText,

      },
      {
        inputType: 'text',
        name: 'fedralTaxId',
        textLabel: 'Federal Tax ID',
        colSpan: 0.5,
        pattern: regexCustomText,

      },
      {
        inputType: 'text',
        name: 'socialSecurityNo',
        textLabel: 'Social Security Number',
        colSpan: 0.5,
        pattern: regexCustomText,

      },
      {
        inputType: 'text',
        name: 'experience',
        textLabel: 'Years Of Experience In Practice',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'conditionsTreated',
        textLabel: ' Conditions Treated',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'clientFocusAges',
        textLabel: 'Client Focus Ages',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'checkBox',
        name: 'insurancesAccepted',
        label: 'Insurances Accepted',
        colSpan: 0.5,
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
        name: 'professionalAssociations',
        textLabel: 'Professional Associations',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'hospitalAffiliations',
        textLabel: 'Hospital Affiliations',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'additionalCertifications',
        textLabel: 'Additional Certifications',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'languagesSpoken',
        textLabel: 'Languages Spoken',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'facebook',
        textLabel: 'Facebook',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'instagram',
        textLabel: 'Instagram',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'whatsapp',
        textLabel: 'WhatsApp',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        name: 'linkedin',
        textLabel: 'LinkedIn',
        colSpan: 0.5,
        pattern: regexCustomText,
      },
      {
        inputType: 'textArea',
        name: 'bio',
        textLabel: 'Bio',
        colSpan: 1,
        pattern:regexCustomText,
      },

];