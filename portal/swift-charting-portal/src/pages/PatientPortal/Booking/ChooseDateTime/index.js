import React, { useCallback, useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';

import Box from 'src/components/Box';
import Container from 'src/components/Container';
import Carousel from 'src/components/Carousel';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { userTimeZone } from 'src/lib/constants';
import {
  generateTimeSlots,
  getScheduleForTheDay,
  verticalScale,
} from 'src/lib/utils';
import CommonBackground from '../CommonBackground';
import BackIcon from '../../../../assets/images/svg/back.svg';
import LocationIcon from '../../../../assets/images/svg/location.svg';
import ClockIcon from '../../../../assets/images/svg/clock.svg';
import Person from '../../../../assets/images/svg/person.svg';

const useStyles = makeStyles(() => ({
  item: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      borderRadius: '50%',
      background: palette.primary.main,
      height: '17px',
      width: '17px',
      left: '-38px',
      top: '3px',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      background: `repeating-linear-gradient(
        transparent,
        transparent 3px,
        ${palette.primary.main} 3px,
        ${palette.primary.main} 6px
      )`,
      width: '1px',
      height: '100%',
      left: '-30px',
      top: '0px',
    },
    '&:last-child:before': {
      height: '0px',
    },
  },
}));

const ChooseDateTime = ({ getURL, setStep, bookingData, setBookingData }) => {
  const [selectedDate, setSelectedDate] = useState(
    bookingData?.payload?.appointmentStart
      ? dayjs(bookingData.payload.appointmentStart)
      : null
  );
  const [selectedTime, setSelectedTime] = useState(
    bookingData?.payload?.appointmentTime ?? null
  );
  const classes = useStyles();

  const {
    location,
    provider,
    service,
    schedule,
    appointmentInterval,
    timeZone,
  } = bookingData || {};
  const { serviceEndDate, leadTime, leadTimeForSameDay } = service || {};
  const today = dayjs().startOf('day');
  const leadTimeValue = leadTime?.split('_');
  const leadTimeForSameDayValue = leadTimeForSameDay?.split('_');
  const leadDays = leadTimeValue?.[1];
  const leadMinutes = leadTimeForSameDayValue?.[1];

  const slotsDataArray = useMemo(() => {
    const scheduleArray = getScheduleForTheDay(
      schedule?.schedule,
      timeZone,
      selectedDate
    );

    return generateTimeSlots(
      scheduleArray,
      appointmentInterval,
      leadMinutes,
      leadDays,
      selectedDate
    );
  }, [
    selectedDate,
    appointmentInterval,
    leadMinutes,
    schedule?.schedule,
    timeZone,
    leadDays,
  ]);

  const onSelectDay = useCallback((day) => {
    setSelectedDate(day);
    setSelectedTime(null);
  }, []);

  const onBack = useCallback(() => setStep((curr) => curr - 1), []);

  const onProceed = useCallback(() => {
    setBookingData((current) => ({
      ...current,
      payload: {
        practice: current?.practiceId,
        practitioner: provider?.id,
        location: location?.id,
        service: service?.id,
        appointmentTime: selectedTime,
        appointmentStart: dayjs(selectedDate).format('YYYY-MM-DD'),
        timezone: userTimeZone,
      },
    }));
    setStep((curr) => curr + 1);
  }, [
    setBookingData,
    setStep,
    provider,
    location,
    service,
    selectedTime,
    selectedDate,
  ]);

  const dateList = useMemo(() => {
    const startDate = leadDays
      ? dayjs().add(leadDays, 'day').startOf('day')
      : today;

    const diffInDays = serviceEndDate
      ? dayjs(serviceEndDate).diff(startDate, 'day')
      : 30;
    const daysOff = {};

    const list = Array.from({ length: diffInDays }).map((_, index) => {
      const day = dayjs(startDate).add(index, 'day');
      const formattedDay = day.format('dddd').toLowerCase();

      if (index < 7) {
        const values = getScheduleForTheDay(schedule?.schedule, timeZone, day);

        daysOff[formattedDay] = isEmpty(values);
      }

      return {
        day,
        disabled: daysOff[formattedDay],
      };
    });

    const firstActiveItemIndex = list.findIndex((item) => !item.disabled);
    return list.slice(firstActiveItemIndex);
  }, [leadDays, serviceEndDate, today, schedule, timeZone]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(dateList.find((item) => !item.disabled)?.day);
    }
  }, [dateList, selectedDate]);

  return (
    <CommonBackground getURL={getURL}>
      <Container
        style={{
          backgroundColor: palette.background.paper,
          padding: verticalScale(50),
        }}
      >
        <Box sx={{ display: 'flex', mb: '24px', alignItems: 'center' }}>
          <IconButton
            sx={{
              boxShadow: 'none',
              padding: 0,
              minWidth: 'unset',
              backgroundColor: 'transparent',
              borderRadius: '50%',
              width: '26px',
              height: '25px',
            }}
            onClick={onBack}
          >
            <img
              src={BackIcon}
              alt=""
              style={{ cursor: 'pointer', padding: '6px' }}
            />
          </IconButton>
          <Typography sx={{ ml: 1, fontSize: '14px' }}>Go Back</Typography>
        </Box>
        <Divider />

        <Box sx={{ display: 'flex' }}>
          <Box sx={{ p: '24px 24px 24px 37px', width: '100%' }}>
            <Box className={classes.item}>
              <Typography
                sx={{ mb: '24px', fontSize: '16px', fontWeight: '700' }}
              >
                {service?.name}
              </Typography>
              <Box sx={{ display: 'flex', mb: '24px' }}>
                <img src={Person} alt="" style={{ height: '24px' }} />
                <Typography
                  sx={{ ml: 2 }}
                >{`Dr. ${provider?.name}`}</Typography>
              </Box>
              <Box
                sx={{ display: 'flex', mb: '24px', alignItems: 'flex-start' }}
              >
                <img src={LocationIcon} alt="" style={{ height: '24px' }} />
                <Typography sx={{ ml: 2 }}>
                  {bookingData?.location?.address?.description ||
                    bookingData?.practiceLocation?.[0]?.address?.description}
                </Typography>
              </Box>
              {!service?.hideSessionDuration && (
                <Box sx={{ display: 'flex', pb: '48px' }}>
                  <img src={ClockIcon} alt="" style={{ cursor: 'pointer' }} />
                  <Typography
                    sx={{ ml: 2 }}
                  >{`Duration: ${service?.sessionDuration} mins`}</Typography>
                </Box>
              )}
            </Box>
            <Box className={classes.item}>
              <Typography
                sx={{ mb: '24px', fontSize: '16px', fontWeight: '700' }}
              >
                Choose Time & Date
              </Typography>
              <Box sx={{ width: '96%', pb: '24px' }}>
                <Carousel
                  data={dateList}
                  initialScrollIndex={0}
                  cardWidth={110}
                  render={({ day, disabled }, index) => {
                    const isActive =
                      dayjs(selectedDate).format('YYYY-MM-DD') ===
                      day.format('YYYY-MM-DD');
                    return (
                      <Box
                        key={index}
                        onClick={() => {
                          if (!disabled) {
                            onSelectDay(day);
                          }
                        }}
                        sx={{
                          py: '5px',
                          mr: '18px',
                          display: 'flex',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: `1px solid ${palette.grey[300]}`,
                          color: isActive
                            ? palette.common.white
                            : palette.grey[800],
                          backgroundColor: isActive ? palette.primary.main : '',
                          opacity: disabled ? 0.5 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            width: '90px',
                          }}
                        >
                          <Typography sx={{ fontSize: '14px' }}>
                            {day.format('ddd')}
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            <Typography sx={{ fontSize: '14px', mr: '4px' }}>
                              {day.format('DD')}
                            </Typography>
                            <Typography sx={{ fontSize: '14px' }}>
                              {day.format('MMM')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  }}
                />
                <Divider sx={{ mt: '24px' }} />
              </Box>
            </Box>
            <div className={classes.item}>
              <Grid
                container
                style={{}}
                sx={{
                  backgroundColor: 'white',
                  width: '100%',
                  maxHeight: '170px',
                  overflow: 'auto',
                }}
              >
                {selectedDate && slotsDataArray?.length
                  ? slotsDataArray?.map((item, index) => {
                      const isActive = selectedTime === item;
                      const time = slotsDataArray[index];

                      return (
                        <Grid item key={index}>
                          <Chip
                            clickable={false}
                            size="medium"
                            label={dayjs(
                              `${dayjs(selectedDate).format(
                                'YYYY-MM-DD'
                              )} ${item}`
                            ).format('hh:mm A')}
                            onClick={() => setSelectedTime(time)}
                            color={isActive ? 'primary' : 'default'}
                            sx={{
                              marginRight: 2,
                              marginBottom: 2,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              width: '5.2rem',
                              backgroundColor: isActive
                                ? palette.primary.main
                                : '',
                            }}
                          />
                        </Grid>
                      );
                    })
                  : selectedDate && (
                      <Typography sx={{ fontWeight: '550', fontSize: '17 px' }}>
                        No slots available
                      </Typography>
                    )}
              </Grid>
            </div>
          </Box>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <CustomButton
            variant="secondary"
            sx={{
              mr: '24px',
            }}
            label="Cancel"
            onClick={onBack}
          />

          <LoadingButton
            label="Proceed"
            onClick={onProceed}
            disabled={!selectedTime}
          />
        </Box>
      </Container>
    </CommonBackground>
  );
};

export default ChooseDateTime;
