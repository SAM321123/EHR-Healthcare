/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { dateFormats, hourOptions, meridianOptions, minuteOptions, regexCustomText, requiredField, successMessage, roleTypes } from 'src/lib/constants';
import {
  convertToUtc,
  dateFormatterDayjs,
  getCurrentMeridien,
  getUpdatedFieldsValues,
  isEqualById,
  showSnackbar,
  timeToMinutes,
} from 'src/lib/utils';
import { ADD_APPOINTMENT, CREATE_MAR_LOG } from 'src/store/types';
import useAuthUser from 'src/hooks/useAuthUser';
// import './appointment.scss';
import { decrypt } from 'src/lib/encryption';
import { WiredMasterField, WiredSelect, WiredStaffField } from 'src/wiredComponent/Form/FormFields';

const currentMeridien = getCurrentMeridien();

const AddMedicationSchedule = ({
  modalCloseAction = () => {},
  refetchData = () => {},
  defaultData = {},
  viewMode = false,
  clickedDateAndTime,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setError, clearErrors } = form;
  const params = useParams();

  const [userInfo] = useAuthUser();

  const [loggedInPractitioner, setLoggedInPractitioner] = useState(null)
  
  const [response, , loading, callAppointmentSaveAPI, clearData] = useCRUD({
    id: CREATE_MAR_LOG,
    url: API_URL.medicationItemMARLog,
    type: !defaultData?.id ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const [initialData, setInitialData] = useState({
    startHour: currentMeridien.hour,
    startMinute: currentMeridien.minute,
    startMeridien: currentMeridien.meridien,
    eventDate: currentMeridien.now,
  });

  useEffect(() => {
    console.log(userInfo.role===roleTypes.practitioner)
    if(userInfo.role===roleTypes.practitioner){
      defaultData = {...defaultData, clinicianId: userInfo?.id}
    }
  }, [userInfo, defaultData])

  const calcRefuseReason = (data, index) => {
    if (data?.actionCode === 'refused') {
      return {
        hide: false,
      };
    }
    return { hide: true };
  };
  const calcOverrideReason = (data) => {  
    if (data?.actionCode === 'taken') {
      const slotTimeInMinutes = timeToMinutes(data?.slotStartHour, data?.slotStartMinute, data?.slotStartMeridien);
      const startTimeInMinutes = timeToMinutes(data?.startHour, data?.startMinute, data?.startMeridien);
  
      if (Math.abs(slotTimeInMinutes - startTimeInMinutes) > 30) {
        return { hide: false };
      }
    }
      return { hide: true };
  };
  

  const formFields = [
    {
      inputType: 'text',
      name: 'patientMedicationItemId',
      textLabel: 'Medication and dosage ID',
      required: requiredField,
      pattern: regexCustomText,
      colSpan: 0.5,
      hide:true,
    },
    {
      inputType: 'text',
      name: 'medicationDosage',
      textLabel: 'Medication and dosage',
      required: requiredField,
      pattern: regexCustomText,
      disabled: isEmpty(defaultData) ? false : true,
      colSpan: 0.5,
    },
    { ...WiredStaffField({
        name: 'clinicianId',
        label: 'Clinician',
        colSpan: 0.5,
        placeholder: 'Select',
        required: requiredField,
      }),
    },
    // {
    //   inputType: 'text',
    //   name: 'comment',
    //   textLabel: 'Comments',
    //   required: requiredField,
    //   pattern: regexCustomText,
    //   colSpan: 0.5,
    // },
    {
      inputType: 'date',
      type: 'text',
      name: 'eventDate',
      label: 'Date',
      required: requiredField,
      colSpan: 0.5,
      disabled: true,
    },
    ...(defaultData?.slotEventDate && defaultData?.medicineStatusCode === 'medication_status_active'
      ? [
        {
          label: 'Schedule Time',
          colSpan: 0.33,
          fields: [
            {
              ...WiredSelect({
                name: 'slotStartHour',
                label: 'Start Time',
                required: requiredField,
                valueAccessor: 'value',
                labelAccessor: 'label',
                url: null,
                options: hourOptions,
                labelProps: { style: { height: 18 }, required: false },
                placeholder: '11',
                showRadio: false,
                disabled: true,
              }),
              colSpan: 0.33,
            },
            {
              ...WiredSelect({
                name: 'slotStartMinute',
                label: 'Min',
                // required: requiredField,
                valueAccessor: 'value',
                labelAccessor: 'label',
                url: null,
                options: minuteOptions,
                showRadio: false,
                placeholder: '28',
                disabled: true,
              }),
              colSpan: 0.33,
            },
            {
              ...WiredSelect({
                name: 'slotStartMeridien',
                label: 'Meridien',
                valueAccessor: 'value',
                labelAccessor: 'label',
                url: null,
                options: meridianOptions,
                gridProps: { paddingLeft: 500 },
                placeholder: 'AM',
                showRadio: false,
                disabled: true,
              }),
              colSpan: 0.33,
            },
            
          ],
        },
        ]
      : []),
    {
      label: 'EMAR Time',
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
            showRadio: false,
            placeholder: '28',
          }),
          colSpan: 0.33,
        },
        {
          ...WiredSelect({
            name: 'startMeridien',
            label: 'Meridien',
            valueAccessor: 'value',
            labelAccessor: 'label',
            url: null,
            options: meridianOptions,
            gridProps: { paddingLeft: 500 },
            placeholder: 'AM',
            showRadio: false,
          }),
          colSpan: 0.33,
        },
      ],
    },
    
    {
      label: 'Medication Action',
      fields: [
        {
          ...WiredMasterField({
            code: 'mar_log_action',
            filter: { limit: 100 },
            name: 'actionCode',
            label: 'Medication Action',
            labelAccessor: 'name',
            valueAccessor: 'code',
          }),
        },
        {
          inputType: 'text',
          name: 'refusedReason',
          textLabel: 'Reason for Refuse',
          placeholder: 'Reason',
          pattern: regexCustomText,
          sx: { minWidth: '150px', marginRight: '4px', display: 'block'  },
          dependencies: {
            keys: ['actionCode'],
            calc: calcRefuseReason,
            listenAllChanges: true,
          },
        },
      ],
    },
    ...(defaultData?.slotEventDate
      ? [
        {
          inputType: 'text',
          name: 'overrideReason',
          textLabel: 'Reason For Override',
          placeholder: 'Enter here',
        pattern: regexCustomText,
          dependencies: {
            keys: ['actionCode','startHour','startMinute','startMeridien'],
            calc: calcOverrideReason,
            listenAllChanges: true,
          },
        },
        ]
      : []),
    {
      inputType: 'text',
      name: 'clinicianInitial',
      textLabel: 'Clinician Initial',
      // required: requiredField,
      pattern: regexCustomText,
      // colSpan: 0.5,
    },
    {
      inputType: 'textArea',
      name: 'comment',
      textLabel: 'Comments',
      // required: requiredField,
      pattern: regexCustomText,
      // colSpan: 0.5,
    },
    {
      inputType: 'checkBox',
      name: 'givenByCaregiver',
      label: 'Given By Family/Caregiver ',
      // colSpan: 0.2,
    },
  ];

  useEffect(() => {
    const eventDate=dateFormatterDayjs(clickedDateAndTime,dateFormats.MMDDYYYY)
    const startTime = dateFormatterDayjs(clickedDateAndTime,dateFormats.hhmmA)
     const recordTimeArray = startTime.split(' ');
     const time = recordTimeArray[0];
     const meridien = recordTimeArray[1];
 
     const timeArray = time.split(':');
     const hour = timeArray[0];
     const minute = timeArray[1];

    setInitialData((prevData) => ({
      ...prevData,
      startHour: hour,
      startMinute: minute,
      startMeridien: meridien,
      eventDate,
    }));
  }, []);


  const getTimeValidation = (value) => {
    const {
      endHour,
      endMinute,
      endMeridien,
      startHour,
      startMinute,
      startMeridien,
    } = value || {};
    if (
      startHour &&
      startMinute &&
      startMeridien &&
      endHour &&
      endMinute &&
      endMeridien
    ) {
      const startTimeString = `2024-01-01 ${startHour}:${startMinute} ${startMeridien}`;
      const endTimeString = `2024-01-01 ${endHour}:${endMinute} ${endMeridien}`;

      const format = 'YYYY-MM-DD h:mm A';
      const startTime = moment(startTimeString, format);
      let endTime = moment(endTimeString, format);

      if (!endTime.isAfter(startTime)) {
        setTimeout(
          () =>
            setError(
              'endHour',
              {
                type: 'manual',
                message: 'Must be higher than start time',
              },
              { shouldFocus: true }
            ),
          100
        );

        return true;
      } else {
        clearErrors(['endHour']);
        return false;
      }
    }
    return false;
  };


  const onHandleSubmit = useCallback(
    (data) => {
      if (
        data?.startHour &&
        data.startMinute &&
        data.startMeridien && data.eventDate
      ) {
        const {
          startHour,
          startMinute,
          startMeridien,
          eventDate,
        } = data || {};

        const startDatetimeString = `${dateFormatterDayjs(
          eventDate,
          dateFormats.MMDDYYYY
        )} ${startHour}:${startMinute} ${startMeridien}`;
        const startDatetimeData = convertToUtc(
          startDatetimeString,
          {format:'MM/DD/YYYY hh:mm A'}
        );
        data.date = startDatetimeData;

        delete data.startHour;
        delete data.startMinute;
        delete data.startMeridien;
        delete data.eventDate;
        delete data.medicationDosage;
      }
      if (
        defaultData?.slotStartHour &&
        defaultData?.slotStartMinute &&
        defaultData?.slotStartMeridien && data?.slotEventDate
      ) {
        const {
          slotStartHour,
          slotStartMinute,
          slotStartMeridien,
          slotEventDate,
        } = defaultData || {};

        const slotStartDatetimeString = `${dateFormatterDayjs(
          slotEventDate,
          dateFormats.MMDDYYYY
        )} ${slotStartHour}:${slotStartMinute} ${slotStartMeridien}`;
        const slotStartDatetimeData = convertToUtc(
          slotStartDatetimeString,
          {format:'MM/DD/YYYY hh:mm A'}
        );
        delete data?.slotStartHour;
        delete data?.slotStartMinute;
        delete data?.slotStartMeridien;
        delete data?.slotEventDate;
        delete data?.slotDate;
        delete data?.medicineStatusCode
        data.slotDate = slotStartDatetimeData;
       
        
      }

      if (!defaultData?.id) {
        // const newData = data;
        const newData = { ...data };
        callAppointmentSaveAPI({ data: newData });
      } else {
        delete defaultData?.slotStartHour;
        delete defaultData?.slotStartMinute;
        delete defaultData?.slotStartMeridien;
        delete defaultData?.slotEventDate;
        delete defaultData?.medicineStatusCode

        delete data?.slotStartHour;
        delete data?.slotStartMinute;
        delete data?.slotStartMeridien;
        delete data?.slotEventDate;
        delete data?.slotDate;
        delete data?.medicineStatusCode



        const updatedFields = getUpdatedFieldsValues(data, defaultData);

        if (
          isEmpty(updatedFields)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        }

          callAppointmentSaveAPI(
            { ...updatedFields },
            `/${defaultData?.id}`
          );

      }
    },
    [callAppointmentSaveAPI, defaultData]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [
    refetchData,
    response,
    defaultData,
    clearData,
    modalCloseAction,
    
  ]);

  return (
    <Box>
      <CardContent>
        <Box className="form-appointment">
          <Box className={viewMode && 'appointment-form-disable'}>
            <CustomForm
              form={form}
              formGroups={formFields}
              columnsPerRow={1}
              defaultValue={isEmpty(defaultData) ? initialData : defaultData}
            />
          </Box>
        </Box>
      </CardContent>
      {!viewMode && (
        <CardActions
          sx={{
            justifyContent: 'flex-start',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          <LoadingButton
            variant="outlinedSecondary"
            onClick={modalCloseAction}
            label="Cancel"
          />
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </CardActions>
      )}
    </Box>
  );
};

export default AddMedicationSchedule;
