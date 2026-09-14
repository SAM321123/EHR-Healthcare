import { isEmpty } from 'lodash';
import { API_URL } from 'src/api/constants';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { hourOptions, meridianOptions, minuteOptions, regexCustomText, regTextArea, requiredField } from 'src/lib/constants';
import PatientInfo from 'src/pages/Patient/components/patientInfo';
import {
  WiredMasterField,
  WiredPatientAutoComplete,
  WiredSelect,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';


const showPatientInfo =(data)=>{
  if (data.patientId && !isEmpty(data.patientId)) {
    return { hide: false };
  }
  return { hide: true };
}

const callEncounterAPI =(data)=>{
  if (data.patientId && !isEmpty(data.patientId)) {
    return { hide: false };
  }
  return { hide: true };
}

const encounterExists =(data)=>{
  if (data.encounterType) {
    return { hide: false };
  }
  return { hide: true };
}

export const invoiceFormGroups = [
  {
    ...WiredPatientAutoComplete({
      name: 'patientId',
      label: 'Patient',
      url: API_URL.getPatients,
      colSpan: 0.5,
      params: { isActive: true },
      required: requiredField,
    }),
  },
  {
    ...WiredSelect({
      name: 'encounterType',
      label: 'Encounter',
      required: requiredField,
      valueAccessor: 'id',
      labelAccessor: ['startDate', 'encounterType.name'],
      url: API_URL.patientEncounter,
      filter: ({ form }) => ({ patientId: form.getValues('patientId')?.id }),
      
    }),
    colSpan: 0.5,
    dependencies: {
      keys: ['patientId'],
      calc: callEncounterAPI,
    },
  },
  {
    component:({form})=><PatientInfo wrapperStyle={{flex:1}} customPatientId={form.getValues('patientId')?.id} />,
    dependencies: {
      keys: ['patientId'],
      calc: showPatientInfo,
    },
  },
  // {
  //   ...WiredMasterField({
  //     code: 'encounter_types_code',
  //     filter: { limit: 100 },
  //     name: 'encounterTypeCode',
  //     label: 'Encounter Types',
  //     labelAccessor: 'name',
  //     valueAccessor: 'code',
  //     colSpan: 0.33,
  //     placeholder: 'Select',
  //     // required: requiredField,
  //     cache: false,
  //   }),
  //   dependencies: {
  //     keys: ['encounterType'],
  //     calc: encounterExists,
  //   },
  //   disabled: true,
  // },
  // {
  //   ...WiredMasterField({
  //     code: 'billing_type',
  //     filter: { limit: 100 },
  //     name: 'billingTypeCode',
  //     label: 'Billing Type',
  //     labelAccessor: 'name',
  //     valueAccessor: 'code',
  //     colSpan: 0.33,
  //     placeholder: 'Select',
  //     cache: false,
  //     required: requiredField,
  //   }),
  //   dependencies: {
  //     keys: ['encounterType'],
  //     calc: encounterExists,
  //   },
  //   disabled: true,
  // },
  // {
  //   label: 'Encounter Start Time',
  //   colSpan: 0.33,
  //   required: requiredField,
  //   fields: [
  //     {
  //       ...WiredSelect({
  //         name: 'startHour',
  //         label: 'Start Time',
  //         required: requiredField,
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: hourOptions,
  //         labelProps: { style: { height: 18 }, required: false },
  //         placeholder: '11',
  //         showRadio: false,
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //     {
  //       ...WiredSelect({
  //         name: 'startMinute',
  //         label: 'Min',
  //         required: requiredField,
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: minuteOptions,
  //         showRadio: false,
  //         placeholder: '28',
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //     {
  //       ...WiredSelect({
  //         name: 'startMeridien',
  //         label: 'Meridien',
  //         required: requiredField,
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: meridianOptions,
  //         gridProps: { paddingLeft: 500 },
  //         placeholder: 'AM',
  //         showRadio: false,
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //   ],
  // },
  // {
  //   label: 'Encounter End Time',
  //   colSpan: 0.33,
  //   fields: [
  //     {
  //       ...WiredSelect({
  //         name: 'endHour',
  //         label: 'Start Time',
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: hourOptions,
  //         labelProps: { style: { height: 18 }, required: false },
  //         placeholder: '11',
  //         showRadio: false,
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //     {
  //       ...WiredSelect({
  //         name: 'endMinute',
  //         label: 'Min',
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: minuteOptions,
  //         showRadio: false,
  //         placeholder: '28',
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //     {
  //       ...WiredSelect({
  //         name: 'endMeridien',
  //         label: 'Meridien',
  //         valueAccessor: 'value',
  //         labelAccessor: 'label',
  //         url: null,
  //         options: meridianOptions,
  //         gridProps: { paddingLeft: 500 },

  //         placeholder: 'AM',
  //         showRadio: false,
  //       }),
  //       colSpan: 0.33,
  //       dependencies: {
  //         keys: ['encounterType'],
  //         calc: encounterExists,
  //       },
  //       disabled: true,
  //     },
  //   ],
  // },
  // {
  //   inputType: 'text',
  //   name: 'duration',
  //   textLabel: 'Duration',
  //   pattern: regexCustomText,
  //   colSpan: 0.33,
  //   dependencies: {
  //     keys: ['encounterType'],
  //     calc: encounterExists,
  //   },
  //   disabled: true,
  // },
  // {
  //   ...WiredStaffField({
  //     name: 'assignedToId',
  //     label: 'Encounter Assigned To',
  //     placeholder: 'Select',
  //     required: requiredField,
  //   }),
  //   dependencies: {
  //     keys: ['encounterType'],
  //     calc: encounterExists,
  //   },
  //   disabled: true,
  // },
  // {
  //   inputType: 'nestedTableV3',
  //   name: 'encounterProcedureCodes',
  //   label: ' ',
  //   // textButton: 'Add New',
  //   columnsPerRow: 8,
  //   gridGap: 1,
  //   isMore: false,
  //   formGroups: [
  //     {
  //       label: 'Rank',
  //       component: ({ index, getValues }) => (
  //         <div
  //           style={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             marginLeft: '1rem',
  //           }}
  //         >
  //           <TableTextRendrer>{index + 1}</TableTextRendrer>
  //         </div>
  //       ),
  //       colSpan: 0.3,
  //       cstSx: {
  //         paddingLeft: '10px !important',
  //         height: '100%',
  //         display: 'flex',
  //         alignItems: 'center',
  //       },
  //     },
  //     {
  //       label: 'CPT Code',
  //       component: ({ index, getValues }) => (
  //         <div
  //           style={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             marginLeft: '1rem',
  //           }}
  //         >
  //           <TableTextRendrer>
  //             {(getValues(`encounterProcedureCodes`) || [])?.[index]?.cptCode}
  //           </TableTextRendrer>
  //         </div>
  //       ),
  //       colSpan: 0.3,
  //       cstSx: {
  //         paddingLeft: '10px !important',
  //         height: '100%',
  //         display: 'flex',
  //         alignItems: 'center',
  //       },
  //     },
  //     {
  //       label: 'Name',
  //       component: ({ index, getValues }) => (
  //         <div
  //           style={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             marginLeft: '1rem',
  //           }}
  //         >
  //           <TableTextRendrer>
  //             {(getValues(`encounterProcedureCodes`) || [])?.[index]?.name}
  //           </TableTextRendrer>
  //         </div>
  //       ),
  //       colSpan: 0.3,
  //       cstSx: {
  //         paddingLeft: '10px !important',
  //         height: '100%',
  //         display: 'flex',
  //         alignItems: 'center',
  //       },
  //     },
  //     {
  //       label: 'Description',
  //       component: ({ index, getValues }) => (
  //         <div
  //           style={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             marginLeft: '1rem',
  //           }}
  //         >
  //           <TableTextRendrer>
  //             {
  //               (getValues(`encounterProcedureCodes`) || [])?.[index]
  //                 ?.description
  //             }
  //           </TableTextRendrer>
  //         </div>
  //       ),
  //       colSpan: 0.3,
  //       cstSx: {
  //         paddingLeft: '10px !important',
  //         height: '100%',
  //         display: 'flex',
  //         alignItems: 'center',
  //       },
  //     },
  //     {
  //       inputType: 'date',
  //       type: 'text',
  //       name: 'serviceDate',
  //       label: 'Service Date',
  //       required: requiredField,
  //       sx: { width: '100px' },
  //       disabled: true,
  //     },
  //     {
  //       inputType: 'text',
  //       name: 'qty',
  //       type: 'number',
  //       textLabel: 'Qty',
  //       label: 'Qty',
  //       placeholder: '',
  //       sx: { width: '60px' },
  //       disabled: true,
  //     },
  //     {
  //       label: 'Modifiers',
  //       fields: [
  //         {
  //           inputType: 'text',
  //           type: 'number',
  //           name: 'modifier1',
  //           required: requiredField,
  //           textLabel: '',
  //           sx: { width: '60px', marginRight: '4px' },
  //           maxLength: { value: 4 },
  //           placeholder: ' ',
  //           disabled: true,
  //         },
  //         {
  //           inputType: 'text',
  //           type: 'number',
  //           name: 'modifier2',
  //           required: requiredField,
  //           textLabel: '',
  //           sx: { width: '60px', marginRight: '4px' },
  //           maxLength: { value: 4 },
  //           placeholder: ' ',
  //           disabled: true,
  //         },
  //         {
  //           inputType: 'text',
  //           type: 'number',
  //           name: 'modifier3',
  //           required: requiredField,
  //           textLabel: '',
  //           sx: { width: '60px', marginRight: '4px' },
  //           maxLength: { value: 4 },
  //           placeholder: ' ',
  //           disabled: true,
  //         },
  //         {
  //           inputType: 'text',
  //           type: 'number',
  //           name: 'modifier4',
  //           required: requiredField,
  //           textLabel: '',
  //           sx: { width: '60px', marginRight: '4px' },
  //           maxLength: { value: 4 },
  //           placeholder: ' ',
  //           disabled: true,
  //         },
  //       ],
  //     },
  //     {
  //       inputType: 'text',
  //       type: 'number',
  //       name: 'price',
  //       required: requiredField,
  //       label: 'Price',
  //       placeholder: ' ',
  //       sx: { width: '70px' },
  //       maxLength: { value: 4 },
  //       disabled: true,
  //     },
  //   ],
  //   disabled: true,
  //   dependencies: {
  //     keys: ['encounterType'],
  //     calc: encounterExists,
  //   },
  // },
  // {
  //   label: 'Payment Details',
  //   colSpan: 1,
  // },
  // {
  //   inputType: 'checkBox',
  //   name: 'payInvoiceInFull',
  //   label: 'Pay Invoice in Full',
  //   colSpan: 0.33,
  // },
  // {
  //   inputType: 'checkBox',
  //   name: 'payCopay',
  //   label: 'Pay Copay',
  //   colSpan: 0.33,
  // },
  // {
  //   inputType: 'checkBox',
  //   name: 'payNonCoveredServices',
  //   label: 'Pay Non Covered Services',
  //   colSpan: 0.33,
  // },
  // {
  //   inputType: 'textArea',
  //   name: 'comment',
  //   textLabel: 'Comments (Optional) ',
  //   placeholder: 'write here',
  //   colSpan: 1,
  //   pattern: regTextArea,
  // },
];
