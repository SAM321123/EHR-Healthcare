/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { 
    requiredField, 
    roleTypes, 
    setUserData, 
    successMessage,
 } from 'src/lib/constants';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import {
  getOrCreateDeviceId,
  setUserRole,
  setUserTimezone,
  showSnackbar,
  triggerEvents,
  verticalScale,
} from 'src/lib/utils';
import { USER_LOGIN, VERIFY_AUTH_EMAIL } from 'src/store/types';
import useCRUD from '../../../hooks/useCRUD';
import { isEmpty } from 'lodash';
import { decrypt } from 'src/lib/encryption';
import { loggedInUserRoutes } from 'src/routes';
import SelectRole from './SelectRole';
import Modal from 'src/components/modal';
import Typography from 'src/components/Typography';

let selectedRole;
const EmailVerificationForm = (props) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const role = decrypt(params.get('role'));
  selectedRole = selectedRole || role
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState([]);
  const [selectRole, setSelectRole] = useState(false);
  
  const [response, , loading, callVerifyEmail, clearData] = useCRUD({
    id: VERIFY_AUTH_EMAIL,
    url: API_URL.verifyAndLogin,
    type: REQUEST_METHOD.post,
  });

  const [roleResponse, , , callRoleAPI] = useCRUD({
    id: `${USER_LOGIN}`,
    url: API_URL.users,
    type: REQUEST_METHOD.get,
  });

  const verifyCodeformGroups = [
    {
      inputType: 'number',
      name: 'code',
      textLabel: 'Verification Code',
      required: requiredField,
      gridProps: { md: 12 },
    },
  ];

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit } = form;


  const handleVerifyCode = useCallback(
    (data) => {
        const deviceId = getOrCreateDeviceId()
        data.deviceId = deviceId;
        data.email = decrypt(email)
        data.role = selectedRole;
      callVerifyEmail({data});
    },
    [callVerifyEmail, email]
  );

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

  useEffect(() => {
    if (response) {
      if (response.error) {
        triggerEvents('showSnackbar', {
          message: response?.message,
          severity: 'error',
        });
        return;
      }
      const user = response?.user;
      if (user && Array.isArray(user?.roles) && user?.roles?.length > 0) {
        const roles = user.roles;
        console.log("🚀 ~ useEffect ~ roles:", roles[0])
        if (roles.length === 1 && roles[0]?.code === roleTypes.patient) {
          // eslint-disable-next-line prefer-destructuring
          selectedRole = roles[0]?.code;
          callRoleAPI({}, `/${user.id}?role=${roles[0]?.code}`);
          return;
        }
        const index = roles.findIndex(role => role.code === roleTypes.patient);
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
            clearData();
            handleNavigation();
          }
        }
      }
  }},[response, clearData, navigate]);

  const toggleModal = useCallback(
    (role) => {
      console.log("🚀 ~ LoginForm ~ selectRole:", selectRole,role)
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
    if (roleResponse) {
      if (selectedRole === roleTypes.patient) {
        setUserTimezone(roleResponse.timezone || null);
      } else {
        setUserTimezone(roleResponse?.practice?.timezone);
      }
      setUserRole(selectedRole);
      setUserData(roleResponse);
      clearData();
      handleNavigation();
    }
  }, [roleResponse]);

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

  return (
    <>
    <Box sx={{ my: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomForm
            formGroups={verifyCodeformGroups}
            columnsPerRow={1}
            form={form}
            gridGap={verticalScale(3)}
          />
          <LoadingButton
            id="submit-button"
            fullWidth
            size="medium"
            type="submit"
            style={{marginTop: '10px'}}
            loading={loading}
            onClick={handleSubmit(handleVerifyCode)}
            label="Verify"
          />
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

export default EmailVerificationForm;
