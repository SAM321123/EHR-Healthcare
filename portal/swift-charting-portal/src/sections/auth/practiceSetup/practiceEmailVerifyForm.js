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
    successMessage,
 } from 'src/lib/constants';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import {
  showSnackbar,
  verticalScale,
} from 'src/lib/utils';
import { VERIFY_EMAIL } from 'src/store/types';
import useCRUD from '../../../hooks/useCRUD';
import { isEmpty } from 'lodash';
import { decrypt, encrypt } from 'src/lib/encryption';
import Typography from 'src/components/Typography';

const PracticeEmailVerifyForm = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  
  const [response, , loading, callVerifyEmail, clearData] = useCRUD({
    id: VERIFY_EMAIL,
    url: `${API_URL.clinic}/verify-code`,
    type: REQUEST_METHOD.post,
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


  const handlePracticeVerify = useCallback(
    (data) => {
        data.email = decrypt(email)
      callVerifyEmail({data});
    },
    [callVerifyEmail, email]
  );

  useEffect(() => {
    const id = response?.data?.id;
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData(true);
      navigate(navigateTo(UI_ROUTES.login));
      // setMembershipModalOpen(true);
      // navigate(
      //   navigateTo(
      //     `${UI_ROUTES.practiceMembership}?id=${encrypt(String(id))}`
      //   )
      // );
    }
  },[response, clearData, navigate]);


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
            onClick={handleSubmit(handlePracticeVerify)}
            label="Verify"
          />
        </Grid>
      </Grid>
    </Box>
    {loading && (
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 2 }}
      >
        🚀 Setting things up for you...  
        <br />
        Your practice database is being created and pre-loaded with all the
        essentials. This may take a couple of minutes — thank you for your
        patience!
      </Typography>
    )}
    </>
  );
};

export default PracticeEmailVerifyForm;
