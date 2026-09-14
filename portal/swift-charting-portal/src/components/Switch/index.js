import React from 'react';
import PropTypes from 'prop-types';
import FormControlLabel from '@mui/material/FormControlLabel';
import MUISwitch from '@mui/material/Switch';

const SwitchLabel = ({
  label,
  onChange,
  disabled = false,
  checked,
  key,
  ...restProps
}) => (
  <FormControlLabel
    key={key}
    control={
      <MUISwitch
        key={key}
        size="small"
        sx={{ marginLeft: 1 }}
        checked={checked}
        inputProps={{ 'aria-label': 'controlled' }}
        onChange={onChange}
        disabled={disabled}
        {...restProps}
      />
    }
    label={label}
  />
);

SwitchLabel.defaultProps = {
  label: '',
  labelPlacement: 'end',
  register: {},
};

SwitchLabel.propTypes = {
  label: PropTypes.string,
  labelPlacement: PropTypes.string,
  register: PropTypes.instanceOf(Object),
};

export default React.memo(SwitchLabel);
