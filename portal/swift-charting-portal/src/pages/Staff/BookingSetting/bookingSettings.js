import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import isEmpty from 'lodash/isEmpty';

import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import PageContent from 'src/components/PageContent';

import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import palette from 'src/theme/palette';
import { GET_STAFF_BOOKING_DATA, SAVE_BOOKING_SETTING } from 'src/store/types';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { decrypt } from 'src/lib/encryption';
import { useParams } from 'react-router-dom';
import useAuthUser from 'src/hooks/useAuthUser';
import { regTextArea } from 'src/lib/constants';
import { InputAdornment } from '@mui/material';

// eslint-disable-next-line react-hooks/exhaustive-deps

const BookingSetting = () => {
  const params = useParams();
  const [user, , ,] = useAuthUser();
  const practitionerId = user.id;

  let { staffId } = params || {};
  if (staffId) {
    staffId = decrypt(staffId);
  } else {
    staffId = practitionerId;
  }
  const formGroups = useMemo(
    () => [
      {
        colSpan: 2,
        component: () => (
          <div>
            <Typography
              variant="body2"
              sx={{
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              Cancellation Settings
            </Typography>
            <Divider />
          </div>
        ),
      },
      {
        colSpan: 2,
        component: () => (
          <div style={{ fontSize: '12px', color: palette.grey[500] }}>
            Allow clients to cancel up to XX hours before the appointment
          </div>
        ),
      },
      {
        label: 'Cancellation Lead Time',
        inputType: 'number',
        name: 'cancellationLeadTime',
        colSpan: 0.25,
        maxLength: { value: 2 },
        InputProps: {
          endAdornment: <InputAdornment position="end">Hr</InputAdornment>,
        },
      },
      {
        colSpan: 2,
        component: () => (
          <div style={{ fontSize: '12px', color: palette.grey[800] }}>
            Clients will not be allowed to cancel if less than the hours
            specified in above statement are left for the appointment
          </div>
        ),
      },
      {
        colSpan: 2,
        component: () => (
          <div style={{ fontSize: '12px', color: palette.grey[500] }}>
            Allow clients to reschedule online up to XX hours before the
            appointment
          </div>
        ),
      },
      {
        label: 'Cancellation Reschedule Time',
        inputType: 'number',
        name: 'cancellationRescheduleTime',
        colSpan: 0.25,
        maxLength: { value: 2 },
        InputProps: {
          endAdornment: <InputAdornment position="end">Hr</InputAdornment>,
        },
      },
      {
        colSpan: 2,
        component: () => (
          <div style={{ fontSize: '12px', color: palette.grey[800] }}>
            Clients will not be allowed to reschedule online if less than the
            hours specified in above statement are left for the appointment
          </div>
        ),
      },
      {
        inputType: 'textArea',
        name: 'cancellationPolicyText',
        textLabel: 'Cancellation Policy Text',
        colSpan: 1.35,
        minRows: 3,
        pattern: regTextArea,
        maxLength: { value: 500 },
      },
    ],
    []
  );
  const [bookingSettingData, , bookingDataLoading, getBookingData] = useCRUD({
    id: GET_STAFF_BOOKING_DATA,
    url: API_URL.staffBookingSetting,
    type: REQUEST_METHOD.get,
  });

  const [
    saveBookingData,
    ,
    saveBookingLoading,
    saveBookingSetting,
    clearSaveBooking,
  ] = useCRUD({
    id: SAVE_BOOKING_SETTING,
    url: API_URL.staffBookingSetting,
    type: isEmpty(bookingSettingData)
      ? REQUEST_METHOD.post
      : REQUEST_METHOD.update,
  });

  const defaultValue = useMemo(() => {
    if (bookingSettingData) {
      const parsedBookingData = {
        cancellationLeadTime: bookingSettingData?.cancellationLeadTime,
        cancellationRescheduleTime:
          bookingSettingData?.cancellationRescheduleTime,
        cancellationPolicyText: bookingSettingData?.cancellationPolicyText,
      };

      return parsedBookingData;
    }
    return {};
  }, [bookingSettingData]);

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;

  useEffect(() => {
    if (staffId) {
      getBookingData({}, `/${staffId}`);
    }
  }, [getBookingData, staffId]);

  useEffect(() => {
    if (saveBookingData) {
      showSnackbar({
        message: 'Settings has been updated successfully',
        severity: 'success',
      });
      clearSaveBooking(true);
      if (staffId) {
        getBookingData({}, `/${staffId}`);
      }
    }
  }, [saveBookingData]);

  const handleBookingSetting = useCallback(
    (data) => {
      let payload = {};
      payload = data;
      if (!isEmpty(defaultValue)) {
        const updatedFields = getUpdatedFieldsValue(payload, defaultValue);
        if (!isEmpty(updatedFields)) {
          saveBookingSetting(
            { ...updatedFields },
            `/${bookingSettingData?.id}`
          );
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      } else {
        saveBookingSetting({
          data: { ...payload, staffId: staffId },
        });
      }
    },
    [defaultValue, bookingSettingData?.id, staffId, saveBookingSetting]
  );

  return (
    <PageContent
      loading={bookingDataLoading || saveBookingLoading}
      style={{ overflow: 'scroll' }}
    >
      <Box
        sx={{
          color: `${palette.common.black}`,
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
      >
        <Divider sx={{ marginBottom: '16px' }} />
        {!bookingDataLoading && (
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
          loading={saveBookingLoading}
          onClick={handleSubmit(handleBookingSetting)}
          label="Save"
        />
      </Box>
    </PageContent>
  );
};

export default BookingSetting;
