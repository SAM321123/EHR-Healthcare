/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { SAVE_DOCUMENTS_DATA } from 'src/store/types';
import CustomForm from 'src/components/form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { inputLength, requiredField, successMessage } from 'src/lib/constants';
import {
  WiredMasterAutoComplete,
  WiredStaffField,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import { useParams } from 'react-router-dom';
import Events from 'src/lib/events';
import { decrypt } from 'src/lib/encryption';

const documentsFormGroups = [
  {
    inputType: 'uploadFile',
    name: 'file',
    textLabel: 'Browse',
    required: requiredField,
    buttonStyle: { backgroundColor: '#3788d8', color: 'white' },
    isDownload: 'true',
    colSpan: 1,
  },
  {
    inputType: 'text',
    type: 'text',
    name: 'title',
    textLabel: 'Title',
    required: requiredField,
    colSpan: 0.3333,
  },
  {
    ...WiredMasterField({
      code: 'patient_document_type',
      filter: { limit: 20 },
      name: 'typeCode',
      label: 'Type',
      labelAccessor: 'name',
      valueAccessor: 'code',
      colSpan: 0.3333,
      placeholder: 'Select',
      required: requiredField,
      cache: false,
    }),
  },
  {
    inputType: 'date',
    name: 'date',
    textLabel: 'Date',
    required: requiredField,
    colSpan: 0.3333,
  },
  {
    ...WiredStaffField({
      name: 'providerId',
      label: 'Assign to',
      placeholder: 'Select',
      cache: false,
    }),
  },
  {
    inputType: 'textArea',
    name: 'description',
    textLabel: 'Description ',
    colSpan: 1,
  },
];

const DocumentForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const params = useParams();
  let {patientId}= params || {}
  patientId =decrypt(patientId);
  
  const id = defaultData?.id;

  const [response, , loading, callDocumentsSaveAPI, clearData] = useCRUD({
    id: SAVE_DOCUMENTS_DATA,
    url: API_URL.document,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      console.log('ashishdata', data);
      data.fileId = data?.file?.id;
      delete data.file;
      delete data.type;
      if (isEmpty(defaultData)) {
        const newData = data;
        callDocumentsSaveAPI({ data: { ...newData, patientId } });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);

        if (!isEmpty(updatedFields)) {
          callDocumentsSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callDocumentsSaveAPI, defaultData, id]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
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
          formGroups={documentsFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
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

export default DocumentForm;
