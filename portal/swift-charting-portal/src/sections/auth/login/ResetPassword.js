import React, { useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { RESET_PASSWORD } from 'src/store/types';
import { API_URL } from 'src/api/constants';
import useSearchQuery from 'src/hooks/useSearchQuery';
import CustomForm from 'src/components/form';
import { requiredField } from 'src/lib/constants';
import Iconify from 'src/components/iconify/Iconify';
import { customRegexValidator } from 'src/utils/inputValidation';
import palette from 'src/theme/palette';
import { UI_ROUTES, navigateTo } from 'src/lib/routeConstants';
import { Grid } from '@mui/material';
import { showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';

export const profileFormGroups = [
  {
    inputType: 'text',
    type: 'password',
    name: 'password',
    textLabel: 'New Password',
    required: requiredField,
    gridProps: { md: 12 },
    containerStyle: { marginBottom: '1.875rem' },
    pattern: {}
  },
  {
    inputType: 'text',
    type: 'password',
    name: 'repeatPassword',
    textLabel: 'Confirm New Password',
    required: requiredField,
    gridProps: { md: 12 },
    containerStyle: { marginBottom: '1.875rem' },
    pattern: {}
  },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useSearchQuery();

  const [response, , loading, callResetAPI] = useCRUD({
    id: RESET_PASSWORD,
    url: API_URL.resetPassword,
  });

  useEffect(() => {
    if (response) {
      showSnackbar({
        severity: 'success',
        message: 'Your Password has been changed',
      });
      navigate(navigateTo(UI_ROUTES.login));
    }
  }, [response, navigate]);

  const form = useForm({mode: 'onChange'});
  const { handleSubmit, watch } = form;

  const formData = watch();

  const conditions = useMemo(
    () => [
      {
        condition: 'At least 1 uppercase character',
        satisfied: formData?.password
          ? !customRegexValidator({
              field: 'password',
              regex: /[A-Z]/g,
            })(formData)
          : false,
      },
      {
        condition: 'At least 1 lowercase character',
        satisfied: formData?.password
          ? !customRegexValidator({
              field: 'password',
              regex: /[a-z]/g,
            })(formData)
          : false,
      },
      {
        condition: 'At least 1 number',
        satisfied: formData?.password
          ? !customRegexValidator({
              field: 'password',
              regex: /[0-9]/,
            })(formData)
          : false,
      },
      {
        condition: 'At least 1 special character',
        satisfied: formData?.password
          ? !customRegexValidator({
              field: 'password',
              regex: /(?=.[!@#$%^&()_{}\-[\];:'"<>,./?\\|+=])/,
            })(formData)
          : false,
      },
      {
        condition: 'At least 8 characters',
        satisfied: formData?.password?.length >= 8,
      },
      {
        condition: 'Password must match',
        satisfied:
          formData?.password?.length &&
          formData?.password === formData?.repeatPassword,
      },
    ],
    [formData]
  );

  const handleResetPassword = useCallback(
    (data) => {
      const payload = {
        password: data.password,
      };

      callResetAPI({
        data: payload,
        params: { token: query.get('token') },
      });
    },
    [query, callResetAPI]
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomForm form={form} formGroups={profileFormGroups} />
          <LoadingButton
            sx={{ mb: 4, mt: 1 }}
            fullWidth
            size="medium"
            type="submit"
            loading={loading}
            onClick={handleSubmit(handleResetPassword)}
            label=" Update Password"
          />

          {conditions.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify
                icon={
                  item.satisfied
                    ? 'material-symbols:check-circle'
                    : 'material-symbols:cancel'
                }
                color={
                  item.satisfied ? palette.success.dark : palette.error.main
                }
              />
              <Typography
                sx={{ ml: 1, fontSize: '1rem', color: palette.grey[500] }}
              >
                {item.condition}
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResetPassword;
