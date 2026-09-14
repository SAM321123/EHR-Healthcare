import React, { useCallback } from 'react';
import makeStyles from '@mui/styles/makeStyles';

import Box from 'src/components/Box';
import CustomButton from 'src/components/CustomButton';
import Typography from 'src/components/Typography';
import Modal from 'src/components/modal';
import useResponsive from 'src/hooks/useResponsive';
import Accept from '../../../../assets/images/icons/accept.svg';

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

const AcceptBooking = ({
  openSecond,
  setOpenSecond,
  setStep,
  setBookingData,
  reset,
}) => {
  const classes = useStyles();
  const mdUp = useResponsive('up', 'lg', 'md');
  const tab = useResponsive('up', 'md');

  const onBookingComplete = useCallback(() => {
    setOpenSecond((curr) => !curr);
    reset();
    setBookingData({});
    setStep(0);
  }, [setBookingData, setOpenSecond, setStep, reset]);

  const modalFooter = () => (
    <Box
      sx={{ display: 'flex', mt: '24px', mb: '10px', justifyContent: 'center' }}
    >
      <CustomButton
        variant="secondary"
        sx={{
          mr: '24px',
        }}
        label="Cancel"
        onClick={onBookingComplete}
      />
      <CustomButton
        variant="outlined"
        label="Book another"
        onClick={onBookingComplete}
      />
    </Box>
  );

  return (
    <Modal
      open={openSecond}
      footerComponent={modalFooter}
      isNotScrollable
      className={
        // eslint-disable-next-line no-nested-ternary
        mdUp ? classes.modal : tab ? classes.tab : classes.responsive
      }
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <img
          src={Accept}
          alt="accept"
          style={{ cursor: 'pointer', height: '110px' }}
        />
        <Typography
          sx={{
            mt: '40px',
            mb: '30px',
            fontSize: '27px',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          Your appointment is awaiting confirmation
        </Typography>
        <Typography sx={{ fontSize: '16px', textAlign: 'center', mb: '15px' }}>
          You will receive an email when your appointment is confirmed.
        </Typography>
      </Box>
    </Modal>
  );
};

export default AcceptBooking;
