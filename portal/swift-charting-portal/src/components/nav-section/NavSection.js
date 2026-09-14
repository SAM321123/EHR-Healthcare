/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import { Badge, Box, List, ListItemText } from '@mui/material';
import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  NavLink as RouterLink,
  generatePath,
  useLocation,
  useNavigate
} from 'react-router-dom';

import logo from 'src/assets/images/logo.png';
import { ChatContext } from 'src/context/chatContext';
import { roleTypes } from 'src/lib/constants';
import { getImageUrl, getUserRole } from 'src/lib/utils';
import palette from 'src/theme/palette';
// import {
//   assistantRoutes,
//   clinicAdminRoutes,
//   patientRoutes,
//   practitionerRoutes,
//   superAdminRoutes,
// } from 'src/routes';
import useLoggedInUser from 'src/hooks/useLoggedInUser';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { loggedInUserRoutes } from 'src/routes';
import DateTimeComponent from '../DateAndTimeComponent';
import { StyledNavItem, StyledNavItemIcon } from './styles';
import { GET_PRACTICE_DATA_SETTING } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

const updateMenu = (data, userRole) => {
  let filterMenu;
  filterMenu = data.filter((item) => loggedInUserRoutes?.includes(item?.path));
  // if (userRole === roleTypes.superAdmin) {
  //   filterMenu = data.filter((item) => superAdminRoutes.includes(item?.path));
  // } else if (userRole === roleTypes.patient) {
  //   filterMenu = data.filter((item) => patientRoutes.includes(item?.path));
  // } else if (userRole === roleTypes.clinicAdmin) {
  //   filterMenu = data.filter((item) => clinicAdminRoutes.includes(item?.path));
  // } else if (userRole === roleTypes.practitioner) {
  //   filterMenu = data.filter((item) => practitionerRoutes.includes(item?.path));
  //   // console.log('practitioner Routes------>', practitionerRoutes,data[1]?.path, filterMenu,practitionerRoutes.includes(data[1]?.path),practitionerRoutes.includes('/patient'))
  // } else {
  //   filterMenu = data.filter((item) => assistantRoutes.includes(item?.path));
  // }
  return filterMenu;
};

