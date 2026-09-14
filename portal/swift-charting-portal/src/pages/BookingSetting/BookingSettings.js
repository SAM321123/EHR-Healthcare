import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import { getTimezonesForCountry } from 'countries-and-timezones';
import isEmpty from 'lodash/isEmpty';

import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import PageContent from 'src/components/PageContent';

import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';
import palette from 'src/theme/palette';
import {
  GET_PRACTICE_DATA_SETTING,
  UPDATE_PRACTICE_DATA_SETTING,
} from 'src/store/types';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useAuthUser from 'src/hooks/useAuthUser';
import PageHeader from 'src/components/PageHeader';
import { inputLength, regDecimal } from 'src/lib/constants';
import { InputAdornment } from '@mui/material';
import Currency from 'src/components/Currency';
import CancellationForm from './Components/CancellationForm';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';

const formGroups = [
  {
    inputType: 'select',
    name: 'timezone',
    label: 'Timezone',
    valueAccessor: 'name',
    labelAccessor: 'displayLabel',
  },
  {
    ...WiredMasterField({
      name: 'appointmentStart',
      label: 'Appointment Start',
      code: 'APPOINTMENT_START',
    }),
  },
  {
    ...WiredMasterField({
      name: 'minimumAppointmentInterval',
      label: 'Minimum Interval Between Appointments',
      code: 'MINIMUM_INTERVAL_BETWEEN_APPOINTMENTS',
    }),
  },
  {
    ...WiredMasterField({
      name: 'leadTime',
      label: 'How much lead time do you require when clients book online?',
      code: 'LEAD_TIME',
    }),
  },
  {
    ...WiredMasterField({
      name: 'leadTimeForSameDay',
      label: 'How much lead time for same day appointments?',
      code: 'SAME_DAY_LEAD_TIME',
    }),
  },
  {
    ...WiredMasterField({
      name: 'advanceBookingAllowedTime',
      label: 'How far in advance can clients book their online appointments?',
      code: 'ADVANCE_BOOKING_ALLOWED_TIME',
    }),
  },
  {
    ...WiredMasterField({
      name: 'appointmentConfirmationType',
      label: 'Appointment Confirmation',
      code: 'APPOINTMENT_CONFIRMATION',
    }),
  },
  {
    ...WiredMasterField({
      name: 'appointmentReminder',
      label: 'Appointment Reminder',
      code: 'APPOINTMENT_REMINDER',
    }),
  },
  {
    ...WiredMasterField({
      name: 'appointmentSameDayReminder',
      label: 'Appointment Same Day Reminder',
      code: 'APPOINTMENT_SAME_DAY_REMINDER',
    }),
  },
  {
    inputType: 'text',
    type: 'number',
    name: 'shipingCharges',
    textLabel: 'Shipping Charge',
    maxLength: { ...inputLength.amountLength },
    pattern: regDecimal,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <Currency />
        </InputAdornment>
      ),
    },
  },
  {
    colSpan: 2,
    component: (props) => (
      <>
        <Typography
          variant="body2"
          sx={{
            fontSize: '18px',
            fontWeight: 800,
          }}
        >
          Cancellation Settings
        </Typography>
        <Divider sx={{ marginBottom: '16px' }} />
        <CancellationForm formProps={props} />
      </>
    ),
  },
];

const BookingSetting = () => {
  const [
    updatePracticeData,
    ,
    updatePracticeLoading,
    updatePractice,
    clearUpdatePractice,
  ] = useCRUD({
    id: UPDATE_PRACTICE_DATA_SETTING,
    url: API_URL.practices,
    type: REQUEST_METHOD.update,
  });

  const [practiceData, , practiceDataLoading, getPractice] = useCRUD({
    id: GET_PRACTICE_DATA_SETTING,
    url: API_URL.practices,
    type: REQUEST_METHOD.get,
  });

  const [user, , , refetchUser] = useAuthUser();

  const defaultValue = useMemo(() => {
    if (practiceData) {
      const parsedPracticeData = {
        timezone: practiceData?.timezone,
        appointmentStart: practiceData?.appointmentStart,
        minimumAppointmentInterval: practiceData?.minimumAppointmentInterval,
        leadTime: practiceData?.leadTime,
        leadTimeForSameDay: practiceData?.leadTimeForSameDay,
        advanceBookingAllowedTime: practiceData?.advanceBookingAllowedTime,
        appointmentConfirmationType: practiceData?.appointmentConfirmationType,
        appointmentReminder: practiceData?.appointmentReminder,
        appointmentSameDayReminder: practiceData?.appointmentSameDayReminder,
        cancellationLeadTime: practiceData?.cancellationLeadTime,
        cancellationRescheduleTime: practiceData?.cancellationRescheduleTime,
        cancellationPolicyText: practiceData?.cancellationPolicyText,
        cancellationChargeTime: practiceData?.cancellationChargeTime,
        cancellationCharge: practiceData?.cancellationCharge,
        shipingCharges: practiceData?.shipingCharges || 0,
      };
      formGroups[0].data = formatTimezonesForDisplay(
        getTimezonesForCountry(practiceData?.address?.countryCode || 'US')
      );
      return parsedPracticeData;
    }
    return {};
  }, [practiceData]);

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;

  const practiceId = user?.practice?.id;

  useEffect(() => {
    if (practiceId) {
      getPractice({}, `/${practiceId}`);
    }
  }, []);

  useEffect(() => {
    if (updatePracticeData) {
      showSnackbar({
        message: 'Settings has been updated successfully',
        severity: 'success',
      });
      clearUpdatePractice(true);
      refetchUser();
    }
  }, [updatePracticeData]);

  const handleBookingSetting = useCallback(
    (data) => {
      const updatedFields = getUpdatedFieldsValue(data, defaultValue);
      if (!isEmpty(updatedFields)) {
        updatePractice(
          {
            ...updatedFields,
            shipingCharges: Number(data?.shipingCharges).toFixed(2),
          },
          `/${practiceId}`
        );
      } else {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
      }
    },
    [defaultValue, practiceId, updatePractice]
  );

  return (
    <PageContent
      loading={practiceDataLoading || updatePracticeLoading}
      style={{ overflow: 'scroll' }}
    >
      <Box
        sx={{
          color: `${palette.common.black}`,
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
      >
        <PageHeader title="Booking Settings" />
        <Divider sx={{ marginBottom: '16px' }} />
        {!practiceDataLoading && (
          <CustomForm
            formGroups={formGroups}
            columnsPerRow={2}
            defaultValue={defaultValue}
            form={form}
          />
        )}
        <LoadingButton
          sx={{
            display: 'flex',
            marginTop: '10px',
            marginLeft: 'auto',
            marginRight: '10px',
          }}
          size="medium"
          type="submit"
          loading={updatePracticeLoading}
          onClick={handleSubmit(handleBookingSetting)}
          label="Save"
        />
      </Box>
    </PageContent>
  );
};

export default BookingSetting;
