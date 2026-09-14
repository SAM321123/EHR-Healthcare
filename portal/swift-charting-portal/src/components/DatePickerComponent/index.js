import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { TextField, IconButton, InputAdornment, FormControl, FormLabel, Box, Alert } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { get, isFunction } from '../../lib/lodash';
import Iconify from '../iconify/Iconify';
import palette from 'src/theme/palette';
 
const DatePickerComponent = (props) => {
  const {
    placeholder,
    onChange,
    defaultValue = null,
    reduxValue,
    height,
    name,
    minDate,
    maxDate,
    style,
  } = props;
  
  const theme = useTheme();
  const tableHeaderColors = get(theme, 'palette.table.tableHeader', {});
  
  const [selectedDate, setSelectedDate] = useState(
      reduxValue === undefined
      ? defaultValue
      ? dayjs(defaultValue)
      : null
      : dayjs(reduxValue)
  );
  
  console.log("eee--------",props)
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [cleared]);
  
  const handleDateChange = useCallback(
  (value) => {
    setSelectedDate(value);

    if (isFunction(onChange)) {
      if (value && dayjs(value).isValid()) {
        onChange(dayjs(value).format('YYYY-MM-DD'));
      } else {
        onChange(null);
      }
    }
  },
  [onChange]
);
 
  const handleClearDate = useCallback(() => {
    setSelectedDate(null);
    if (isFunction(onChange)) {
      onChange(null);
    }
  }, [onChange]);
 

  return (
    <Box sx={{ width: 'fit-content', display: 'inline-block', ...style }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} style={{...style}} >
        <DatePicker
          label= {name}
          inputFormat="MM/DD/YYYY"
          value={selectedDate}
          onChange={handleDateChange}
          minDate={minDate} // Today as the minimum date
          maxDate={maxDate} // One month from today as the maximum date
          style={{ backgroundColor: 'red'}}
          // style={{...style}}
          renderInput={(params) => (
            <TextField
              {...params}
              // fullWidth
              size="small"
              inputProps={{
                ...params.inputProps,
              //   placeholder: placeholder || 'MM/DD/YYYY', // 👈 set placeholder here
              }}
              sx={{
                '& .MuiInputBase-root': {
                  height,
                  fontSize: '11.68px',
                  backgroundColor: palette.background.paper,
                  border: `0.97px solid ${palette.border.main}`,
                  color: '#999999',
                },
                '& .MuiInputBase-input': {
                  padding: '8px',
                  color: tableHeaderColors?.searchInputColor,
                },
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    {selectedDate && (
                      <IconButton
                        size="small"
                        onClick={handleClearDate}
                        sx={{ p: 0.5 }}
                        data-testid="clear-icon"
                      >
                        <Iconify icon="eva:close-outline" width={16} height={16} />
                      </IconButton>
                  )}
                    {params.InputProps?.endAdornment}
                  </InputAdornment>
                ),
              }}
              data-testid="datepicker_input_test"
            />
          )}
        />
      </LocalizationProvider>
    </Box>

  );
};
 
DatePickerComponent.defaultProps = {
  placeholder: '',
  onChange: () => {},
};
 
DatePickerComponent.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any,
  reduxValue: PropTypes.any,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
 
export default React.memo(DatePickerComponent);
 
 