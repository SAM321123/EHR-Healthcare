/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer } from '@mui/material';

import { DRAWER_WIDTH } from 'src/lib/constants';
// mock
import palette from 'src/theme/palette';
import useResponsive from '../../../hooks/useResponsive';
// components
import { Scrollbar } from '../../../components/scrollbar';
import { NavSection } from '../../../components/nav-section';
import navConfig from './config';

// ----------------------------------------------------------------------

export default function Nav({ openNav = false, onCloseNav = () => {} }) {
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Box
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
        paddingLeft:2.5,
        paddingTop:2.5
      }}
    >
      <NavSection data={navConfig} />
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: DRAWER_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
              backgroundColor: palette.background.paper,
              
            },
          }}
          sx={{ "& .MuiDrawer-paper": { borderWidth: 0,height:'fit-content',position:'relative' }}}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: DRAWER_WIDTH,border:'none',borderWidth:0 },
            backgroundColor: palette.background.paper,
          }}
          sx={{ "& .MuiDrawer-paper": { borderWidth: 0 }}}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};
