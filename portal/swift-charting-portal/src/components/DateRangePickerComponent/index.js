import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, useTheme, IconButton } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { get, isFunction } from '../../lib/lodash';
import './dateRangePicker.scss';
import Iconify from '../iconify/Iconify';

dayjs.extend(customParseFormat);

const DateRangePickerComponent = ({
  onChange,
  defaultFrom = null,
  defaultTo = null,
  reduxFrom,
  reduxTo,
  minDate,
  maxDate,
  tableId,
}) => {
  const theme = useTheme();
  const tableHeaderColors = get(theme, 'palette.table.tableHeader', {});
 
  const [from, setFrom] = useState(
    reduxFrom
      ? dayjs(reduxFrom, 'MM/DD/YYYY')
      : defaultFrom
      ? dayjs(defaultFrom, 'MM/DD/YYYY')
      : null
  );
  const [to, setTo] = useState(
    reduxTo
      ? dayjs(reduxTo, 'MM/DD/YYYY')
      : defaultTo
      ? dayjs(defaultTo, 'MM/DD/YYYY')
      : null
  );
 
  // Sync state with redux values if they change
  useEffect(() => {
    if (reduxFrom) setFrom(dayjs(reduxFrom, 'MM/DD/YYYY'));
    if (reduxTo) setTo(dayjs(reduxTo, 'MM/DD/YYYY'));
  }, [reduxFrom, reduxTo]);
 
    // ✅ Reset date range when table changes
    useEffect(() => {
      setFrom(null);
      setTo(null);
      if (typeof onChange === "function") {
        onChange({ from: null, to: null });
      }
    }, [tableId]); // Reset when switching tables
  const handleFromChange = (newValue) => {
    setFrom(newValue);
    if (isFunction(onChange)) {
      onChange({
        from: newValue ? newValue.format('YYYY-MM-DD') : null,
        to: to ? to.format('YYYY-MM-DD') : null,
      });
    }
  };
 
  const handleToChange = (newValue) => {
    setTo(newValue);
    if (isFunction(onChange)) {
      onChange({
        from: from ? from.format('YYYY-MM-DD') : null,
        to: newValue ? newValue.format('YYYY-MM-DD') : null,
      });
    }
  };
 
  const handleClear = () => {
    setFrom(null);
    setTo(null);
    if (isFunction(onChange)) {
      onChange({ from: null, to: null });
    }
  };
 
  return (
    <div className="date-range-picker">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start Date Picker */}
       
        <DatePicker
          placeholder="Start Date"
          className='date-picker-style'
          value={from}
          onChange={handleFromChange}
          minDate={minDate ? dayjs(minDate, 'MM/DD/YYYY') : undefined}
          maxDate={to || (maxDate ? dayjs(maxDate, "MM/DD/YYYY", true) : null)} // ✅ Updated: Restrict future dates based on `to`
          format="MM/DD/YYYY"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
            />
          )}
        />
 
        <span style={{ margin: '0 8px' }}> to </span>
 
        {/* End Date Picker */}
        <DatePicker
          placeholder="End Date"
          className='date-picker-style'
          value={to}
          onChange={handleToChange}
          minDate={from || (minDate ? dayjs(minDate, "MM/DD/YYYY", true) : null)} // ✅ Updated: Restrict past dates based on `from`
          maxDate={maxDate ? dayjs(maxDate, 'MM/DD/YYYY') : undefined}
          format="MM/DD/YYYY"
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              className='date-picker-style'
            />
          )}
        />
      </LocalizationProvider>
 
      {/* Clear Icon */}
      {(from || to) && (
        <IconButton onClick={handleClear} className="clear-icon">
          <Iconify icon="eva:close-outline" />
        </IconButton>
      )}
    </div>
  );
};


DateRangePickerComponent.propTypes = {
  onChange: PropTypes.func,
  defaultFrom: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  defaultTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  reduxFrom: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  reduxTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  minDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default React.memo(DateRangePickerComponent);
