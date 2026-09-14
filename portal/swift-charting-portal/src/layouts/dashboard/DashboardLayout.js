/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
//
import { HEADER_DESKTOP, HEADER_MOBILE } from 'src/lib/constants';
import Loader from 'src/components/Loader';
import { isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import useAuthUser from 'src/hooks/useAuthUser';
import Box from 'src/components/Box';
import Nav from './nav';
import Header from './header';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')({
  display: 'flex',
  // height: '100%',
  overflow: 'scroll',
});

const Main = styled('div')(({ theme }) => ({
  // flexGrow: 1,
  overflow: 'auto',
  flex:1,
  // height: '100%',
  padding: '10px',
  // paddingTop: HEADER_MOBILE + 14,
  display: 'flex',
  flexDirection: 'column',
  // paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    // paddingTop: HEADER_DESKTOP + 14,
    paddingLeft: theme.spacing(3.75),
    paddingRight: theme.spacing(2.5),
  },
  backgroundColor: palette.background.paper,
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [user, ,loading,,,validateToken,userData] = useAuthUser();

  useEffect(()=> {
    validateToken();
  }, [])

  // TODO: will uncomment this useEffect once api is stable
  // useEffect(() => {
  //   if (error) {
  //     navigate(UIRoutes.login);
  //   }
  // }, [error]);

  return loading || isEmpty(userData) ? (
    <Loader loading={loading} />
  ) : (
    <div style={{display:'flex'}}>
      
      <Nav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
      <Header onOpenNav={() => setOpen(true)} userData={user}/>
      <Box sx={{marginTop:'30px'}}>
        <Outlet />
        </Box>
      </Main>
    </div>
  );
}
