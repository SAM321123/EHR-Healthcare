import React from 'react';
import { Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';

import Esignature from 'src/components/E-Signature';

const FormEsignature = ({
  register,
  control,
  gridProps,
  // setValue,
  // name,
  defaultValue,
  required,
  label='',
}) => (
  <Controller
    control={control}
    {...register}
    rules={{ required: required && 'Signature is required.' }}
    render={({ field: { value = '', onChange }, fieldState: { error } }) => (
      <Grid item xs={12} md={6} {...gridProps}>
        <FormControl sx={{ mt: 1, width: '100%' }}>
          <div>
            <Esignature
              onChange={onChange}
              defaultValue={defaultValue || value}
              error={error}
              label={label}
            />
            {error && (
              <span style={{ fontSize: '14px', color: '#FF4842' }}>
                {error.message}
              </span>
            )}
          </div>
        </FormControl>
      </Grid>
    )}
  />
);

FormEsignature.defaultProps = {
  type: 'signature',
  error: '',
  defaultValue: '',
  register: {},
};

FormEsignature.propTypes = {
  type: PropTypes.string,
  error: PropTypes.string,
  defaultValue: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default FormEsignature;
