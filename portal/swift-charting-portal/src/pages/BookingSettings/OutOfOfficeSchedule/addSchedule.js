import React, { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

import CustomForm from 'src/components/form';
import {
  hourOptions,
  meridianOptions,
  minuteOptions,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import Box from 'src/components/Box';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_STAFF_OOF_SCHEDULE } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { getCurrentMeridien, getUTCDateTime, showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PageContent from 'src/components/PageContent';
import PageHeader from 'src/components/PageHeader';
import {
  WiredMasterField,
  WiredSelect,
} from 'src/wiredComponent/Form/FormFields';

const AddSchedule = ({
  onCancel,
  fetchData,
  staffId,
}) => {
  const initialData = useMemo(() => {
    const startTime = getCurrentMeridien();
    const endTime = getCurrentMeridien(dayjs().add(15, 'minute').toDate());

    return {
      startHour: startTime.hour,
      startMinute: startTime.minute,
      startMeridien: startTime.meridien,
      endHour: endTime.hour,
      endMinute: endTime.minute,
      endMeridien: endTime.meridien,
    };
  }, []);

  const LocationFormGroups = useMemo(
    () => [
      {
        ...WiredMasterField({
          url: API_URL.staffLocation,
          filter: { limit: 20, staffId },
          name: 'locationId',
          label: 'Location',
          labelAccessor: 'location.name',
          valueAccessor: 'locationId',
          colSpan: 0.6,
          placeholder: 'Select',
          required: requiredField,
          cache: false,
        }),
      },
      {
        inputType: 'date',
        type: 'text',
        name: 'startDate',
        label: 'Start Date',
        required: requiredField,
        disablePast: true,
        colSpan: 0.6,
      },
      {
        inputType: 'date',
        type: 'text',
        name: 'endDate',
        label: 'End Date',
        required: requiredField,
        disablePast: true,
        colSpan: 0.6,
      },
      {
        label: 'Start Time',
        colSpan: 0.6,
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
              placeholder: 'H',
              showRadio: false,
            }),
            colSpan: 0.6,
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
              placeholder: 'M',
            }),
            colSpan: 0.6,
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
            colSpan: 0.6,
          },
        ],
      },
      {
        label: 'End Time',
        colSpan: 0.6,
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
              placeholder: 'H',
              showRadio: false,
              required: requiredField,
            }),
            colSpan: 0.6,
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
              placeholder: 'M',
              required: requiredField,
            }),
            colSpan: 0.6,
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
            colSpan: 0.6,
          },
        ],
      },
    ],
    [staffId]
  );

  const [
    saveLocationRes,
    ,
    saveLocationLoading,
    saveLocation,
    clearSaveLocationRes,
  ] = useCRUD({
    id: SAVE_STAFF_OOF_SCHEDULE,
    url: API_URL.oofSchedule,
    type: REQUEST_METHOD.post,
  });

  const onClose = useCallback(() => {
    clearSaveLocationRes();
    onCancel();
  }, [clearSaveLocationRes, onCancel]);


  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;


  const handleSave = useCallback(
    (data) => {
      const {
        locationId,
        startHour,
        startMinute,
        startMeridien,
        endHour,
        endMinute,
        endMeridien,
        startDate,
        endDate,
      } = data;


      const payload = {
        locationId,
        staffId,
      };
      payload.startDateTime = getUTCDateTime(startDate, { hour: startHour, minute: startMinute, meridien: startMeridien });
      payload.endDateTime = getUTCDateTime(endDate, { hour: endHour, minute: endMinute, meridien: endMeridien });

      saveLocation({
        data: payload,
      });
    },
    [staffId, saveLocation]
  );

  useEffect(() => {
    if (saveLocationRes) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      fetchData();
      onClose();
    }
  }, [fetchData, onClose, saveLocationRes]);

  return (
    <PageContent disableGutters style={{ overflowY: 'scroll' }}>
      <PageHeader
        title="Back"
        showBackIcon
        onPressBackIcon={onClose}
      />
      <div>
        <CustomForm
          formGroups={LocationFormGroups}
          columnsPerRow={2}
          form={form}
          defaultValue={initialData}
        />
      </div>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          onClick={handleSubmit(handleSave)}
          loading={saveLocationLoading}
          label="Save"
        />
      </Box>
    </PageContent>
  );
};

export default AddSchedule;
