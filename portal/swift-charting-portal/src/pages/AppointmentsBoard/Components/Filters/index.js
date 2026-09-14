/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useState } from 'react';

import './filters.scss';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DatePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import Box from 'src/components/Box';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Typography from 'src/components/Typography';
import { getEndOfTheDate, getNewDate, getStartOfTheDate} from 'src/lib/utils';

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

const CalendarDatePicker = ({ handleFilter, date, setDate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = useCallback(
    (newDate) => {
      setDate(newDate);
      handleFilter({
        startDate: getStartOfTheDate(newDate, { unit: 'day' }),
        endDate: getEndOfTheDate(newDate, { unit: 'day' }),
      });
    },
    [handleFilter, setDate]
  );

  const handleDatePickerVisibility = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="date-wrapper">
        <DatePicker
          open={isOpen}
          onClose={handleDatePickerVisibility}
          value={date}
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
          onClick={handleDatePickerVisibility}
          style={{ width: '110px' }}
        >
          {getNewDate(date).format("MMM D, YYYY")}
        </Typography>
      </div>
    </LocalizationProvider>
  );
};

const Filters = ({ handleFilter = {} }) => {
  const [date, setDate] = useState(getNewDate().toDate());

  const handleIconClick = useCallback(
    (e) => {
      if (e) {
        const iconId = e?.currentTarget.id;
        let newDate;
        if (iconId === 'left-icon') {
          newDate = getNewDate(date).subtract(1, 'day').toDate();
        } else {
          newDate = getNewDate(date).add(1, 'day').toDate();
        }
  
        const startDate = getStartOfTheDate(getNewDate(newDate), { unit: 'day' });
        const endDate = getEndOfTheDate(getNewDate(newDate), { unit: 'day' });
        
        setDate(newDate);
        
        handleFilter({
          startDate,
          endDate,
        });      
      }
    },
    [handleFilter, date]
  );

  useEffect(() => {
    handleIconClick();
  }, [handleIconClick]);

  return (
    <div
      className="dashboard-filter-header-section"
      data-testid="filters-main-component"
    >
      <div className="heading" data-testid="filtersHeading">
        Appointments
      </div>
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
            date={date}
            setDate={setDate}
            handleFilter={handleFilter}
          />
          <ArrowRightIcon
            id="right-icon"
            onClick={handleIconClick}
            className="icon-wrapper"
          />
        </Box>
      </div>
    </div>
  );
};

export default Filters;
