import React, { useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import {
  inputLength,
  regEmail,
  regexName,
  requiredField,
  roleTypes,
  successMessage,
  dbConfig,
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

export const addDatabaseFormGroup = () => [
  // {
  //   inputType: 'text',
  //   name: 'databaseName',
  //   textLabel: 'Name',
  //   required: requiredField,
  //   maxLength: { ...inputLength.name },
  //   gridProps: { md: 12 },
  //   pattern: {
  //     value: regexName.value,
  //     message: `Name ${regexName.message}`,
  //   },
  // },
  {
    inputType: 'text',
    name: 'databaseUser',
    textLabel: 'Database UserName ',
    disabled: true,
    // required: requiredField,
    gridProps: { md: 12 },
  },
  // {
  //   inputType: 'text',
  //   type: 'text',
  //   name: 'databasePassword',
  //   textLabel: 'Database Password ',
  //   disabled: true,
  //   gridProps: { md: 12 },
  //   style:{ WebkitTextSecurity: "disc" }
  // },
  {
    inputType: 'number',
    name: 'databasePort',
    textLabel: 'Database Port ',
    disabled: true,
    // required: requiredField,
    gridProps: { md: 12 },
  },
  {
    inputType: 'text',
    name: 'databaseHost',
    textLabel: 'Database Host ',
    disabled: true,
    // required: requiredField,
    gridProps: { md: 12 },
  },
  // {
  //   inputType: 'text',
  //   name: 'databaseDialect',
  //   textLabel: 'Dialect ',
  //   disabled: true,
  //   // required: requiredField,
  //   gridProps: { md: 12 },
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

const AddDatabase = ({
  form,
  isTitle,
  isButton,
  memberData,
  routeProps,
  modalCloseAction,
  isSuperAdmin,
}) => {
  const { type = roleTypes.clinicAdmin, clinicId } = routeProps || {};
  const defaultValue = useMemo(
    () =>
      ({
        databaseUser: process.env.REACT_APP_SEQUELIZE_USER,
        databasePassword: process.env.REACT_APP_SEQUELIZE_PASSWORD,
        databasePort: process.env.REACT_APP_SEQUELIZE_PORT,
        databaseHost: process.env.REACT_APP_SEQUELIZE_HOST,
        databaseDialect: process.env.REACT_APP_SEQUELIZE_DIALECT,
      }),
    []
  );

  const [response, , loading, callAddStaffAPI, clearData] = useCRUD({
    id: ADD_CLINIC_ADMIN,
    url: isEmpty(memberData)
      ? API_URL.clinicAdmin
      : `${API_URL.clinicAdmin}/${memberData?.id}`,
    type: isEmpty(memberData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const { handleSubmit, reset } = form;

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
              ? addDatabaseFormGroup()
              : updateStaffFormGroup()
          }
          columnsPerRow={1}
          defaultValue={defaultValue || {}}
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

export default AddDatabase;
