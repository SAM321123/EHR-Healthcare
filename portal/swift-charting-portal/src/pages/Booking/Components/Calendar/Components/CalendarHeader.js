import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import Select from 'src/components/Select';
import Typography from 'src/components/Typography';
import WiredAutoComplete from 'src/wiredComponent/AutoComplete';
import FilterSelect from 'src/wiredComponent/FilterSelect';
import WiredSelect from 'src/wiredComponent/Select';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { dateFormats, roleTypes } from 'src/lib/constants';
import './calendarHeader.scss';
import { Tooltip } from '@mui/material'


import {
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPE,
  GET_PRACTICES_LOCATION,
} from 'src/store/types';

import useCRUD from 'src/hooks/useCRUD';
import palette from 'src/theme/palette';

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

const CalendarDatePicker = ({ apiParams, calendarRef, fetchAppointment }) => {
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
        startDate: startDate,
        endDate: startDate,
      };
      fetchAppointment({ ...apiParams.current });
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

const CalendarHeader = ({ calendarRef, fetchAppointment, data }) => {
  const apiParams = useRef({});
  const [iconClickCount, setIconClickCount] = useState(0);

  const code = 'appointment_status';
  const [getResponse, , , getAPI] = useCRUD({
    id: APPOINTMENT_STATUS,
    url: `${API_URL.getMasters}/${code}`,
    type: REQUEST_METHOD.get,
  });

  const [appointmentTypeResponse, , , getAppointmentTypeAPI] = useCRUD({
    id: APPOINTMENT_TYPE,
    url: `${API_URL.getMasters}/appointment_type`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getAPI();
  }, []);

  useEffect(() => {
    getAppointmentTypeAPI();
  }, []);

  const [practicesLocationResponse, , , getLocation] = useCRUD({
    id: GET_PRACTICES_LOCATION,
    url: API_URL.getPractice,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getLocation();
  }, []);

  const filterData = getResponse
    ? [
        {
          data: practicesLocationResponse?.results?.map((data) => ({
            name: data?.name,
            code: data?.id,
          })),
          label: 'location',
        },
        {
          data: getResponse?.results?.map((data) => ({
            name: data?.name,
            code: data?.code,
          })),
          label: 'status',
        },
        {
          data: appointmentTypeResponse?.results?.map((data) => ({
            name: data?.name,
            code: data?.code,
          })),
          label: 'type',
        },
      ]
    : [];

  const handleFilterChange = useCallback(
    (filter) => {
      apiParams.current = {
        ...apiParams.current,
        statusCode: filter?.status,
        locationId: filter?.location,
        typeCode: filter?.type,
      };
      fetchAppointment({ ...apiParams.current });
    },
    [fetchAppointment]
  );

  const handleIconClick = useCallback(
    (e) => {
      const calendarApi = calendarRef.current.getApi();
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
      };
      fetchAppointment({ ...apiParams.current });
    },
    [calendarRef, fetchAppointment, iconClickCount]
  );

  const handleViewSelect = useCallback(
    (e) => {
      const { target: { value } = {} } = e;
      const calendarApi = calendarRef.current.getApi();
      setIconClickCount(iconClickCount + 1);
      calendarApi.changeView(viewMap[value]);
      handleIconClick();
    },
    [calendarRef, iconClickCount]
  );

  useEffect(() => {
    handleIconClick();
  }, []);

  const handleChange = useCallback(
    (value) => {
      apiParams.current = { ...apiParams.current, practitionerId: value };
      fetchAppointment({ ...apiParams.current });
    },
    [fetchAppointment]
  );

  const handleChangePatient = useCallback(
    (value) => {
      if (!value) {
        apiParams.current = { ...apiParams.current, patientId: undefined };
      } else {
        const onlyIds = value.map((item) => item.id);
        apiParams.current = { ...apiParams.current, patientId: onlyIds };
      }
      fetchAppointment({ ...apiParams.current });
    },
    [fetchAppointment]
  );
  return (
    <Grid
      container
      spacing={2}
      sx={{ display: 'flex', marginBottom: '12px', alignItems: 'center' }}
    >
      <Grid item md={2.5} style={{ paddingLeft: '16px' }}>
        <Tooltip  title='Select Practitioner' placement="bottom">
          <Typography
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 12,
              color: palette.text.offWhite,
              lineHeight: '20px',
              fontWeight: 400,
              fontFamily: 'Poppins',
            }}
          >
            <WiredSelect
              name="practitionerId"
              label="Practitioner Name"
              url={API_URL.staff}
              params={{
                isActive: true,
                limit: 300,
                role: roleTypes.practitioner,
              }}
              size="small"
              // style={{ width: '250px' }}
              onChange={handleChange}
              labelAccessor={[
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ]}
              valueAccessor="id"
              // isAllOptionNeeded
              // defaultValue="ALL"
              cache={false}
              crudId="scheduling-ui-practitioner"
              multiple={true}
            />
          </Typography>{' '}
        </Tooltip>
      </Grid>
      <Grid item md={2.7}>
        <WiredAutoComplete
          name="patientId"
          label="Patient Name"
          url={API_URL.patient}
          params={{ isActive: true, limit: 300 }}
          size="small"
          // style={{ width: '250px' }}
          onChange={handleChangePatient}
          labelAccessor={['title.name', 'firstName', 'middleName', 'lastName']}
          valueAccessor="id"
          cache={false}
          crudId="scheduling-ui-patient"
          placeholder="Search by patient name"
          multiple={true}
        />
      </Grid>
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
              fetchAppointment={fetchAppointment}
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
            <FilterSelect
              size="small"
              variant="outlined"
              onChange={handleFilterChange}
              fetchData={fetchAppointment}
              style={{ minWidth: '100px' }}
              filterData={filterData}
              apiParams={apiParams}
              clearOnUnmount
            />
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default CalendarHeader;