const NavItem = ({
  item = {},
  activeMenu,
  setActiveMenu,
  userRole,
  index,
  length,
  isChild,
}) => {
  const { title, path, icon, activeIcon, children } = item;
  const location = useLocation();
  // const [user] = useAuthUser();
  const user = useLoggedInUser();
  const { response} = useContext(ChatContext);
  const isLast = index + 1 === length;
  const childParams = location.pathname.split('/')?.[3];

  const unReadParentChats = useMemo(()=>{
    let count = 0;
    response?.results?.forEach(item=>{
      const unreadMessagesForUser = item.UnreadMessages?.filter(_item=>_item.receiverId===user?.userId)
      if(unreadMessagesForUser?.length){
        count++
      }
    })
    return count
  },[response,user])
  useEffect(() => {
    const pathName = location.pathname.split('/')[1];
    if (`/${pathName}` === path) {
      setActiveMenu(path);
    }
  }, [location.pathname, path]);

  const isPatientRoute = location?.pathname?.includes('/patient/detail/');

  return (
    <>
      <StyledNavItem
        component={RouterLink}
        to={childParams ? generatePath(path, { patientId: childParams }) : path}
        sx={{
          height: '40px',
          fontStyle: 'normal',
          lineHeight: '19.6px',
          padding: '8px 10px',
          ...(isLast
            ? {}
            : { borderBottom: `1px solid ${palette.border.main}` }),
          '&.MuiListItemButton-root': {
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '21px',
          },
          '&.active': {
            background: palette.background.main,
            color: palette.common.white,
            fontWeight: 400,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <StyledNavItemIcon>
              {title === 'Messages' ? (
                <Badge
                  badgeContent={unReadParentChats}
                  color="error"
                  // overlap={userRole === 'patient' ? 'circular' : 'rectangular'}
                  // variant={userRole === 'patient' && 'dot'}
                >
                  {activeMenu === path ? activeIcon : icon}
                </Badge>
              ) : activeMenu === path ? (
                activeIcon
              ) : (
                icon
              )}
            </StyledNavItemIcon>
            <ListItemText disableTypography primary={title} />
          </Box>
        </Box>
      </StyledNavItem>
      {children && isPatientRoute && (
        <List
          sx={{
            '&.childNav a': {
              fontSize: 12,
              lineHeight: '18px',
              color: palette.text.offWhite,
              fontWeight: 400,
            },
            '&.childNav .active': {
              background: palette.background.paper,
              color: palette.common.green,
              fontWeight: 700,
            },
          }}
          className="childNav"
          component="div"
          disablePadding
        >
          {children.map((childItem) => (
            <NavItem
              key={childItem.path || childItem.title}
              item={childItem}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              userRole={userRole}
            />
          ))}
        </List>
      )}
    </>
  );
};

const navItemShape = PropTypes.shape({
  title: PropTypes.string,
  path: PropTypes.string,
  icon: PropTypes.node,
  activeIcon: PropTypes.node,
  children: PropTypes.array,
});

export default function NavSection({ data = [], ...other }) {
  const userRole = getUserRole();
  const navigate = useNavigate();

  const updatedMenu = updateMenu(data, userRole);
  const [activeMenu, setActiveMenu] = useState();
  
  const [imageUrl, setImageUrl] = useState(null);
  const [getPracticeSettingResponse, ,getPracticeSettingLoading ,getPracticeSetting, clearPracticeSetting] = useCRUD({
      id: GET_PRACTICE_DATA_SETTING,
      url: API_URL.practiceSetting,
      type: REQUEST_METHOD.get,
    });
  
    useEffect(() => {
      getPracticeSetting();
    }, []); 

    useEffect(() => {
      const imageUrl = getImageUrl(getPracticeSettingResponse?.logo?.name, {
        isPublic: true,
      });
      setImageUrl(imageUrl);
    }, [getPracticeSettingResponse?.logo?.name]);
  

  const userData = useLoggedInUser();
  const timeZone = userData?.practice?.timezone;
  const sideMenu =
    userRole !== roleTypes.clinicAdmin && userRole !== roleTypes.superAdmin
      ? updatedMenu?.map((item) => ({
          ...item,
          children: item?.children?.filter((child) =>
            loggedInUserRoutes.includes(child.path)
          ),
        }))
      : updatedMenu?.map((item) => ({ ...item }));

  const onLogoClick = () => {
    navigate(generatePath(UI_ROUTES.dashboard));
  };

  return (
    <Box
      {...other}
      sx={{ border: `1px solid ${palette.border.main}`, borderRadius: 1.333 }}
    >
      <Box
        sx={{ display: 'flex', justifyContent: 'center', padding: '20px 0px' }}
      >
        <img src={imageUrl || logo} alt="logo" width="137.42px" height="70px" style={{ cursor: 'pointer' }} onClick={onLogoClick} />
      </Box>
      <List disablePadding sx={{ maxHeight: '98%', overflow: 'auto' }}>
        {/* {updatedMenu.map((item, index) => ( */}
        {sideMenu?.map((item, index) => (
          <NavItem
            key={item.title}
            item={item}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            userRole={userRole}
            index={index}
            length={sideMenu.length}
          />
        ))}
      </List>
      {timeZone &&
      !(
        userData?.role === roleTypes.patient ||
        userData?.role === roleTypes.superAdmin
      ) ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            textAlign: 'center',
            padding: '10px 20px 20px 20px',
            boxShadow: '4px 8px 18px 0px rgba(68, 97, 242, 0.9)',
            backgroundColor: palette.common.white,
            maxHeight: '2%',
          }}
        >
          <DateTimeComponent timeZone={timeZone} />
        </Box>
      ) : null}
    </Box>
  );
}

NavSection.propTypes = {
  data: PropTypes.arrayOf(navItemShape),
};

NavItem.propTypes = {
  item: navItemShape,
  activeMenu: PropTypes.string,
  setActiveMenu: PropTypes.func,
  userRole: PropTypes.string,
  index: PropTypes.number,
  length: PropTypes.number,
  isChild: PropTypes.bool,
};
