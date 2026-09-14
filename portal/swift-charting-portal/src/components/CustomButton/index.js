import React from 'react';
import PropTypes from 'prop-types';
import MUIButton from '@mui/material/Button';
import { buttonStyle } from 'src/theme/buttonStyle';

const CustomButton = ({
  onClick,
  label,
  variant,
  sx,
  children,
  ...restProps
}) => (
  <MUIButton
    key={label}
    onClick={onClick}
    sx={{
      whiteSpace: 'nowrap',
      textAlign: 'center',
      ...sx,
    }}
    variant={variant}
    {...restProps}
  >
    {label}
    {children}
  </MUIButton>
);

CustomButton.defaultProps = {
  label: '',
  onClick: () => {},
  sx: {},
  variant: 'primary',
  children: <span />,
};

CustomButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  sx: PropTypes.objectOf(),
  variant: PropTypes.string,
  children: PropTypes.node,
};

export default CustomButton;
