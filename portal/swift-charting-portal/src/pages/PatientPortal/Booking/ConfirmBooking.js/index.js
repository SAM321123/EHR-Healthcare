import React, { useCallback, useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import dayjs from 'dayjs';

import Box from 'src/components/Box';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import Modal from 'src/components/modal';
import palette from 'src/theme/palette';
import useResponsive from 'src/hooks/useResponsive';
import useCRUD from 'src/hooks/useCRUD';
import { CREATE_APPOINTMENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Person from '../../../../assets/images/svg/person.svg';
import LocationIcon from '../../../../assets/images/svg/location.svg';
import ClockIcon from '../../../../assets/images/svg/clock.svg';

const useStyles = makeStyles(() => ({
  modal: {
    zIndex: '9999',
    marginLeft: '200px',
    marginRight: '200px',
  },
  responsive: {
    margin: '0px',
    zIndex: '9999',
  },
  tab: {
    marginLeft: '50px',
    marginRight: '50px',
    zIndex: '9999',
  },
}));

const modalHeader = () => (
  <Typography sx={{ pl: '24px', fontSize: '20px', fontWeight: '500' }}>
    Confirm your booking
  </Typography>
);

const ConfirmBooking = ({
  openFirst,
  setOpenFirst,
  setOpenSecond,
  bookingData,
}) => {
  const classes = useStyles();
  const mdUp = useResponsive('up', 'lg', 'md');
  const tab = useResponsive('up', 'md');
  const { provider, service, payload } = bookingData || {};

  const [
    saveBookingResponse,
    saveBookingError,
    savBookingResponseLoading,
    saveBooking,
    clearSaveBooking,
  ] = useCRUD({
    id: CREATE_APPOINTMENT,
    url: `${API_URL.booking}`,
    type: REQUEST_METHOD.post,
  });

  const onConfirm = useCallback(() => {
    saveBooking({ data: bookingData?.payload });
  }, [bookingData]);

  const toggleModal = useCallback(() => {
    setOpenFirst(!openFirst);
  }, [openFirst, setOpenFirst]);

  useEffect(() => {
    if (saveBookingResponse && !saveBookingError) {
      setOpenSecond((curr) => !curr);
      clearSaveBooking();
    }
  }, [saveBookingResponse, saveBookingError, setOpenSecond, clearSaveBooking]);

  const modalFooter = () => (
    <Box>
      <CustomButton
        variant="secondary"
        sx={{
          mr: '24px',
        }}
        label="Cancel"
        onClick={toggleModal}
      />
      <LoadingButton
        label="Confirm"
        loading={savBookingResponseLoading}
        onClick={onConfirm}
      />
    </Box>
  );

  return (
    <Modal
      open={openFirst}
      headerComponent={modalHeader}
      footerComponent={modalFooter}
      onClose={toggleModal}
      isNotScrollable
      className={
        // eslint-disable-next-line no-nested-ternary
        mdUp ? classes.modal : tab ? classes.tab : classes.responsive
      }
    >
      <Box sx={{ p: '24px 24px 5px 24px' }}>
        <Box
          sx={{
            border: `1px solid ${palette.background.accentBlue}`,
            p: '24px',
            mb: '24px',
          }}
        >
          <Typography sx={{ mb: '24px', fontSize: '16px', fontWeight: '700' }}>
            {service?.name}
          </Typography>
          <Box sx={{ display: 'flex', mb: '24px' }}>
            <img
              src={Person}
              alt="login"
              style={{ width: '24px', height: '24px' }}
            />
            <Typography sx={{ ml: 2 }}>{`Dr. ${provider?.name}`}</Typography>
          </Box>
          <Box sx={{ display: 'flex', mb: '24px', alignItems: 'flex-start' }}>
            <img
              src={LocationIcon}
              alt="login"
              style={{ width: '24px', height: '24px' }}
            />
            <Typography sx={{ ml: 2 }}>
              {bookingData?.location?.address?.description ||
                bookingData?.practiceLocation?.[0]?.address?.description}
            </Typography>
          </Box>
          {!service?.hideSessionDuration && (
            <Box sx={{ display: 'flex', pb: '24px' }}>
              <img src={ClockIcon} alt="login" style={{ cursor: 'pointer' }} />
              <Typography
                sx={{ ml: 2 }}
              >{`Duration: ${service?.sessionDuration} mins`}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                border: `1px solid ${palette.primary.main}`,
                mr: '16px',
                p: '8px 18px',
                borderRadius: '48px',
                background: palette.background.accentBlue,
              }}
            >
              <Typography
                sx={{
                  color: palette.primary.main,
                  fontSize: tab ? '14px' : '10px',
                  textAlign: 'center',
                }}
              >
                {dayjs(payload?.appointmentStart).format('dddd, D MMMM')}
              </Typography>
            </Box>
            <Box
              sx={{
                border: `1px solid ${palette.primary.main}`,
                p: '8px 18px',
                borderRadius: '48px',
                background: palette.background.accentBlue,
              }}
            >
              <Typography
                sx={{
                  color: palette.primary.main,
                  fontSize: tab ? '14px' : '10px',
                  textAlign: 'center',
                }}
              >
                {dayjs(payload?.appointmentTime, 'HH:mm').format('h:mm A')}
              </Typography>
            </Box>
          </Box>
          {bookingData?.service?.cancellationPolicyText ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                Cancellation Policy :
              </Typography>
              <Typography sx={{ fontSize: '14px', ml: 1 }}>
                {bookingData?.service?.cancellationPolicyText}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmBooking;
