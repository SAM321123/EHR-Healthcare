import { useCallback, useEffect } from 'react';
import {
  Box,
  Stack,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { requiredField, successMessage } from 'src/lib/constants';
import Container from 'src/components/Container';
import useCRUD from 'src/hooks/useCRUD';
import { UPDATE_PASSWORD } from 'src/store/types';
import { API_URL } from 'src/api/constants';
import ModalHeader from 'src/components/modal/header';
import { showSnackbar } from 'src/lib/utils';
import { isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PasswordValidation from './passwordValidation';

const profileFormGroups = [
  {
    inputType: 'text',
    type: 'password',
    name: 'currentPassword',
    textLabel: 'Current Password',
    required: requiredField,
    gridProps: { md: 12 },
    pattern: {}
  },
  {
    inputType: 'text',
    type: 'password',
    name: 'password',
    textLabel: 'New Password',
    required: requiredField,
    gridProps: { md: 12 },
    pattern: {}
  },
  {
    inputType: 'text',
    type: 'password',
    name: 'repeatPassword',
    textLabel: 'Confirm Password',
    gridProps: { md: 12 },
    required: requiredField,
    pattern: {}
  },
];

const ChangePassword = (props) => {
  const { header = {}, modalCloseAction } = props;
  const form = useForm({mode: 'onChange'});
  const { handleSubmit, watch } = form;

  const [response, , loading, updateApi, clear] = useCRUD({
    id: UPDATE_PASSWORD,
    url: API_URL.changePassword,
  });

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });

      clear();
      modalCloseAction();
    }
  }, [response]);

  const formData = watch();

  const handleSaveAccountDetails = useCallback(
    (data) => {
      // here we are getting the form values
      const payload = {
        password: data.currentPassword,
        newPassword: data.password,
      };
      updateApi({ data: payload });
    },
    [form]
  );

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Stack
        spacing={0}
        sx={{
          height: '100%',
        }}
      >
        <Grid container sx={{ justifyContent: 'center', height: '100%' }}>
          <Grid
            xs={12}
            md={12}
            lg={12}
            sx={{
              height: '100%',
            }}
          >
            <Card
              display="flex"
              sx={{
                height: '100%',
                backgroundColor: palette.background.paper,
                boxShadow: 'none',
              }}
            >
              {!isEmpty(header) ? (
                <ModalHeader
                  header={header}
                  modalCloseAction={modalCloseAction}
                />
              ) : null}
              <CardContent>
                <Box sx={{ mb: 4 }}>
                  <CustomForm form={form} formGroups={profileFormGroups} />
                </Box>
                <PasswordValidation formData={formData} />
              </CardContent>

              <CardActions sx={{ justifyContent: 'center' }}>
                <CustomButton
                  variant="secondary"
                  onClick={modalCloseAction}
                  label="Cancel"
                />
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  onClick={handleSubmit(handleSaveAccountDetails)}
                  label="Update"
                />
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ChangePassword;
