import React from 'react';
import styled from '@mui/material/styles/styled';

import palette from 'src/theme/palette';

const StyledLocationTab = styled('div')(({ theme, isLocationActive }) => ({
  backgroundColor: isLocationActive
    ? theme.palette.primary.main
    : theme.palette.common.white,
  padding: '16px',
  borderRadius: '8px',
  border: `1px solid var(--accent-blue, ${theme.palette.background.accentBlue})`,
  cursor: 'pointer',
  flexGrow: 1,
  width: '235px',
  maxWidth: '235px',
  alignSelf: 'stretch',
}));

const StyledLocationList = styled('div')(() => ({
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
  padding: '24px 0px',
  justifyContent: 'start',
}));

const StyledLocationContent = styled('div')(() => ({
  marginLeft: '42px',
  marginRight: '42px',
  overflow: 'auto',
}));

const StyledLocationTitle = styled('div')(({ isLocationActive }) => ({
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '25.2px',
  color: isLocationActive ? palette.common.white : palette.common.black,
  paddingBottom: '16px',
}));

const StyledLocationSubTitle = styled('div')(({ isLocationActive }) => ({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '19.6px',
  color: isLocationActive ? palette.common.white : palette.common.black,
  paddingBottom: '16px',
}));

const LocationModal = ({ bookingData, setBookingData }) => {
  const { practiceLocation } = bookingData || {};

  const handleClick = (value, id, address) => {
    setBookingData({
      ...bookingData,
      location: { name: value, id, address },
    });
  };

  return (
    <StyledLocationContent>
      <StyledLocationList>
        {practiceLocation?.map(({ name, address, isActive, id }, index) => {
          const { description } = address || {};
          const isLocationActive = bookingData?.location?.id === id;
          if (!isActive) return;
          // eslint-disable-next-line consistent-return
          return (
            <StyledLocationTab
              key={index}
              onClick={() =>
                !isLocationActive && handleClick(name, id, address)
              }
              isLocationActive={isLocationActive}
            >
              <StyledLocationTitle isLocationActive={isLocationActive}>
                {name}
              </StyledLocationTitle>
              <StyledLocationSubTitle isLocationActive={isLocationActive}>
                {description}
              </StyledLocationSubTitle>
            </StyledLocationTab>
          );
        })}
      </StyledLocationList>
    </StyledLocationContent>
  );
};

export default LocationModal;
