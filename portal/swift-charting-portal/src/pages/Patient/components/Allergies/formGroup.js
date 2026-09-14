const { requiredField, regTextArea, regexCustomText } = require('src/lib/constants');
const {
  WiredMasterAutoComplete,
  WiredMasterField,
} = require('src/wiredComponent/Form/FormFields');

export const allergiesFormGroups = [
  {
    inputType: 'text',
    type: 'text',
    name: 'allergy',
    textLabel: 'Allergy',
    required: requiredField,
    colSpan: 1,
    pattern: regexCustomText,
  },
  {
    ...WiredMasterAutoComplete({
      code: 'allergy_reactions',
      label: 'Reaction(s)',
      name: 'reactionCode',
      colSpan: 1,
      placeholder: 'Enter here',
      cache: false,
      multiple: true,
      required: requiredField,
      labelAccessor: 'name',
      valueAccessor: 'code',
      freeSolo: true,
    }),
  },
  // {
  //   component: () => <LoadingButton label="ADD" style={{ marginTop: 22 }} />,
  //   colSpan: 0.19,
  // },
  {
    ...WiredMasterField({
      code: 'allergy_severities',
      filter: { limit: 20 },
      name: 'severitiesCode',
      label: 'Allergy severities',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 0.5,
      placeholder: 'Select',
      cache: false,
    }),
  },
  {
    inputType: 'date',
    name: 'dateOfOnSet',
    textLabel: 'Date of OnSet',
    required: requiredField,
    disableFuture: true,
    colSpan: 0.5,
  },
  {
    inputType: 'checkBox',
    name: 'isActive',
    label: 'Active',
    gridProps: { md: 4 },
  },
  {
    inputType: 'textArea',
    name: 'comment',
    textLabel: 'Comments (Optional) ',
    colSpan: 1,
    pattern: regTextArea,
  },
];
