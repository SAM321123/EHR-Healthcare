import { API_URL } from 'src/api/constants';
import { regexCustomText, requiredField } from 'src/lib/constants';

const {
  WiredMasterAutoComplete,
} = require('src/wiredComponent/Form/FormFields');

export const DiagnosisFormGroups = [
  {
    ...WiredMasterAutoComplete({
      url: API_URL.diagnosisIcd,
      label: 'ICD-10',
      name: 'ICDId',
      colSpan: 1,
      placeholder: 'Search by keyword(S) or code',
      cache: false,
      labelAccessor: 'name',
      valueAccessor: 'id',
      required: requiredField,
      showDescription: true,
      descriptionAccessor: 'description',
      params:{limit:100},
      multiple: true,
    }),
  },
];

export const templateFormGroups = [
  {
    inputType: 'text',
    name: 'templateName',
    textLabel: 'Template Name',
    pattern: regexCustomText,
    colSpan: 1,
    required: requiredField,
  },
  {
    inputType: 'textArea',
    name: 'templateDescription',
    textLabel: 'Template Description',
    colSpan: 1,
  },
];