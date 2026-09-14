import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
  hourOptions,
  meridianOptions,
  minuteOptions,
  requiredField,
  weekOptions,
  repeatEveryOptions,
  monthWeekOption,
  successMessage,
  dateFormats
} from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import {
  convertWithTimezone,
  getUpdatedFieldsValues,
  getUserTimezone,
  showSnackbar
} from 'src/lib/utils';
import { SAVE_MEDICATION_SCHEDULE } from 'src/store/types';
import {
  WiredMasterAutoComplete,
  WiredSelect
} from 'src/wiredComponent/Form/FormFields';

const AddMedicationSchedule = ({defaultData, modalCloseAction, refetchData = () => {},}) => {
    const params = useParams();
    const form = useForm({ mode: 'onChange' });
    const { handleSubmit, setValue, watch } = form;
    const repeatType = watch('repeatType'); // Watch the repeatType field

  useEffect(() => {
    // Clear fields based on repeatType
    if (repeatType === 'Day') {
      setValue('repeatWeek', undefined);
      setValue('isOnDay', undefined);
      setValue('monthOnDay', undefined);
      setValue('monthWeek', undefined);
      setValue('monthWeekDay', undefined);
    } else if (repeatType === 'Week') {
      setValue('isOnDay', undefined);
      setValue('monthOnDay', undefined);
      setValue('monthWeek', undefined);
      setValue('monthWeekDay', undefined);
    } else if (repeatType === 'Month') {
      setValue('repeatWeek', undefined);
    }
  }, [repeatType, setValue]);

    const totalDays = defaultData?.durationCode === 'weeks' ? defaultData?.durationAmount*7 : defaultData?.durationAmount; 
    const startDate = defaultData?.startDate;
    const startDateObject = new Date(startDate); 
    const endDate = new Date(startDateObject);
    endDate.setDate(startDateObject.getDate() + totalDays); // Add days to the date


    const endDateOb =  convertWithTimezone(
      endDate,
      { format: dateFormats.MMDDYYYYhhmmA }
    )

    const initialData = useMemo(
      () =>
        !isEmpty(defaultData) && {
          ...defaultData,
          ...defaultData?.schedules,
          timeSlots: defaultData?.timeSlots,
          endDate: defaultData?.endDate ? defaultData?.endDate : endDateOb
        },
      [defaultData]
    );

    let { patientId, patientMedicationId } = params || {};
    patientId =decrypt(patientId);

    const showWeeklyFields = (data) => {
      if (data?.repeatType === 'Week') {
        return { hide: false };
      }
      return { hide: true };
    };
    const showMonthlyFields = (data) => {
      if (data?.repeatType === 'Month') {
        return { hide: false };
      }
      return { hide: true };
    };
    const showMonthlyFields1 = (data) => {
      if (data?.repeatType === 'Month' && !data.isOnDay) {
        return { hide: false };
      }
      return { hide: true };
    };
    const showMonthlyFields2 = (data) => {
      if (data?.repeatType === 'Month' && !data.isOnDay) {
        return { hide: false };
      }
      return { hide: true };
    };
    const showisOnDayFields = (data) => {
      if (data?.isOnDay  && data.repeatType === 'Month') {
        return { hide: false };
      }
      return { hide: true };
    };
    const showDailyFields = (data) => {
      if (
        data?.repeatType === 'Day' ||
        data?.repeatType === 'Week' ||
        data?.repeatType === 'Month'
      ) {
        return { hide: false };
      }
      return { hide: true };
    };

    const ordersFormGroups = useMemo(
      () => [
        {
          ...WiredMasterAutoComplete({
            url: API_URL.genericDrug,
            name: 'genericDrug',
            label: 'Generic',
            labelAccessor: 'name',
            valueAccessor: 'id',
            disabled: true,
          }),
        },
        {
          inputType: 'nestedForm',
          name: 'timeSlots',
          label: 'Dosage details for active ingredients',
          textButton: 'Add New',
          required: requiredField,
          columnsPerRow: 1,
          colSpan: 1,
          // isMore: false,
          formGroups: [
            {
              label: 'Start Time',
              colSpan: 1,
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
                    placeholder: 'Hour',
                    showRadio: false,
                  }),
                  colSpan: 0.22,
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
                    placeholder: 'Minute',
                  }),
                  colSpan:  0.22,
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
                    placeholder: 'AM/PM',
                    showRadio: false,
                  }),
                  colSpan: 0.22,
                },
              ],
            },
          ],
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
        },
        {
          inputType: 'date',
          type: 'text',
          name: 'startDate',
          label: 'Start Date',
          colSpan: 0.5,
          disabled:true,
          dependencies: {
            keys: [ 'repeatType'],
            calc: showDailyFields,
          },
          description:'will be changed with medication start date'
        },
        {
          inputType: 'date',
          type: 'text',
          name: 'endDate',
          label: 'End Date',
          colSpan: 0.5,
          // disabled:true,
          dependencies: {
            keys: ['repeatType'],
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
              keys: ['repeatType'],
              calc: showDailyFields,
            },
          }),
          colSpan: 0.5,
        },
        {
          ...WiredSelect({
            name: 'repeatWeek',
            label: 'Weeks',
            valueAccessor: 'value',
            labelAccessor: 'label',
            url: null,
            options: weekOptions,
            showRadio: false,
            placeholder: 'Select',
            dependencies: {
              keys: ['repeatType'],
              calc: showWeeklyFields,
            },
          }),
          multiple: true,
          colSpan: 0.5,
        },
    
        {
          inputType: 'checkBox',
          name: 'isOnDay',
          label: 'On Day',
          colSpan: 0.5,
          dependencies: {
            keys: ['repeatType'],
            calc: showMonthlyFields,
          },
        },
        {
          ...WiredSelect({
            name: 'monthOnDay',
            label: 'Day Of Month',
            valueAccessor: 'value',
            labelAccessor: 'label',
            url: null,
            options: repeatEveryOptions,
            showRadio: false,
            placeholder: '28',
            dependencies: {
              keys: ['isOnDay'],
              calc: showisOnDayFields,
            },
          }),
          colSpan: 0.5,
        },
        {
          ...WiredSelect({
            name: 'monthWeekDay',
            label: 'Week Day',
            valueAccessor: 'value',
            labelAccessor: 'label',
            url: null,
            options: weekOptions,
            showRadio: false,
            placeholder: 'Sunday',
            dependencies: {
              keys: ['repeatType'],
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
            valueAccessor: 'value',
            labelAccessor: 'label',
            url: null,
            options: monthWeekOption,
            showRadio: false,
            placeholder: '01',
            dependencies: {
              keys: ['repeatType'],
              calc: showMonthlyFields1,
            },
            multiple: true,
          }),
          colSpan: 0.5,
        },
      ],
      []
    );

    
    const [response, , loading, callMedicationScheduleSaveAPI, clearData] = useCRUD({
      id: SAVE_MEDICATION_SCHEDULE,
      url: API_URL.medicationSchedule,
      type: defaultData?.scheduleId ? REQUEST_METHOD.update : REQUEST_METHOD.post,
    });

    function processTimeSlotsToUTC(data) {
      const userTimezone = getUserTimezone(); // Get user's timezone
      const processedData = { ...data, timeSlots: [] };
  
      data?.timeSlots?.forEach(slot => {
          const hour = parseInt(slot.startHour, 10);
          const minute = parseInt(slot.startMinute, 10);
          const meridien = slot.startMeridien.toUpperCase();
  
          // Adjust hour based on AM/PM
          const adjustedHour = meridien === 'PM' && hour !== 12 ? hour + 12 : hour === 12 && meridien === 'AM' ? 0 : hour;
  
          // Step 1: Create a dayjs object in the user's timezone
          const localTime = dayjs()
          .set('hour', adjustedHour)
          .set('minute', minute)
          .set('second', 0)
          .set('millisecond', 0)
          .tz(userTimezone, true);
         
  
          // Step 2: Convert to UTC time and extract hour, minute, meridian
          const utcTime = localTime.utc();
          const utcHour = utcTime.format('hh'); // UTC hour in 12-hour format
          const utcMinute = utcTime.format('mm'); // UTC minute
          const utcMeridien = utcTime.format('A'); // UTC AM/PM
          // Push the updated slot with UTC time fields into processedData
          processedData.timeSlots.push({
              startHour: utcHour,
              startMinute: utcMinute,
              startMeridien: utcMeridien
          });
      });
  
      return processedData;
  }

  
    const onHandleSubmit = useCallback(
      (data) => {
        const isDefaultData=defaultData?.scheduleId;
        let payload = {};
        const recurringFields = [
          'repeatType',
          'repeatEvery',
          'repeatWeek',
          'monthOnDay',
          'monthWeek',
          'monthWeekDay',
          'isOnDay',
          'endDate',
        ];
        if (!isDefaultData) {
          payload = {
            patientId,
            patientMedicationItemId: data?.id,
            endDate: data?.endDate,
            isOnDay: data?.isOnDay,
            monthOnDay: data?.monthOnDay, 
            monthWeek: data?.monthWeek,
            monthWeekDay: data?.monthWeekDay,
            repeatEvery: data?.repeatEvery,
            repeatType: data?.repeatType,
            repeatWeek: data?.repeatWeek,
            startDate: data?.startDate, 
            timeSlots: data?.timeSlots,
          };
        } else {
          payload ={
            endDate: data?.endDate,
            isOnDay: data?.isOnDay,
            monthOnDay: data?.monthOnDay, 
            monthWeek: data?.monthWeek,
            monthWeekDay: data?.monthWeekDay,
            repeatEvery: data?.repeatEvery,
            repeatType: data?.repeatType,
            repeatWeek: data?.repeatWeek,
            startDate: data?.startDate, 
            timeSlots: data?.timeSlots,
          }
        }

        if (!isDefaultData) {
          const updatedPayload = processTimeSlotsToUTC(payload)
          payload = { ...updatedPayload }
          callMedicationScheduleSaveAPI({ data: { ...updatedPayload } });
          // callMedicationScheduleSaveAPI({ data: { ...payload } });
        } else {
          const updateData = getUpdatedFieldsValues(payload, defaultData?.schedules);
          // const diff = payload - defaultData?.schedules
          if (isEmpty(updateData)) {
            showSnackbar({
              message: 'No changes found',
              severity: 'error',
            });
            return;
          }
          // const updatedPayload = processTimeSlotsToUTC(payload)
          const updatedPayload = processTimeSlotsToUTC(updateData)
          
          const updatedRecurringFields = {};
          recurringFields?.forEach((field) => {
            updatedRecurringFields[field] = data[field];
          });

          // payload = { ...updatedPayload }
          payload = {...updatedPayload}
          const newData = { timeSlots:updatedPayload?.timeSlots, ...updatedRecurringFields}   
          callMedicationScheduleSaveAPI({ ...newData }, `/${defaultData?.scheduleId}`);
          // callMedicationScheduleSaveAPI({ ...payload }, `/${defaultData?.scheduleId}`);
        }
      },
      [callMedicationScheduleSaveAPI, defaultData]
    );  

    useEffect(() => {
      if (!isEmpty(response)) {
        showSnackbar({
          message: defaultData?.scheduleId
            ? successMessage.update
            : successMessage.create,
          severity: 'success',
        });
        clearData(true);
        refetchData();
        modalCloseAction();
      }
    }, [refetchData, response, defaultData, clearData, modalCloseAction,patientId]);

    return (
        <Box>
          <CardContent>
            {/* <Box sx={{ mt: 2 }}>
                <LoadingButton
                    onClick={addTimeField}
                    label="Add Another Time"
                />
            </Box> */}
            <CustomForm
              form={form}
              formGroups={ordersFormGroups}
              columnsPerRow={1}
              defaultValue={isEmpty(defaultData) ? {} : initialData}
            />
          </CardContent>
          <CardActions
            sx={{
              justifyContent: 'flex-start',
              paddingLeft: '24px',
              paddingRight: '24px',
            }}
          >
            <LoadingButton
              type= 'fabButton'
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
        </Box>
      );
}
export default AddMedicationSchedule;
