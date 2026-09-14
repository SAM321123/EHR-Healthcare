import { isEmpty } from 'lodash';
import { API_URL } from 'src/api/constants';
import {
  dateFormats,
  hourOptions,
  meridianOptions,
  minuteOptions,
  monthWeekOption,
  regexCustomText,
  repeatEveryOptions,
  requiredField,
  roleTypes,
  weekOptions
} from 'src/lib/constants';
import { convertWithTimezone, dateFormatterDayjs } from 'src/lib/utils';
import {
  WiredLocationField,
  WiredMasterAutoComplete,
  WiredMasterField,
  WiredPatientAutoComplete,
  WiredSelect,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';

const showDailyFields = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }
  if (
    data?.repeatType === 'Day' ||
    data?.repeatType === 'Week' ||
    data?.repeatType === 'Month'
  ) {
    return { hide: false };
  }
  return { hide: true };
};

const showWeeklyFields = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }
  if (data?.repeatType === 'Week') {
    return { hide: false };
  }
  return { hide: true };
};

const showMonthlyFields = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }
  if (data?.repeatType === 'Month') {
    return { hide: false };
  }
  return { hide: true };
};

const showMonthlyFields1 = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }

  if (data?.repeatType === 'Month' && !data.isOnDay) {
    return { hide: false };
  }
  return { hide: true };
};

const showMonthlyFields2 = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }
  if (data?.repeatType === 'Month' && !data.isOnDay) {
    return { hide: false };
  }
  return { hide: true };
};

const showisOnDayFields = (data) => {
  if(!data.editSeries || !data.isRecurring) {
    return { hide: true };
  }
  if (data?.isOnDay  && data.repeatType === 'Month') {
    return { hide: false };
  }
  return { hide: true };
};

const showRecurringFields = (data) => {
  if(!data.editSeries) {
    return { hide: true };
  }
  if (data?.isRecurring == true) {
    return { hide: false };
  }
  return { hide: true };
};
const showRecurringCheckBox = (data) => {
  if(!data.editSeries) {
    return { hide: true };
  }
  return { hide: false };
};

const showPatientDropDown = (data) => {
  if ( data.typeCode === 'group_appointment_type') {
    return { hide: false };
  }
  return { hide: true };
};
const showSinglePatientDropDown = (data) => {
  if (data.fromCalender && data.typeCode !== 'group_appointment_type') {
    return { hide: false };
  }
  return { hide: true };
};
const showPatientNameFields = (data) => {
  if(!data.fromCalender && data.typeCode !== 'group_appointment_type') {
    return { hide: false };
  }
  return { hide: true };
};


