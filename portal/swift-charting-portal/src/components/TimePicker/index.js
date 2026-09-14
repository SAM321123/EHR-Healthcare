import React from 'react';
import PropTypes from 'prop-types';

import { TimeField as MuiTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';

const TimePicker = ({
  index,
  label,
  text,
  initialTime,
  isClosed,
  onTimeChange,
  required,
  ...restprops
}) => (
  <MuiTimePicker
    orientation="portrait"
    slotProps={{
      textField: { size: 'small' },
    }}
    disabled={isClosed}
    label={text}
    required={required}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {/* <Loader type="circular" size={15} loading={loading} /> */}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
    {...restprops}
  />
);

TimePicker.defaultProps = {
  label: '',
  initialTime: dayjs(),
  isClosed: false,
  onTimeChange: () => { },
};

TimePicker.propTypes = {
  index: PropTypes.number.isRequired,
  label: PropTypes.string,
  initialTime: PropTypes.instanceOf(dayjs),
  isClosed: PropTypes.bool,
  onTimeChange: PropTypes.func,
};

export default TimePicker;
