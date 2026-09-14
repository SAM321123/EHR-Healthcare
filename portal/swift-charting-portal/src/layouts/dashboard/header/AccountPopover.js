import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  Tooltip,
} from '@mui/material';

import { API_URL, REQUEST_METHOD, ROLES } from 'src/api/constants';
import arrowDown from 'src/assets/images/arrowDown.png';
import userIcon from 'src/assets/images/user.png';
import Modal from 'src/components/modal';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import { roleMessage, roleTypes, setUserData } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { getImageUrl, setUserRole, setUserTimezone, showSnackbar } from 'src/lib/utils';
import SelectRole from 'src/sections/auth/login/SelectRole';
import { USER_LOGIN, USER_LOGOUT } from 'src/store/types';
import palette from 'src/theme/palette';

// import { pushToken } from 'src/notification/notification';

// ----------------------------------------------------------------------

const getRoles = (role) => {
  return role ? ROLES[role] : '';
}

const MENU_OPTIONS = [
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    to: UI_ROUTES.accounts,
  },
];

// ----------------------------------------------------------------------

const headerComponent = () => (
  <Box textAlign="center">
    <Typography
      sx={{
        fontSize: '22px',
        fontWeight: 600,
        marginBottom: '24px',
      }}
    >
      Choose a Role
    </Typography>
  </Box>
);

let selectedRole = null;

export default function AccountPopover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const dispatch = useDispatch();

  const [authData, , , callAuthAPI,authDataClear] = useCRUD({
    id: `${USER_LOGIN}`,
    url: API_URL.users,
    type: REQUEST_METHOD.get,
  });


  const account = {
    displayName:`${authData?.firstName || ''} ${authData?.middleName || ''} ${authData?.lastName || ''}`,
    email: authData?.email,
    photoURL:(authData?.fileId && authData?.file?.file) ? getImageUrl(authData?.file?.file) : userIcon,
    role:`${authData?.role || ''}`

  };


  // const [, , , , clearProfileData ] = useCRUD({
  //   id: `${USER_LOGIN}`,
  //   url: API_URL.users,
  //   type: REQUEST_METHOD.get,
  // });

  const [responseLogout, , , callLogoutApi, clearLogoutData] = useCRUD({
    id: USER_LOGOUT,
    url: API_URL.logout,
  });


  const handleNavigation = () => {
    const route = UI_ROUTES.dashboard;
    navigate(route);
  };

  const toggleModal = useCallback(
    (role) => {
      if (role && typeof role === 'string') {
        callAuthAPI({}, `/${authData?.user}?role=${role}`);
        handleNavigation();
      }
      selectedRole = role;
    },
    [callAuthAPI, authData?.user]
  );

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (row) => {
    setOpen(null);
    navigate(row.to);
  };

  const handleShowModal = () => {
    setOpenModal(false);
    setOpen(null);
  };

  useEffect(() => {
    if (responseLogout) {
      localStorage.clear();
      if(authData?.role=== 'superAdmin'){
        navigate(UI_ROUTES.adminLogin)
      }else{
        navigate(UI_ROUTES.login);
      }
      dispatch({
        type: '@login/LOGOUT',
      });
 
    }
  });

  const handleLogout = () => {
  const refreshToken = localStorage.getItem('refresh_token');
    callLogoutApi({ data: {refreshToken} });
  };

  useEffect(() => {
    if (authData && selectedRole) {
      authData.role = selectedRole;
      if (selectedRole === roleTypes.patient) {
        setUserTimezone(authData.timezone || null);
      } else {
        setUserTimezone(authData?.practice?.timezone);
      }
      setUserRole(selectedRole);

      setUserData(authData);
      showSnackbar({
        message: roleMessage.change,
        severity: 'success',
      });
      selectedRole = null;
    }
  }, [authData]);

  return (
    <div>
      <IconButton
        onClick={handleOpen}
        disableRipple
        sx={{
          p: 0,
          "&.MuiButtonBase-root:hover": {
            bgcolor: "transparent"
          },
          display:'flex',
          gap:0.99,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
            },
          }),
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
          <Typography noWrap color={palette.text.dark} style={{fontSize:14,lineHeight:'21px',fontWeight:400,maxWidth:'118px'}}>{account.displayName}</Typography>
          <Typography color={palette.text.offWhite} style={{fontSize:12,lineHeight:'18px',fontWeight:400}}>{getRoles(account.role)}</Typography>
        </div>
        <img src={arrowDown} alt='arrow-down' width="9.92px" height="10px"/>
        </div>
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {account.displayName}
          </Typography>
          <Tooltip title={account.email}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {account.email}
            </Typography>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClose(option)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        {/* {authData?.role.length > 1 && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <MenuItem onClick={() => setOpenModal(true)} sx={{ m: 1 }}>
              Switch Role
            </MenuItem>
          </>
        )} */}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>

        {openModal && (
          <Modal
            header={{
              modalCloseAction: handleShowModal,
            }}
            open={openModal}
            onClose={handleShowModal}
            headerComponent={headerComponent}
            isSelectRole
          >
            <SelectRole
              roles={authData?.role}
              modalCloseAction={toggleModal}
              initialRole={authData?.role}
              handleShowModal={handleShowModal}
            />
          </Modal>
        )}
      </Popover>
    </div>
  );
}
