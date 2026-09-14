/* eslint-disable no-unused-vars */
import React from 'react';
import FormControl from '@mui/material/FormControl';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import { Controller } from 'react-hook-form';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';

import './textArea.scss';
import { Box, FormLabel, InputLabel } from '@mui/material';

const TextAreaInput = ({
  register,
  control,
  textLabel,
  placeholder,
  ...restProps
}) => (
  <Controller
    control={control}
    {...register}
    render={({ field, fieldState: { error } }) =>{
      const {value} = field
      return (
        <Box sx={{display:'flex',flexWrap:'wrap',flex:1}}>
          <FormControl fullWidth sx={{'& .textarea-input::placeholder': {
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight: 400,
                  lineHeight: '18px',
                  color:palette.text.secondary
                }}}>
          {textLabel && <FormLabel
              required={restProps?.item?.required?.value}
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

              </FormLabel>}
            <TextareaAutosize
              id="component-helper"
              aria-describedby="component-helper-text"
              minRows={3}
              maxRows={12}
              placeholder={placeholder || 'Enter here'}
              className={error ? 'textarea-input-error' : 'textarea-input'}
              style={{
                backgroundColor: 'transparent',
                ...(restProps.sx || {})
              }}
              {...restProps}
              {...field}
              value={value || ''}
            />
          </FormControl>
          {error && (
            <Typography
              sx={{ color: palette.error.main, fontSize: '12px', m: 1 }}
            >
              {error?.message}
            </Typography>
          )}
        </Box>
      )}}
  />
);

export default TextAreaInput;
