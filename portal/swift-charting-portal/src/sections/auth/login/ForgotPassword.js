import React, { useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { FORGOT_PASSWORD } from 'src/store/types';
import { API_URL } from 'src/api/constants';
import CustomForm from 'src/components/form';
import { requiredField } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { useNavigate } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';

export const forgotPasswordGroups = [
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email Address',
    required: requiredField,
    colSpan:1,
  },
];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [response, , loading, callForgotPasswordAPI,clearData] = useCRUD({
    id: FORGOT_PASSWORD,
    url: API_URL.forgotPassword,
  });

  useEffect(() => {
    if (response) {
      showSnackbar({
        severity: 'success',
        message: 'A reset password link is sent in your email address',
      });
      clearData(true)
    }
  }, [response]);

  const form = useForm({mode: 'onChange'});
  const { handleSubmit } = form;

  const handleForgotPassword = useCallback(
    (data) => {
      const payload = {
        email: data.email,
      };

      callForgotPasswordAPI({
        data: payload,
      });
    },
    [callForgotPasswordAPI]
  );
  const goHome =()=>{
    navigate(`/${UI_ROUTES.login}`)
  }

  return (
    <>
    <Box sx={{ mt: 3,width:'100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomForm formGroups={forgotPasswordGroups} form={form} />
          <LoadingButton
            sx={{
              mt: 5,
            }}
            fullWidth
            size="medium"
            type="submit"
            loading={loading}
            onClick={handleSubmit(handleForgotPassword)}
            label="Recover Password"
          />
        </Grid>
      </Grid>
    </Box>
    <Box sx={{display:'flex',marginTop:"10px",justifyContent:'center'}}>
           <div onClick={goHome}> 
          <Typography className="class-cursor" color={palette.background.main} style={{fontSize:13,fontWeight:600,lineHeight:'19.5px'}}>Back To Login</Typography>
            </div>
          </Box>
          </>
  );
};

export default ForgotPassword;
