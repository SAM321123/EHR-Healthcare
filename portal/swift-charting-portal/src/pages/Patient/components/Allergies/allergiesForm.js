/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { getUTCDateTime, getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { SAVE_ALLERGIES_DATA } from 'src/store/types';
import { allergiesFormGroups } from './formGroup';
import { decrypt } from 'src/lib/encryption';

const initialData = { isActive: true };

const AllergiesForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const params = useParams();
  let { patientId } = params || {};
  patientId =decrypt(patientId);

    
  const id = defaultData?.id;

  const [response, , loading, callAllergiesSaveAPI, clearData] = useCRUD({
    id: SAVE_ALLERGIES_DATA,
    url: API_URL.allergies,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(defaultData)) {
        const newData = data;
        if(newData.dateOfOnSet){
          newData.dateOfOnSet = getUTCDateTime(newData.dateOfOnSet)
        }
        callAllergiesSaveAPI({ data: {...newData,patientId} });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (!isEmpty(updatedFields)) {
          if(updatedFields.dateOfOnSet){
            updatedFields.dateOfOnSet = getUTCDateTime(updatedFields.dateOfOnSet)
          }
          callAllergiesSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callAllergiesSaveAPI, defaultData, id]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      Events.trigger(`ADD_ALLEGRY_ON_ENCOUNTER`,response);
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
          formGroups={allergiesFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? initialData : defaultData}
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

export default AllergiesForm;
