/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormats, successMessage } from 'src/lib/constants';
import { convertToUtc, dateFormatterDayjs, getUTCDateTime, getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { SAVE_DIAGNOSIS_DATA } from 'src/store/types';
import { diagnosisFormGroups } from './formGroup';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';

const initialData = { isActive: 1 };

const DignosisForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const params = useParams();
  let { patientId } = params || {};
  patientId =decrypt(patientId);

  const id = defaultData?.id;

  const [response, , loading, callDiagnosisSaveAPI, clearData] = useCRUD({
    id: SAVE_DIAGNOSIS_DATA,
    url: API_URL.diagnosis,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if(data.problemId){
        data.problemId = data.problemId.id;
      }
      if(data.ICDId){
        data.ICDId = data.ICDId.id;
      }
      if (isEmpty(defaultData)) {

        const newData = data;
        if(newData.startDate){
          newData.startDate = getUTCDateTime(newData.startDate)
        }
        if(newData.endDate){
          newData.endDate = getUTCDateTime(newData.endDate)
        }

        callDiagnosisSaveAPI({ data: {...newData,patientId} });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);

        if(updatedFields.startDate){
          updatedFields.startDate = getUTCDateTime(updatedFields.startDate)
        }
        if(updatedFields.endDate){
          updatedFields.endDate = getUTCDateTime(updatedFields.endDate)
        }
        if (!isEmpty(updatedFields)) {
          callDiagnosisSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callDiagnosisSaveAPI, defaultData, id]
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
      Events.trigger(`ADD_DIAGNOSIS_ON_ENCOUNTER`,response);
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);


  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={diagnosisFormGroups}
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

export default DignosisForm;
