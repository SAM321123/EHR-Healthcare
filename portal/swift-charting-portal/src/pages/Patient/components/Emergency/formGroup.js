import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
const { requiredField, statusOptions, onlyNumber } = require('src/lib/constants');
const { WiredMasterField } = require('src/wiredComponent/Form/FormFields');

const showPatientRelationOther = (data)=>{
  if (data?.patientRelationCode === 'emergency_contact_relation_other') {
    return { hide: false };
  }
  return { hide: true };
}
const emergencyContactFormGroups = [
  {
    inputType: 'text',
    name: 'emergencyContactName',
    textLabel: 'Emergency Contact Name',
    required: requiredField,
    colSpan: 0.5,
  },
  {
    inputType: 'phoneInput',
    name: 'emergencyContactNo',
    textLabel: 'Emergency Contact No.',
    // pattern: onlyNumber,
    required: requiredField,
    colSpan: 0.5,
  },
  {
    ...WiredMasterField({
      code: 'emergency_contact_relation',
      filter:{limit:100},
      name: 'patientRelationCode',
      label:"Relation With Patient",
      labelAccessor:'name',
      valueAccessor:'code',
      colSpan:0.5,
      placeholder:'Select',
      required: requiredField,
      cache:false,

    }),
  },
  {
    inputType: 'text',
    name: 'patientRelationOther',
    textLabel: 'Relation With Patient (Other)',
    colSpan: 0.5,
    dependencies: {
      keys: ['patientRelationCode'],
      calc: showPatientRelationOther,
    },
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
    inputType: 'textArea',
    name: 'description',
    textLabel: 'Description',
    colSpan: 1,
  },
];

export default emergencyContactFormGroups;
