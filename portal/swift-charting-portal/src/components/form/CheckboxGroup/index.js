import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FormGroup, FormLabel, Grid } from '@mui/material';
import { Controller } from 'react-hook-form';
import palette from 'src/theme/palette';

const CheckboxGroup = ({
  label,
  register,
  name,
  gridProps,
  labelPlacement,
  form,
  control,
  setValue,
  options,
  ...restProps }) => {
    const handleChange = useCallback((value=[],onChange)=>(event)=>{
      if(event.target.checked){
        setValue(name, [...value,event.target.value])
        onChange([...value,event.target.value])
      }
      else{
        const valueIndex = value?.indexOf(event.target.value)
        if(valueIndex > -1){
          value.splice(valueIndex, 1)
          setValue(name, [...value])
          onChange([...value])
        }
      }
    }, [name, setValue]);

    return(
    <Controller
        name={name}
        control={control}
        {...register}
        defaultValue={[]}
        render={({ field }) => {
          const {value,onChange} =field
          return(
          <FormGroup sx={{ width: '100%', fontSize: '10px' ,           '& .MuiFormLabel-root': {
            fontSize: '12px',
            marginBottom:'4px',
            color:palette.text.primary,
            lineHeight:'18px',
            fontWeight:500,
          },
          '& .MuiCheckbox-root':{
            paddingTop:'9px !important',
          },
           '& .MuiTypography-root': {
            fontSize: '14px',
            lineHeight:'19.6px',
            fontWeight:500,
            padding:'0px !important',
            
          }}}>
           <FormLabel sx={{ mr: 2 }}>{restProps?.textLabel}</FormLabel>
          <Grid container spacing={2}>
            {options.map((option) => (
              <Grid key={option} item xs={12} sm={6} md={4}>
              <FormControlLabel
                key={option.value}
                control={<Checkbox {...field}
                onChange={handleChange(value,onChange)}
                checked={value?.includes(option?.value)}
                value={option.value} />}
                label={option.label}
              />
              </Grid>
            ))}
            </Grid>
          </FormGroup>
        )}}
        {...restProps}
      />

);}

CheckboxGroup.defaultProps = {
  options: [],
};

CheckboxGroup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.objectOf()),
};

export default CheckboxGroup;
