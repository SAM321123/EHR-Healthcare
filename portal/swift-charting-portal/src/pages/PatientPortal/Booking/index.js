import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useMediaQuery, CardActions } from '@mui/material';
import styled from '@mui/material/styles/styled';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import useResponsive from 'src/hooks/useResponsive';
import Modal from 'src/components/modal';
import Typography from 'src/components/Typography';
import { mobileWidth } from 'src/lib/constants';
import { verticalScale } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import LocationModal from './locationModal';
import LocationIcon from '../../../assets/images/svg/location.svg';
import DopeLogo from '../../../assets/images/svg/dopelogo.png';

const useStyles = makeStyles(() => ({
  modal: {
    marginLeft: '110px',
    marginRight: '110px',
  },
  responsive: {
    margin: '0px',
  },
  tab: {
    marginLeft: '50px',
    marginRight: '50px',
  },
}));

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme, mdUp }) => ({
  width: '100%',
  maxWidth: mdUp ? '40%' : '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
  top: 0,
  left: 0,
  minHeight: '100%',
  zIndex: 1000,
  padding: '10px',
}));

const StyledImg = styled('div')(() => ({
  paddingTop: verticalScale(45),
  paddingLeft: '24px',
}));

const StyledLeftContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const StyledBtn = styled('div')(() => ({
  display: 'flex',
  backgroundColor: palette.common.white,
  padding: '10px 20px',
  margin: '52px 0px',
  borderRadius: '8px',
  cursor: 'pointer',
}));

const StyledHeader = styled('div')(() => ({
  display: 'flex',
  margin: '42px',
  marginBottom: '24px',
}));

const StyledLink = styled('div')(() => ({
  width: '100%',
}));

const ModalHeader = () => (
  <StyledHeader>
    <img
      alt="location"
      src={LocationIcon}
      style={{
        height: 24,
        width: 24,
        marginRight: '14px',
      }}
    />
    <Typography>Choose a Location</Typography>
  </StyledHeader>
);

const Locations = ({ label, setStep, getURL, bookingData, setBookingData }) => {
  const classes = useStyles();
  const isMobile = useMediaQuery(mobileWidth);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { practice, practiceLocation } = bookingData || {};

  const isSingleLocation =
    practiceLocation?.length === 1 && practiceLocation[0].isActive;

  const mdUp = useResponsive('up', 'lg', 'md');
  const tab = useResponsive('up', 'md');

  const onProceed = useCallback(() => {
    setStep((curr) => curr + 1);
    setBookingData((curr) => ({
      ...curr,
      provider: {},
      service: {},
    }));
  }, []);

  const toggleModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  // eslint-disable-next-line react/no-unstable-nested-components
  const ModalFooter = () => (
    <CardActions
      sx={{
        display: 'flex',
        justifyContent: 'start',
        gap: '24px',
        backgroundColor: palette.common.white,
        marginLeft: '18px',
        marginTop: '16px',
      }}
    >
      <LoadingButton
        variant="secondary"
        label="Cancel"
        onClick={toggleModal}
        style={{
          boxShadow: 'unset',
          color: palette.common.black,
          backgroundColor: palette.common.white,
        }}
      />

      <LoadingButton
        label="Proceed"
        onClick={onProceed}
        disabled={!bookingData?.location?.id}
      />
    </CardActions>
  );

  useEffect(() => {
    if (bookingData?.location?.id && !isSingleLocation) {
      setShowLocationModal(true);
    }
  }, [bookingData?.location?.id, isSingleLocation]);

  useEffect(() => {
    if (isSingleLocation) {
      const { name, id } = practiceLocation[0] || {};
      setBookingData((curr) => ({
        ...curr,
        location: { name, id },
        isSingleLocation,
      }));
    }
  }, [isSingleLocation, practiceLocation]);

  return (
    <>
      {mdUp && (
        <img
          alt="booking"
          src="/assets/booking.svg"
          style={{
            height: '100vh',
            width: '100vw',
          }}
        />
      )}
      <Helmet>
        <title>{label}</title>
      </Helmet>
      <StyledRoot>
        <StyledSection mdUp={mdUp}>
          <StyledImg>
            <img
              alt="booking"
              src={getURL() || DopeLogo}
              style={{
                height: 50,
                maxWidth: 250,
                objectFit: 'contain',
              }}
            />
          </StyledImg>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingTop: verticalScale(226),
            }}
          >
            <StyledLeftContent>
              <Typography
                variant="p"
                style={{
                  fontSize: !isMobile ? '3rem' : '2.5rem',
                  fontWeight: 600,
                  lineHeight: !isMobile ? '52.8px' : 'normal',
                  color: palette.common.white,
                  paddingBottom: '5px',
                }}
              >
                Online Booking
              </Typography>
              <Typography
                variant="p"
                style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '25.2px',
                  color: palette.common.white,
                }}
              >
                {`Book an appointment with ${practice?.name}`}
              </Typography>
              <StyledBtn
                onClick={() =>
                  isSingleLocation
                    ? setStep((curr) => curr + 1)
                    : setShowLocationModal(true)
                }
              >
                <Typography>
                  {isSingleLocation
                    ? `${practiceLocation[0]?.name}`
                    : 'Select location'}
                </Typography>
                <Typography
                  style={{
                    marginLeft: 'auto',
                  }}
                >
                  {'>'}
                </Typography>
              </StyledBtn>
              <StyledLink>
                <Link
                  href="/appointments"
                  to="/login"
                  style={{
                    color: palette.common.white,
                    fontWeight: 600,
                    fontSize: '16px',
                  }}
                >
                  Manage Appointments
                </Link>
              </StyledLink>
            </StyledLeftContent>
          </div>
        </StyledSection>
        <Modal
          open={showLocationModal}
          headerComponent={ModalHeader}
          footerComponent={ModalFooter}
          onClose={toggleModal}
          isNotScrollable
          isDivider
          className={
            // eslint-disable-next-line no-nested-ternary
            mdUp ? classes.modal : tab ? classes.tab : classes.responsive
          }
        >
          <LocationModal
            bookingData={bookingData}
            setBookingData={setBookingData}
          />
        </Modal>
      </StyledRoot>
    </>
  );
};

export default Locations;
