/* eslint-disable no-unused-vars */
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PageContent from 'src/components/PageContent';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { dateFormats, successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import {
  convertToUtc,
  dateFormatterDayjs,
  getCurrentMeridien,
  getUpdatedFieldsValue,
  getUpdatedFieldsValues,
  getUserTimezone,
  isEqualById,
  showSnackbar,
} from 'src/lib/utils';
import { formFields } from './formGroup';
import moment from 'moment';
import useAuthUser from 'src/hooks/useAuthUser';
import { SAVE_CALENDAR_SCHEDULE } from 'src/store/types';
import './calendarSchedule.scss';

const currentMeridien = getCurrentMeridien();

const AddSchedule = ({
  refetchData = () => {},
  selectedLocation,
  editSeries,
  modalCloseAction,
  viewMode = false,
  addOnIntialData,
  defaultData = {},
}) => {
  const [user, , ,] = useAuthUser();
  const practitionerId = user.id;
  const [initialData, setInitialData] = useState({
    startHour: currentMeridien.hour,
    startMinute: currentMeridien.minute,
    startMeridien: currentMeridien.meridien,
    isActive: true ,
    newPatient: true,
    existingPatient: true,
  });

  const [calendarScheduleResponse, , calendarScheduleLoading, callCalendarScheduleApi, clearData] = useCRUD({
    id: SAVE_CALENDAR_SCHEDULE,
    url: API_URL.calendarSchedule,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
  
  useEffect(() => {
    form.setValue('editSeries', editSeries, {
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [editSeries]);
  
  useEffect(() => {
    let temp = { ...addOnIntialData };
    const currentMeridien = getCurrentMeridien();
    const endMeridien = getCurrentMeridien(moment().add(15, 'm').toDate());

    setInitialData((prevData) => ({
      ...prevData,
      startHour: currentMeridien.hour,
      startMinute: currentMeridien.minute,
      startMeridien: currentMeridien.meridien,
      endHour: endMeridien.hour,
      endMinute: endMeridien.minute,
      endMeridien: endMeridien.meridien,
      ...temp,
    }));
  }, []);

  useEffect(() => {
    if (!isEmpty(calendarScheduleResponse)) {
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
    calendarScheduleResponse,
    defaultData,
    clearData,
    modalCloseAction,
  ]);
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch, setError, clearErrors } = form;

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

  const onHandleSubmit = useCallback((data) => {
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

      let startDatetimeString = `${dateFormatterDayjs(
        startDate,
        dateFormats.MMDDYYYY
      )} ${startHour}:${startMinute} ${startMeridien}`;
      startDatetimeString = convertToUtc(startDatetimeString,{timezone:getUserTimezone(),format:dateFormats.MMDDYYYYhhmmA})

      let endDatetimeString = `${dateFormatterDayjs(
        startDate,
        dateFormats.MMDDYYYY
      )} ${endHour}:${endMinute} ${endMeridien}`;
      endDatetimeString = convertToUtc(endDatetimeString,{timezone:getUserTimezone(),format:dateFormats.MMDDYYYYhhmmA})
      data.startDateTime = startDatetimeString;
      data.endDateTime = endDatetimeString;
      data.staffId = practitionerId;
      data.locationId = selectedLocation;
      delete data.startHour;
      delete data.startMinute;
      delete data.startMeridien;
      delete data.endHour;
      delete data.endMinute;
      delete data.endMeridien;
      delete data.startDate;
      delete data.endDate;
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
        // const newData = data;
        const newData = { ...data };
        callCalendarScheduleApi({ data: newData });
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
        let startDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${startHour}:${startMinute} ${startMeridien}`;
        startDatetimeString = convertToUtc(startDatetimeString,{timezone:getUserTimezone(),format:dateFormats.MMDDYYYYhhmmA})
  
        let endDatetimeString = `${dateFormatterDayjs(
          startDate,
          dateFormats.MMDDYYYY
        )} ${endHour}:${endMinute} ${endMeridien}`;
        endDatetimeString = convertToUtc(endDatetimeString,{timezone:getUserTimezone(),format:dateFormats.MMDDYYYYhhmmA})
        clonedDefaultData.startDateTime = startDatetimeString;
        clonedDefaultData.endDateTime = endDatetimeString;
        
        const updatedFields = getUpdatedFieldsValues(data, clonedDefaultData);
        
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

        const { editSeries, ...restUpdatedFields } =
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
          callCalendarScheduleApi(
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
  }, []);

  return (
    <PageContent>
      <Box sx={{ display: 'flex', gap: '25px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box className='form-calendar-schedule'>
          <Box className={viewMode && 'schedule-form-disable'}>
            <CustomForm
              formGroups={formFields}
              columnsPerRow={1}
              form={form}
              defaultValue={isEmpty(defaultData) ? initialData : defaultData}
            />
          </Box>

          </Box>
          {!viewMode && (
          <Box style={{ display: 'flex', gap: 20 }}>
            <LoadingButton
              label="Cancel"
              variant="outlinedSecondary"
              onClick={modalCloseAction}
            />
            <LoadingButton
              label="Save"
              onClick={handleSubmit(onHandleSubmit)}
              loading={calendarScheduleLoading }
            />
          </Box>

          )}
        </Box>
      </Box>
    </PageContent>
  );
};

export default AddSchedule;
