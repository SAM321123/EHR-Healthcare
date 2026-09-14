import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';
import { requiredField } from 'src/lib/constants';
import CustomForm from 'src/components/form';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

const ServiceOverride = ({ form, isTitle, defaultData }) => {
  const { watch, getValues, setValue } = form;

  const initialData = useMemo(() => {
    const data = {
      appointmentConfirmationType:
        getValues('appointmentConfirmationType') ||
        defaultData?.appointmentConfirmationType,
      creditCardRequiredType:
        getValues('creditCardRequiredType') ||
        defaultData?.creditCardRequiredType,
      leadTime: getValues('leadTime') || defaultData?.leadTime,
      leadTimeForSameDay:
        getValues('leadTimeForSameDay') || defaultData?.leadTimeForSameDay,
      serviceStartDate:
        getValues('serviceStartDate') || defaultData?.serviceStartDate,
      serviceEndDate:
        getValues('serviceEndDate') || defaultData?.serviceEndDate,
    };

    return data;
  }, [defaultData]);

  useEffect(()=>{
    if(isEmpty(defaultData)){
      setValue('serviceStartDate',dayjs(new Date()))
    }
  },[defaultData])

  const startDate = watch('serviceStartDate');
  const isDisabled = watch('leadTime') === 'LT_0';

  const ServiceAppointmentFormGroup = useMemo(
    () => [
      {
        ...WiredMasterField({
          label: 'Appointment Confirmation',
          name: 'appointmentConfirmationType',
          code: 'APPOINTMENT_CONFIRMATION',
          valueField: 'name',
          required: requiredField,
        }),
      },
      {
        ...WiredMasterField({
          label: 'Lead Time',
          name: 'leadTime',
          code: 'LEAD_TIME',
          valueField: 'name',
          required: requiredField,
        }),
      },
      {
        ...WiredMasterField({
          label: 'Same Day Lead Time',
          name: 'leadTimeForSameDay',
          code: 'SAME_DAY_LEAD_TIME',
          valueField: 'name',
          required: isDisabled ? requiredField : false,
          disabled: !isDisabled,
        }),
      },

      {
        inputType: 'date',
        name: 'serviceStartDate',
        label: 'Service Start Date',
        disablePast: !!isEmpty(defaultData),
        required: requiredField,
        minDate: !isEmpty(defaultData)
          ? dayjs(initialData?.serviceStartDate)
          : dayjs(new Date()),
      },
      {
        inputType: 'date',
        name: 'serviceEndDate',
        label: 'Service End Date',
        disablePast: !!isEmpty(defaultData),
        minDate: dayjs(startDate).add(1, 'day'),
      },
    ],
    [startDate, isDisabled]
  );
  return (
    <Box>
      {isTitle ? (
        <CardHeader
          title={isTitle}
          subheader="Use the following settings to override the account settings for this service only"
        />
      ) : null}
      <CardContent>
        <CustomForm
          formGroups={ServiceAppointmentFormGroup}
          columnsPerRow={2}
          form={form}
          defaultValue={!isEmpty(defaultData) ? initialData : {}}
        />
      </CardContent>
    </Box>
  );
};

export default ServiceOverride;
