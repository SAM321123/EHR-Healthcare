import React from 'react';
import PropTypes from 'prop-types';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormControl } from '@mui/material';
import { Controller } from 'react-hook-form';
import TimePicker from 'src/components/TimePicker';

const FormTimePicker = ({
  label,
  register,
  setValue,
  defaultValue,
  gridProps,
  control,
  ...restProps
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Controller
      control={control}
      {...register}
      render={({ field, fieldState: { error } }) => {
        const { ref } = field;
        return (
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
            <TimePicker
              text={label}
              {...field}
              slotProps={{
                textField: {
                  disabled: restProps.disabled,
                  fullWidth: true,
                  error: error?.message,
                  helperText: error?.message,
                  size: 'small',
                  inputRef: ref,
                },
              }}
              name={register?.name}
              sx={{
                '& .MuiFormLabel-root': {
                  fontSize: '14px',
                },
              }}
              required={restProps?.required?.value}
            />
          </FormControl>
        );
      }}
    />
  </LocalizationProvider>
);
TimePicker.defaultProps = {
  label: '',
  register: () => { },
  setValue: () => { },
};

TimePicker.propTypes = {
  label: PropTypes.string,
  register: PropTypes.func,
  setValue: PropTypes.func,
};

export default FormTimePicker;
