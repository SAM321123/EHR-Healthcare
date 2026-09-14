import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_URL } from 'src/api/constants';
import Box from 'src/components/Box';
import Select from 'src/components/Select';
import Typography from 'src/components/Typography';
import WiredSelect from 'src/wiredComponent/Select';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { dateFormats } from 'src/lib/constants';
import './calendarHeader.scss';

import useAuthUser from 'src/hooks/useAuthUser';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';

const viewOptions = [
  { name: 'Day', code: 'day' },
  { name: 'Week', code: 'week' },
  { name: 'Month', code: 'month' },
];

const viewMap = {
  day: 'timeGridDay',
  month: 'dayGridMonth',
  week: 'timeGridWeek',
};

const reverseViewMap = {
  timeGridDay: 'day',
  dayGridMonth: 'month',
  timeGridWeek: 'week',
};

const CalendarDatePicker = ({ calendarRef ,fetchCalendarSchedule,apiParams}) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarApi = calendarRef.current?.getApi();
  const { currentData: { currentViewType, viewTitle, dateProfile } = {} } =
    calendarApi || {};

  const handleDateChange = useCallback(
    (newDate) => {
      calendarApi.gotoDate(newDate);
      const startDate = dayjs(newDate).utc().format(dateFormats.YYYYMMDD);
      apiParams.current = {
        ...apiParams.current,
        startDate : startDate,
        endDate: startDate,
      };
      fetchCalendarSchedule({ ...apiParams.current })
    },
    [calendarApi]
  );

  const handleDatePickerVisibility = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="date-wrapper" style={{ display: 'flex' }}>
        <DatePicker
          open={isOpen}
          onClose={handleDatePickerVisibility}
          value={dateProfile?.currentDate}
          onChange={handleDateChange}
          sx={{
            visibility: 'hidden',
            width: '0px',
            height: '0px',
            left: '-100px',
          }}
        />
        <Typography
          className="date-format"
          onClick={
            currentViewType === viewMap.day
              ? handleDatePickerVisibility
              : () => {}
          }
        >
          {viewTitle}
        </Typography>
      </div>
    </LocalizationProvider>
  );
};

const CalendarHeader = ({ apiParams, calendarRef, fetchCalendarSchedule,defaultOptions }) => {
  const [user, , ,] = useAuthUser();
  const practitionerId = user.id;
  const [iconClickCount, setIconClickCount] = useState(0);
  const [initialLocationId, setInitialLocationId] = useState(null);

  useEffect(() => {
    if (!isEmpty(defaultOptions)) {
      const primaryLocationId = defaultOptions?.find(
        (location) => location.isPrimaryLocation
      )?.id;
      const selectedLocationId = primaryLocationId || defaultOptions[0]?.id;

      apiParams.current = {
        ...apiParams.current,
        locationId: selectedLocationId,
      };
      setInitialLocationId(selectedLocationId);
    }
  }, [defaultOptions]);

  const handleIconClick = useCallback(
    (e) => {
      const calendarApi = calendarRef.current?.getApi();
      if (e) {
        const iconId = e.currentTarget.id;
        setIconClickCount(iconClickCount + 1);
        if (iconId === 'left-icon') {
          calendarApi.prev();
        } else {
          calendarApi.next();
        }
      }
      const currentDate = calendarApi?.currentData?.currentDate;
      const view =
        reverseViewMap[calendarApi?.currentData?.currentViewType] || 'month';
      const startDate = dayjs(currentDate)
        .utc()
        .startOf(view)
        .format(dateFormats.YYYYMMDD);
      const endDate = dayjs(startDate).endOf(view).format(dateFormats.YYYYMMDD);

      apiParams.current = {
        ...apiParams.current,
        startDate,
        endDate,
        staffId: practitionerId,
      };
      fetchCalendarSchedule({ ...apiParams.current });
    },
    [calendarRef, fetchCalendarSchedule, iconClickCount]
  );

  const handleViewSelect = useCallback(
    (e) => {
      const { target: { value } = {} } = e;
      const calendarApi = calendarRef.current?.getApi();
      setIconClickCount(iconClickCount + 1);
      calendarApi.changeView(viewMap[value]);
      handleIconClick();
    },
    [calendarRef, iconClickCount]
  );

  useEffect(() => {
    if (defaultOptions) {
      handleIconClick();
    }
  }, [defaultOptions]);


  const handleChange = useCallback(
    (value) => {
      apiParams.current = { ...apiParams.current, locationId: value };
      fetchCalendarSchedule({ ...apiParams.current });
    },
    [fetchCalendarSchedule]
  );

  return (
    <Grid
      container
      spacing={2}
      sx={{ display: 'flex', marginBottom: '12px', alignItems: 'center' }}
    >
      <Grid item md={2.5} style={{ paddingLeft: '16px' }}>
        <WiredSelect
          name="locationId"
          defaultValue={initialLocationId}
          label="Location"
          url={null}
          placeholder="Select"
          labelAccessor={['location.name']}
          valueAccessor="id"
          onChange={handleChange}
          defaultOptions={defaultOptions}
      
          cache={false}
          crudId="scheduling-ui-location"
          multiple={false}
          // key={initialLocationId}
        />
      </Grid>
      {/* <Grid item md={2.7}>
        <WiredAutoComplete
          name="patientId"
          label="Patient Name"
          url={API_URL.patient}
          params={{ isActive: true, limit: 300, }}
          size="small"
          // style={{ width: '250px' }}
          onChange={handleChangePatient}
          labelAccessor={['title.name','firstName','middleName', 'lastName']}
          valueAccessor="id"
          cache={false}
          crudId="scheduling-ui-patient"
          placeholder="Search by patient name"
          multiple={true}

        />
      </Grid> */}
      <Grid item md={6.8} style={{ marginTop: '4px !important' }}>
        <div className="calendar-header-filter-wrapper">
          <Box
            className="next-prev-wrapper"
            sx={{
              justifyContent: { md: 'flex-end', sm: 'unset' },
            }}
          >
            <ArrowLeftIcon
              id="left-icon"
              onClick={handleIconClick}
              className="icon-wrapper"
            />
            <CalendarDatePicker
              key={iconClickCount}
              calendarRef={calendarRef}
              apiParams={apiParams}
              fetchCalendarSchedule={fetchCalendarSchedule}

            />
            <ArrowRightIcon
              id="right-icon"
              onClick={handleIconClick}
              className="icon-wrapper"
            />
          </Box>
          <div className="select-filter-wrapper">
            <Select
              data={viewOptions}
              onChange={handleViewSelect}
              defaultValue="month"
              size="small"
              variant="outlined"
              fullWidth
              style={{ marginRight: '12px', minWidth: '100px' }}
              labelAccessor="name"
              valueAccessor="code"
            />
            {/* <FilterSelect
              size="small"
              variant="outlined"
              onChange={handleFilterChange}
              fetchData={fetchAppointment}
              style={{ minWidth: '100px' }}
              filterData={filterData}
              apiParams={apiParams}
              clearOnUnmount
            /> */}
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default CalendarHeader;
