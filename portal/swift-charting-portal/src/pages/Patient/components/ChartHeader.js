import { useCallback, useEffect, useState } from 'react';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

import Box from 'src/components/Box';
import Select from 'src/components/Select';
import Typography from 'src/components/Typography';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getEndOfTheDate, getNewDate, getStartOfTheDate } from 'src/lib/utils';
import dayjs from 'dayjs';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { dateFormats } from 'src/lib/constants';
// import { useNavigate } from 'react-router-dom';
import palette from 'src/theme/palette';

const viewOptions = [
  { name: 'Week', code: 'week' },
  { name: 'Month', code: 'month' },
  { name: 'Year', code: 'year' },
  { name: 'Custom', code: 'custom' },
];

const viewMap = {
  week: 'week',
  month: 'month',
  year: 'year',
  custom: 'custom',
};
let viewTitle;
let currentDate = getNewDate();

viewTitle = currentDate.format('MMMM-YYYY');

const CalendarDatePicker = ({ selectedDate }) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <div className="date-wrapper" style={{ display: 'flex' }}>
      <DatePicker
        sx={{
          visibility: 'hidden',
          width: '0px',
          height: '0px',
        }}
      />
      <Typography className="date-format">{selectedDate}</Typography>
    </div>
  </LocalizationProvider>
);

const ChartHeader = ({ patientData, fetchRecord }) => {
  // const navigate = useNavigate();
  const [viewType, setViewType] = useState('month');
  const [customStartDate, setCustomStartDate] = useState(getNewDate());
  const [customEndDate, setCustomEndDate] = useState(getNewDate());
  const [selectedDate, setSelectedDate] = useState(viewTitle);

  const handleIconClick = useCallback(
    (selectedViewType, opt) => {
      if (selectedViewType === viewMap.custom) return;
      const applyOpt = () =>
        opt === '+'
          ? dayjs(currentDate).add(1, selectedViewType)
          : dayjs(currentDate).subtract(1, selectedViewType);

      currentDate = opt ? applyOpt() : currentDate;
      let startDate = getStartOfTheDate(getNewDate(), { unit: 'month' });
      let endDate = getEndOfTheDate(getNewDate(), { unit: 'month' });
      viewTitle = dayjs(startDate).format('MMMM-YYYY');

      if (selectedViewType === viewMap.year) {
        startDate = getStartOfTheDate(currentDate, { unit: 'year' });
        endDate = getEndOfTheDate(currentDate, { unit: 'year' });
        viewTitle = dayjs(startDate).format('YYYY');
      }
      if (selectedViewType === viewMap.month) {
        startDate = getStartOfTheDate(currentDate, { unit: 'month' });
        endDate = getEndOfTheDate(currentDate, { unit: 'month' });
        viewTitle = dayjs(startDate).format('MMMM-YYYY');
      }
      if (selectedViewType === viewMap.week) {
        startDate = getStartOfTheDate(currentDate, { unit: 'week' });
        endDate = getEndOfTheDate(currentDate, { unit: 'week' });
        viewTitle = `${dayjs(startDate).format('MMM DD')} - ${dayjs(
          endDate
        ).format('MMM DD, YYYY')}`;
      }

      const current = {
        startDate,
        endDate,
      };
      setSelectedDate(viewTitle);
      fetchRecord(current, selectedViewType);
    },
    [viewType, selectedDate]
  );

  const handleViewSelect = useCallback(
    (e) => {
      const { target: { value } = {} } = e;
      currentDate = dayjs();
      setViewType(value);
      handleIconClick(value);
    },
    [viewType]
  );

  useEffect(() => {
    handleIconClick(viewType);
  }, []);

  const onChangeEndDate = useCallback(
    (newValue) => {
      setCustomEndDate(newValue);
      fetchRecord(
        {
          startDate: dayjs(customStartDate).format('YYYY-MM-DD'),
          endDate: dayjs(newValue).format('YYYY-MM-DD'),
        },
        viewMap.custom
      );
    },
    [customEndDate, customStartDate]
  );
  const onChangeStartDate = useCallback(
    (newValue) => {
      setCustomStartDate(newValue);

      if (
        dayjs(newValue).isBefore(dayjs(customEndDate)) ||
        dayjs(newValue).isSame(dayjs(customEndDate))
      )
        fetchRecord(
          {
            startDate: dayjs(newValue).format('YYYY-MM-DD'),
            endDate: dayjs(customEndDate).format('YYYY-MM-DD'),
          },
          viewMap.custom
        );
    },
    [customEndDate, customStartDate]
  );

  const customDatePicker = useCallback(
    () => (
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <MobileDatePicker
          label="From"
          defaultValue={dayjs(customStartDate)}
          value={dayjs(customStartDate)}
          onChange={(newValue) => onChangeStartDate(newValue)}
          format={dateFormats.YYYYMMDD}
          slotProps={{
            textField: {
              size: 'small',
              style: { width: 115, textAlign: 'center' },
            },
          }}
        />
        <MobileDatePicker
          sx={{ ml: 1, mr: 2 }}
          label="To"
          defaultValue={dayjs(customStartDate)}
          minDate={dayjs(customStartDate)}
          value={dayjs(customEndDate)}
          format={dateFormats.YYYYMMDD}
          onChange={(newValue) => onChangeEndDate(newValue)}
          slotProps={{
            textField: {
              size: 'small',
              style: { width: 115, textAlign: 'center' },
            },
          }}
        />
      </Box>
    ),
    [customEndDate, customStartDate]
  );

  // const handleBackIconClick = useCallback(() => {
  //   navigate(-1);
  // }, [navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      {patientData && (
        <Box sx={{ display: 'flex', mt: 1, mb: 2, alignItems: 'center' }}>
          {/* <IconButton
            variant="secondary"
            sx={{
              boxShadow: 'none',
              padding: 0,
              minWidth: 'unset',
              backgroundColor: 'transparent',
              borderRadius: '50%',
            }}
            onClick={handleBackIconClick}
          >
            <img
              src={BackIcon}
              alt="login"
              style={{
                cursor: 'pointer',
                padding: '6px',
                width: 30,
                height: 30,
              }}
            />
          </IconButton> */}
          <Box>
            <Typography sx={{ ml: 1, fontSize: '0.8rem' }} variant="h7">
              {patientData?.name}
            </Typography>
            <Typography
              sx={{ ml: 1, fontSize: '08px', color: palette.primary.main }}
              variant="body2"
            >
              {dayjs(patientData?.dob).format(dateFormats.MMDDYYYY)}
            </Typography>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'end',
          alignItems: 'center',
          mb: 1,
        }}
      >
        {viewType === 'custom' ? (
          customDatePicker()
        ) : (
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <ArrowLeftIcon
              id="left-icon"
              onClick={() => handleIconClick(viewType, '-')}
            />
            <CalendarDatePicker
              key="iconClickCount"
              selectedDate={selectedDate}
            />
            <ArrowRightIcon
              id="right-icon"
              onClick={() => handleIconClick(viewType, '+')}
            />
          </Box>
        )}
        <Box>
          <Select
            data={viewOptions}
            onChange={handleViewSelect}
            defaultValue="month"
            size="small"
            variant="outlined"
            fullWidth
            style={{ paddingRight: '10px' }}
            labelAccessor="name"
            valueAccessor="code"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChartHeader;
