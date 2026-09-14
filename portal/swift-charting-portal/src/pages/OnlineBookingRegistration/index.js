import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Skeleton,
} from '@mui/material';
import { decrypt } from 'src/lib/encryption';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import dayjs from 'dayjs';
import Carousel from 'src/components/Carousel';
import palette from 'src/theme/palette';
import {
  formatAppointmentSchedules,
  generateTimeSlots,
  getScheduleForTheDay,
  getUserTimezone,
  sortSchedulesByStartDateTime,
  showSnackbar,
  getImageUrl,
} from 'src/lib/utils';
import { preferredScheduleCode } from 'src/lib/constants';
import useQuery from 'src/hooks/useQuery';
import GuestPatientForm from './GuestPatientForm';

const BookingHeader = ({ clinicData, params, currentStep, onBack }) => {
  const locationName = params?.locationName || clinicData?.name || '';

  const backLabel =
    currentStep === 2
      ? 'Reschedule Booking'
      : currentStep === 3
      ? 'Back to Appointment'
      : null;

  return (
    <Box sx={{ bgcolor: '#2e7d32', color: 'white', py: 2.5, px: 3 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant={currentStep === 1 ? 'h5' : 'h6'}
              fontWeight={700}
              sx={{
                mb: 0.3,
                fontSize: currentStep === 1 ? '1.25rem' : '1.1rem',
              }}
            >
              {clinicData?.name || locationName}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {clinicData?.address
                ? typeof clinicData.address === 'string'
                  ? clinicData.address
                  : `${clinicData.address.addressLine1 || ''} ${
                      clinicData.address.country || ''
                    }, ${clinicData.address.state || ''} ${
                      clinicData.address.postalCode || ''
                    }`.trim()
                : ''}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.95, display: 'block', fontSize: '0.75rem' }}
            >
              {clinicData?.phoneNo || ''}
            </Typography>
            {locationName && (
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, mb: 0.25, fontWeight: 500 }}
              >
                Selected Location: {locationName}
              </Typography>
            )}
          </Box>

          {backLabel && (
            <Button
              variant="text"
              onClick={onBack}
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {backLabel}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

const OnlineBookingRegistrationForm = ({
  params,
  staffData,
  staffLoading,
  clinicData,
  widgetConfig = {},
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [serviceEndDate, setServiceEndDate] = useState(null);
  const [isCalendarSchedule, setCalendarSchedule] = useState(false);
  const [isDefaultSchedule, setDefaultSchedule] = useState(false);
  const [scheduleArray, setScheduleArray] = useState({});
  const [timeZone, setTimezone] = useState('America/Los_Angeles');
  const [practitionerSearch, setPractitionerSearch] = useState('');

  const showPractitionerSelector = params?.showPractitioner === 'yes';
  const [selectedStaffId, setSelectedStaffId] = useState(
    params?.staffId || null
  );

  const autoConfirmSetting = params?.autoConfirm ?? 0;
  const howFarInFutureMonths = useMemo(() => {
    const raw = params?.howFarInFuture || '12_months';
    const parsed = Number.parseInt(raw.split('_')[0], 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
  }, [params?.howFarInFuture]);

  const [procedureCodesList, procedureCodesLoading] = useQuery({
    listId: 'ONLINE_BOOKING_PROCEDURE_CODES',
    url: API_URL.onlineBookingProcedureCodes,
    type: REQUEST_METHOD.get,
    queryParams: { limit: 100 },
  });

  const [allStaffData, , allStaffLoading, getAllStaff] = useCRUD({
    id: 'ONLINE_BOOKING_ALL_STAFF',
    url: API_URL.onlineBookingAllStaff,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (showPractitionerSelector && !allStaffData && !allStaffLoading) {
      getAllStaff({ limit: 100 });
    }
  }, [showPractitionerSelector, allStaffData, allStaffLoading, getAllStaff]);

  const [selectedStaffData, , selectedStaffLoading, getSelectedStaffData] =
    useCRUD({
      id: 'ONLINE_BOOKING_SELECTED_STAFF',
      url: selectedStaffId
        ? `${API_URL.onlineBookingStaff}/${selectedStaffId}`
        : null,
      type: REQUEST_METHOD.get,
    });

  useEffect(() => {
    if (
      showPractitionerSelector &&
      selectedStaffId &&
      selectedStaffId !== params?.staffId
    ) {
      getSelectedStaffData();
    }
  }, [selectedStaffId]);

  const activeStaffData =
    showPractitionerSelector &&
    selectedStaffId !== params?.staffId &&
    selectedStaffData
      ? selectedStaffData
      : staffData;

  const practitionerId = selectedStaffId || params?.staffId;
  const locationId = params?.locationId || activeStaffData?.primaryLocationId;

  const formatCurrentDate = useMemo(
    () =>
      selectedDate
        ? dayjs(selectedDate).tz(getUserTimezone()).format('YYYY-MM-DD')
        : '',
    [selectedDate]
  );

  const providersAppointmentUrl = useMemo(() => {
    if (!formatCurrentDate || !practitionerId || !locationId) {
      return null;
    }
    const params = new URLSearchParams({
      startDate: formatCurrentDate,
      endDate: formatCurrentDate,
    });

    if (practitionerId) {
      params.append('practitionerId', practitionerId);
    }
    if (locationId) {
      params.append('locationId', locationId);
    }

    return `${API_URL.onlineBookingAppointments}?${params.toString()}`;
  }, [formatCurrentDate, practitionerId, locationId]);

  const [
    providersAppointmentSlotsData,
    ,
    providerSlotLoading,
    getProvidersAppointmentSlotsData,
    clearProvidersAppointmentSlotsData,
  ] = useCRUD({
    id: 'online-booking-provider-appointments',
    url: providersAppointmentUrl,
    type: REQUEST_METHOD.get,
  });

  const oooUrl = useMemo(() => {
    if (!formatCurrentDate || !practitionerId || !locationId) {
      return null;
    }
    const searchParams = new URLSearchParams({
      startDate: formatCurrentDate,
      endDate: formatCurrentDate,
    });

    searchParams.append('staffId', practitionerId);
    searchParams.append('locationId', locationId);

    return `${API_URL.onlineBookingOofSchedules}?${searchParams.toString()}`;
  }, [formatCurrentDate, practitionerId, locationId]);

  const [oooSchedulesData, , oooLoading, getOooSchedules, clearOooSchedulesData] = useCRUD({
    id: 'online-booking-ooo-schedules',
    url: oooUrl,
    type: REQUEST_METHOD.get,
  });

  // Keep refs to the latest fetch/clear functions so the effect below never
  // captures stale closures while still re-running whenever the key deps change.
  const getProvidersAppointmentSlotsDataRef = useRef(getProvidersAppointmentSlotsData);
  const getOooSchedulesRef = useRef(getOooSchedules);
  const clearProvidersRef = useRef(clearProvidersAppointmentSlotsData);
  const clearOooRef = useRef(clearOooSchedulesData);
  useEffect(() => {
    getProvidersAppointmentSlotsDataRef.current = getProvidersAppointmentSlotsData;
  }, [getProvidersAppointmentSlotsData]);
  useEffect(() => {
    getOooSchedulesRef.current = getOooSchedules;
  }, [getOooSchedules]);
  useEffect(() => {
    clearProvidersRef.current = clearProvidersAppointmentSlotsData;
  }, [clearProvidersAppointmentSlotsData]);
  useEffect(() => {
    clearOooRef.current = clearOooSchedulesData;
  }, [clearOooSchedulesData]);

  useEffect(() => {
    if (!formatCurrentDate || !practitionerId || !locationId) {
      return;
    }

    clearProvidersRef.current(true);
    getProvidersAppointmentSlotsDataRef.current();
  }, [formatCurrentDate, practitionerId, locationId]);

  useEffect(() => {
    if (!formatCurrentDate || !practitionerId || !locationId) {
      return;
    }
    clearOooRef.current(true);
    getOooSchedulesRef.current();
  }, [formatCurrentDate, practitionerId, locationId]);

  useEffect(() => {
    if (activeStaffData?.primaryLocation) {
      const location = activeStaffData.primaryLocation;
      if (
        location?.preferredScheduleCode ===
        preferredScheduleCode?.DEFAULT_SCHEDULE
      ) {
        setDefaultSchedule(true);
        setCalendarSchedule(false);
      }
      if (
        location?.preferredScheduleCode ===
        preferredScheduleCode?.CALENDAR_SCHEDULE
      ) {
        setCalendarSchedule(true);
        setDefaultSchedule(false);
      }
      setScheduleArray(location);
      setTimezone(activeStaffData?.timezone || getUserTimezone());
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [activeStaffData]);

  useEffect(() => {
    if (isCalendarSchedule && scheduleArray?.calenderSchedule) {
      const calendarAppointment = formatAppointmentSchedules(
        scheduleArray.calenderSchedule,
        timeZone
      );
      setSchedule(calendarAppointment?.schedules);
      setServiceEndDate(
        dayjs()
          .tz(getUserTimezone())
          .add(calendarAppointment?.totalDays, 'day')
          .startOf('day')
      );
    }
    if (isDefaultSchedule && scheduleArray?.schedule) {
      setSchedule(scheduleArray.schedule);
      setServiceEndDate(
        dayjs()
          .tz(getUserTimezone())
          .add(howFarInFutureMonths, 'month')
          .startOf('day')
      );
    }
  }, [
    isCalendarSchedule,
    isDefaultSchedule,
    scheduleArray,
    timeZone,
    howFarInFutureMonths,
  ]);

  const leadTimeValue = scheduleArray?.leadDays?.split('_');
  const leadTimeForSameDayValue = scheduleArray?.leadInterval?.split('_');
  const leadDays = isCalendarSchedule ? 0 : leadTimeValue?.[0] || 0;
  const leadMinutes = isCalendarSchedule
    ? 0
    : leadTimeForSameDayValue?.[0] || 0;
  const gapInDays = params?.gapInDays ?? 0;
  const effectiveLeadDays = isCalendarSchedule
    ? 0
    : Math.max(Number(leadDays) || 0, Number(gapInDays) || 0);

  const dateList = useMemo(() => {
    let list = [];
    const daysOff = {};
    const today = dayjs().tz(getUserTimezone()).startOf('day');

    if (isCalendarSchedule && scheduleArray?.calenderSchedule) {
      // For calendar schedule, apply gapInDays by filtering out dates before the cutoff
      const cutoff = today.add(Number(gapInDays) || 0, 'day');
      let addedDays = new Set();
      list = sortSchedulesByStartDateTime(scheduleArray.calenderSchedule)
        .flatMap((item) => {
          const startDay = dayjs(item.startDateTime).tz(getUserTimezone());
          const endDay = dayjs(item.endDateTime).tz(getUserTimezone());
          const startDayFormatted = startDay.format('YYYY-MM-DD');
          const endDayFormatted = endDay.format('YYYY-MM-DD');
          const result = [];

          if (!addedDays.has(startDayFormatted)) {
            result.push({
              day: startDay,
              disabled: daysOff[startDay.format('dddd').toLowerCase()],
            });
            addedDays.add(startDayFormatted);
          }

          if (
            startDayFormatted !== endDayFormatted &&
            !addedDays.has(endDayFormatted)
          ) {
            result.push({
              day: endDay,
              disabled: daysOff[endDay.format('dddd').toLowerCase()],
            });
            addedDays.add(endDayFormatted);
          }

          return result;
        })
        .filter((item) => !dayjs(item.day).isBefore(cutoff, 'day'));
    } else if (isDefaultSchedule) {
      // Start date is today + effectiveLeadDays (max of leadDays and gapInDays)
      const startDate =
        effectiveLeadDays > 0
          ? dayjs()
              .tz(getUserTimezone())
              .add(effectiveLeadDays, 'day')
              .startOf('day')
          : today;

      const diffInDays = serviceEndDate
        ? dayjs(serviceEndDate).tz(getUserTimezone()).diff(startDate, 'day')
        : 30;

      list = Array.from({ length: diffInDays }).map((_, index) => {
        const day = dayjs(startDate).add(index, 'day');
        const formattedDay = day.format('dddd').toLowerCase();

        if (index < 7) {
          const values = getScheduleForTheDay(schedule, timeZone, day);
          daysOff[formattedDay] = !values || values.length === 0;
        }

        return {
          day,
          disabled: daysOff[formattedDay],
        };
      });
    }

    const currentDate = dayjs();
    const futureDates = list.filter((item) => {
      return (
        dayjs(item.day).isSame(currentDate, 'day') ||
        dayjs(item.day).isAfter(currentDate)
      );
    });

    const firstActiveItemIndex = futureDates?.findIndex(
      (item) => !item?.disabled
    );
    return firstActiveItemIndex >= 0
      ? futureDates.slice(firstActiveItemIndex)
      : futureDates;
  }, [
    effectiveLeadDays,
    gapInDays,
    serviceEndDate,
    schedule,
    timeZone,
    isCalendarSchedule,
    isDefaultSchedule,
    scheduleArray,
  ]);

  useEffect(() => {
    if (dateList?.length && !selectedDate) {
      setSelectedDate(dateList[0]?.day);
    }
  }, [dateList, selectedDate]);

  const hideDurations = params?.hideDurations === true || params?.hideDurations === 1;

  const appointmentInterval = (!hideDurations && params?.appointmentInterval)
    ? params.appointmentInterval
    : scheduleArray?.appointmentInterval;

  const appointmentIntervalMinutes = useMemo(
    () => Number(appointmentInterval?.split('_')?.[0] || 0),
    [appointmentInterval]
  );

  const slotsDataArray = useMemo(() => {
    if (!selectedDate) {
      return [];
    }
    const scheduleForDay = getScheduleForTheDay(
      schedule,
      timeZone,
      selectedDate,
      isCalendarSchedule
    );

    return generateTimeSlots(
      scheduleForDay,
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
    isCalendarSchedule,
    hideDurations,
  ]);

  const getSlotRange = useCallback(
    (time) => {
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
    },
    [selectedDate, appointmentIntervalMinutes]
  );

  const isSlotBlocked = useCallback(
    (time) => {
      if (!selectedDate) {
        return false;
      }

      const { slotStart, slotEnd } = getSlotRange(time);
      const slotStartValue = slotStart.valueOf();
      const slotEndValue = slotEnd.valueOf();

      const hasAppointmentConflict = providersAppointmentSlotsData?.some(
        (slot) => {
          const slotStartTime = new Date(slot.startDateTime).getTime();
          const slotEndTime = new Date(slot.endDateTime).getTime();

          return slotStartValue < slotEndTime && slotEndValue > slotStartTime;
        }
      );

      const hasOooConflict = oooSchedulesData?.some((oooSlot) => {
        if (oooSlot.locationId && locationId && String(oooSlot.locationId) !== String(locationId)) {
          return false;
        }

        const oooStart = new Date(oooSlot.startDateTime).getTime();
        const oooEnd = new Date(oooSlot.endDateTime).getTime();

        return slotStartValue < oooEnd && slotEndValue > oooStart;
      });

      return hasAppointmentConflict || hasOooConflict;
    },
    [
      selectedDate,
      getSlotRange,
      providersAppointmentSlotsData,
      oooSchedulesData,
    ]
  );

  useEffect(() => {
    if (!selectedTime) return;
    if (!slotsDataArray?.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedTime, slotsDataArray]);

  const onSelectDay = useCallback((day) => {
    setSelectedDate(day);
    setSelectedTime(null);
  }, []);

  const onSelectTime = useCallback((time) => {
    setSelectedTime(time);
  }, []);

  const handleProceed = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      showSnackbar({
        message: 'Please select a date and time slot',
        severity: 'error',
      });
      return;
    }
    if (isSlotBlocked(selectedTime)) {
      showSnackbar({
        message: 'The selected time slot is no longer available. Please choose another.',
        severity: 'error',
      });
      return;
    }

    setBookingData({
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      practitionerId: selectedStaffId || params?.staffId,
      locationId: params?.locationId || activeStaffData?.primaryLocationId,
      staffData: activeStaffData,
      autoConfirm: autoConfirmSetting,
      gapInDays: params?.gapInDays,
      hidePrices: params?.hidePrices,
      hideDurations: params?.hideDurations,
      showPractitioner: params?.showPractitioner,
      howFarInFuture: params?.howFarInFuture,
      sendTextAlso: params?.sendTextAlso,
      paymentForBooking: params?.paymentForBooking,
      depositAmount: params?.depositAmount,
      textTemplate: params?.textTemplate,
      stripePublishableKey: widgetConfig?.stripePublishableKey || '',
      stripeMode: widgetConfig?.stripeMode || 'test',
      appointmentInterval: params?.appointmentInterval || scheduleArray?.appointmentInterval || '',
    });

    setCurrentStep(3);
  };

  // Step 1: Service Selection
  if (currentStep === 1) {
    const locationName = params?.locationName || clinicData?.name || '';

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <BookingHeader
          clinicData={clinicData}
          params={params}
          currentStep={currentStep}
          onBack={handleBack}
        />

        <Container maxWidth="lg">
          {staffLoading || procedureCodesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Step 1 Of 3
                </Typography>
              </Box>

              {/* Service Cards */}
              {procedureCodesList?.results?.map((service) => (
                <Card
                  key={service.id}
                  sx={{
                    mb: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: '#4caf50',
                          mr: 2,
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: '#1976d2' }}
                          >
                            {service.cptCode} - {service.name}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleProceed(service)}
                            sx={{
                              bgcolor: '#1976d2',
                              ml: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': { bgcolor: '#1565c0' },
                            }}
                          >
                            Proceed
                          </Button>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
                        >
                          {service.description || 'No description available'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {!procedureCodesLoading &&
                (!procedureCodesList?.results ||
                  procedureCodesList?.results?.length === 0) && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No services available at this time.
                    </Typography>
                  </Box>
                )}
            </>
          )}
        </Container>
      </Box>
    );
  }

  // Step 2: Appointment Booking Calendar
  if (currentStep === 2) {
    const activeLoading =
      showPractitionerSelector && selectedStaffId !== params?.staffId
        ? selectedStaffLoading
        : staffLoading;
    const locationName = params?.locationName || clinicData?.name || '';

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#e8e8e8' }}>
        <BookingHeader
          clinicData={clinicData}
          params={params}
          currentStep={currentStep}
          onBack={handleBack}
        />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.875rem', color: '#999' }}
            >
              Step 2 Of 3
            </Typography>
          </Box>
          {showPractitionerSelector && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <FormControl sx={{ minWidth: 320 }}>
                <Select
                  value={selectedStaffId || ''}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }}
                  onClose={() => setPractitionerSearch('')}
                  displayEmpty
                  size="small"
                  sx={{ bgcolor: 'white' }}
                  MenuProps={{
                    PaperProps: { sx: { maxHeight: 360 } },
                    autoFocus: false,
                  }}
                  renderValue={(value) => {
                    if (!value)
                      return (
                        <span style={{ color: '#aaa' }}>
                          Select Practitioner
                        </span>
                      );
                    const staff = (allStaffData?.results || []).find(
                      (s) => String(s.id) === String(value)
                    );
                    if (!staff) return value;
                    return (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.7rem',
                            bgcolor: '#1976d2',
                          }}
                        >
                          {staff.firstName?.[0]}
                          {staff.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{ fontSize: '0.875rem', lineHeight: 1.2 }}
                          >
                            {staff.firstName} {staff.lastName}
                          </Typography>
                          {(staff.role?.name ||
                            staff.practitionerType ||
                            staff.designation) && (
                            <Typography
                              sx={{
                                fontSize: '0.72rem',
                                color: '#888',
                                lineHeight: 1.2,
                              }}
                            >
                              {staff.role?.name ||
                                staff.practitionerType ||
                                staff.designation}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  }}
                >
                  {/* Sticky search box */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      position: 'sticky',
                      top: 0,
                      bgcolor: 'white',
                      zIndex: 1,
                      borderBottom: '1px solid #eee',
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      placeholder="Search practitioner..."
                      value={practitionerSearch}
                      onChange={(e) => setPractitionerSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </Box>

                  {allStaffLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : (
                    (() => {
                      const filtered = (allStaffData?.results || []).filter(
                        (s) => {
                          const isPractitioner = s.user?.roles?.some(
                            (r) => r.code === 'practitioner'
                          );
                          if (!isPractitioner) return false;
                          const fullName = `${s.firstName || ''} ${
                            s.lastName || ''
                          }`.toLowerCase();
                          return fullName.includes(
                            practitionerSearch.toLowerCase()
                          );
                        }
                      );

                      if (filtered.length === 0) {
                        return (
                          <MenuItem disabled>
                            <Typography
                              sx={{ fontSize: '0.875rem', color: '#aaa' }}
                            >
                              No practitioners found
                            </Typography>
                          </MenuItem>
                        );
                      }

                      return filtered.map((s) => (
                        <MenuItem
                          key={s.id}
                          value={String(s.id)}
                          sx={{ py: 1.2 }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                fontSize: '0.75rem',
                                bgcolor: '#1976d2',
                              }}
                            >
                              {s.firstName?.[0]}
                              {s.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  lineHeight: 1.3,
                                }}
                              >
                                {s.firstName} {s.lastName}
                              </Typography>
                              {(s.role?.name ||
                                s.practitionerType ||
                                s.designation) && (
                                <Typography
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: '#888',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {s.role?.name ||
                                    s.practitionerType ||
                                    s.designation}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ));
                    })()
                  )}
                </Select>
              </FormControl>
            </Box>
          )}

          {selectedService && (
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Typography
                variant="h6"
                fontWeight={500}
                sx={{ color: '#666', fontSize: '1rem' }}
              >
                {selectedService.id} - {selectedService.name}
              </Typography>
            </Box>
          )}

          {selectedDate && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="body2"
                sx={{ color: '#999', fontSize: '0.875rem' }}
              >
                Browse Dates {selectedDate.format('ddd, DD MMM YYYY')}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 4,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            {/* Practitioner Card */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Card
                sx={{
                  width: 220,
                  textAlign: 'center',
                  p: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: 2,
                }}
              >
                <Avatar
                  src={activeStaffData?.file?.file ? getImageUrl(activeStaffData.file.file, { isPublicURI: true }) : undefined}
                  sx={{
                    width: 140,
                    height: 140,
                    mx: 'auto',
                    mb: 2,
                    border: '3px solid #f0f0f0',
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{ fontSize: '1rem', color: '#333' }}
                >
                  {activeStaffData?.firstName || ''}{' '}
                  {activeStaffData?.lastName || ''}
                </Typography>
                {activeStaffData?.primaryLocation?.name && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {activeStaffData.primaryLocation.name}
                  </Typography>
                )}
              </Card>
            </Box>

            {/* Calendar Section */}
            <Box sx={{ flex: 1, maxWidth: 900 }}>
              {activeLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {dateList?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Carousel
                        data={dateList}
                        cardWidth={110}
                        render={({ day, disabled }, index) => {
                          const isActive =
                            selectedDate &&
                            dayjs(selectedDate).format('YYYY-MM-DD') ===
                              day.format('YYYY-MM-DD');
                          return (
                            <Box
                              key={index}
                              onClick={() => {
                                if (!disabled) onSelectDay(day);
                              }}
                              sx={{
                                py: '5px',
                                mr: '18px',
                                display: 'flex',
                                borderRadius: '8px',
                                cursor: disabled ? 'not-allowed' : 'pointer',
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
                  )}

                  <Grid
                    container
                    sx={{
                      backgroundColor: 'white',
                      maxHeight: '400px',
                      overflow: 'auto',
                      paddingTop: '22px',
                      paddingLeft: '17px',
                      borderRadius: 2,
                    }}
                  >
                    {!activeStaffData?.primaryLocation ? (
                      <Typography
                        sx={{ fontWeight: '550', p: 2, color: 'error.main' }}
                      >
                        No primary location configured for this staff member.
                        Please contact the administrator.
                      </Typography>
                    ) : !scheduleArray?.schedule &&
                      !scheduleArray?.calenderSchedule ? (
                      <Typography
                        sx={{ fontWeight: '550', p: 2, color: 'error.main' }}
                      >
                        No schedule configured for this location. Please contact
                        the administrator.
                      </Typography>
                    ) : !appointmentInterval ? (
                      <Typography
                        sx={{ fontWeight: '550', p: 2, color: 'error.main' }}
                      >
                        Appointment interval not configured. Please contact the
                        administrator.
                      </Typography>
                    ) : selectedDate && slotsDataArray?.length ? (
                      slotsDataArray?.map((item, index) => {
                        const isActive = selectedTime === item;
                        const { slotStart, slotEnd } = getSlotRange(item);
                        const isDisabled = isSlotBlocked(item);
                        const slotLabel = hideDurations
                          ? slotStart.format('hh:mm A')
                          : `${slotStart.format('hh:mm A')}–${slotEnd.format('hh:mm A')}`;
                        return (
                          <Grid item key={index}>
                            {providerSlotLoading || oooLoading ? (
                              <Skeleton
                                variant="rectangular"
                                sx={{
                                  borderRadius: '10px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                  margin: '4px',
                                }}
                                width={80}
                                height={40}
                              />
                            ) : (
                              <Chip
                                clickable={!isDisabled}
                                size="medium"
                                label={slotLabel}
                                onClick={
                                  isDisabled
                                    ? undefined
                                    : () => onSelectTime(item)
                                }
                                color={isActive ? 'primary' : 'default'}
                                sx={{
                                  marginRight: 2,
                                  marginBottom: 2,
                                  cursor: isDisabled
                                    ? 'not-allowed'
                                    : 'pointer',
                                  fontSize: '0.8rem',
                                  width: hideDurations ? '5.2rem' : 'auto',
                                  minWidth: hideDurations ? 'unset' : '9rem',
                                  backgroundColor: isDisabled
                                    ? palette.action.disabledBackground
                                    : isActive
                                    ? palette.primary.main
                                    : '',
                                  color: isDisabled
                                    ? palette.action.disabled
                                    : 'inherit',
                                }}
                              />
                            )}
                          </Grid>
                        );
                      })
                    ) : (
                      selectedDate && (
                        <Typography sx={{ fontWeight: '550', p: 2 }}>
                          No slots available
                        </Typography>
                      )
                    )}
                  </Grid>
                </>
              )}
            </Box>
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ textTransform: 'none', px: 4 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedDate || !selectedTime || (selectedTime && isSlotBlocked(selectedTime))}
              sx={{
                textTransform: 'none',
                px: 4,
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              Next
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // Step 3: Patient Registration Form
  if (currentStep === 3) {
    const locationName = params?.locationName || clinicData?.name || '';
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <BookingHeader
          clinicData={clinicData}
          params={params}
          currentStep={currentStep}
          onBack={handleBack}
        />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.875rem', color: '#999' }}
            >
              Step 3 Of 3
            </Typography>
          </Box>

          <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Appointment Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Service:</strong> {selectedService?.cptCode} -{' '}
                  {selectedService?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Provider:</strong> {activeStaffData?.firstName}{' '}
                  {activeStaffData?.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{' '}
                  {selectedDate?.format('dddd, MMMM DD, YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong>{' '}
                  {selectedTime &&
                    dayjs(selectedDate)
                      .hour(Number.parseInt(selectedTime.split(':')[0], 10))
                      .minute(Number.parseInt(selectedTime.split(':')[1], 10))
                      .format('hh:mm A')}
                </Typography>
                {activeStaffData?.primaryLocation?.name && (
                  <Typography variant="body2">
                    <strong>Location:</strong>{' '}
                    {activeStaffData.primaryLocation.name} ({locationName})
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Patient Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please fill out the form below to complete your appointment
                booking.
              </Typography>
              <GuestPatientForm
                bookingData={bookingData}
                onSuccess={() => setCurrentStep(4)}
              />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Step 4: Confirmation Page
  if (currentStep === 4) {
    const locationName = params?.locationName || clinicData?.name || '';
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="md">
          <Card
            sx={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              textAlign: 'center',
              py: 6,
              px: 4,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ color: 'white', fontWeight: 'bold' }}
                >
                  ✓
                </Typography>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mb: 2, color: '#2e7d32' }}
              >
                Thank you!
              </Typography>
              <Typography
                variant="h5"
                fontWeight={500}
                sx={{ mb: 4, color: '#333' }}
              >
                Your appointment has been booked.
              </Typography>

              <Box
                sx={{
                  bgcolor: '#f9f9f9',
                  borderRadius: 2,
                  p: 3,
                  mb: 4,
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  Appointment Details
                </Typography>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Service:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedService?.cptCode} - {selectedService?.name}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Provider:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {activeStaffData?.firstName} {activeStaffData?.lastName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Date:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedDate?.format('dddd, MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Time:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedTime &&
                        dayjs(selectedDate)
                          .hour(Number.parseInt(selectedTime.split(':')[0], 10))
                          .minute(
                            Number.parseInt(selectedTime.split(':')[1], 10)
                          )
                          .format('hh:mm A')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Location:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {clinicData?.name || ''} ({locationName})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Additional Information */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                A confirmation email has been sent to your email address with
                all the appointment details.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  window.location.reload();
                }}
                sx={{
                  px: 6,
                  py: 1.5,
                  bgcolor: '#2e7d32',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#1b5e20',
                  },
                }}
              >
                Book Another Appointment
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return null;
};
const OnlineBookingRegistration = () => {
  const [params, setParams] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const encryptedP = query.get('token');
    if (encryptedP) {
      try {
        const decryptedString = decrypt(decodeURIComponent(encryptedP));
        const searchParams = new URLSearchParams(decryptedString);

        const data = {
          staffId: searchParams.get('staffId'),
          locationId: searchParams.get('locationId') || null,
          locationName: searchParams.get('locationName')
            ? decodeURIComponent(searchParams.get('locationName'))
            : '',
          autoConfirm: Number.parseInt(
            searchParams.get('autoConfirm') || '0',
            10
          ),
          gapInDays: Number.parseInt(searchParams.get('gapInDays') || '2', 10),
          hidePrices: searchParams.get('hidePrices') === '1',
          hideDurations: searchParams.get('hideDurations') === '1',
          showPractitioner: searchParams.get('showPractitioner') || 'yes',
          howFarInFuture: searchParams.get('howFarInFuture') || '12_months',
          sendTextAlso: searchParams.get('sendTextAlso') || 'to_both',
          paymentForBooking:
            searchParams.get('paymentForBooking') || 'not_required',
          depositAmount: Number.parseFloat(
            searchParams.get('depositAmount') || '0'
          ),
          textTemplate:
            searchParams.get('textTemplate') || 'default_reminder_text',
          appointmentInterval: searchParams.get('appointmentInterval') || '',
        };


        if (!data.staffId) throw new Error('Incomplete link');
        setParams(data);
      } catch (err) {
        console.error('Decryption Error:', err);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, []);

  const [staffData, , staffLoading, getStaffData] = useCRUD({
    id: 'ONLINE_BOOKING_STAFF_DATA',
    url: params?.staffId
      ? `${API_URL.onlineBookingStaff}/${params.staffId}`
      : null,
    type: REQUEST_METHOD.get,
  });

  const [widgetConfigResp, , , getWidgetConfig] = useCRUD({
    id: 'ONLINE_BOOKING_WIDGET_CONFIG',
    url: `${API_URL.ProspectRegistration}/widget-config`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (params?.staffId && !staffData && !staffLoading) {
      getStaffData();
    }
  }, [params?.staffId]);

  useEffect(() => {
    if (params && !widgetConfigResp) {
      getWidgetConfig();
    }
  }, [params]);

  const widgetConfig = widgetConfigResp?.data || {};

  if (error)
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="error">Invalid or expired registration link.</Alert>
      </Container>
    );

  if (!params)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <OnlineBookingRegistrationForm
      params={params}
      staffData={staffData}
      staffLoading={staffLoading}
      clinicData={staffData?.primaryLocation || null}
      widgetConfig={widgetConfig}
    />
  );
};

export default OnlineBookingRegistration;
