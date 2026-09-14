import {useMemo} from 'react';
import {
  WiredLocationByStaffIdField,
    WiredLocationField,
    WiredMasterAutoComplete,
    WiredMasterField,
    WiredPatientAutoComplete,
    WiredSelect,
    WiredStaffField,
  } from 'src/wiredComponent/Form/FormFields';
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
import { API_URL } from 'src/api/constants';
import { cloneDeep, isEmpty } from 'lodash';
import { dateFormatterDayjs } from 'src/lib/utils';

const calcPractitionerLocation = (data,form,{isValueChanged}={}) => {
  const cloendData = cloneDeep(data)
  if (cloendData?.practitionerId) {
    if(isValueChanged){
      form.setValue('locationId','')
    }
    return {
      reFetch: true,
      queryParams: { staffId: cloendData?.practitionerId,isActiveSchedule:true},
    };
  }
  return { reFetch: false };
};

export const getFormFields = (defaultData) => [
    {
        inputType: 'text',
        name: 'title',
        textLabel: 'Title',
        pattern: regexCustomText,
        disabled: !isEmpty(defaultData),
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
      ...WiredLocationByStaffIdField({
        url: API_URL.staffLocation,
        name: 'locationId',
        label: 'Location',
        colSpan: 0.5,
        placeholder: 'Select',
        filter: { limit: 20 },
        required: requiredField,
        cache: false,
        fetchInitial: false,
        dependencies: {
          keys: ['practitionerId'],
          calc: calcPractitionerLocation,
        },
      }),
    },
    {
      inputType: 'textArea',
      label: 'Reason for appointment',
      name: 'reasonForAppointment',
      textLabel: 'Reason for appointment',
      colSpan: 3,
    },
    {
      inputType: 'checkBox',
      name: 'isVirtual',
      label: 'Virtual Appointment ',
    },
    ]


export const getAppointmentEditData =(rowData) => {

  let clonedRowData={};
  if (!isEmpty(rowData)) {
    rowData.startDate=dateFormatterDayjs(rowData.startDateTime,dateFormats.MMDDYYYY)
    const startTime = dateFormatterDayjs(rowData.startDateTime,dateFormats.hhmmA)
    const endTime = dateFormatterDayjs(rowData.endDateTime,dateFormats.hhmmA)

    const formFields =  getFormFields();

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
      formId: rowData?.patientForm?.formId,
      formCategory: rowData?.patientForm?.formData?.formCategoryCode,
    };
  }
  return clonedRowData;
};

