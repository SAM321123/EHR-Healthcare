import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Controller } from 'react-hook-form';

const FormTimeInput = ({
  label,
  register,
  setValue,
  defaultValue,
  gridProps,
  control,
  ...restProps
}) => {
  const [hour, setHour] = useState('');
  const [min, setMin] = useState('');
  const [meridiem, setMeridiem] = useState('');
  const handleHourChange = (e) => {
    setHour(e.target.value);
  };
  const handleMinChange = (e) => {
    setMin(e.target.value);
  };
  const handleMeridiemChange = (e) => {
    setMeridiem(e.target.value);
  };
  console.log('hour', `${hour}:${min} ${meridiem}`);

  useEffect(() => {
    if (hour && min && meridiem) {
      const data = `${hour}:${min} ${meridiem}`;
      setValue(register.name, data, {
        shouldValidate: true,
      });
    }
  }, [hour, min, meridiem]);

  const hourArray = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24,
  ];
  const minutesArray = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60,
  ];
  let styled = {
    color: '#333333',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '18px',
  };
  return (
    <Box sx={{ minWidth: 250 }}>
      <Controller
        control={control}
        {...register}
        render={({ field, fieldState: { error } }) => {
          return (
            <Box sx={{ display: 'flex', marginTop: '7px' }}>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '14px',
                  },
                }}
                {...restProps}
              >
                <FormLabel id="demo-simple-select-label" sx={styled}>
                  Hour
                </FormLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={hour}
                  onChange={handleHourChange}
                  sx={{ marginRight: '10px' }}
                >
                  {hourArray.map((elem) => {
                    return <MenuItem value={elem}>{elem}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '14px',
                  },
                }}
                {...restProps}
              >
                <FormLabel id="demo-simple-select-label" sx={styled}>
                  Min
                </FormLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={min}
                  onChange={handleMinChange}
                  sx={{ marginRight: '10px' }}
                >
                  {minutesArray.map((elem) => {
                    return <MenuItem value={elem}>{elem}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '14px',
                  },
                }}
                {...restProps}
              >
                <FormLabel id="demo-simple-select-label" sx={styled}>
                  AM
                </FormLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={meridiem}
                  onChange={handleMeridiemChange}
                >
                  <MenuItem value="AM">AM</MenuItem>
                  <MenuItem value="PM">PM</MenuItem>
                </Select>
              </FormControl>
            </Box>
          );
        }}
      />
    </Box>
  );
};
FormTimeInput.defaultProps = {
  label: '',
  register: () => {},
  setValue: () => {},
};

FormTimeInput.propTypes = {
  label: PropTypes.string,
  register: PropTypes.func,
  setValue: PropTypes.func,
};

export default FormTimeInput;
