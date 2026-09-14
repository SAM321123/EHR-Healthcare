import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as DatePickerMUI } from '@mui/x-date-pickers/DatePicker';
import FormControl from '@mui/material/FormControl';
import { convertWithTimezone } from 'src/lib/utils';
import { FormLabel } from '@mui/material';
import palette from 'src/theme/palette';

const DatePicker = ({
  label,
  register,
  setValue,
  defaultValue,
  control,
  required,
  labelProps = {},
  ...restProps
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Controller
      control={control}
      {...register}
      render={({ field, fieldState: { error } }) => {
        const valueData = {};
        const { ref } = field;
        if (field?.value && typeof field?.value === 'string') {
          valueData.value = dayjs(convertWithTimezone(field.value));
        }
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
            {label && (
              <FormLabel
                required={required?.value}
                sx={{
                  fontSize: 12,
                  lineHeight: '18px',
                  fontWeight: 500,
                  color: palette.text.primary,
                  marginBottom: '4px',
                  ...labelProps,
                }}
              >
                {label}
              </FormLabel>
            )}

            <DatePickerMUI
              {...field}
              {...valueData}
              slotProps={{
                textField: {
                  disabled: restProps.disabled,
                  fullWidth: true,
                  error: error?.message,
                  helperText: error?.message,
                  size: 'small',
                  inputRef: ref,
                  required: required?.value,
                },
              }}
              // label={label}
              name={register?.name}
              {...restProps}
              sx={{
                '& .MuiFormLabel-root': {
                  fontSize: '14px',
                },
                '& .MuiInputBase-root': {
                  padding: '13px 12px !important',
                },
                '& .MuiSvgIcon-root': {
                  color: palette.text.offGray,
                },
                '& input::placeholder': {
                  fontSize: '12px',
                  color: palette.text.secondary,
                  lineHeight: '18px',
                  fontWeight: 400,
                },
                '& input': {
                  padding: '0px !important',
                },
              }}
            />
          </FormControl>
        );
      }}
    />
  </LocalizationProvider>
);
DatePicker.defaultProps = {
  label: '',
  register: () => {},
  setValue: () => {},
};

DatePicker.propTypes = {
  label: PropTypes.string,
  register: PropTypes.func,
  setValue: PropTypes.func,
};

export default DatePicker;
