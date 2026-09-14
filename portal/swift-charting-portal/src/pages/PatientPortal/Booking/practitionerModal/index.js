import React, { useEffect, useCallback } from 'react';
import { uniqBy } from 'lodash';
import styled from '@mui/material/styles/styled';

import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import Typography from 'src/components/Typography';
import { GET_PRACTITIONERS } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Loader from 'src/components/Loader';
import { verticalScale } from 'src/lib/utils';

const StyledServiceContent = styled('div')(() => ({
  marginLeft: '42px',
  marginRight: '42px',
}));

const StyledServiceList = styled('div')(() => ({
  paddingTop: '24px',
  gap: '24px',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingBottom: '20px',
}));

const StyledIcon = styled('div')(() => ({
  backgroundColor: palette.background.lightRed,
  borderRadius: `calc(50% + 3px)`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledTab = styled('div')(({ isActive }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: verticalScale(24),
  border: `0.5px solid var(--accent-blue, ${palette.background.accentBlue})`,
  borderRadius: '8px',
  boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',

  width: '310px',
  maxWidth: '310px',
  backgroundColor: isActive && palette.primary.main,
  cursor: 'pointer',
}));
const PractitionerModal = ({ serviceId, bookingData, setBookingData }) => {
  console.log(serviceId)
  const [
    getPractitionerResponse,
    ,
    getPractitionerLoading,
    getPractitioners,
    ,
  ] = useCRUD({
    id: GET_PRACTITIONERS,
    url: `${API_URL.bookingService}/${serviceId}`,
    type: REQUEST_METHOD.get,
  });

  const handleClick = useCallback(
    (id, name, initial, schedule) => {
      setBookingData((curr) => ({
        ...curr,
        provider: { id, name, initial },
        schedule,
      }));
    },
    [setBookingData]
  );

  const filterServices = useCallback(
    (data) => {
      const allPractitioners = [];
      // eslint-disable-next-line array-callback-return
      data?.locations?.forEach(
        // eslint-disable-next-line array-callback-return
        ({ location, practitioner, schedule }) => {
          if (location === bookingData?.location?.id) {
            const { firstName, lastName } = practitioner || {};
            const practitionerName = `${firstName} ${lastName}`;
            allPractitioners.push({
              ...practitioner,
              name: practitionerName,
              schedule,
            });
          }
        }
      );
      return uniqBy([...allPractitioners], 'id');
    },
    [bookingData?.location?.id]
  );

  useEffect(() => {
    getPractitioners();
  }, []);

  useEffect(() => {
    if (getPractitionerResponse) {
      setBookingData((curr) => ({
        ...curr,
        appointmentInterval:
          getPractitionerResponse?.minimumAppointmentInterval,
      }));
    }
  }, [getPractitionerResponse]);

  if (getPractitionerLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
          marginTop: '20px',
        }}
      >
        <Loader type="circular" loading />
      </div>
    );
  }

  return (
    <StyledServiceContent>
      <StyledServiceList>
        {filterServices(getPractitionerResponse)?.map?.((data, index) => {
          const {
            firstName = '',
            lastName = '',
            name,
            id,
            schedule,
            ...rest
          } = data || {};
          const isActive = bookingData?.provider?.id === id;
          const initial = `${firstName && firstName[0]}${
            lastName && lastName[0]
          }`.toLocaleUpperCase();
          if (!rest?.isActive) return;

          // eslint-disable-next-line consistent-return
          return (
            <StyledTab
              key={index}
              onClick={() =>
                !isActive && handleClick(id, name, initial, schedule)
              }
              isActive={isActive}
            >
              <StyledIcon>
                <Typography
                  style={{
                    color: palette.info.paleRed,
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    padding: '7px',
                    minWidth: '39px',
                    textAlign: 'center',
                  }}
                >
                  {initial}
                </Typography>
              </StyledIcon>

              <Typography
                style={{
                  color: isActive ? palette.common.white : palette.common.black,
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '22.4px',
                  marginLeft: '13px',
                  overflow: 'hidden',
                }}
              >
                {name}
              </Typography>
            </StyledTab>
          );
        })}
      </StyledServiceList>
    </StyledServiceContent>
  );
};

export default PractitionerModal;
