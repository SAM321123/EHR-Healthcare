/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import InputAdornment from '@mui/material/InputAdornment';

import Box from 'src/components/Box';
import {
  WiredLocationField,
  WiredSelect,
} from 'src/wiredComponent/Form/FormFields';
import { requiredField } from 'src/lib/constants';
import { API_URL } from 'src/api/constants';
import CustomForm from 'src/components/form';
import Currency from 'src/components/Currency';
import { isEmpty } from 'lodash';
import { showSnackbar } from 'src/lib/utils';

const ServiceForm = ({ form, isTitle, defaultData }) => {
  const { getValues } = form;

  const initialData = useMemo(() => {
    const data = {
      form: getValues('form') || defaultData?.form,
      locations: getValues('locations') || defaultData?.locations,
    };

    return data;
  }, [defaultData, getValues]);

  const calc = useCallback((data, index) => {
    if (data?.locations.length) {
      const locationData = data.locations[index]?.location;
      if (locationData) {
        return {
          reFetch: true,
          reFetchData: locationData,
        };
      }
    }
    return { reFetch: false };
  }, []);

  const scheduleCalc = useCallback((data, index) => {
    if (data?.locations.length) {
      const locationData = data.locations[index]?.location;
      if (locationData) {
        return {
          reFetch: true,
          reFetchData: locationData,
          queryParams: { location: locationData },
        };
      }
    }
    return { reFetch: false };
  }, []);

  const handleValidateSelection = useCallback(
    (selectedValue, otherProps) => {
      const { index } = otherProps;
      const { locations = [] } = form.getValues();
      const selectedLocation = locations[index]?.location;
      const isValid = locations.findIndex(
        (item) =>
          item.location === selectedLocation &&
          item.practitioner === selectedValue
      );
      if (isValid <= -1) {
        return true;
      }
      showSnackbar({
        message: 'Practitioner already selected for this location',
        severity: 'error',
      });
      return false;
    },
    [form]
  );
  const ServiceFormGroup = useMemo(
    () => [
      {
        ...WiredSelect({
          label: 'Select an intake form',
          name: 'form',
          labelAccessor: 'name',
          required: requiredField,
          url: `${API_URL.getFormList}?formType=FT_QUESTIONNAIRES&isActive=true`,
          valueAccessor: 'id',
          cache: false,
          addOnFilterKey: 'forms',
        }),
      },
      {
        inputType: 'nestedForm',
        name: 'locations',
        textButton: 'Add New',
        required: requiredField,
        columnsPerRow: 4,
        formGroups: [
          {
            ...WiredLocationField({
              name: 'location',
              url: API_URL.practiceLocation,
              label: 'Location',
              valueAccessor: 'id',
              required: requiredField,
              code: 'id',
              selectFirstValue: true,
              extraId: 'locations',
              colSpan: 1.05,
              addOnFilterKey:'locations'
            }),
          },
          {
            ...WiredSelect({
              name: 'practitioner',
              label: 'Practitioner',
              url: API_URL.practiceLocation,
              extraId: 'practitioners',
              valueAccessor: 'id',
              code: 'id',
              labelAccessor: ['firstName', 'lastName'],
              accessor: (data) =>
                data?.practitioners?.map((item) => item),
              dependencies: {
                keys: ['location'],
                calc,
              },
              validateSelection: handleValidateSelection,
              required: requiredField,
              colSpan: 1.15,
            }),
          },
          {
            ...WiredSelect({
              name: 'schedule',
              label: 'Schedule',
              valueAccessor: 'id',
              labelAccessor: 'name',
              url: API_URL.practiceLocationSchedule,
              dependencies: {
                keys: ['location'],
                calc: scheduleCalc,
              },
              required: requiredField,
              fetchInitial: false,
              colSpan: 1.05,
            }),
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'price',
            textLabel: 'Price',
            colSpan: 0.75,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <Currency />
                </InputAdornment>
              ),
            },
          },
        ],
      },
    ],
    [calc, scheduleCalc]
  );

  return (
    <Box>
      {isTitle ? <CardHeader title={isTitle} /> : null}
      <CardContent>
        <CustomForm
          formGroups={ServiceFormGroup}
          columnsPerRow={1}
          form={form}
          gridGap={3}
          defaultValue={!isEmpty(defaultData) ? initialData : {}}
        />
      </CardContent>
    </Box>
  );
};

export default ServiceForm;
