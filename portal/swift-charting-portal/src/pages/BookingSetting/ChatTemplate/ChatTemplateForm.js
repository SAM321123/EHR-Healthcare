import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import { requiredField, successMessage } from 'src/lib/constants';
import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { GET_CHAT_TEMPLATE } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';

const chatTemplateForm = [
  {
    inputType: 'text',
    name: 'tag',
    textLabel: 'Template tag',
    required: requiredField,
    maxLength: { value: 100 },
  },
  {
    inputType: 'text',
    name: 'template',
    label: 'Template message',
    placeholder: 'Type your message here',
    required: { value: true, message: 'Template is required.' },
    minRows: 3,
    multiline: true,
    maxLength: { value: 1000 },
  },
];

const ChatTemplateForm = ({
  form,
  modalCloseAction,
  defaultData,
  handleOnFetchDataList,
}) => {
  const [response, , loading, callApi, clearResponse] = useCRUD({
    id: GET_CHAT_TEMPLATE,
    url: API_URL.chatTemplate,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const id = defaultData?.id;

  const { handleSubmit } = form;

  const initialData = useMemo(() => {
    const data = {
      tag: defaultData?.tag,
      template: defaultData?.template,
    };
    return data;
  }, [defaultData]);

  const onHandleSubmit = useCallback(
    (data) => {
      const payload = data;

      if (isEmpty(defaultData)) {
        callApi({ data: payload });
      } else if (initialData) {
        const updatedFields = getUpdatedFieldsValue(data, initialData);
        if (!isEmpty(updatedFields)) {
          callApi({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [defaultData, id, initialData]
  );

  useEffect(() => {
    if (response) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      modalCloseAction();
      clearResponse();
      handleOnFetchDataList();
    }
  }, [response]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={chatTemplateForm}
          form={form}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? {} : initialData}
        />
      </CardContent>
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
    </Box>
  );
};

export default ChatTemplateForm;
