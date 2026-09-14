import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import BoxMUI from '@mui/material/Box';

const Box = forwardRef(({ children = null, ...props }, ref) => (
  <BoxMUI ref={ref} {...props}>
    {children}
  </BoxMUI>
));
Box.displayName = 'Box';

Box.propTypes = {
  children: PropTypes.node,
};

export default Box;
