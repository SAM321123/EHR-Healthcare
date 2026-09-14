
import { isEmpty } from 'lodash';
import {
  dateFormats,
  hourOptions,
  meridianOptions,
  minuteOptions,
  monthWeekOption,
  repeatEveryOptions,
  requiredField,
  weekOptions
} from 'src/lib/constants';
import { convertWithTimezone, dateFormatterDayjs } from 'src/lib/utils';
import {

  WiredSelect,
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

export const formFields = [ 
  {
    inputType: 'date',
    type: 'text',
    name: 'startDate',
    label: 'Date',
    required: requiredField,
    colSpan: 0.34,
  },

  {
    label: 'Start Time',
    colSpan: 0.33,
    required: requiredField,
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
          required: requiredField,
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
          required: requiredField,
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
    inputType: 'text',
    name: 'shiftTitle',
    textLabel: 'Shift Title',
    colSpan: 0.33,
  },
  {
    inputType: 'checkBox',
    name: 'newPatient',
    label: 'New Patient Initial Consultation (Telehealth/Video)',
    colSpan: 0.33,
  },
  {
    inputType: 'checkBox',
    name: 'existingPatient',
    label: 'Existing Patient Follow-up Appointment(Telehealth/Video)',
    colSpan: 0.33,
  },
   {
    inputType: 'checkBox',
    name: 'isActive',
    label: 'Active',
    colSpan: 0.2,
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
      keys: ['repeatType','editSeries'],
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
//   {
//     inputType: 'textArea',
//     name: 'note',
//     textLabel: 'Note',
//     colSpan: 1,
//   },
//   {
//     inputType: 'checkBox',
//     name: 'confirmOnIntake',
//     label: 'Confirm when intake form is submitted',
//     colSpan: 1,
//     dependencies: {
//       keys: ['typeCode'],
//       calc: showForm,
//     },
//   },
//   {
//     ...WiredMasterAutoComplete({
//       name: 'formId',
//       label: 'Forms',
//       url: API_URL.getFormList,
//       cache: false,
//       multiple: true,
//       labelAccessor: 'name',
//       valueAccessor: 'id',
//       colSpan: 1,
//       fetchInitial:true,
//       params: { limit: 300, isActive: true ,formTypeCode: 'FT_QUESTIONNAIRES'},
//       dependencies: {
//         keys: [ 'typeCode'],
//         calc: (formValues) => {
//           if (formValues?.typeCode !== 'follow_up') {
//             return { hide: true };
//           }
//           return { reFetch: false, hide: false };
//         },
//       },
//     }),
//   },
];

export const getScheduleEditData =(rowData) => {
  let clonedRowData={};
  if (!isEmpty(rowData)) {
    rowData.startDate=convertWithTimezone(rowData.startDateTime,{format : dateFormats.MMDDYYYY})
    const startTime = convertWithTimezone(rowData.startDateTime,{format: dateFormats.hhmmA})
    const endTime = convertWithTimezone(rowData.endDateTime,{format : dateFormats.hhmmA})
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
    // delete clonedRowData.fileId;
    clonedRowData=  {
      ...clonedRowData,
      startHour: hour,
      startMinute: minute,
      startMeridien: meridien,
      endHour,
      endMeridien,
      endMinute,
      staffId: rowData?.staffId,
      locationId: rowData?.locationId,
      shiftTitle: rowData?.shiftTitle,
      isRecurring: rowData?.isRecurring,
      isActive: rowData?.isActive,
      repeatType: rowData?.calendarScheduleRecurringSetting?.repeateType,
      startRecurringDate: rowData?.calendarScheduleRecurringSetting?.startRecurringDate,
      endRecurringDate: rowData?.calendarScheduleRecurringSetting?.endRecurringDate,
      repeatEvery: rowData?.calendarScheduleRecurringSetting?.repeateEvery,
      repeateWeek: rowData?.calendarScheduleRecurringSetting?.repeateWeek,
      monthOnDay: rowData?.calendarScheduleRecurringSetting?.monthOnDay,
      monthWeek: rowData?.calendarScheduleRecurringSetting?.monthWeek,
      monthWeekDay: rowData?.calendarScheduleRecurringSetting?.monthWeekDay,
      isOnDay: rowData?.calendarScheduleRecurringSetting?.isOnDay,
    };
  }
  return clonedRowData;
};
