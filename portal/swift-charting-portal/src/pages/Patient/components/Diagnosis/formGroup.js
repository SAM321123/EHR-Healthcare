import { API_URL } from 'src/api/constants';
import { regTextArea, requiredField } from 'src/lib/constants';
import {
  WiredMasterAutoComplete,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';

const calcDiagnosisProblem = (data) => {
  if (data?.problemId) {
    return {
      reFetch: true,
      queryParams: { diagnosisProblemId: data?.problemId?.id },
    };
  }
  return { reFetch: false };
};

export const diagnosisFormGroups = [
  {
    inputType: 'radio',
    name: 'isActive',
    required: requiredField,
    options: [
      { label: 'Active', value: 1 },
      { label: 'Inactive', value: 0 },
    ],
    colSpan: 1,
  },
  {
    ...WiredMasterAutoComplete({
      code: 'dignosis_problem',
      url: API_URL.diagnosisProblem,
      label: 'Problem',
      name: 'problemId',
      colSpan: 1,
      placeholder: 'Search by keyword(S) or code',
      cache: false,
      labelAccessor: 'name',
      valueAccessor: 'id',
      required: requiredField,
      params:{limit:100},
    }),
  },
  {
    ...WiredMasterAutoComplete({
      url: API_URL.diagnosisIcd,
      label: 'ICD-10 Diagnosis',
      name: 'ICDId',
      colSpan: 1,
      placeholder: 'Search by keyword(S) or code',
      cache: false,
      labelAccessor: 'name',
      valueAccessor: 'id',
      required: requiredField,
      dependencies: {
        keys: ['problemId'],
        calc: calcDiagnosisProblem,
      },
      showDescription: true,
      descriptionAccessor: 'description',
    }),
  },
  {
    ...WiredMasterField({
      code: 'diagnosis_type',
      filter: { limit: 20 },
      name: 'typeCode',
      label: 'Type',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 1,
    }),
  },
  {
    inputType: 'date',
    name: 'startDate',
    textLabel: ' Start Date',
    required: requiredField,
    disableFuture: true,
    colSpan: 0.5,
  },
  {
    inputType: 'date',
    name: 'endDate',
    textLabel: ' End Date',
    disableFuture: true,
    colSpan: 0.5,
  },
  {
    inputType: 'textArea',
    name: 'comments',
    textLabel: 'Comments (Optional) ',
    placeholder: 'write here',
    colSpan: 1,
    pattern: regTextArea,
  },
];
