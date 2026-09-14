import { getTimezonesForCountry } from "countries-and-timezones";
import { maxLength, onlyNumber, regEmail, regexCustomText, regexDomain, regexName, requiredField } from "src/lib/constants";

export const clinicAddFormField = [
    {
        inputType: 'text',
        name: 'name',
        textLabel: 'Clinic Name',
        required: requiredField,
        maxLength: maxLength('Clinic Name', 200),
        gridProps: { md: 12 },
        pattern: {
            value: regexName.value,
            message: `Clinic Name ${regexName.message}`,
        },
    },
    {
        inputType: 'text',
        type: 'email',
        name: 'email',
        textLabel: 'Clinic Email Address ',
        // required: requiredField,
        pattern: regEmail,
        gridProps: { md: 12 },
        // disabled: selectedClinic ? !isClinicAdmin : isClinicAdmin,
    },
    {
    inputType: 'text',
    name: 'domainName',
    textLabel: 'URL',
    // required: requiredField,
    maxLength: maxLength('URL', 200),
    gridProps: { md: 12 },
    disabled: true,         
    copyToClipboard: true,   
    displaySuffix: '.swiftcharting.com', 
    pattern: {
        value: regexDomain.value,
        message: `URL ${regexDomain.message}`,
    },
},
    {
        inputType: 'phoneInput',
        name: 'contact',
        textLabel: 'Contact Number',
        gridProps: { md: 12 },
    },
    {
        inputType: 'mapAutoComplete',
        name: 'address',
        label: 'Address',
        // required: requiredField,
    },
];