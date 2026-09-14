/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useState, useEffect, useRef } from 'react';
import useCRUD from 'src/hooks/useCRUD';
import styled from '@mui/material/styles/styled';
import Link from '@mui/material/Link';
import { CardActions, useMediaQuery } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import Modal from 'src/components/modal';
import Loader from 'src/components/Loader';
import { mobileWidth } from 'src/lib/constants';
import useResponsive from 'src/hooks/useResponsive';
import { verticalScale } from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { GET_SERVICES } from 'src/store/types';
import PractitionerModal from '../practitionerModal';
import CommonBackground from '../CommonBackground';

const useStyles = makeStyles(() => ({
  modal: {
    marginLeft: '174px',
    marginRight: '174px',
    zIndex: '9999',
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

const modalStyle = {
  overflowX: 'hidden',
  width: '100%',
};

const StyledServiceContent = styled('div')(() => ({
  display: 'flex',
  padding: verticalScale(50),
  flexDirection: 'column',
}));

const StyledHeader = styled('div')(({ isMobile }) => ({
  display: 'flex',
  alignItems: !isMobile && 'center',
  borderBottom: `0.5px solid ${palette.divider}`,
  width: '100%',
  paddingBottom: verticalScale(24),
  flexDirection: isMobile && 'column',
  gap: '20px',
  flexWrap: 'wrap',
}));

const SelectedLocation = styled('div')(({ isMobile }) => ({
  width: !isMobile ? '367px' : '100%',
  maxWidth: '367px',
  borderRadius: '8px',
  border: `0.5px solid ${palette.text.secondary}`,
  padding: '10px 20px',
}));

const StyledSubHeader = styled('div')(({ isMobile }) => ({
  display: 'flex',
  alignItems: !isMobile && 'center',
  paddingTop: '24px',
  justifyContent: 'space-between',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile && '20px',
}));

const StyledLink = styled('div')(() => ({
  paddingLeft: '0px',
}));

const StyledSubLeftContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const StyledServiceTab = styled('div')(({ theme, isActive }) => ({
  backgroundColor: isActive
    ? theme.palette.primary.main
    : theme.palette.common.white,
  padding: '24px',
  borderRadius: '8px',
  border: `1px solid var(--accent-blue, ${theme.palette.background.accentBlue})`,
  cursor: 'pointer',
  width: '336px',
  maxWidth: '336px',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledBorder = styled('div')(({ isActive }) => ({
  borderBottom: `0.1px solid ${
    !isActive ? palette.divider : palette.background.offWhite
  }`,
}));

const StyledServiceList = styled('div')(({ activeService }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '24px',
  padding: '20px 0px',
  borderBottom: activeService?.id && `0.5px solid ${palette.divider}`,
}));

const SelectPractitioner = styled('div')(() => ({
  borderRadius: '8px',
  border: `0.5px solid ${palette.text.secondary}`,
  padding: '10px 20px',
  width: '367px',
  maxWidth: '367px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}));

const StyledModalHeader = styled('div')(() => ({
  display: 'flex',
  marginLeft: '42px',
  marginTop: '42px',
  marginBottom: '24px',
}));

const StyledIcon = styled('div')(() => ({
  backgroundColor: palette.background.lightRed,
  borderRadius: '50%',
  minHeight: '29px',
  minWidth: '29px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledPractitionerTab = styled('div')(({ isMobile }) => ({
  display: 'flex',
  alignItems: !isMobile && 'center',
  marginTop: '24px',
  cursor: 'pointer',
  flexDirection: isMobile && 'column',
  gap: '10px',
}));

const ModalHeader = () => (
  <StyledModalHeader>
    <img
      alt="location"
      src="/assets/icons/person.svg"
      style={{
        height: 24,
        width: 24,
        marginRight: '14px',
      }}
    />
    <Typography>Choose a Practitioner</Typography>
  </StyledModalHeader>
);

const Services = ({ setStep, getURL, bookingData, setBookingData }) => {
  const { services } = bookingData || {};
  const classes = useStyles();
  const isMobile = useMediaQuery(mobileWidth);
  const initialRender = useRef(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedService, setSelectedService] = useState(bookingData?.service);

  const [getServicesResponse, , getServicesLoading, getServices, ,] = useCRUD({
    id: GET_SERVICES,
    url: `${API_URL.bookingService}?practice=${bookingData?.practiceId}&location=${bookingData?.location?.id}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (!services) {
      getServices();
    } else {
      setSelectedService(services?.[0]);
    }
  }, [services]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else if (selectedService?.id) {
      setBookingData((curr) => ({
        ...curr,
        provider: {},
      }));
    }
  }, [selectedService?.id]);

  const mdUp = useResponsive('up', 'lg', 'md');
  const tab = useResponsive('up', 'md');
  const handleClick = (
    id,
    name,
    sessionDuration,
    hidePrice,
    hideSessionDuration,
    restData
  ) => {
    setSelectedService({
      id,
      name,
      sessionDuration,
      hidePrice,
      hideSessionDuration,
      ...restData,
    });
  };

  const toggleModal = useCallback(() => {
    setShowProviderModal(false);
  }, []);

  const modalFooter = () => (
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
        onClick={() => {
          setShowProviderModal(false);
        }}
        style={{
          boxShadow: 'unset',
          color: palette.common.black,
          backgroundColor: palette.common.white,
        }}
      />

      <LoadingButton
        label="Proceed"
        onClick={toggleModal}
        disabled={!bookingData?.provider?.id}
      />
    </CardActions>
  );

  const onCancel = useCallback(() => {
    setStep((curr) => curr - 1);
    setBookingData((current) => ({
      ...current,
      service: [],
      provider: {},
    }));
  }, [setBookingData, setStep]);

  const onProceed = useCallback(() => {
    setBookingData((current) => ({
      ...current,
      service: selectedService,
    }));
    setStep((curr) => curr + 1);
  }, [selectedService]);

  return (
    <CommonBackground getURL={getURL}>
      <StyledServiceContent>
        <StyledHeader isMobile={isMobile}>
          <SelectedLocation isMobile={isMobile}>
            <Typography
              variant="p"
              style={{
                color: palette.success.contrastText,
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
              }}
            >
              {bookingData?.location?.name || 'Choose location'}
            </Typography>
          </SelectedLocation>
          {!bookingData?.isSingleLocation && (
            <StyledLink>
              <Link
                onClick={() => setStep((curr) => curr - 1)}
                color={palette.primary.main}
                variant="subtitle2"
                style={{
                  textDecoration: 'none',
                  color: palette.primary.main,
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19.6px',
                  cursor: 'pointer',
                }}
              >
                Change location
              </Link>
            </StyledLink>
          )}
        </StyledHeader>
        <StyledSubHeader isMobile={isMobile}>
          <StyledSubLeftContent>
            {!services &&
            !getServicesResponse?.length &&
            !getServicesLoading ? (
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontStyle: 'normal',
                  fontWeight: '600',
                }}
              >
                Sorry, no service available
              </Typography>
            ) : (
              <>
                <img
                  alt="location"
                  src="/assets/icons/option.svg"
                  style={{
                    height: 24,
                    width: 24,
                  }}
                />
                <Typography
                  variant="p"
                  style={{
                    color: palette.success.contrastText,
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '25.2px',
                    marginLeft: '14px',
                    marginRight: '10px',
                  }}
                >
                  {!services ? 'Choose a service' : 'Service'}
                </Typography>
              </>
            )}
          </StyledSubLeftContent>
          <Link
            href="/appointments"
            color={palette.primary.main}
            variant="subtitle2"
            style={{
              textDecoration: 'none',
            }}
          >
            Manage Appointments
          </Link>
        </StyledSubHeader>
        {getServicesLoading && !services ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              marginTop: '20px',
            }}
          >
            <Loader type="circular" loading />
          </div>
        ) : (
          <StyledServiceList activeService={selectedService}>
            {(!services ? getServicesResponse : services)?.map?.(
              ({
                name,
                sessionDuration,
                price,
                id,
                hidePrice,
                hideSessionDuration,
                ...restData
              }) => {
                const isActive = services ? true : selectedService?.id === id;
                if (!restData?.isActive) return;
                // eslint-disable-next-line consistent-return
                return (
                  <StyledServiceTab
                    key={id}
                    onClick={() =>
                      !isActive &&
                      handleClick(
                        id,
                        name,
                        sessionDuration,
                        hidePrice,
                        hideSessionDuration,
                        restData
                      )
                    }
                    isActive={isActive}
                  >
                    <Typography
                      variant="p"
                      style={{
                        color: !isActive
                          ? palette.success.contrastText
                          : palette.common.white,
                        fontSize: '18px',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        textAlign: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="p"
                      style={{
                        color: !isActive
                          ? palette.info.dimGray
                          : palette.common.white,
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        textAlign: 'center',
                        padding: '18px 0px',
                      }}
                    >
                      {!hideSessionDuration &&
                        `Duration: ${sessionDuration} mins`}
                    </Typography>
                    <StyledBorder isActive={isActive} />
                    <Typography
                      variant="p"
                      style={{
                        color: !isActive
                          ? palette.primary.main
                          : palette.common.white,
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        textAlign: 'center',
                        paddingTop: '18px',
                      }}
                    >
                      {!hidePrice && `Price $${price}`}
                    </Typography>
                  </StyledServiceTab>
                );
              }
            )}
          </StyledServiceList>
        )}

        {selectedService?.id && (
          <StyledPractitionerTab isMobile={isMobile}>
            <div
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={
                !bookingData?.provider?.id
                  ? () => setShowProviderModal(true)
                  : null
              }
            >
              <SelectPractitioner>
                {bookingData?.provider?.id && (
                  <StyledIcon>
                    <Typography
                      style={{
                        color: palette.info.paleRed,
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                      }}
                    >
                      {bookingData?.provider?.initial}
                    </Typography>
                  </StyledIcon>
                )}
                <Typography
                  variant="p"
                  style={{
                    color: palette.success.contrastText,
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: 'normal',
                  }}
                >
                  {bookingData?.provider?.id
                    ? bookingData?.provider?.name
                    : 'Select Practitioner'}
                </Typography>
              </SelectPractitioner>
            </div>
            {bookingData?.provider?.id && (
              <StyledLink>
                <Link
                  onClick={() => {
                    setShowProviderModal(true);
                  }}
                  color={palette.primary.main}
                  variant="subtitle2"
                  style={{
                    textDecoration: 'none',
                    color: palette.primary.main,
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '19.6px',
                  }}
                >
                  Change Practitioner
                </Link>
              </StyledLink>
            )}
          </StyledPractitionerTab>
        )}
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'start',
            gap: '24px',
            paddingTop: '24px',
          }}
        >
          <LoadingButton
            variant="secondary"
            label="Cancel"
            onClick={onCancel}
            style={{
              boxShadow: 'unset',
              color: palette.common.black,
              backgroundColor: palette.common.white,
            }}
          />

          <LoadingButton
            variant="contained"
            label="Proceed"
            onClick={onProceed}
            disabled={!bookingData?.provider?.id}
          />
        </CardActions>
      </StyledServiceContent>
      <Modal
        open={showProviderModal}
        onClose={toggleModal}
        headerComponent={ModalHeader}
        footerComponent={modalFooter}
        isNotScrollable
        className={
          // eslint-disable-next-line no-nested-ternary
          mdUp ? classes.modal : tab ? classes.tab : classes.responsive
        }
        modalStyle={modalStyle}
        isDivider
      >
        <PractitionerModal
          setShowProviderModal={setShowProviderModal}
          serviceId={selectedService?.id}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      </Modal>
    </CommonBackground>
  );
};

export default Services;
