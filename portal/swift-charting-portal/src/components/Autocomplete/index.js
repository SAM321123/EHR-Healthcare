import PropTypes from 'prop-types';
import { useMemo } from 'react';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { FormLabel } from '@mui/material';
import AutocompleteMUI from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import palette from 'src/theme/palette';
const AutoComplete = ({
  variant,
  data,
  label,
  name,
  getOptions,
  loading,
  multiple,
  labelAccessor,
  placeholder,
  onSearch,
  onChange,
  ...restProps
}) => {
  const { getOptionLabel, value } = restProps || {};
  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined && value !== '';
  const renderMultiSelectOptions = useMemo(
    () => ({
      renderOption: (props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {getOptionLabel(option)}
        </li>
      ),
    }),
    [getOptionLabel]
  );

  return (
    <AutocompleteMUI
      id={variant}
      options={data}
      onFocus={getOptions}
      fullWidth
      multiple={multiple}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      {...(multiple ? renderMultiSelectOptions : {})}
      renderInput={(params) => (
        <>
        {label && <FormLabel >{label}</FormLabel>}
        <TextField
          {...params}
          // label={label}
          onChange={onSearch}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {/* <Loader type="circular" size={15} loading={loading} /> */}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          placeholder={hasValue ? '' : placeholder}
        />
        </>
      )}
      {...restProps}
      sx={{
        ...(restProps?.sx || {}),
        '& .MuiFormLabel-root': {
          fontSize: '12px',
          marginBottom: '4px',
          color: palette.text.primary,
          lineHeight: '18px',
          fontWeight: 500,
        },
        '& .MuiInputBase-root': {
          padding: '13px 12px !important',
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
        '& input::placeholder': {
          fontSize: '12px',
          color: palette.text.secondary,
          lineHeight: '18px',
          fontWeight: 400,
        },
        '& input': {
          padding: '0px !important',
        },
        '& .MuiInputBase-adornedStart': {
          padding: '10px 12px !important',
        },
        '& .Mui-selected': {
          fontWeight: 600,
          color: palette.background.main,
        },
      }}
      noOptionsText="Type to search"
    />
  );
};

AutoComplete.defaultProps = {
  variant: 'combo-box-demo',
  data: [],
  label: '',
  register: {},
  error: '',
  getOptions: () => {},
  loading: false,
};

AutoComplete.propTypes = {
  variant: PropTypes.string,
  data: PropTypes.instanceOf(Object),
  label: PropTypes.string,
  register: PropTypes.instanceOf(Object),
  error: PropTypes.string,
  getOptions: PropTypes.func,
  loading: PropTypes.bool,
};

export default AutoComplete;
