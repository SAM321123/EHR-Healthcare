import Chip from '@mui/material/Chip';

import * as React from 'react';
import PropTypes from 'prop-types';

import TextField from '@mui/material/TextField';
import Autocomplete from '../Autocomplete';

const TagsInput = ({
  variant,
  label,
  register,
  control,
  setValue,
  loading,
  onSearch,
  multiple = true,
  ...restProps
}) => (
    <Autocomplete
      size="small"
      id={variant}
      freeSolo
      multiple={multiple}
      renderTags={(tagValue, getTagProps) => tagValue?.map((option, index) => (
        <Chip key={option} variant="outlined" label={option} {...getTagProps({ index })} />
      ))}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          
          required={restProps?.required?.value}
          InputProps={{
            ...params.InputProps,
          }}
          size="small"
        />
      )}
      {...restProps}
      // eslint-disable-next-line no-nested-ternary
      sx={{
        '& .MuiFormLabel-root': {
          fontSize: '14px',
        },
      }}
    />
);

TagsInput.defaultProps = {
  variant: 'combo-box-demo',
  label: '',
  register: {},
  error: '',
  loading: false,
};

TagsInput.propTypes = {
  variant: PropTypes.string,
  label: PropTypes.string,
  register: PropTypes.instanceOf(Object),
  error: PropTypes.string,
  loading: PropTypes.bool,
};

export default TagsInput;
