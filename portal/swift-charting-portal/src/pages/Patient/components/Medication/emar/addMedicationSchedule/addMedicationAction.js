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
import { dateFormats, successMessage } from 'src/lib/constants';
import {
  dateFormatterDayjs,
  getCurrentMeridien,
  getUpdatedFieldsValues,
  isEqualById,
  showSnackbar,
} from 'src/lib/utils';
import { ADD_APPOINTMENT } from 'src/store/types';

// import './appointment.scss';
import { formFields } from './formGroup';
import { decrypt } from 'src/lib/encryption';

const currentMeridien = getCurrentMeridien();

const AddMedicationAction = ({
  modalCloseAction = () => {},
  refetchData = () => {},
  defaultData = {},
  editSeries,
  fromCalender = false,
  viewMode = false,
  addOnIntialData,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch, setError, clearErrors } = form;
  const params = useParams();
  let { patientId } = params || {};
  if(patientId){
  patientId = decrypt(patientId);
  }
  const [patientData] = usePatientDetail({ patientId });

  const [response, , loading, callAppointmentSaveAPI, clearData] = useCRUD({
    id: ADD_APPOINTMENT,
    url: API_URL.appointment,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const [initialData, setInitialData] = useState({
    startHour: currentMeridien.hour,
    startMinute: currentMeridien.minute,
    startMeridien: currentMeridien.meridien,
    startDate: currentMeridien.now,
  });

  useEffect(() => {
    let temp = { ...addOnIntialData };
const currentMeridien = getCurrentMeridien();
const endMeridien = getCurrentMeridien(moment().add(15, 'm').toDate());

    if (!fromCalender) {
      temp = {
        patientFirstName: patientData?.firstName || '',
        patientLastName: patientData?.lastName || '',
        titleCode: patientData?.titleCode || '',
        patientIds: [{ ...patientData }],
      };
    }
    setInitialData((prevData) => ({
      ...prevData,
      startHour: currentMeridien.hour,
      startMinute: currentMeridien.minute,
      startMeridien: currentMeridien.meridien,
      startDate: currentMeridien.now,
      endHour :endMeridien.hour,
      endMinute :endMeridien.minute,
      endMeridien:endMeridien.meridien,
      ...temp,
    }));
  }, []);

  useEffect(() => {
    form.setValue('editSeries', editSeries, {
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [editSeries]);

  useEffect(() => {
    form.setValue('fromCalender', fromCalender, {
      shouldTouch: true,
      shouldValidate: true,
    });
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

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      getTimeValidation(value);
      if (name === 'startDate') {
        form.setValue('startRecurringDate', value.startDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onHandleSubmit = useCallback(
    (data) => {
      if (fromCalender && data.typeCode !== 'group_appointment_type') {
        delete data.patientIds;
        const patientIds = [];
        patientIds.push(data.patientId);
        data.patientIds = patientIds;
      } else if (!fromCalender && data.typeCode !== 'group_appointment_type') {
        data.patientIds = [{ id: parseInt(patientId) }];
      }
      delete data.patientId;
      const validationError = getTimeValidation(data);
      if (validationError) {
        return;
      }
      if (
        data?.startHour &&
        data.startMinute &&
        data.startMeridien &&
        data?.endHour &&
        data.endMinute &&
        data.endMeridien &&
        data.startDate
      ) {
        const {
          startHour,
          startMinute,
          startMeridien,
          endHour,
          endMinute,
          endMeridien,
          startDate,
        } = data || {};

        const startDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${startHour}:${startMinute} ${startMeridien}`;
        const endDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${endHour}:${endMinute} ${endMeridien}`;
        const startDatetimeData = moment(
          startDatetimeString,
          'MM/DD/YYYY hh:mm A'
        );
        const endDateTimeData = moment(endDatetimeString, 'MM/DD/YYYY hh:mm A');
        data.startDateTime = startDatetimeData;
        data.endDateTime = endDateTimeData;
        if (data?.problemId?.id) {
          data.problemId = data.problemId.id;
        } else {
          delete data?.problemId;
        }
        delete data.startHour;
        delete data.startMinute;
        delete data.startMeridien;
        delete data.endHour;
        delete data.endMinute;
        delete data.endMeridien;
        delete data.patientFirstName;
        delete data.patientLastName;
        delete data.titleCode;
        delete data.startDate;
        delete data.endDate;
        delete data.formCategory;
      }

      const recurringFields = [
        'repeatType',
        'startRecurringDate',
        'endRecurringDate',
        'repeatEvery',
        'repeateWeek',
        'monthOnDay',
        'monthWeek',
        'monthWeekDay',
        'isOnDay',
      ];

      let recurringFieldsUpdated = false;
      if (isEmpty(defaultData)) {
        data.patientIds = data.patientIds.map((item) => item.id);
        // const newData = data;
        const newData = { ...data };
        callAppointmentSaveAPI({ data: newData });
      } else {
        const clonedDefaultData = { ...defaultData };
        const {
          startHour,
          startMinute,
          startMeridien,
          endHour,
          endMinute,
          endMeridien,
          startDate,
        } = clonedDefaultData || {};

        const startDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${startHour}:${startMinute} ${startMeridien}`;
        const endDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${endHour}:${endMinute} ${endMeridien}`;
        const startDatetimeData = moment(
          startDatetimeString,
          'MM/DD/YYYY hh:mm A'
        );
        const endDateTimeData = moment(endDatetimeString, 'MM/DD/YYYY hh:mm A');
        clonedDefaultData.startDateTime = startDatetimeData;
        clonedDefaultData.endDateTime = endDateTimeData;

        const updatedFields = getUpdatedFieldsValues(data, clonedDefaultData);
        if (
          isEqualById(
            updatedFields.patientIds,
            defaultData?.patientIds?.length
              ? defaultData?.patientIds
              : [defaultData.patientId]
          )
        ) {
          delete updatedFields.patientIds;
        }
        if (updatedFields.patientIds) {
          updatedFields.patientIds = updatedFields.patientIds.map(
            (item) => item.id
          );
          if (!updatedFields.formId && data.typeCode === 'follow_up') {
            updatedFields.formId = data.formId;
          }
        }
        if (updatedFields.startDateTime || updatedFields.endDateTime) {
          updatedFields.startDateTime = data.startDateTime;
          updatedFields.endDateTime = data.endDateTime;
        }

        recurringFields.forEach((field) => {
          if (updatedFields[field] !== undefined) {
            recurringFieldsUpdated = true;
            return;
          }
        });

        const updatedRecurringFields = {};
        if (recurringFieldsUpdated || data.editSeries) {
          recurringFields.forEach((field) => {
            updatedRecurringFields[field] = data[field];
          });
        }
        const dirtyRecurringFields = getUpdatedFieldsValues(
          updatedRecurringFields,
          defaultData
        );

        const { editSeries, fromCalender, ...restUpdatedFields } =
          updatedFields;
        if (
          isEmpty(dirtyRecurringFields) &&
          data.editSeries &&
          isEmpty(restUpdatedFields)
        ) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        }

        if (!isEmpty(restUpdatedFields)) {
          callAppointmentSaveAPI(
            { ...updatedFields, ...updatedRecurringFields },
            `/${defaultData?.id}`
          );
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callAppointmentSaveAPI, defaultData, patientId]
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
    patientId,
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

export default AddMedicationAction;
