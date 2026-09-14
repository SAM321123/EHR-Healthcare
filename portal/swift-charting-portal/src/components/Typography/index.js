import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import TypographyMUI from '@mui/material/Typography';

const Typography = forwardRef(({ children = null, ...props }, ref) => (
  <TypographyMUI
    ref={ref}
    fontFamily="Poppins"
    {...props}
    data-testid="typography-test"
  >
    {children}
  </TypographyMUI>
));
Typography.displayName = 'Typography';

Typography.propTypes = {
  children: PropTypes.node,
};

export default Typography;
