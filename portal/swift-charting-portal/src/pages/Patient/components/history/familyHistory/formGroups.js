import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
const { requiredField, statusOptions } = require("src/lib/constants");
const { WiredMasterField } = require("src/wiredComponent/Form/FormFields");

const showOtherCondition = (data) => {
  if (data?.conditionCode === 'family_condition_other') {
    return { hide: false };
  }
  return { hide: true };
};

const familyHistoryFormGroups = [
    {
        ...WiredMasterField({
          code: 'family_relation',
          filter:{limit:20},
          name: 'relationshipCode',
          label:"Relationship",
          labelAccessor:'name',
          valueAccessor:'code',
          colSpan:0.3,
          placeholder:'Select',
          required: requiredField,
          cache:false,
    
        }),
      },
      {
        ...WiredMasterField({
          code: 'family_condition',
          filter:{limit:50},
          name: 'conditionCode',
          label:"Conditions/Diagnosis",
          labelAccessor:'name',
          valueAccessor:'code',
          colSpan:0.3,
          placeholder:'Select',
          required: requiredField,
          cache:false,
    
        }),
      },
      {
        inputType: 'text',
        name: 'conditionOther',
        textLabel: 'Conditions/Diagnosis (Other)',
        colSpan: 0.3,
        dependencies: {
          keys: ['conditionCode'],
          calc: showOtherCondition,
        },
      },
    {
      ...WiredMasterField({
        code: 'status_code',
        filter:{limit:20},
        name: 'statusCode',
        label:"Status",
        labelAccessor:'name',
        valueAccessor:'code',
        colSpan:0.4,
        placeholder:'Select',
        required: requiredField,
  
      }),
      },
      {
        inputType: 'textArea',
        name: 'description',
        textLabel: 'Description',
        colSpan: 1,
      },
]

export default familyHistoryFormGroups;