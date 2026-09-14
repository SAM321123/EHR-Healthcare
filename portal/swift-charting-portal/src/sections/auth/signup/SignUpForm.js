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
import { 
    requiredField,
    roleTypes, 
    inputLength,
    onlyNumber,
    regEmail,
    regexCustomText,
    regFirstname,
    regTextArea,
} from 'src/lib/constants';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { UI_ROUTES, navigateTo } from 'src/lib/routeConstants';
import {
  setUserRole,
  setUserTimezone,
  showSnackbar,
  triggerEvents,
  verticalScale,
} from 'src/lib/utils';

import { SAVE_USER } from 'src/store/types';
import palette from 'src/theme/palette';
import useCRUD from '../../../hooks/useCRUD';
import useValidateAuth from 'src/hooks/useValidateAuth';

export const signUpFormGroups = [
    {
        inputType: 'text',
        name: 'firstName',
        textLabel: 'First Name',
        required: requiredField,
        pattern: {
          value: regFirstname.value,
          message: `Firstname ${regFirstname?.message}`,
        },
        maxLength: { ...inputLength.firstName },
        minLength: { value: 3 },
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        name: 'lastName',
        textLabel: 'Last Name',
        required: requiredField,
        pattern: {
          value: regFirstname.value,
          message: `Lastname ${regFirstname?.message}`,
        },
        maxLength: { ...inputLength.firstName },
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        type: 'email',
        name: 'email',
        textLabel: 'Email',
        required: requiredField,
        pattern: regEmail,
        maxLength: { ...inputLength.email },
      },
      {
        inputType: 'phoneInput',
        name: 'phone',
        textLabel: 'Phone No.',
        pattern:onlyNumber,
      },
];


const SignUpForm = (props) => {
    useValidateAuth();
    const navigate = useNavigate();

    const [response,, loading, callUserSaveAPI, clearData] = useCRUD({
        id: SAVE_USER,
        url: API_URL.signup,
        type: REQUEST_METHOD.post
    });

    const handleBack = () => {
        navigate(-1);
    }


  const form = useForm({ mode: 'onChange' });

  useEffect(() => {
    if (response) {
        showSnackbar({
        severity: 'success',
        message: 'Your account credentials have been sent to your email address. Please check your email and log in!',
        });
        clearData(true)
        handleBack();
    }
  }, [response]);

  const { handleSubmit } = form;

  const handleSignup = useCallback(
    (data) => {
      callUserSaveAPI({ data });
    },
    [callUserSaveAPI]
  );

  return (
    <>
    <Box sx={{ my: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomForm
            formGroups={signUpFormGroups}
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
            onClick={handleSubmit(handleSignup)}
            label="Sign up"
          />
          <Box sx={{display:'flex',marginTop:verticalScale(2.5),justifyContent:'center'}}>
          <Typography color={palette.text.dull} style={{fontSize:13,fontWeight:400,lineHeight:'19.5px'}}>Already have an account ?</Typography>
          <Link
              style={{ 
                color: palette.grey[500], 
                textDecoration: 'none',
                fontSize:15,
                // fontWeight:400,
                lineHeight:'19.5px', 
                fontWeight: 'bold'
              }}
              to={navigateTo(UI_ROUTES.login)}
            >
              Sign in
            </Link>
          </Box>
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default SignUpForm;