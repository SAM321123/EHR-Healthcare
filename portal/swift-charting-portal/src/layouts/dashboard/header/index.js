/* eslint-disable no-unused-vars */
import { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

import { DRAWER_WIDTH, HEADER_DESKTOP, HEADER_MOBILE } from 'src/lib/constants';
import palette from 'src/theme/palette';
import { getImageUrl, getRouteName, getUserRole } from 'src/lib/utils';
import Typography from 'src/components/Typography';
import { useLocation } from 'react-router-dom';
import { bgBlur } from '../../../utils/cssStyles';
import { Iconify } from '../../../components/iconify';
import AccountPopover from './AccountPopover';
import NotificationsPopover from './NotificationsPopover';
import Searchbar from './Searchbar';

const StyledRoot = styled(AppBar)(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  boxShadow: 'none',
  [theme.breakpoints.up('lg')]: {
    // width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
  },
  backgroundColor: palette.background.paper,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(1.812, 5),
    paddingLeft: '16px',
    paddingRight: '16px',
  },
}));

// ----------------------------------------------------------------------

export default function Header({ onOpenNav = () => {}, userData }) {
  const defaultImageUrl = useMemo(() => {
    const selectedClinic = userData?.practice?.logo?.name;
    return getImageUrl(selectedClinic, {isPublic: true});
  }, []);
const location=  useLocation()

  const userRole = getUserRole();

  return (
    <StyledRoot sx={{position:'relative'}}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            display: { lg: 'none' },
          }}
        >
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
        <Typography style={{fontWeight:600,fontSize:20}} color={palette.background.main}>{getRouteName(location.pathname)}</Typography>
        <div >
              {location.pathname === '/dashboard' && <Searchbar />}
          </div>
        </div>
       

        <Box sx={{ flexGrow: 1 }} />
        <Stack
          direction="row"
          alignItems="center"
          sx={{gap:1.5}}
          spacing={{
            xs: 0.5,
            sm: 1,
          }}
        >
          {userRole !== "superAdmin" && (<NotificationsPopover />)} 
          <AccountPopover />
        </Stack>
      </StyledToolbar>
      <Divider />
    </StyledRoot>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
