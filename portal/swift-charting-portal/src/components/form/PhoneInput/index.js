import React from 'react';
import { Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import './phoneInput.css';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// eslint-disable-next-line import/no-extraneous-dependencies
import { PhoneNumberUtil } from 'google-libphonenumber';

import palette from 'src/theme/palette';
import { InputLabel } from '@mui/material';

const phoneUtil = PhoneNumberUtil.getInstance();

const FormPhoneInput = ({
  textLabel,
  register,
  control,
  gridProps,
  required,
  disabled = false,
}) => {
  const isValid = (value, { iso2 }, error) => {
    try {
      if (error) {
        return false;
      }
      if (value && value.lenght > 1) {
        const parsedNumber = phoneUtil.parse(value, iso2);
        return phoneUtil.isValidNumber(parsedNumber) ? true : 'Invalid Number';
      }
      return true;
    } catch (err) {
      return false;
    }
  };
  return (
    <Controller
      name={register?.name}
      control={control}
      rules={{
        required: required?.value ? 'Please enter mandatory field' : null,
      }}
      render={({ field: { ref, ...field }, fieldState: { error } }) => console.log("error >>>", error) || (
        <Grid item sm={12}  {...gridProps}>
              {textLabel && <InputLabel
            required={required}
            shrink={false}
            sx={{ fontSize:12,lineHeight:'18px',fontWeight:500,color:palette.text.primary,marginBottom:'4px','& .MuiFormLabel-root': {
              fontSize: '12px',
              marginBottom:'4px',
              lineHeight:'18px',
              fontWeight:500,
              color:palette.text.primary,
              
            }, }}
        >
            {textLabel}

            </InputLabel>}
          <PhoneInput
            {...field}
            specialLabel={` `}
            country='us'
            preferredCountries={['us']} // US appears at the top
            id={register?.name}
            name={register?.name}
            disabled={disabled}
            autoFormat
            inputStyle={{
              width: '100%',
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              color: error ? palette.error.main : palette.grey[800],
              paddingTop:13,
              paddingBottom:13,
              height:46.3,
            }}
            inputProps={{
              ref,
              required: true,
            }}
            isValid={(value, country) => isValid(value, country, error)}
          />
          {error && (
            <Typography
              sx={{
                color: palette.error.main,
                fontSize: '12px',
                mx: '14px',
                mt: '4px',
              }}
            >
              {error.message}
            </Typography>
          )}
        </Grid>
      )}
    />
  );
};
export default FormPhoneInput;
