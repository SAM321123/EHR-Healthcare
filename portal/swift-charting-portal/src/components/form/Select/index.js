/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback } from 'react';
import isArray from 'lodash/isArray';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';

import { Controller } from 'react-hook-form';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Box from 'src/components/Box';
import { FormHelperText, FormLabel, Radio, Typography } from '@mui/material';
import get from 'lodash/get';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import palette from 'src/theme/palette';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import './select.css';

const FormSelect = ({
  variant,
  data,
  label,
  register,
  control,
  setValue,
  loading,
  onSearch,
  onChange: handleChange = () => {},
  defaultValue,
  valueAccessor = 'value',
  labelAccessor = 'label',
  getOptionLabel = () => {},
  multiple,
  options,
  validateSelection,
  sx,
  extraAPIParams,
  placeholder="Select",
  labelProps={},
  showRadio=true,
  disabled,
  ...restProps
}) => {
  const displayLabel = label || restProps?.textLabel;
  
  const menuProps = {
    PaperProps: { style: {maxWidth:600, maxHeight: '250px',boxShadow: `0px 0px 4px 0px #00000029`}},MenuListProps:{style:{padding:0},'& .Mui-disabled':{display:'none'} }};

  const handleValidateSelection = useCallback(
    (event, onChange) => {
      if (isFunction(validateSelection)) {
        const isSelectionValid = validateSelection(
          event.target.value,
          restProps
        );
        if (isSelectionValid) {
          onChange(event.target.value);
          handleChange(register?.name, event.target.value);
        }
      } else {
        onChange(event.target.value);
        handleChange(register?.name, event.target.value);
      }
    },
    [handleChange, register?.name, restProps, validateSelection]
  );
  return (
    <Controller
      control={control}
      {...register}
      render={({ field, fieldState: { error } }) => {
        const { onChange, value } = field;
        return (
          <FormControl
            hiddenLabel={!displayLabel}
            fullWidth
            size="small"
            {...restProps}
            error={error}
            {...error}
            sx={{
              '& .MuiFormLabel-root': {
                fontSize: '12px',
                marginBottom:'4px',
                color:palette.text.primary,
                lineHeight:'18px',
                fontWeight:500,
              },
              '& .MuiSelect-select':{
                padding:'13px 12px'
              },
              '& .MuiTypography-root':{
                fontSize: '12px',
                color:palette.text.secondary,
                lineHeight:'18px',
                fontWeight:400,
              },
              '& .MuiSvgIcon-root':{
                color:palette.text.offGray
              },
              '& .MuiButtonBase-root.MuiButtonBase-root':{
                display:'none'
              },
              '& .Mui-selected':{
                fontWeight:600,
                color:palette.background.main
            }
            }}
            label={displayLabel}
          >
            {displayLabel && (
              <FormLabel {...labelProps} id="demo-select-medium-label">
                {displayLabel}
              </FormLabel>
            )}
            <Select
            IconComponent={ExpandMoreIcon}
              labelId="demo-select-medium-label"
              id="demo-select-medium"
              {...(placeholder?{displayEmpty:true}:{})}
              multiple={multiple}
              {...field}
              // eslint-disable-next-line no-nested-ternary
              value={value ? cloneDeep(value) : multiple ? [] : ''}
              onChange={(event) => {
                handleValidateSelection(event, onChange);
              }}
              sx={{...sx, '& .Mui-disabled': {
                opacity: 0.5, // Increase specificity and use !important
                cursor: 'not-allowed',
              },
              '& .MuiMenu-list': {
                padding: 0,
              }}}
              MenuProps={menuProps}
              renderValue={
                multiple &&
                ((selected) => {
                  const selectedOptions = (data || options)?.filter(
                    (option) =>
                      selected.indexOf(get(option, valueAccessor)) > -1
                  );
                  if (selectedOptions?.length) {
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedOptions.map((item) => (
                          <Chip
                            size="small"
                            key={get(item, valueAccessor)}
                            label={
                              isArray(labelAccessor)
                                ? getOptionLabel(item)
                                : get(item, labelAccessor)
                            }
                          />
                        ))}
                      </Box>
                    );
                  }
                  return null;
                })
                // :(selected) => {           
                //    const selectedOption = (data || options)?.filter(
                //   (option) =>get(option, valueAccessor)===selected);
                //   return selectedOption?.[0]?.[labelAccessor]
                // }
              }
            disabled={disabled}
            >
            <MenuItem disabled value="">
            <Typography color="#777777">{placeholder}</Typography>
          </MenuItem>
              {(extraAPIParams?.options || data || options)?.map((item) => {
                const disabled = Object.prototype.hasOwnProperty.call(item, 'isActive') ? !item.isActive: false;
                const selectedValues = Array.isArray(value) ? value:[value];
                const isItemSelected = selectedValues.indexOf(get(item, valueAccessor)) > -1
               return <MenuItem
                  key={get(item, valueAccessor) || item.value}
                  value={get(item, valueAccessor) || item.label}
                  sx={{
                    fontSize: '14px',
                    height: multiple ? '36px' : 'auto',
                    paddingLeft: multiple && 'unset',
                    textWrap: 'wrap',
                    padding:'10px 16px',
                    gap:'6px',
                    lineHeight:'21px',
                      fontWeight:400,
                      color:palette.text.offGray,
                    '& .MuiRadio-root':{
                      padding:0,
                    color:palette.text.radio
                    },
                    '& .Mui-checked':{
                      color:palette.background.main
                    },
                    '&.Mui-selected': {
                      fontWeight: 600,
                      color: palette.background.main,
                      backgroundColor:palette.background.paper,
                    },  
                    '& .Mui-disabled':{
                      display:'none'
                    },
                    '& .MuiMenu-list':{
                      padding:0,
                    }               
                  }}
                  size="small"
                  disabled={disabled && !isItemSelected}
                >
                  {multiple && ( 
                    <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={
                      (value || []).indexOf(get(item, valueAccessor)) > -1
                    }
                  />
                  )} 
                  {isArray(labelAccessor)
                    ? getOptionLabel(item)
                    : `${get(item, labelAccessor)}`}
                </MenuItem>
      })}
            </Select>
            {error?.message && (<FormHelperText id="select-helper-text">
              {error?.message}
            </FormHelperText>)}
          </FormControl>
        );
      }}
    />
  );
};

export default FormSelect;
