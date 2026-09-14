/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import { requiredField, roleTypes, setUserData } from 'src/lib/constants';
import { UI_ROUTES, navigateTo } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import {
  setUserRole,
  setUserTimezone,
  triggerEvents,
  verticalScale,
} from 'src/lib/utils';
// import {
//   assistantRoutes,
//   clinicAdminRoutes,
//   patientRoutes,
//   practitionerRoutes,
//   superAdminRoutes,
// } from 'src/routes';
import { loggedInUserRoutes } from 'src/routes';
import { USER_LOGIN } from 'src/store/types';
import palette from 'src/theme/palette';
import useCRUD from '../../../hooks/useCRUD';
import { get } from 'lodash';
import SelectRole from './SelectRole';
import Modal from 'src/components/modal';
import { getOrCreateDeviceId } from '../../../lib/utils';

export const loginFormGroups = [
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'E-Mail',
    required: requiredField,
    gridProps: { md: 12 },
    containerStyle: { marginBottom: '1.875rem' },
  },
  {
    inputType: 'text',
    type: 'password',
    name: 'password',
    textLabel: 'Password',
    required: requiredField,
    pattern: {
      value: '',
      message: '',
    },
    gridProps: { md: 12 },
    containerStyle: { marginBottom: '1.875rem' },
  },
];

// const handleResponseModification = (data) => {
//   const accessToken = get(data, 'tokens.access.token', '');
//   const refreshToken = get(data, 'tokens.refresh.token', '');
//   localStorage.setItem('token', accessToken);
//   localStorage.setItem('refreshToken', refreshToken);
// };

