import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const TextInput = ({
  sx = {},
  ...restProps
} = {}) => (
      <TextField
        size="small"
        id="outlined-basic"
        variant="filled"
        fullWidth
        sx={{
          '& .MuiFormLabel-root': {
            fontSize: '14px',
          },
          ...sx,
        }}
        {...restProps}
      />
  );

TextInput.defaultProps = {
  type: 'text',
  disabled: false,
  error: '',
  required: false,
  formVariant: 'outlined-basic',
  variant: 'outlined',
  InputProps: {},
};

TextInput.propTypes = {
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  formVariant: PropTypes.string,
  variant: PropTypes.string,
  InputProps: PropTypes.instanceOf(Object),
};

export default TextInput;
