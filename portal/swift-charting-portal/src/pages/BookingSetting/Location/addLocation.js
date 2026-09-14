/* eslint-disable no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useForm } from 'react-hook-form';

import CustomForm from 'src/components/form';
import {
  defaultScheduleData,
  inputLength,
  regexCommonText,
  requiredField,
  scheduleMessage,
} from 'src/lib/constants';
import Box from 'src/components/Box';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_LOCATION_DATA, GET_LOCATION_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormatterDayjs, showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PageContent from 'src/components/PageContent';
import PageHeader from 'src/components/PageHeader';

export const locationFormGroups = [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Location Name',
    required: requiredField,
    maxLength: { ...inputLength.commonTextLength },
    pattern: {
      value: regexCommonText.value,
      message: `Location Name ${regexCommonText.message}`,
    },
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    required: requiredField,
  },

];

const AddLocation = ({ selectedLocation, onCancel, fetchLocations }) => {
  // eslint-disable-next-line no-unused-vars
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(null);

  const [
    getLocationRes,
    ,
    getLocationLoading,
    getLocation,
    clearGetLocationRes,
  ] = useCRUD({
    id: GET_LOCATION_DATA,
    url: API_URL.practiceLocation,
    type: REQUEST_METHOD.get,
  });

  const getInitialValue = useCallback(() => {
    if (selectedLocation && getLocationRes?.schedule?.length) {
      return cloneDeep(getLocationRes?.schedule);
    }

    return defaultScheduleData;
  }, [getLocationRes?.schedule, selectedLocation]);

  const schedule = useRef(getInitialValue());

  useEffect(() => {
    if (getLocationRes && !getLocationLoading) {
      schedule.current = getInitialValue();
    }
  }, [getLocationLoading, getLocationRes]);

  const [
    saveLocationRes,
    ,
    saveLocationLoading,
    saveLocation,
    clearSaveLocationRes,
  ] = useCRUD({
    id: SAVE_LOCATION_DATA,
    url: API_URL.practiceLocation,
    type: selectedLocation ? REQUEST_METHOD.update : REQUEST_METHOD.post,
  });

  const onClose = useCallback(() => {
    clearGetLocationRes(true);
    clearSaveLocationRes();
    onCancel();
  }, [onCancel, clearGetLocationRes, clearSaveLocationRes]);

  useEffect(() => {
    if (selectedLocation) {
      getLocation({}, `/${selectedLocation}`);
    }
  }, [selectedLocation]);

  const defaultValue = useMemo(
    () =>
      getLocationRes
        ? {
            name: getLocationRes?.name,
            address: getLocationRes?.address,
          }
        : {},
    [getLocationRes]
  );

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;

  const handleSave = useCallback(
    (data) => {
      const { name, address } = data;

      const payload = {
        name,
        address,
      };

      if (error) {
        showSnackbar({
          message: scheduleMessage.validTimeMessage,
          severity: 'error',
        });
        return;
      }

      if (selectedLocation) {
        const initialData = {
          name: getLocationRes?.name,
          address: getLocationRes?.address,
        };
        if (!isEqual(payload, initialData)) {
          saveLocation(payload, `/${selectedLocation}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
        return;
      }

      saveLocation({
        data: payload,
      });
    },
    [
      error,
      selectedLocation,
      saveLocation,
      getLocationRes?.name,
      getLocationRes?.address,
    ]
  );

  useEffect(() => {
    if (saveLocationRes) {
      showSnackbar({
        message: selectedLocation
          ? scheduleMessage.updateSuccessMessage
          : scheduleMessage.addSuccessMessage,
        severity: 'success',
      });
      fetchLocations();
      onClose();
    }
  }, [saveLocationRes]);

  return (
    <PageContent
      loading={getLocationLoading}
      disableGutters
      style={{ overflowY: 'scroll' }}
    >
      <PageHeader
        title="Location Details"
        showBackIcon
        onPressBackIcon={onClose}
      />
      <div>
        <CustomForm
          formGroups={locationFormGroups}
          columnsPerRow={2}
          defaultValue={defaultValue}
          form={form}
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

export default AddLocation;
