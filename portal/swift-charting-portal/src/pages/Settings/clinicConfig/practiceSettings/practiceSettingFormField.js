import { getTimezonesForCountry } from "countries-and-timezones";
import { onlyNumber, regEmail, regexCustomText, requiredField } from "src/lib/constants";
import { formatTimezonesForDisplay } from "src/lib/timezoneHelpers";

export const practiceSettingFormField = [
    {
      inputType: 'text',
      type: 'text',
      name: 'name',
      required: requiredField,
      textLabel: 'Name',
      colSpan: 0.5,
      pattern: regexCustomText,
    },
    {
      inputType: 'text',
      type: 'email',
      name: 'email',
      textLabel: 'Email',
      pattern: regEmail,
      colSpan: 0.5,
      required: requiredField,
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
        // required: requiredField,
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
      inputType: 'phoneInput',
      type: 'number',
      name: 'contact',
      textLabel: 'Contact',
      pattern: onlyNumber,
      colSpan: 0.5,
    //   required: requiredField,
    },
    {
        inputType: 'text',
        type: 'text',
        name: 'primaryContactName',
        // required: requiredField,
        textLabel: 'Primary Contact Name',
        colSpan: 0.5,
        pattern: regexCustomText,
    },
    {
        inputType: 'phoneInput',
        type: 'number',
        name: 'primaryContactPhone',
        textLabel: 'Primary Contact Phone',
        pattern: onlyNumber,
        colSpan: 0.5,
        //   required: requiredField,
    },
    {
        inputType: 'signature',
        name: 'signature',
        colSpan: 2,
        gridProps: { md: 12 },
        // required: requiredField,
      },
  ];