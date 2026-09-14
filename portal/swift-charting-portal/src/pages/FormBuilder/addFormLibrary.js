import React, { useCallback, useEffect, useMemo } from 'react';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import {
  inputLength,
  regexCommonText,
  requiredField,
} from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import CardContent from '@mui/material/CardContent';

import { WiredMasterAutoComplete } from 'src/wiredComponent/Form/FormFields';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { Box, CardActions } from '@mui/material';

export default function AddFormLibrary({ handleModal, defaultData }) {
  const [apiResponse, , loading, apiHandler, clear] = useCRUD({
    id: 'sharedLibarayForm',
    url: API_URL.formLibrary,
    type: REQUEST_METHOD.post,
  });

  const emailTemplateFormGroups = useMemo(
    () => [
      {
        inputType: 'text',
        name: 'name',
        textLabel: 'Name',
        required: requiredField,
        placeholder: 'Form name',
        maxLength: { ...inputLength.commonTextLength },
        pattern: {
          value: regexCommonText.value,
          message: `Name ${regexCommonText.message}`,
        },
      },
      {
        ...WiredMasterAutoComplete({
          code: 'form_category',
          label: 'Form Category',
          name: 'formCategory',
          colSpan: 1,
          required: requiredField,
          placeholder: 'Enter here',
          params: { parentCode: defaultData.formTypeCode},
          cache: false,
          fetchInitial:true,
          labelAccessor: 'name',
          valueAccessor: 'code',
        }),
      },
    ],
    []
  );

  const form = useForm({ mode: 'onChange' });

  const { handleSubmit, setError } = form;

  useEffect(() => {
    if (apiResponse) {
      showSnackbar({
        severity: 'success',
        message: 'Imported successfully',
      });
      clear();
      handleModal();
    }
  }, [apiResponse, clear, handleModal]);

  const onHandleSubmit = useCallback(
    (data) => {
      delete data.formTypeCode
      let payload = { ...data };
      if (!payload.formCategory) {
        setError('formCategory', true);
        return;
      }

      apiHandler({ data: payload });
    },
    [apiHandler, setError]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={emailTemplateFormGroups}
          columnsPerRow={2}
          defaultValue={defaultData}
          form={form}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={handleModal}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          label="Import"
          onClick={handleSubmit(onHandleSubmit)}
        />
      </CardActions>
    </Box>
  );
}
