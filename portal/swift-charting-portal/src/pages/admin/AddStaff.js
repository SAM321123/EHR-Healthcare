import React, { useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import {
  inputLength,
  onlyNumber,
  regEmail,
  regexName,
  regFirstname,
  requiredField,
  roleTypes,
  successMessage,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import { ADD_CLINIC_ADMIN, TEAM_LIST } from 'src/store/types';
import { isEmpty, upperCase } from 'src/lib/lodash';
import {
  getUpdatedFieldsValue,
  showSnackbar,
  triggerEvents,
} from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import CustomButton from 'src/components/CustomButton';

export const addStaffFormGroup = () => [
  {
    inputType: 'text',
    name: 'staffFirstName',
    textLabel: 'First Name',
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
    textLabel: 'Middle Name',
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
    textLabel: 'Last Name',
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
    textLabel: 'Email',
    required: requiredField,
    pattern: regEmail,
    maxLength: { ...inputLength.email },
    colSpan:0.5
  },
  {
    inputType: 'phoneInput',
    name: 'staffContact',
    textLabel: 'Phone No.',
    pattern:onlyNumber,
    required: requiredField,
    colSpan:0.5,  
  },
  // {
  //   inputType: 'text',
  //   type: 'password',
  //   name: 'staffPassword',
  //   textLabel: 'Password',
  //   required: requiredField,
  //   pattern: {
  //     value: '',
  //     message: '',
  //   },
  //   colSpan:1, 
  // },
];

export const updateStaffFormGroup = () => [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    maxLength: { ...inputLength.name },
    gridProps: { md: 12 },
    pattern: {
      value: regexName.value,
      message: `Name ${regexName.message}`,
    },
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email Address ',
    required: requiredField,
    pattern: regEmail,
    gridProps: { md: 12 },
  },
  {
    inputType: 'phoneInput',
    name: 'contact',
    textLabel: 'Contact Number',
    gridProps: { md: 12 },
    required: false,
  },
];

const AddStaff = ({
  form,
  isTitle,
  isButton,
  memberData,
  routeProps,
  modalCloseAction,
  isSuperAdmin,
}) => {
  const { type = roleTypes.clinicAdmin, clinicId } = routeProps || {};
  const { handleSubmit, reset, getValues } = form;
  const {email, contact} = getValues();

  const defaultValue = useMemo(
    () =>({
      staffFirstName: process.env.REACT_APP_ADMIN_FIRST_NAME,
      staffLastName:  process.env.REACT_APP_ADMIN_LAST_NAME,
      staffEmail: email,
      staffContact:  contact,
      // staffEmail:  process.env.REACT_APP_ADMIN_EMAIL,
      // staffContact:  process.env.REACT_APP_ADMIN_CONTACT,
      staffPassword: process.env.REACT_APP_ADMIN_PASSWORD,
    }),[]
  );

  const [response, , loading, callAddStaffAPI, clearData] = useCRUD({
    id: ADD_CLINIC_ADMIN,
    url: isEmpty(memberData)
      ? API_URL.clinicAdmin
      : `${API_URL.clinicAdmin}/${memberData?.id}`,
    type: isEmpty(memberData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });


  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(memberData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      if (modalCloseAction) modalCloseAction();
      triggerEvents(`REFRESH-TABLE-${TEAM_LIST}_${upperCase(type)}`);
    }
  }, [response]);

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(memberData)) {
        const staffCred = {
          name: data.staffName,
          email: data.staffEmail,
          contact: data.staffContact,
        };

        const { name, email,  } = staffCred;

        if (name && email) {
          if (isSuperAdmin) {
            const newData = {
              ...staffCred,
              practice: clinicId,
            };

            callAddStaffAPI({ data: newData });
          } else callAddStaffAPI({ data: staffCred });
          reset();
        }
      } else {
        const updatedFields = getUpdatedFieldsValue(data, memberData);
        if (isEmpty(updatedFields))
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        else {
          callAddStaffAPI({ ...updatedFields });
        }
      }
    },
    [
      callAddStaffAPI,
      clinicId,
      isSuperAdmin,
      memberData,
      modalCloseAction,
      reset,
    ]
  );

  return (
    <Box>
      {isTitle ? <CardHeader title="Staff Detail" /> : null}
      <CardContent>
        <CustomForm
          form={form}
          formGroups={
            isEmpty(memberData)
              ? addStaffFormGroup()
              : updateStaffFormGroup()
          }
          columnsPerRow={1}
          defaultValue={defaultValue}
          // defaultValue={isEmpty(memberData) ? {} : defaultValue}
        />
      </CardContent>
      {isButton ? (
        <CardActions
          sx={{
            justifyContent: 'center',
          }}
        >
          <CustomButton
            variant="secondary"
            onClick={modalCloseAction}
            label="Cancel"
          />
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </CardActions>
      ) : null}
    </Box>
  );
};

export default AddStaff;
