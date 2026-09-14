import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Checkbox, FormLabel } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import isArray from 'lodash/isArray';
import { useEffect, useState } from 'react';
import palette from 'src/theme/palette';
import './select.scss';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: '250px',
      width: '250px',
    },
  },
};

const Select = ({
  name,
  variant,
  data,
  label,
  control,
  loading,
  onChange,
  defaultValue,
  gridProps,
  size = 'small',
  valueAccessor = 'value',
  labelAccessor = 'label',
  getOptionLabel,
  options,
  showPlaceholder = false,
  placeholder,
  multiple = false,
  ...restProps
}) => {
  const [selectedValues, setSelectedValues] = useState(defaultValue || []);

  useEffect(() => {
    if (!multiple) {
      setSelectedValues(defaultValue);
    }
  }, [defaultValue, multiple]);

  const handleChange = (event) => {
    const { value } = event.target;
    setSelectedValues(value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <FormControl
      variant={variant}
      size={size}
      fullWidth
      sx={{
        '& .MuiFormLabel-root': {
          fontSize: '12px',
          marginBottom: '4px',
          color: palette.text.primary,
          lineHeight: '18px',
          fontWeight: 500,
        },
        '& .MuiSelect-select': {
          padding: '13px 12px',
        },
        '& .MuiTypography-root': {
          fontSize: '12px',
          color: palette.text.secondary,
          lineHeight: '18px',
          fontWeight: 400,
        },
        '& .MuiSvgIcon-root': {
          color: palette.text.offGray,
        },
        '& .MuiButtonBase-root.MuiButtonBase-root': {
          display: 'none',
        },
        '& .Mui-selected': {
          fontWeight: 600,
          color: palette.background.main,
        },
      }}
      {...restProps}
    >
      <FormLabel id="demo-select-medium-label">{label}</FormLabel>
      <MuiSelect
        name={name}
        labelId="demo-select-medium-label"
        id="demo-select-medium"
        className="mui-select"
        defaultValue={defaultValue}
        onChange={handleChange}
        MenuProps={MenuProps}
        placeholder="Select"
        multiple={multiple}
        {...(multiple ? {} : { value: selectedValues })}
        {...restProps}
      >
        {(data || options)?.map((item) => (
          <MenuItem
            key={item[valueAccessor] || item.value}
            value={item[valueAccessor] || item.label}
            sx={{
              fontSize: '14px',
              height: 'auto',
              textWrap: 'wrap',
            }}
            size="small"
          >
            {multiple && (
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selectedValues.includes(item[valueAccessor])}
              />
            )}
            {isArray(labelAccessor)
              ? getOptionLabel(item)
              : item[labelAccessor]}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
