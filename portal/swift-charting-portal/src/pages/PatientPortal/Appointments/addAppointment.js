/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { preferredScheduleCode, successMessage } from 'src/lib/constants';
import {
  convertWithTimezone,
  formatAppointmentSchedules,
  generateTimeSlots,
  getNewDate,
  getScheduleForTheDay,
  getUserTimezone,
  showSnackbar,
  sortSchedulesByStartDateTime
} from 'src/lib/utils';
import { ADD_APPOINTMENT } from 'src/store/types';

import { Chip, Grid, Skeleton } from '@mui/material';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import Carousel from 'src/components/Carousel';
import Typography from 'src/components/Typography';
import useAuthUser from 'src/hooks/useAuthUser';
import palette from 'src/theme/palette';
import { getFormFields } from './formGroup';
const AddAppointment = ({
  modalCloseAction = () => {},
  refetchData = () => {},
  defaultData = {},
  fromCalender = false,
  viewMode = false,
  addOnIntialData,
  patientId,
}) => {
  const defultSelectedDate = dayjs()
    .tz(getUserTimezone())
    .add(0, 'day')
    .startOf('day');
  const defultTimeZone = 'America/Los_Angeles';
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch, setError, clearErrors } = form;
  const [patientData] = usePatientDetail({ patientId });
  const [sheduleArray, setScheduleArray] = useState({});
  const [selectedDate, setSelectedDate] = useState(defultSelectedDate);
  const [selectedTime, setSelectedTime] = useState(null);
  const [schedule,setSchedule] = useState([]);
  const [serviceEndDate,setServiceEndDate] = useState(null);
  const [timeZone,setTimezone] = useState(defultTimeZone);
  const [isCalendarSchedule,setCalendarSchedule] = useState(false);
  const [isDefaultchedule,setDefaultchedule] = useState(false);
  const [practitioner, setPractitioner] = useState([]);
  const [user] = useAuthUser();
  const formFields = useMemo(() => getFormFields(defaultData), [defaultData]);
  const [initialData, setInitialData] = useState({
    isVirtual: true,
  });                
  
  const [response, , loading, callAppointmentSaveAPI, clearData] = useCRUD({
    id: ADD_APPOINTMENT,
    url: API_URL.appointment,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const locationData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-locationId')?.get('read')?.get('data')
        ?.results
  );

  const practionerData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-practitionerId')?.get('read')?.get('data')
        ?.results
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'locationId' && type) {
        setCalendarSchedule(false);
        setDefaultchedule(false);
        const selectedLocationSchedule = locationData?.find(
          (location) => location?.locationId === value?.locationId
        );

        if (selectedLocationSchedule?.preferredScheduleCode === preferredScheduleCode?.DEFAULT_SCHEDULE) {
          setDefaultchedule(true);
          setCalendarSchedule(false);
        }
        if (selectedLocationSchedule?.preferredScheduleCode === preferredScheduleCode?.CALENDAR_SCHEDULE) {
          setCalendarSchedule(true);
          setDefaultchedule(false);
        }
        
        if (!isEmpty(defaultData)) {
          if (selectedLocationSchedule?.locationId === defaultData?.locationId) {
            setSelectedDate(
              dayjs(defaultData.startDateTime).tz(getUserTimezone()).startOf('day')
            );
            setSelectedTime(dayjs(defaultData.startDateTime).format('HH:mm'));
          } else {
            setSelectedDate(defultSelectedDate);
            setSelectedTime(null);
          }
        }
        setScheduleArray(selectedLocationSchedule);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, locationData]);
  
  useEffect(() => {
    const subscription = watch((value, { name ,type }) => {
      if(name === 'practitionerId' && type ){
        const selectedPractionerUser = practionerData?.find(practionerUser => practionerUser?.id === value?.practitionerId);
        setTimezone(selectedPractionerUser?.timezone || getUserTimezone());
        setPractitioner(selectedPractionerUser);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, practionerData]);
  const selectedPractitionerId =
    practitioner?.id || watch('practitionerId') || defaultData?.practitionerId;
  const selectedLocationId = watch('locationId') || defaultData?.locationId;
  const [statsFilter, setStatsFilters] = useState({
    month: getNewDate().toDate().getMonth(),
    year: getNewDate().toDate().getFullYear(),
  });
  
  const formatCurrentDate = useMemo(
    () =>
      selectedDate
        ? dayjs(selectedDate).tz(getUserTimezone()).format('YYYY-MM-DD')
        : '',
    [selectedDate]
  );
  const providersAppointmentUrl = useMemo(() => {
    const params = new URLSearchParams({
      startDate: formatCurrentDate,
      endDate: formatCurrentDate,
    });

    if (selectedPractitionerId) {
      params.append('practitionerId', selectedPractitionerId);
    }
    if (selectedLocationId) {
      params.append('locationId', selectedLocationId);
    }

    return `${API_URL.providersAppointment}?${params.toString()}`;
  }, [formatCurrentDate, selectedPractitionerId, selectedLocationId]);
  const [providersAppointmentSlotsData, ,providerSlotLoading , getProvidersAppointmentSlotsData] = useCRUD({
    id: `provider-appointments`,
    url: providersAppointmentUrl,
    type: REQUEST_METHOD.get,
  });
  const oooUrl = useMemo(() => {
    const params = new URLSearchParams({
      startDate: formatCurrentDate,
      endDate: formatCurrentDate,
    });

    if (selectedPractitionerId) {
      params.append('staffId', selectedPractitionerId);
    }
    if (selectedLocationId) {
      params.append('locationId', selectedLocationId);
    }

    return `${API_URL.oofScheduleSlotCheck}?${params.toString()}`;
  }, [formatCurrentDate, selectedPractitionerId, selectedLocationId]);
  
  const [oooSchedulesData, , oooLoading, getOooSchedules] = useCRUD({
    id: `ooo-schedules`,
    url: oooUrl,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {
    if (!formatCurrentDate || !selectedPractitionerId || !selectedLocationId) {
      return;
    }

    getProvidersAppointmentSlotsData();
    getOooSchedules();
  }, [
    formatCurrentDate,
    selectedPractitionerId,
    selectedLocationId,
    getProvidersAppointmentSlotsData,
    getOooSchedules,
  ]);
  // reschedule appointment
  useEffect(() => {
    if (!isEmpty(defaultData)) {
      const selectedLocationSchedule = locationData?.find(
        (location) => location?.locationId === defaultData?.locationId
      );
      if (selectedLocationSchedule?.preferredScheduleCode === preferredScheduleCode?.DEFAULT_SCHEDULE) {
        setDefaultchedule(true);
        setCalendarSchedule(false);
      }
      if (selectedLocationSchedule?.preferredScheduleCode === preferredScheduleCode?.CALENDAR_SCHEDULE) {
        setCalendarSchedule(true);
        setDefaultchedule(false);
      }
      setScheduleArray(selectedLocationSchedule);

      const selectedPractionerUser = practionerData?.find(
        (practionerUser) => practionerUser?.id === defaultData?.practitionerId
      );
      setTimezone(selectedPractionerUser?.timezone || getUserTimezone());
      setSelectedDate(
        dayjs(defaultData?.startDateTime).tz(getUserTimezone()).startOf('day')
      );
      setSelectedTime(dayjs(defaultData?.startDateTime).format('HH:mm'));
    }
  }, [defaultData, locationData, practionerData]);
 
  const onHandleSubmit = useCallback((data) => {
    if(!selectedDate || !selectedTime ){
      showSnackbar({
        message: "Please select an appointment date and time slot.",
        severity: 'error',
      });
      return false;
    }
    const appointmentIntervalTime = sheduleArray?.appointmentInterval?.split('_');

    const combinedDateTime = dayjs(selectedDate)
      .hour(parseInt(selectedTime?.split(':')[0]))
      .minute(parseInt(selectedTime?.split(':')[1]));
    const payload = {
      title: data?.title ?? null,
      practitionerId: data?.practitionerId,
      locationId: data?.locationId,
      startDateTime: combinedDateTime,
      endDateTime: dayjs(combinedDateTime).add(appointmentIntervalTime[0], 'minute'),
      patientIds: [user.id],
      reasonForAppointment: data.reasonForAppointment,
    };
    if (
      sheduleArray?.appointmentConfirmation === 'always_confirm_automatically'
    ) {
      payload.statusCode = 'confirmed';
    }
    if (selectedTime && isEmpty(defaultData)) {
      callAppointmentSaveAPI({ data: payload });
    } else {
      const rescheduleData = {
        startDateTime: combinedDateTime,
        endDateTime: dayjs(combinedDateTime).add(appointmentIntervalTime, 'minute'),
        practitionerId: data?.practitionerId,
        locationId: data?.locationId,
        reasonForAppointment: data?.reasonForAppointment,
      };
      callAppointmentSaveAPI({ ...rescheduleData }, `/${defaultData?.id}`);
    }
  });

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [
    refetchData,
    response,
    defaultData,
    clearData,
    modalCloseAction,
    patientId,
  ]);

  let today = dayjs().tz(getUserTimezone()).startOf('day');

  const leadTimeValue = sheduleArray?.leadDays?.split('_');
  const leadTimeForSameDayValue = sheduleArray?.leadInterval?.split('_');
  const leadDays = isCalendarSchedule ? 0 : leadTimeValue?.[0] || 0;
  const leadMinutes = isCalendarSchedule
    ? 0
    : leadTimeForSameDayValue?.[0] || 0;

  const scrollIndex = useRef(0);

 

  useEffect(() => {
    if (isCalendarSchedule) {
      const calanderAppointment = formatAppointmentSchedules(
        sheduleArray?.calenderSchedule,
        timeZone
      );
      setSchedule(calanderAppointment?.schedules);
      setServiceEndDate(
        dayjs()
          .tz(getUserTimezone())
          .add(calanderAppointment?.totalDays, 'day')
          .startOf('day')
      );
    }
    if(isDefaultchedule)
      {
      setSchedule(sheduleArray?.schedule ? sheduleArray?.schedule : []);
      setServiceEndDate(
        dayjs().tz(getUserTimezone()).add(30, 'day').startOf('day')
      );
    }
  }, [isCalendarSchedule, isDefaultchedule, sheduleArray, timeZone]);

  const dateList = useMemo(() => {
    let list = [];
    const daysOff = {};
    if (isCalendarSchedule) {
      let addedDays = new Set(); // To track already added days
      list = sortSchedulesByStartDateTime(sheduleArray?.calenderSchedule).flatMap((item) => {
        const startDay = dayjs(item.startDateTime).tz(getUserTimezone());
        const endDay = dayjs(item.endDateTime).tz(getUserTimezone());

        const startDayFormatted = startDay.format('YYYY-MM-DD'); // Use full date to differentiate days
        const endDayFormatted = endDay.format('YYYY-MM-DD'); // Use full date to differentiate days

        const result = [];

        // Add start date if not already added
        if (!addedDays.has(startDayFormatted)) {
          result.push({
            day: startDay,
            disabled: daysOff[startDay.format('dddd').toLowerCase()],
          });
          addedDays.add(startDayFormatted);
        }

        // Check if the schedule crosses into the next day
        if (
          startDayFormatted !== endDayFormatted && // Different days
          !addedDays.has(endDayFormatted)
        ) {
          result.push({
            day: endDay,
            disabled: daysOff[endDay.format('dddd').toLowerCase()],
          });
          addedDays.add(endDayFormatted);
        }

        // Special case: if the same day but spans over midnight
        if (
          startDayFormatted === endDayFormatted &&
          endDay.isAfter(startDay.endOf('day')) && // Check if it crosses midnight
          !addedDays.has(endDay.add(1, 'day').format('YYYY-MM-DD'))
        ) {
          // Add the next day after midnight
          const nextDay = endDay.add(1, 'day');
          result.push({
            day: nextDay,
            disabled: daysOff[nextDay.format('dddd').toLowerCase()],
          });
          addedDays.add(nextDay.format('YYYY-MM-DD'));
        }

        return result;
      });
    } else if (isDefaultchedule) {
      const startDate = leadDays
        ? dayjs().tz(getUserTimezone()).add(leadDays, 'day').startOf('day')
        : today;

      const defaultDate = convertWithTimezone(defaultData?.appointmentDate);

      scrollIndex.current = defaultDate
        ? dayjs(defaultDate).tz(getUserTimezone()).diff(startDate, 'day')
        : 0;

      const diffInDays = serviceEndDate
        ? dayjs(serviceEndDate).tz(getUserTimezone()).diff(startDate, 'day')
        : 30;

      list = Array.from({ length: diffInDays }).map((_, index) => {
        const day = dayjs(startDate).add(index, 'day');
        const formattedDay = day.format('dddd').toLowerCase();

        if (index < 7) {
          const values = getScheduleForTheDay(schedule, timeZone, day);
          daysOff[formattedDay] = isEmpty(values);
        }

        return {
          day,
          disabled: daysOff[formattedDay],
        };
      });
    }
    else{
      list =[];
      }
    const currentDate = dayjs(); // Get current date and time
    // Filter out past dates
    const futureDates = list.filter(item => {
      return dayjs(item.day).isSame(currentDate, 'day') || dayjs(item.day).isAfter(currentDate);
    });

    const firstActiveItemIndex = futureDates?.findIndex((item) => !item?.disabled);
    // Ensure that the index is valid (non-negative)
    return firstActiveItemIndex >= 0 ? futureDates.slice(firstActiveItemIndex) : futureDates;
  }, [
    leadDays,
    today,
    defaultData,
    serviceEndDate,
    schedule,
    timeZone,
    getUserTimezone,
    convertWithTimezone,
    getScheduleForTheDay,
    isEmpty,
  ]);

  const appointmentInterval = sheduleArray?.appointmentInterval;
  const appointmentIntervalMinutes = useMemo(
    () => Number(appointmentInterval?.split('_')?.[0] || 0),
    [appointmentInterval]
  );
  const slotsDataArray = useMemo(() => {
    const scheduleArray = getScheduleForTheDay(
      schedule,
      timeZone,
      selectedDate,
      isCalendarSchedule
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
    schedule,
    timeZone,
    leadDays,
  ]);
  const getSlotRange = useCallback((time) => {
    const [slotHour = '0', slotMinute = '0'] = time.split(':');
    const slotStart = dayjs(selectedDate)
      .hour(Number(slotHour))
      .minute(Number(slotMinute))
      .second(0)
      .millisecond(0);

    return {
      slotStart,
      slotEnd: slotStart.add(appointmentIntervalMinutes, 'minute'),
    };
  }, [selectedDate, appointmentIntervalMinutes]);

  const isSlotBlocked = useCallback((time) => {
    if (!selectedDate) {
      return false;
    }

    const { slotStart, slotEnd } = getSlotRange(time);
    const slotStartValue = slotStart.valueOf();
    const slotEndValue = slotEnd.valueOf();

    const hasAppointmentConflict = providersAppointmentSlotsData?.some((slot) => {
      const slotStartTime = new Date(slot.startDateTime).getTime();
      const slotEndTime = new Date(slot.endDateTime).getTime();

      return slotStartValue < slotEndTime && slotEndValue > slotStartTime;
    });

    const hasOooConflict = oooSchedulesData?.some((oooSlot) => {
      const oooStart = new Date(oooSlot.startDateTime).getTime();
      const oooEnd = new Date(oooSlot.endDateTime).getTime();

      return slotStartValue < oooEnd && slotEndValue > oooStart;
    });

    return hasAppointmentConflict || hasOooConflict;
  }, [
    selectedDate,
    getSlotRange,
    providersAppointmentSlotsData,
    oooSchedulesData,
  ]);

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (!slotsDataArray?.includes(selectedTime) || isSlotBlocked(selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedTime, slotsDataArray, isSlotBlocked]);

  useEffect(() => {
    if (!dateList?.length) {
      return;
    }

    const isSelectedDateAvailable = selectedDate
      ? dateList.some((item) => dayjs(item.day).isSame(selectedDate, 'day'))
      : false;
    if (!isSelectedDateAvailable) {
      setSelectedDate(dateList[0]?.day);
      setSelectedTime(null);
    }
  }, [dateList, selectedDate]);

  const onSelectDay = useCallback((day) => {
    setSelectedDate(day);
    setSelectedTime(null);
  }, []);

  const onSelectTime = useCallback((time) => {
    setSelectedTime(time);
  }, []);

  return (
    <Box>
      <CardContent>
        <Box className="form-appointment">
          <Box className={viewMode && 'appointment-form-disable'}>
            <div>
              <CustomForm
                form={form}
                formGroups={formFields}
                columnsPerRow={1}
                defaultValue={isEmpty(defaultData) ? initialData : defaultData}
              />
            </div>
            {!isEmpty(sheduleArray) && (
              <div
                style={{
                  padding: '23px 13px 13px 13px',
                }}
              >
                <Box>
                  <Box>
                    <Carousel
                      data={dateList}
                      initialScrollIndex={scrollIndex?.current}
                      cardWidth={110}
                      render={({ day, disabled }, index) => {
                        let currentDate = selectedDate;
                        if(isCalendarSchedule && index == 0 && !selectedDate ){
                          currentDate = dayjs(day);
                        }
                        const isActive =
                          dayjs(currentDate).format('YYYY-MM-DD') ===
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
                              backgroundColor: isActive
                                ? palette.primary.main
                                : '',
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
                                <Typography
                                  sx={{ fontSize: '14px', mr: '4px' }}
                                >
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
                  </Box>

                  <Grid
                    container
                    sx={{
                      backgroundColor: 'white',
                      maxHeight: '174px',
                      overflow: 'auto',
                      paddingTop: '22px',
                      paddingLeft: '17px',
                    }}
                  >
                    {selectedDate && slotsDataArray?.length
                      ? slotsDataArray?.map((item, index) => {
                          const isActive = selectedTime === item;
                          const time = slotsDataArray[index];
                          const { slotStart } = getSlotRange(item);
                          const isDisabled = isSlotBlocked(item);
                          return (
                            <Grid item key={index}>
                              {providerSlotLoading || oooLoading ? (
                                <Skeleton variant="rectangular"  sx={{
                                  borderRadius: '10px', // Add rounded corners
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)', // Custom background
                                  margin: '4px',
                                }} width={80} height={40} />
                              ) : (
                              <Chip
                                clickable={false}
                                size="medium"
                                label={slotStart.format('hh:mm A')}
                                onClick={isDisabled ? undefined : () => onSelectTime(time)}
                                color={isActive ? 'primary' : 'default'}
                                sx={{
                                  marginRight: 2,
                                  marginBottom: 2,
                                  cursor: isDisabled ? 'not-allowed' : 'pointer', // Disable pointer interaction if matched
                                  fontSize: '0.8rem',
                                  width: '5.2rem',
                                  // backgroundColor: isActive
                                  //   ? palette.primary.main
                                  //   : '',
                                  backgroundColor: isDisabled
                                  ? palette.action.disabledBackground // Use theme color for disabled state
                                  : isActive
                                  ? palette.primary.main
                                  : '',
                                    color: isDisabled ? palette.action.disabled : 'inherit', // Set text color for disabled state
                                
                                }}
                              />
                            )}
                            </Grid>
                          );
                        })
                      : selectedDate && (
                          <Typography sx={{ fontWeight: '550' }}>
                            No slots available
                          </Typography>
                        )}
                  </Grid>
                </Box>
              </div>
            )}
          </Box>
            <div style={{
              padding: "16px 13px 10px 13px",
            }}>
                <span style={{
                  fontWeight: "800",
                }}>
                  Cancellation policy
                </span>
                <p style={{
                      marginTop: "2px",
                      marginLeft: "5px",
                }}>
                {practitioner?.bookingSetting?.cancellationPolicyText
                ? practitioner.bookingSetting.cancellationPolicyText
                : "N/A"}
                </p>
            </div>
        </Box>
      </CardContent>
      {!viewMode && (
        <CardActions
          sx={{
            justifyContent: 'flex-start',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          <LoadingButton
            variant="outlinedSecondary"
            onClick={modalCloseAction}
            label="Cancel"
          />
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </CardActions>
      )}
    </Box>
  );
};

export default AddAppointment;