export const formFields = [
  {
    ...WiredMasterField({
      code: 'name_prefixes',
      filter: { limit: 20 },
      name: 'titleCode',
      label: 'Title',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 0.2,
      placeholder: 'Mr.',
      InputProps: { readOnly: true },
    }),
    dependencies: {
      keys: ['fromCalender'],
      calc: showPatientNameFields,
    },
  
  },
  {
    inputType: 'text',
    name: 'patientFirstName',
    textLabel: 'Patient First Name',
    colSpan: 0.4,
    InputProps: { readOnly: true },
    dependencies: {
      keys: ['fromCalender'],
      calc: showPatientNameFields,
    },
  },
  {
    inputType: 'text',
    name: 'patientLastName',
    textLabel: 'Patient Last Name(S)',
    InputProps: { readOnly: true },
    colSpan: 0.4,
    dependencies: {
      keys: ['fromCalender'],
      calc: showPatientNameFields,
    },
  },
  {
    inputType: 'text',
    name: 'title',
    textLabel: 'Appointment Title',
    pattern: regexCustomText,
    colSpan: 0.5,
  },
  {
    ...WiredMasterField({
      code: 'appointment_type',
      filter: { limit: 20 },
      name: 'typeCode',
      label: 'Type',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 0.5,
      placeholder: 'Select',
      required: requiredField,

      cache: false,
    }),
  },
  {
    ...WiredPatientAutoComplete({
      name: 'patientIds',
      label: 'Patient *',
      url: API_URL.getPatients,
      params: { isActive: true },
      multiple:true,
    }),
    dependencies: {
      keys: ['fromCalender', 'typeCode'],
      calc: showPatientDropDown,
    },
  },
  {
    ...WiredPatientAutoComplete({
      name: 'patientId',
      label: 'Patient *',
      url: API_URL.getPatients,
      params: { isActive: true },
      multiple: false,
    }),
    dependencies: {
      keys: ['fromCalender', 'typeCode'],
      calc: showSinglePatientDropDown,
    },
  },
  {
    inputType: 'date',
    type: 'text',
    name: 'startDate',
    label: 'Start Date',
    required: requiredField,
    disablePast: true,
    colSpan: 0.34,
  },

  {
    label: 'Start Time',
    colSpan: 0.33,
    fields: [
      {
        ...WiredSelect({
          name: 'startHour',
          label: 'Start Time',
          required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: hourOptions,
          labelProps: { style: { height: 18 }, required: false },
          placeholder: '11',
          showRadio: false,
        }),
        colSpan: 0.33,
      },
      {
        ...WiredSelect({
          name: 'startMinute',
          label: 'Min',
          // required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: minuteOptions,
          // labelProps: { style: { height: 18 }, required: false },
          // cstSx: { paddingLeft: '10px !important' },
          showRadio: false,
          placeholder: '28',
        }),
        colSpan: 0.33,
      },
      {
        ...WiredSelect({
          name: 'startMeridien',
          label: 'Meridien',
          // required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: meridianOptions,
          gridProps: { paddingLeft: 500 },
          // cstSx: { paddingLeft: '10px !important' },
          // labelProps: { style: { height: 18 }, required: false },
          placeholder: 'AM',
          showRadio: false,
        }),
        colSpan: 0.33,
      },
    ],
  },
  {
    label: 'End Time',
    colSpan: 0.33,
    required: requiredField,
    fields: [
      {
        ...WiredSelect({
          name: 'endHour',
          label: 'End Time',
          // required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: hourOptions,
          // labelProps: { style: { height: 18 }, required: false },
          placeholder: '11',
          showRadio: false,
          required: requiredField,
        }),
        colSpan: 0.33,
      },
      {
        ...WiredSelect({
          name: 'endMinute',
          label: 'Min',
          // required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: minuteOptions,

          showRadio: false,
          placeholder: '28',
          required: requiredField,
        }),
        colSpan: 0.33,
      },
      {
        ...WiredSelect({
          name: 'endMeridien',
          label: 'Meridien',
          // required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'label',
          url: null,
          options: meridianOptions,
          gridProps: { paddingLeft: 500 },
          required: requiredField,
          // cstSx: { paddingLeft: '10px !important' },
          // labelProps: { style: { height: 18 }, required: false },
          placeholder: 'AM',
          showRadio: false,
        }),
        colSpan: 0.33,
      },
    ],
  },
  {
    inputType: 'checkBox',
    name: 'isVirtual',
    label: 'Virtual Appointment ',
  },
  {
    ...WiredStaffField({
      name: 'practitionerId',
      label: 'Provider',
      colSpan: 0.5,
      placeholder: 'Select',
      required: requiredField,
    }),
  },
  {
    ...WiredLocationField({
      name: 'locationId',
      label: 'Location',
      colSpan: 0.5,
      placeholder: 'Select',
      filter: { limit: 20 },
      required: requiredField,
    }),
  },
  // {
  //   ...WiredMasterAutoComplete({
  //     url: API_URL.diagnosisProblem,
  //     label: 'Reason for the appointment',
  //     name: 'problemId',
  //     colSpan: 0.5,
  //     placeholder: 'Search by keyword(S) or code',
  //     cache: false,
  //     labelAccessor: 'name',
  //     valueAccessor: 'id',
  //     fetchInitial:true,
  //     showDescription:true,
  //     descriptionAccessor:'description'
  //   }),
  // },
  {
    ...WiredMasterField({
      code: 'appointment_status',
      filter: { limit: 20 },
      name: 'statusCode',
      label: 'Status',
      labelAccessor: 'name',
      valueAccessor: 'code',
      placeholder: 'Select',
      cache: false,
    }),
  },
  {
    inputType: 'textArea',
    name: 'reasonForAppointment',
    textLabel: 'Reason for appointment',
    colSpan: 1,
  },

  {
    inputType: 'checkBox',
    name: 'isRecurring',
    label: 'Recurring',
    colSpan: 0.2,
    dependencies: {
      keys: ['editSeries'],
      calc: showRecurringCheckBox,
    },
  },
  {
    inputType: 'radio',
    name: 'repeatType',
    options: [
      { label: 'Daily', value: 'Day' },
      { label: 'Weekly', value: 'Week' },
      { label: 'Monthly', value: 'Month' },
    ],
    colSpan: 0.6,
    dependencies: {
      keys: ['isRecurring','editSeries'],
      calc: showRecurringFields,
    },
  },
  // Daily start
  {
    inputType: 'date',
    type: 'text',
    name: 'startRecurringDate',
    label: 'Start Date',
    colSpan: 0.5,
    disabled:true,
    dependencies: {
      keys: ['isRecurring', 'repeatType','editSeries'],
      calc: showDailyFields,
    },
    description:'will be changed with appointment start date'
  },
  {
    inputType: 'date',
    type: 'text',
    name: 'endRecurringDate',
    label: 'End Date',
    colSpan: 0.5,
    dependencies: {
      keys: ['repeatType', 'editSeries'],
      calc: showDailyFields,
    },
  },

  {
    ...WiredSelect({
      name: 'repeatEvery',
      label: 'Repeat Every',
      valueAccessor: 'value',
      labelAccessor: 'label',
      url: null,
      options: repeatEveryOptions,

      showRadio: false,
      placeholder: '28',
      dependencies: {
        keys: ['repeatType','editSeries'],
        calc: showDailyFields,
      },
    }),
    colSpan: 0.5,
  },

  // Daily End

  // weekly start

  {
    ...WiredSelect({
      name: 'repeateWeek',
      label: 'Weeks',
      valueAccessor: 'value',
      labelAccessor: 'label',
      url: null,
      options: weekOptions,
      showRadio: false,
      placeholder: 'Select',
      dependencies: {
        keys: ['isRecurring','repeatType','editSeries'],
        calc: showWeeklyFields,
      },
    }),
    multiple: true,
    colSpan: 0.5,
  },

  // weekly end

  // month section start
  {
    inputType: 'checkBox',
    name: 'isOnDay',
    label: 'On Day',
    colSpan: 0.5,
    dependencies: {
      keys: ['isRecurring','repeatType','editSeries'],
      calc: showMonthlyFields,
    },
  },

  {
    ...WiredSelect({
      name: 'monthOnDay',
      label: 'Day Of Month',
      // required: requiredField,
      valueAccessor: 'value',
      labelAccessor: 'label',
      url: null,
      options: repeatEveryOptions,
      showRadio: false,
      placeholder: '28',
      dependencies: {
        keys: ['isRecurring','isOnDay','editSeries'],
        calc: showisOnDayFields,
      },
    }),
    colSpan: 0.5,
  },

  {
    ...WiredSelect({
      name: 'monthWeekDay',
      label: 'Week Day',
      // required: requiredField,
      valueAccessor: 'value',
      labelAccessor: 'label',
      url: null,
      options: weekOptions,

      showRadio: false,
      placeholder: 'Sunday',
      dependencies: {
        keys: ['isRecurring','repeatType','editSeries'],
        calc: showMonthlyFields2,
      },
      multiple: true,
    }),
    colSpan: 0.5,
  },
  {
    ...WiredSelect({
      name: 'monthWeek',
      label: 'Week Of Month',
      // required: requiredField,
      valueAccessor: 'value',
      labelAccessor: 'label',
      url: null,
      options: monthWeekOption,
      showRadio: false,
      placeholder: '01',
      dependencies: {
        keys: ['isRecurring','repeatType','editSeries'],
        calc: showMonthlyFields1,
      },
      multiple: true,
    }),
    colSpan: 0.5,
  },
  {
    inputType: 'textArea',
    name: 'note',
    textLabel: 'Note',
    colSpan: 1,
  },
  {
    inputType: 'checkBox',
    name: 'confirmOnIntake',
    label: 'Confirm when intake form is submitted',
    colSpan: 1,
  },
  {
    ...WiredMasterAutoComplete({
      name: 'formId',
      label: 'Questionnaire / Consent Forms',
      url: API_URL.getFormList,
      cache: false,
      multiple: true,
      labelAccessor: 'name',
      valueAccessor: 'id',
      colSpan: 1,
      fetchInitial:true,
      params: { limit: 300, isActive: true ,formTypeCode: ['FT_QUESTIONNAIRES','FT_CONSENT_FORMS']},
    }),
  },
];

