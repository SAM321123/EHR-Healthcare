import React from 'react';

import { Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import Slider from 'src/components/Slider';
import Typography from 'src/components/Typography';

const FormSlider = ({
  textLabel,
  setValue,
  name,
  register,
  control,
  ...restProps
}) => (
  <Controller
    control={control}
    {...register}
    render={({ field, fieldState: { error } }) => {
      const { value, onChange } = field;
      return (
        <FormControl
          fullWidth
          size="small"
          {...restProps}
          error={error}
          {...error}
          sx={{
            '& .MuiFormLabel-root': {
              fontSize: '14px',
            },
          }}
        >
          <Typography>{textLabel}</Typography>
          <Slider
            onChange={(e) => onChange(e?.target?.value)}
            value={value}
            fullWidth
            {...restProps}
          />
        </FormControl>
      );
    }}
  />
);
export default FormSlider;
