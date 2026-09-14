import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import { Box } from '@mui/material';
//
import { StyledRootScrollbar, StyledScrollbar } from './styles';

// ----------------------------------------------------------------------
function Scrollbar({ children, sx, ...other }) {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <StyledRootScrollbar>
      <StyledScrollbar timeout={500} clickOnTrack={false} sx={sx} {...other}>
        {children}
      </StyledScrollbar>
    </StyledRootScrollbar>
  );
}

export default memo(Scrollbar);

Scrollbar.defaultProps = {
  sx: {},
  children: null,
};

Scrollbar.propTypes = {
  sx: PropTypes.instanceOf(Object),
  children: PropTypes.node,
};