export const getAppointmentEditData =(rowData) => {
  const formData = []
  let clonedRowData={};
  if (!isEmpty(rowData)) {
    rowData.startDate=convertWithTimezone(rowData.startDateTime,{format: dateFormats.MMDDYYYY})
    const startTime = convertWithTimezone(rowData.startDateTime,{format: dateFormats.hhmmA})
    const endTime = convertWithTimezone(rowData.endDateTime,{format: dateFormats.hhmmA})
    // for(const patientForm of rowData.patientForms){
    //   formData.push(patientForm.formData)
    //   if(rowData?.typeCode === 'group_appointment_type'){

    //   }
    // }
    const formIds = new Set();

    for (const patientForm of rowData.patientForms) {
      if (rowData?.typeCode === 'group_appointment_type') {
      if (!formIds.has(patientForm.formId)) {
        formData.push(patientForm.formData);
        formIds.add(patientForm.formId);
      }
      } else {
      formData.push(patientForm.formData);
      }
    }
    const recordTimeArray = startTime.split(' ');
    const time = recordTimeArray[0];
    const meridien = recordTimeArray[1];

    const timeArray = time.split(':');
    const hour = timeArray[0];
    const minute = timeArray[1];

    const endRecordTimeArray = endTime.split(' ');
    const endtime = endRecordTimeArray[0];
    const endMeridien = endRecordTimeArray[1];

    const endTimeArray = endtime.split(':');
    const endHour = endTimeArray[0];
    const endMinute = endTimeArray[1];
    // const clonedRowData = cloneDeep(rowData);
     clonedRowData = { id: rowData.id };
    formFields.forEach((item) => {
      if(item.fields){
        item.fields.map(_item=>{
          clonedRowData[_item?.name] = rowData[_item?.name];  
        })
      }
      if (item?.name) {
        clonedRowData[item?.name] = rowData[item?.name];
      }
    });
    if(rowData?.problem){
    clonedRowData.problemId= rowData.problem
    }
    // delete clonedRowData.fileId;
    clonedRowData=  {
      ...clonedRowData,
      patientFirstName: rowData?.patients?.[0]?.firstName,
      patientLastName: rowData?.patients?.[0]?.lastName,
      titleCode: rowData?.patients?.[0]?.titleCode,
      startHour: hour,
      startMinute: minute,
      startMeridien: meridien,
      endHour,
      endMeridien,
      endMinute,
      isRecurring: rowData?.isRecurring,
      repeatType: rowData?.recurringSetting?.repeateType,
      startRecurringDate: rowData?.recurringSetting?.startRecurringDate,
      endRecurringDate: rowData?.recurringSetting?.endRecurringDate,
      repeatEvery: rowData?.recurringSetting?.repeateEvery,
      repeateWeek: rowData?.recurringSetting?.repeateWeek,
      monthOnDay: rowData?.recurringSetting?.monthOnDay,
      monthWeek: rowData?.recurringSetting?.monthWeek,
      monthWeekDay: rowData?.recurringSetting?.monthWeekDay,
      isOnDay: rowData?.recurringSetting?.isOnDay,
      patientIds:
        rowData?.typeCode === 'group_appointment_type' ? rowData?.patients : [],
      patientId:
        rowData?.typeCode === 'group_appointment_type'
          ? {}
          : rowData?.patients[0],
      formId: formData,
      reasonForAppointment:rowData?.reasonForAppointment || ''
    };
  }
  return clonedRowData;
};
