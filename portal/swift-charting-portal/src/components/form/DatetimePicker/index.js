import React from 'react';
import PropTypes from 'prop-types';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as MuiDesktopDatePicker } from '@mui/x-date-pickers';
import { FormControl, FormLabel, Grid } from '@mui/material';
import { Controller } from 'react-hook-form';
import palette from 'src/theme/palette';
import dayjs from 'dayjs';
import { convertWithTimezone } from 'src/lib/utils';
const DateTimePicker = ({
  label,
  register,
  setValue,
  defaultValue,
  gridProps,
  control,
  labelProps = {},
  ...restProps
}) => (
  <Grid>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        control={control}
        {...register}
        render={({ field, fieldState: { error } }) => {
          const { ref } = field;
          const valueData = {};
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
                  required={restProps?.required?.value}
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
              <MuiDesktopDatePicker
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
                  },
                }}
                name={register?.name}
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
  </Grid>
);
MuiDesktopDatePicker.defaultProps = {
  label: '',
  register: () => {},
  setValue: () => {},
};
 
MuiDesktopDatePicker.propTypes = {
  label: PropTypes.string,
  register: PropTypes.func,
  setValue: PropTypes.func,
};

export default DateTimePicker;
