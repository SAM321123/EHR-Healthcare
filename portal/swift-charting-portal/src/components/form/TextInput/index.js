/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import TextField from 'src/components/TextInput';

import {
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Controller } from 'react-hook-form';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { showSnackbar } from 'src/lib/utils';

const TextInput = ({
  type,
  disabled,
  required,
  formVariant,
  InputProps,
  register,
  label,
  textLabel,
  control = {},
  defaultValue,
  setValue,
  sx = {},
  isShrink = false,
  showLabel = true,
  placeholder = 'Enter here',
  copyToClipboard = false, 
  displaySuffix = '',
  ...restProps
} = {}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleOnShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const handleCopy = useCallback(
    (value) => {
      const fullValue = value ? `${value}${displaySuffix}` : '';
      if (!fullValue) return;
      navigator.clipboard.writeText(fullValue);
      showSnackbar({ message: 'Copied to clipboard', severity: 'success' });
    },
    [displaySuffix]
  );

  return (
    <Controller
      control={control}
      {...register}
      render={({ field, fieldState: { error } }) => {
        let shrinkProps = {};
        const { value } = field;
        if (field.value || isShrink) {
          shrinkProps = { shrink: true };
        }
        return (
          <div style={{ width: '100%' }}>
            {textLabel && (
              <InputLabel
                required={restProps?.item?.required?.value}
                shrink={false}
                sx={{
                  fontSize: 12,
                  lineHeight: '18px',
                  fontWeight: 500,
                  color: palette.text.primary,
                  marginBottom: '4px',
                  '& .MuiFormLabel-root': {
                    fontSize: '12px',
                    marginBottom: '4px',
                    lineHeight: '18px',
                    fontWeight: 500,
                    color: palette.text.primary,
                  },
                }}
              >
                {typeof  textLabel ==='function' ? textLabel():textLabel}
              </InputLabel>
            )}
            <TextField
              size="small"
              type={showPassword ? 'text' : type}
              id="outlined-basic"
              placeholder={placeholder}
              variant="outlined"
              disabled={disabled}
              required={required}
              fullWidth
              InputLabelProps={{ ...shrinkProps }}
              InputProps={
                type === 'password'
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleOnShowPassword} edge="end">
                            <Iconify
                              icon={
                                showPassword
                                  ? 'eva:eye-fill'
                                  : 'eva:eye-off-fill'
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : copyToClipboard
                  ? {
                      ...InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleCopy(value)} edge="end">
                            <Iconify icon="eva:copy-outline" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  : InputProps
              }
              {...restProps}
              error={error}
              helperText={error?.message || null}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '13px 12px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: `1px solid ${palette.border.main}`,
                },
                '& .MuiInputBase-root ::placeholder': {
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: '18px',
                  color: palette.text.secondary,
                },
                ...sx,
              }}
              {...field}
              value={
                value === 0
                  ? 0
                  : value
                  ? `${value}${displaySuffix}`
                  : ''
              }
            />
          </div>
        );
      }}
    />
  );
};

TextInput.defaultProps = {
  type: 'text',
  disabled: false,
  error: '',
  required: false,
  formVariant: 'outlined-basic',
  variant: 'outlined',
  InputProps: {},
};

TextInput.propTypes = {
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  formVariant: PropTypes.string,
  variant: PropTypes.string,
  InputProps: PropTypes.instanceOf(Object),
};

export default TextInput;
