import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// icons
import { Icon } from '@iconify/react';
// @mui
import { Box, Grid } from '@mui/material';

// ----------------------------------------------------------------------

const Iconify = forwardRef(({ icon, width = 20, sx, ...other }, ref) => (
  <Grid sx={{ display: 'flex' }}>
    <Box
      ref={ref}
      component={Icon}
      icon={icon}
      sx={{ width, height: width, ...sx }}
      {...other}
    />
  </Grid>
));

Iconify.defaultProps = {
  sx: {},
  width: 20,
  icon: null,
};

Iconify.propTypes = {
  sx: PropTypes.instanceOf(Object),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Iconify;
