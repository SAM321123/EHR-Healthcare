/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { 
    requiredField, 
    regEmail,
    maxLength,
    successMessage,
    regexName,
    regexDomain,
    inputLength,
    onlyNumber,
    regFirstname,
 } from 'src/lib/constants';
import { UI_ROUTES, navigateTo } from 'src/lib/routeConstants';
import {
  showSnackbar,
  verticalScale,
} from 'src/lib/utils';
import { decrypt, encrypt } from 'src/lib/encryption';
import { ADD_CLINIC } from 'src/store/types';
import useCRUD from '../../../hooks/useCRUD';
import { isEmpty } from 'lodash';


const PracticeRegistrationForm = (props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  const [response, , loading, callCreateClinicRequest, clearData] = useCRUD({
    id: ADD_CLINIC,
    url: `${API_URL.clinic}`,
    type: REQUEST_METHOD.post,
  });
  const formGroups = [
    {
      inputType: 'text',
      name: 'name',
      textLabel: 'Clinic Name',
      required: requiredField,
      maxLength: maxLength('Clinic Name', 200),
      gridProps: { md: 12 },
      pattern: {
        value: regexName.value,
        message: `Clinic Name ${regexName.message}`,
      },
    },
    {
      inputType: 'text',
      type: 'email',
      name: 'email',
      textLabel: 'Clinic Email Address ',
      required: requiredField,
      pattern: regEmail,
      gridProps: { md: 12 },
      colSpan:0.5,
      // disabled: selectedClinic ? !isClinicAdmin : isClinicAdmin,
    },
    {
      inputType: 'phoneInput',
      name: 'contact',
      textLabel: 'Contact Number',
      required: requiredField,
      gridProps: { md: 12 },
      colSpan:0.5,
    },
    {
      inputType: 'text',
      name: 'domainName',
      textLabel: 'Domain Name',
      required: requiredField,
      maxLength: maxLength('Domain Name', 200),
      gridProps: { md: 12 },
      pattern: {
        value: regexDomain.value,
        message: `Domain Name ${regexDomain.message}`,
      },
      InputProps: { endAdornment: '.swiftcharting.com' },
    },
    {
      inputType: 'mapAutoComplete',
      name: 'address',
      label: 'Address',
      required: requiredField,
    },
    {
        inputType: 'text',
        name: 'staffFirstName',
        textLabel: 'Admin First Name',
        required: requiredField,
        pattern: {
        value: regFirstname.value,
        message: `Firstname ${regFirstname?.message}`,
        },
        maxLength: { ...inputLength.firstName },
        minLength: { value: 3 },
        colSpan: 0.33,
    },
    {
        inputType: 'text',
        name: 'staffMiddleName',
        textLabel: 'Admin Middle Name',
        pattern: {
        value: regFirstname.value,
        message: `Lastname ${regFirstname?.message}`,
        },
        maxLength: { ...inputLength.firstName },
        colSpan: 0.33,
    },
    {
        inputType: 'text',
        name: 'staffLastName',
        textLabel: 'Admin Last Name',
        required: requiredField,
        pattern: {
        value: regFirstname.value,
        message: `Lastname ${regFirstname?.message}`,
        },
        maxLength: { ...inputLength.firstName },
        colSpan: 0.33,
    },
    {
        inputType: 'text',
        type: 'email',
        name: 'staffEmail',
        textLabel: 'Admin Email',
        required: requiredField,
        pattern: regEmail,
        maxLength: { ...inputLength.email },
        colSpan:0.5,
        gridProps: { md: 12 },
        containerStyle: { marginBottom: '1.875rem' },
    },
    {
        inputType: 'phoneInput',
        name: 'staffContact',
        textLabel: 'Admin Phone No.',
        pattern:onlyNumber,
        required: requiredField,
        colSpan:0.5,  
        gridProps: { md: 12 },
    },
  ];

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit, watch, setValue } = form;

  // Watch for changes in the "email" field
  const emailValue = watch('email');
  const contactValue = watch('contact');

  useEffect(() => {
    if (emailValue || contactValue) {
      setValue('staffEmail', emailValue); // Automatically set staffEmail to email
      setValue('staffContact', contactValue); // Automatically set staffContact to contact
    }
  }, [emailValue, contactValue,setValue]);


  const handlePracticeRegister = useCallback(
    (data) => {
      data.staffPassword = process.env.REACT_APP_ADMIN_PASSWORD
      setEmail(data?.email)
      callCreateClinicRequest({data});
      
    },
    [callCreateClinicRequest]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      // showSnackbar({
      //   message: successMessage.create,
      //   severity: 'success',
      // });
      clearData(true);
      navigate(
        navigateTo(
          `${UI_ROUTES.practiceRegisterationVerifyEmail}?email=${encrypt(email)}`
        )
      );
    }
  },[response, clearData, navigate, email]);


  return (
    <>
    <Box sx={{ my: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomForm
            formGroups={formGroups}
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
            onClick={handleSubmit(handlePracticeRegister)}
            label="Register"
          />
        </Grid>
      </Grid>
    </Box>
    </>
  );
};

export default PracticeRegistrationForm;
