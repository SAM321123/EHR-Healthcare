import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import CustomForm from 'src/components/form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { GET_FAX_CONTACT_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { inputLength, requiredField, successMessage ,regEmail, regexCustomText} from 'src/lib/constants';

const faxContactFormGroups = [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    pattern: regexCustomText,
    colSpan:0.5,
  },
  {
    inputType: 'phoneInput',
    type: 'number',
    name: 'faxNo',
    textLabel: 'Fax Contact',
    gridProps: { md: 12 },
    colSpan:0.5,
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Email',
    pattern: regEmail,
    maxLength: { ...inputLength.email },
    colSpan:1,
  },
  {
    inputType: 'mapAutoComplete',
    name: 'address',
    label: 'Address',
    itemProps:{
      address:{colSpan:1},
      countryCode:{colSpan:0.25},
      stateCode:{colSpan:0.25},
      city:{colSpan:0.25},
      postalCode:{colSpan:0.25},
    },
},
];

const FaxContactForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const id = defaultData?.id;

  const [response, , loading, callFaxContactAPI, clearData] = useCRUD({
    id: GET_FAX_CONTACT_DATA,
    url: API_URL.faxContact,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(defaultData)) {
        const newData = data;
        callFaxContactAPI({ data: newData });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (isEqual(updatedFields?.practice, defaultData?.practice))
          delete updatedFields?.practice;
        if (!isEmpty(updatedFields)) {
          callFaxContactAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callFaxContactAPI, defaultData, id]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={faxContactFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft:'24px',
          paddingRight:'24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </Box>
  );
};

export default FaxContactForm;
