/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Box from 'src/components/Box';
import {
  regexUrl,
  requiredField,
  successMessage,
  inputLength,
  fileInfo,
} from 'src/lib/constants';
import CustomForm from 'src/components/form';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { GET_EDUCATION_CONTENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';

const educationFormGroup = (watch) => [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    colSpan: 2,
    maxLength: { ...inputLength.commonTextLength },
  },
  {
    inputType: 'text',
    name: 'description',
    minRows: 3,
    textLabel: 'Description',
    multiline: true,
    colSpan: 2,
    placeholder: 'Type Short Description here',
    maxLength: { value: 1000 },
  },
  {
    inputType: 'checkBox',
    name: 'isUrl',
    label: 'URL',
    colSpan: 2,
  },
  ...(watch('isUrl')
    ? [
        {
          inputType: 'text',
          type: 'url',
          name: 'url',
          textLabel: 'URL',
          pattern: regexUrl,
          colSpan: 2,
          required: requiredField,
        },
      ]
    : [
        {
          inputType: 'uploadFile',
          name: 'file',
          textLabel: 'Upload File',
          gridProps: { md: 12 },
          accept: '.mp4',
          colSpan: 2,
          required: requiredField,
          fileInfo:{ type: fileInfo.EDUCATION_CONTENT },
        },
      ]),
];

const EducationForm = ({
  form,
  modalCloseAction,
  refetchDataList,
  defaultData,
}) => {
  const { handleSubmit, watch } = form;

  const id = defaultData?.id;

  const initialData = useMemo(() => {
    const data = {
      name: defaultData?.name,
      description: defaultData?.description,
      isUrl: defaultData?.isUrl,
      url: defaultData?.url,
      file: defaultData?.file,
      type: defaultData?.type,
    };

    return data;
  }, [defaultData]);

  const [updateServiceData, , loading, callEducationAPI, clearData] = useCRUD({
    id: GET_EDUCATION_CONTENT,
    url: API_URL.educationContent,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (data?.file?.id) {
        data.type = (data?.file?.mimetype || '').split('/')?.[0];
        data.file = data?.file?.id;
      }
      if (data?.isUrl) {
        data.file = null;
        data.type = '';
      } else {
        data.url = null;
      }
      if (isEmpty(defaultData)) {
        const newData = data;
        callEducationAPI({ data: newData });
      } else {
        if (initialData?.file?.id) {
          initialData.file = initialData?.file?.id;
        }
        const updatedFields = getUpdatedFieldsValue(data, initialData);

        if (!isEmpty(updatedFields)) {
          callEducationAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callEducationAPI, defaultData]
  );

  useEffect(() => {
    if (updateServiceData) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      modalCloseAction();
      clearData();
      refetchDataList();
    }
  }, [updateServiceData]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={educationFormGroup(watch)}
          form={form}
          columnsPerRow={2}
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

export default EducationForm;
