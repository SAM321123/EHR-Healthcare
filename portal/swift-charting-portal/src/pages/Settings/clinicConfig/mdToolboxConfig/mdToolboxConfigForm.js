import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import CustomForm from 'src/components/form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { MD_TOOLBOX_CONFIG } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { regexCustomText, requiredField, successMessage } from 'src/lib/constants';

const mdToolboxConfirFormGroups = [
  {
    inputType: 'text',
    name: 'appName',
    pattern: regexCustomText,
    textLabel: 'App Name',
    required: requiredField,
    colSpan:0.5,
  },
  {
    inputType: 'number',
    name: 'practiceId',
    textLabel: 'Practice ID',
    required: requiredField,
    colSpan:0.5,
  },
  {
    inputType: 'text',
    name: 'mdToolboxKey',
    textLabel: 'Md Toolbox Key',
    required: requiredField,
    pattern: regexCustomText,
    colSpan:1,
  },
];

const MdToolboxConfigForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const id = defaultData?.id;

  const [response, , loading, callMdToolboxConfigAPI, clearData] = useCRUD({
    id: MD_TOOLBOX_CONFIG,
    url: API_URL.mdToolboxConfig,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(defaultData)) {
        const newData = data;
        callMdToolboxConfigAPI({ data: newData });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (isEqual(updatedFields?.practice, defaultData?.practice))
          delete updatedFields?.practice;
        if (!isEmpty(updatedFields)) {
          callMdToolboxConfigAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callMdToolboxConfigAPI, defaultData, id]
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
          formGroups={mdToolboxConfirFormGroups}
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

export default MdToolboxConfigForm;
