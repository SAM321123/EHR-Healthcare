import { forwardRef } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';

const ActionButton = forwardRef(({ label, children, ...restProps }, ref) => (
  <Button {...restProps} ref={ref}>
    {label || null}
    {children}
  </Button>
));

ActionButton.defaultProps = {
  label: '',
  variant: 'contained',
  children: <span />,
};

ActionButton.propTypes = {
  label: PropTypes.string,
  variant: PropTypes.string,
  children: PropTypes.node,
};

export default ActionButton;
