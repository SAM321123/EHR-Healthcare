import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MUICheckbox from '@mui/material/Checkbox';
import { Controller } from 'react-hook-form';
import palette from 'src/theme/palette';

const CheckboxLabel = ({
  label,
  textLabel,
  register,
  gridProps,
  labelPlacement,
  form,
  control,
  ...props
}) => (
  <Controller
    control={control}
    name={props.name}
    {...register}
    render={({ field }) => {
      const { value } = field;
      const extraProp = {};
      if (value) {
        extraProp.defaultChecked = value;
      }
      return (
        <FormGroup
          aria-label="position"
          row
          sx={{
            mt: props.mt,
            '& .MuiFormControlLabel-root': {
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              margin: 0,
            },
            '& .MuiFormControlLabel-label': {
              padding: '0px !important',
              fontSize: '12px !important',
              lineHeight: '18px !important',
              color: `${palette.text.primary} !important`,
              fontWeight: 500,
            },
            '& .MuiCheckbox-root': {
              padding: 0,
            },
          }}
        >
          <FormControlLabel
            control={
              <MUICheckbox
                {...props}
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                {...field}
                {...extraProp}
                sx={{
                  '&.MuiButtonBase-root:hover': {
                    bgcolor: 'transparent',
                  },
                  '&.MuiSvgIcon-root': {
                    fontSize: '20px',
                  },
                }}
              />
            }
            label={label || textLabel}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '14px',
              },
            }}
            labelPlacement={labelPlacement}
          />
        </FormGroup>
      );
    }}
  />
);

CheckboxLabel.defaultProps = {
  label: '',
  textLabel: '',
  register: {},
  labelPlacement: 'end',
};

CheckboxLabel.propTypes = {
  label: PropTypes.string,
  textLabel: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default CheckboxLabel;
