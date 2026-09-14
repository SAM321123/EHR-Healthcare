import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_URL, REQUEST_METHOD, BASE_URL } from 'src/api/constants';
import Box from 'src/components/Box';
import Select from 'src/components/Select';
import { IconButton } from '@mui/material';
import { convertWithTimezone, downloadPdf } from 'src/lib/utils';
import Typography from 'src/components/Typography';
import FilterSelect from 'src/wiredComponent/FilterSelect';
import LoadingButton from 'src/components/CustomButton/loadingButton';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { dateFormats } from 'src/lib/constants';
import './calendarHeader.scss';

import { GET_MEDICINE_STATUS, MAR_FILTERS, MAR_STATUS } from 'src/store/types';

import useCRUD from 'src/hooks/useCRUD';



const viewOptions = [
  { name: 'Day', code: 'day' },
  { name: 'Week', code: 'week' },
  { name: 'Month', code: 'month' },
];

const viewMap = {
  day: 'resourceTimelineDay',
  week: 'resourceTimelineWeek',
  month: 'resourceTimelineMonth',
};


const reverseViewMap = {
  resourceTimelineDay: 'day',
  resourceTimelineWeek: 'week',
  resourceTimelineMonth: 'month',
};

const CalendarDatePicker = ({ calendarRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarApi = calendarRef.current?.getApi();
  const { currentData: { currentViewType, viewTitle, dateProfile } = {} } =
    calendarApi || {};

  const handleDateChange = useCallback(
    (newDate) => {
      calendarApi.gotoDate(newDate);
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

const CalendarHeader = ({ calendarRef, fetchAppointment,onFilterChange, data, resourceInfo, patientId, medicationId=0 }) => {
  const isMARExists = resourceInfo?.find((resource) => resource?.isMARLogExists) 
  const apiParams = useRef({});
  const medicationItemData = resourceInfo?.resource;
  const [iconClickCount, setIconClickCount] = useState(0);
  
  const code = 'mar_log_action';
  const [getResponse, , ,getAPI] = useCRUD({
    id:   MAR_STATUS,
    url: `${API_URL.getMasters}/${code}`,
    type: REQUEST_METHOD.get,
  });


  useEffect(() => {
      getAPI();
  }, []);


  const [practicesLocationResponse, , , getLocation] = useCRUD({
    id: GET_MEDICINE_STATUS,
    url: `${API_URL.getMasters}/medication_status`,
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
          code: data?.code,
        })),
        label: 'Medication Status',
      },
      {
        data: getResponse?.results?.map((data) => ({
          name: data?.name,
          code: data?.code,
        })),
        label: 'Mar Action',
      },
    ]
  : [];

  const handleFilterChange = useCallback(
    (filter) => {
      apiParams.current = { ...apiParams.current,staticFilter: {statusCode: filter?.['Medicine Status'], actionCode: filter?.['Mar Action']}};
      onFilterChange({ ...apiParams.current });
  }, [onFilterChange]);

  const handleDownloadMAR = (data) => {
    if(patientId){
      downloadPdf(
        `/${API_URL.downloadAllMedicationsMARLogPDF}/${patientId}/${medicationId}`, 'EMAR'
      )
    }
  }

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
      const view = reverseViewMap[calendarApi?.currentData?.currentViewType] || 'month'
      const startDate = dayjs(currentDate).utc().startOf(view).format(dateFormats.YYYYMMDD);
      const endDate =  dayjs(startDate).endOf(view).format(dateFormats.YYYYMMDD);
      
      apiParams.current = {
        ...apiParams.current,
        dynamicFilter:{
        startDate,
        endDate,
        }
      };
      fetchAppointment({ ...apiParams.current });
    },
    [calendarRef, fetchAppointment, iconClickCount]
  );

  const handleViewSelect = useCallback(
    (e) => {
      const { target: { value } = {} } = e;
      console.log("🚀 ~ CalendarHeader ~ value:", value)
      const calendarApi = calendarRef.current.getApi();
      setIconClickCount(iconClickCount + 1);
      calendarApi.changeView(viewMap[value]);
      handleIconClick();
    },
    [calendarRef, iconClickCount]
  );

  useEffect(()=>{
   handleIconClick()
  },[])

  // const handleChange = useCallback(
  //   (value) => {
  //       apiParams.current = { ...apiParams.current, practitionerId: value };
  //     fetchAppointment({ ...apiParams.current });
  //   },
  //   [fetchAppointment]
  // );

  return (
    <Grid container spacing={2} sx={{ display: 'flex', marginBottom: '12px',alignItems:'center' }}>
       <Grid item md={5} style={{marginTop:'4px !important'}} ></Grid>
      <Grid item md={6.8} style={{marginTop:'4px !important'}} >
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
              defaultValue="day"
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
              reduxId={MAR_FILTERS}
            />
            {isMARExists && (
              <LoadingButton
                onClick={() => handleDownloadMAR(resourceInfo)}
                startIcon={<Iconify icon="mdi:file-pdf-box" />}
                label="Download"
                variant="contained"
                sx={{ minWidth: '120px', marginLeft: '12px', marginTop: '2px' }}
              >
                Download
              </LoadingButton>
            )}

          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default CalendarHeader;
