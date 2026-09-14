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
import {
  getOrCreateDeviceId,
  setUserRole,
  setUserTimezone,
  triggerEvents,
  verticalScale,
} from 'src/lib/utils';
import { loggedInUserRoutes } from 'src/routes';
import { ADMIN_LOGIN, USER_LOGIN } from 'src/store/types';
import palette from 'src/theme/palette';
import useCRUD from '../../../hooks/useCRUD';
import { get } from 'lodash';
import { encrypt } from 'src/lib/encryption';

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
let selectedRole;
const SuperAdminLoginForm = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('superAdmin');
  const [email, setEmail] = useState(null);
  console.log("🚀 ~ LoginForm ~ selectRole:", role)

  const [response, , loading, callLoginAPI, clearUserData] = useCRUD({
    id: ADMIN_LOGIN,
    // url: API_URL.adminLogin,
    url: API_URL.checkCredential,
  });

  const [roleResponse, , , callRoleAPI] = useCRUD({
    id: `${USER_LOGIN}`,
    url: API_URL.users,
    type: REQUEST_METHOD.get,
  });

  const getAllowedRoute = (role, path) => {
    const tempPath = path.split('/');
    let allowedRoute = loggedInUserRoutes.includes(`/${tempPath?.[1]}`);
    return allowedRoute;
  };

  const handleNavigation = () => {
    let route = UI_ROUTES.clinics;
    const searchParams = new URLSearchParams(location.search);
    const redirectionURL = searchParams.get('redirectionURL');
    if (redirectionURL) {
      const allowedRoute = getAllowedRoute(role, redirectionURL);
      if (allowedRoute) route = redirectionURL;
    }
    navigate(route);
  };

  const form = useForm({ mode: 'onChange' });

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
        console.log("🚀 ~ useEffect ~ roles:", roles[0])
        if (roles.length === 1 && roles[0]?.code === roleTypes.patient) {
          // eslint-disable-next-line prefer-destructuring
          callRoleAPI({}, `/${user.id}?role=${role}`);
          return;
        }
        const index = roles.findIndex(role => role.code === roleTypes.patient);
        if (index !== -1) {
          roles.splice(index, 1);
        }
          user.role = roles[0];
          setUserRole(role);
          setUserData(user);
          clearUserData();
          handleNavigation();
          }
            }
        }
  }, [clearUserData, navigate, response]);

  useEffect(() => {
    if (roleResponse) {
      setUserTimezone(roleResponse?.practice?.timezone);
      setUserRole(role);
      setUserData(roleResponse);
      clearUserData();
      handleNavigation();
    }
  }, [roleResponse]);

  const { handleSubmit } = form;

  const handleLogin = useCallback(
    (data) => {
      const deviceId = getOrCreateDeviceId()
      console.log("🚀 ~  ~ data:", data)
      const userCred = {
        email: data.email,
        password: data.password,
        role: role,
        deviceId,
      };
      const { email, password } = userCred;
      setEmail(email);

      if (email && password) {
        callLoginAPI({
          data: userCred,
        });
      }
    },
    [callLoginAPI]
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
              mt:verticalScale(0.7)
            }}
          >
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
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default SuperAdminLoginForm;
