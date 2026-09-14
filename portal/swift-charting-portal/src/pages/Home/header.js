/* eslint-disable no-unused-vars */
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from 'src/assets/images/logo.png';
import palette from 'src/theme/palette';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { Iconify } from 'src/components/iconify';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { Link } from 'react-router-dom';

const drawerWidth = 240;
const navItems = [{label:'Home',link:''}, {label:'About Us',link:''},{label:'Our Services',link:''}, {label:'Contact Us',link:''},{label:'Log in',link:UI_ROUTES.login}];

function DrawerAppBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
             <Box className="drawer-logo-wrapper" sx={{display:'flex',justifyContent:'center',padding:'15px 0px'}}>      <img className='client-logo' src={logo} alt="logo" /></Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <Link className='linkTags' {...(item?.link?{to:`/${item.link}`}:{})}><ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box className="header-wrapper" sx={{backgroundColor:'#EFF8FF'}}>
    <Box className="container" sx={{ display: 'flex'}}>
      <CssBaseline />
      <AppBar component="nav" sx={{backgroundColor:'#EFF8FF',boxShadow:'none',position:'relative',padding:0}}>
        <Toolbar sx={{padding:0}} className='app-toolbar'>
          <div className='hamburger'>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ mr: 2,  display: { xs: 'block', sm: 'block', md: 'none' }  }}
          >
            {/* <MenuIcon sx={{color:palette.background.main}} /> */}
            <Iconify icon="vaadin:menu" sx={{fontSize:30,color:palette.background.main}}/>
          </IconButton>
          </div>
          <Box sx={{ flexGrow: 1, display: { sm: 'block' } }}>
              <img className='client-logo' src={logo} alt="logo" />
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex'},gap:3}}>
          <Box className="menu-item-wrapper" sx={{ display: { xs: 'none', sm: 'none',md:'flex' }, gap:3 ,alignItems:'center'}}>
            {navItems.map((item) => (
             <Link className='linkTags' key={item.label} {...(item?.link?{to:`/${item.link}`}:{})}> <Typography className='menu-item'  sx={{ color: palette.text.dark,fontSize:18,fontWeight:400,lineHeight:'28.5px' }}>
                {item.label}
              </Typography>
              </Link>
            ))}
          </Box>
          <LoadingButton
              id="bookbtn"
              size="medium"
              type="submit"
              label="Book Appointment"
              className="bookbtn"
            />
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          className='drawer-main'
          container={container}
          variant="temporary"
          anchor='right'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            padding:0,
            display: { xs: 'block', sm: 'block', md: 'none' } ,
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

    </Box>
    </Box>
  );
}

export default DrawerAppBar;