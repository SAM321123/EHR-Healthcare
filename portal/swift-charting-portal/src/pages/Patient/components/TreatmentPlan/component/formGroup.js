import { API_URL } from 'src/api/constants';
import { regexCustomText, requiredField } from 'src/lib/constants';

const {
  WiredMasterAutoComplete,
} = require('src/wiredComponent/Form/FormFields');

export const showTemplateField = (data) => {
  if(!data.addTreatmentPlanTemplate ) {
    return { hide: true };
  }
  return { hide: false };
};
export const showOverrideTemplateField = (data) => {
  if(!data.editTreatmentPlanTemplate ) {
    return { hide: true };
  }
  return { hide: false };
};


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

// export const treatmentPlanFormGroups = [
//   {
//     inputType: 'date',
//     name: 'startDate',
//     textLabel: 'Start Date',
//     required: requiredField,
//     disableFuture: false,
//     colSpan: 0.33,
//   },
//   {
//     inputType: 'date',
//     name: 'endDate',
//     textLabel: 'End Date',
//     required: requiredField,
//     disableFuture: false,
//     colSpan: 0.33,
//   },
//   {
//     inputType: 'text',
//     type: 'number',
//     name: 'treatmentDays',
//     textLabel: 'Expected Length of Treatment Days',
//     colSpan: 0.33,
//   },
//   {
//     inputType: 'checkBox',
//     name: 'addTreatmentPlanTemplate',
//     label: 'Add this treatment plan as template',
//     colSpan: 0.5,
//   },
//   {
//     inputType: 'checkBox',
//     name: 'editTreatmentPlanTemplate',
//     label: 'Override template',
//     colSpan: 0.5,
//   },
//   {
//     inputType: 'text',
//     name: 'templateName',
//     textLabel: 'Override Template Name',
//     pattern: regexCustomText,
//     colSpan: 1,
//     dependencies: {
//       keys: ['editTreatmentPlanTemplate'],
//       calc: showOverrideTemplateField,
//     },
//   },
//   {
//     inputType: 'textArea',
//     name: 'templateDescription',
//     textLabel: 'Override Treatment Description',
//     colSpan: 1,
//     dependencies: {
//       keys: ['editTreatmentPlanTemplate'],
//       calc: showOverrideTemplateField,
//     },
//   },
//   {
//     inputType: 'text',
//     name: 'templateName',
//     textLabel: 'Treatment Template Name',
//     pattern: regexCustomText,
//     colSpan: 1,
//     dependencies: {
//       keys: ['addTreatmentPlanTemplate'],
//       calc: showTemplateField,
//     },
//   },
//   {
//     inputType: 'textArea',
//     name: 'templateDescription',
//     textLabel: 'Treatment Description',
//     colSpan: 1,
//     dependencies: {
//       keys: ['addTreatmentPlanTemplate'],
//       calc: showTemplateField,
//     },
//   },
// ];