let selectedRole;
const LoginForm = (props) => {
  const {selectedRole:selectedRoleFromContianer}=props||{}
  const navigate = useNavigate();
  const location = useLocation();
  const [selectRole, setSelectRole] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [email, setEmail] = useState(null);

  const [response, , loading, callLoginAPI, clearUserData] = useCRUD({
    id: USER_LOGIN,
    url: API_URL.checkCredential,
  });

  const [roleResponse, , , callRoleAPI] = useCRUD({
    id: `${USER_LOGIN}`,
    url: API_URL.users,
    type: REQUEST_METHOD.get,
  });

  // const getAllowedRoute = (role, path) => {
  //   const tempPath = path.split('/');
  //   let allowedRoute = false;
  //   if (role === roleTypes.superAdmin) {
  //     allowedRoute = superAdminRoutes.includes(`/${tempPath?.[1]}`);
  //   } else if (role === roleTypes.patient) {
  //     allowedRoute = patientRoutes.includes(`/${tempPath?.[1]}`);
  //   } else if (role === roleTypes.clinicAdmin) {
  //     allowedRoute = clinicAdminRoutes.includes(`/${tempPath?.[1]}`);
  //   } else if (role === roleTypes.practitioner) {
  //     allowedRoute = practitionerRoutes.includes(`/${tempPath?.[1]}`);
  //   } else {
  //     allowedRoute = assistantRoutes.includes(`/${tempPath?.[1]}`);
  //   }

  //   return allowedRoute;
  // };
  const getAllowedRoute = (role, path) => {
    const tempPath = path.split('/');
    let allowedRoute = loggedInUserRoutes.includes(`/${tempPath?.[1]}`);
    return allowedRoute;
  };

  const handleNavigation = () => {
    let route = UI_ROUTES.dashboard;
    const searchParams = new URLSearchParams(location.search);
    const redirectionURL = searchParams.get('redirectionURL');
    if (redirectionURL) {
      const allowedRoute = getAllowedRoute(selectedRole, redirectionURL);
      if (allowedRoute) route = redirectionURL;
    }
    navigate(route);
  };

  const form = useForm({ mode: 'onChange' });

  const toggleModal = useCallback(
    (role) => {
      if (role && role?.code) {
        selectedRole = role?.code;
        // localStorage.setItem('token', get(response, 'tokens.access.token', ''));
        callRoleAPI({}, `/${response?.user?.id}?role=${role?.code}`);
        // localStorage.clear();
      }
      setSelectRole(!selectRole);
    },
    [selectRole]
  );

  useEffect(() => {
    if (response) {
      if (response.error) {
        triggerEvents('showSnackbar', {
          message: response?.message,
          severity: 'error',
        });
        return;
      }
      if (response?.allowed2FA === true) {
        const roleData =
          response?.user?.roles?.legth > 1
            ? selectedRole
            : response?.user?.roles[0]?.code;
        navigate(
          navigateTo(
            `${UI_ROUTES.emailVerification}?email=${encrypt(
              email
            )}&role=${encrypt(roleData)}`
          )
        );
      } else {
        const user = response?.user;
        if (user && Array.isArray(user?.roles) && user?.roles?.length > 0) {
          const roles = user.roles;
          if (roles.length === 1 && roles[0]?.code === roleTypes.patient) {
            // eslint-disable-next-line prefer-destructuring
            selectedRole = roles[0]?.code;
            callRoleAPI({}, `/${user.id}?role=${roles[0]?.code}`);
            return;
          }
          const index = roles.findIndex(
            (role) => role.code === roleTypes.patient
          );
          if (index !== -1) {
            roles.splice(index, 1);
          }
          if (roles.length > 1) {
            setUserRoles(roles);
            toggleModal();
          } else {
            // eslint-disable-next-line prefer-destructuring
            selectedRole = roles[0]?.code;
            if (selectedRole !== roleTypes.superAdmin) {
              callRoleAPI({}, `/${user.id}?role=${roles[0]?.code}`);
            } else {
              // eslint-disable-next-line prefer-destructuring
              user.role = roles[0];
              setUserRole(selectedRole);
              setUserData(user);
              clearUserData();
              handleNavigation();
            }
          }
        }
      }
    }
  },[response, clearUserData, navigate]);

  useEffect(() => {
    if (roleResponse) {
      if (selectedRole === roleTypes.patient) {
        setUserTimezone(roleResponse.timezone || null);
      } else {
        setUserTimezone(roleResponse?.practice?.timezone);
      }
      setUserRole(selectedRole);
      setUserData(roleResponse);
      clearUserData();
      handleNavigation();
    }
  }, [roleResponse]);

  const { handleSubmit } = form;

  const handleLogin = useCallback(
    (data) => {
      const deviceId = getOrCreateDeviceId()
      const userCred = {
        email: data.email,
        password: data.password,
        role: selectedRoleFromContianer,
        deviceId,
        browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const { email, password } = userCred;
      setEmail(email);

      if (email && password) {
        callLoginAPI({
          data: userCred,
        });
      }
    },
    [callLoginAPI, selectedRoleFromContianer]
  );

  const headerComponent = () => (
    <Box textAlign="center">
      <Typography
        sx={{
          fontSize: '22px',
          fontWeight: 600,
          marginBottom: '24px',
        }}
      >
        Select a Role
      </Typography>
    </Box>
  );

  const handleEnterKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      document.getElementById('submit-button')?.click();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keypress', handleEnterKeyPress);
    return () => {
      window.removeEventListener('keypress', handleEnterKeyPress);
    };
  }, []);

  return (
    <>
      <Box sx={{ my: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomForm
              formGroups={loginFormGroups}
              columnsPerRow={1}
              form={form}
              gridGap={verticalScale(3)}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'end',
                mb: verticalScale(5),
                fontSize: '.875rem',
                mt: verticalScale(0.7),
              }}
            >
              <Link
                style={{
                  color: palette.grey[500],
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
                to={navigateTo(UI_ROUTES.forgotpassword)}
              >
                Forgot password?
              </Link>
            </Box>
            <LoadingButton
              id="submit-button"
              fullWidth
              size="medium"
              type="submit"
              loading={loading}
              onClick={handleSubmit(handleLogin)}
              label="Sign in"
            />
            <Box
              sx={{
                display: 'flex',
                marginTop: verticalScale(2.5),
                justifyContent: 'center',
              }}
            >
              <Typography
                color={palette.text.dull}
                style={{ fontSize: 15, fontWeight: 400, lineHeight: '19.5px' }}
              >
                No Patient Account ?{' '}
              </Typography>
              <Link
                style={{
                  color: palette.grey[500],
                  textDecoration: 'none',
                  fontSize: 15,
                  // fontWeight:400,
                  lineHeight: '19.5px',
                  fontWeight: 'bold',
                }}
                to={navigateTo(UI_ROUTES.signup)}
              >
                Sign up
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {selectRole && (
        <Modal
          header={{
            modalCloseAction: toggleModal,
          }}
          open={selectRole}
          onClose={toggleModal}
          headerComponent={headerComponent}
          isSelectRole={selectRole}
          // footerComponent={footerComponent}
        >
          <SelectRole roles={userRoles} modalCloseAction={toggleModal} />
        </Modal>
      )}
    </>
  );
};

export default LoginForm;
