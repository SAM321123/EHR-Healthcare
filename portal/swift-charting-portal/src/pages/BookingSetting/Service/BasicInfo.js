import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import InputAdornment from '@mui/material/InputAdornment';

import Box from 'src/components/Box';
import Currency from 'src/components/Currency';
import CustomForm from 'src/components/form';
import { inputLength, regexCommonText, requiredField } from 'src/lib/constants';
import {
  WiredMasterField,
  WiredSelect,
} from 'src/wiredComponent/Form/FormFields';
import { API_URL } from 'src/api/constants';

export const basicInfoFormGroup = [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Service Name',
    required: requiredField,
    colSpan: 2,
    pattern: {
      value: regexCommonText.value,
      message: `Service Name ${regexCommonText.message}`,
    },
    maxLength: { ...inputLength.commonTextLength },
  },
  {
    inputType: 'text',
    multiline: true,
    minRows: 3,
    name: 'description',
    textLabel: 'Description',
    colSpan: 2,
    maxLength: { ...inputLength.commonTextLength },
  },
  {
    inputType: 'text',
    type: 'number',
    name: 'sessionDuration',
    textLabel: 'Session Duration (Mins)',
    required: requiredField,
    colSpan: 0.7,
  },

  {
    inputType: 'checkBox',
    name: 'hideSessionDuration',
    maxLength: { value: 2 },
    label: 'Hide',
    colSpan: 0.3,
    mt: 1.1,
  },
  {
    inputType: 'text',
    type: 'number',
    name: 'price',
    textLabel: 'Price',
    required: requiredField,
    maxLength: { ...inputLength.amountLength },
    colSpan: 0.5,
    isShrink: true,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <Currency />
        </InputAdornment>
      ),
    },
  },
  {
    inputType: 'checkBox',
    name: 'hidePrice',
    label: 'Hide',
    colSpan: 0.3,
    mt: 1.1,
  },
  {
    ...WiredMasterField({
      label: 'Service Type',
      name: 'serviceType',
      code: 'SERVICE_TYPE',
      valueField: 'name',
      applyPractice: true,
      required: requiredField,
      cache: false,
      params: { limit: 300, isActive: true },
      addOnFilterKey: '_ids',
    }),
    colSpan: 1,
  },
  {
    ...WiredSelect({
      label: 'Education Content',
      name: 'educationContent',
      valueAccessor: 'id',
      labelAccessor: 'name',
      url: API_URL.educationContent,
      multiple: true,
      cache: false,
      params: { isActive: true },
      addOnFilterKey: 'educationContents',
    }),
    colSpan: 1,
  },
  {
    inputType: 'checkBox',
    name: 'isAppointmentType',
    label: 'Enable Booking',
    colSpan: 1,
  },
];

const BasicInfo = ({ form, isTitle, defaultData }) => {
  const { getValues } = form;

  const initialData = useMemo(() => {
    const data = {
      name: getValues('name') || defaultData?.name,
      description: getValues('description') || defaultData?.description,
      sessionDuration:
        getValues('sessionDuration') || defaultData?.sessionDuration,
      price: getValues('price') || defaultData?.price,
      hideSessionDuration:
        getValues('hideSessionDuration') || defaultData?.hideSessionDuration,
      hidePrice: getValues('hidePrice') || defaultData?.hidePrice,
      serviceType: getValues('serviceType') || defaultData?.serviceType,
      isAppointmentType:
        getValues('isAppointmentType') || defaultData?.isAppointmentType,
      educationContent:
        getValues('educationContent') || defaultData?.educationContent,
    };

    return data;
  }, [defaultData]);

  return (
    <Box>
      {isTitle ? <CardHeader title={isTitle} /> : null}
      <CardContent>
        <CustomForm
          formGroups={basicInfoFormGroup}
          form={form}
          columnsPerRow={2}
          defaultValue={!isEmpty(defaultData) ? initialData : {}}
        />
      </CardContent>
    </Box>
  );
};

export default BasicInfo;
