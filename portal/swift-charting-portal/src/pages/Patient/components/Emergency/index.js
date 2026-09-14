import React, { useCallback, useEffect } from 'react';
import { CardActions, CardContent } from '@mui/material';
import Container from 'src/components/Container';
import {Box} from '@mui/material';

import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { GET_EMERGENCY_CONTACT, SAVE_EMERGENCY_CONTACT } from 'src/store/types';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import { useParams } from 'react-router-dom';
import { showSnackbar } from 'src/lib/utils';
import isEmpty from 'lodash/isEmpty';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import useQuery from 'src/hooks/useQuery';
import emergencyContactFormGroups from './formGroup';
import EmergencyContactRendrer from './render';
import { decrypt } from 'src/lib/encryption';
import useAuthUser from 'src/hooks/useAuthUser';
import { getModulePermisions } from 'src/utils/genricMethods';

const EmergencyContact = () => {
  let { patientId } = useParams();
  patientId =decrypt(patientId);

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, reset } = form;
  
  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate, isDelete, isUpdate, isRead, isPrint } = getModulePermisions({ moduleName: MODULE.emergencyContact, userData }) || {}
  
  const [
    { results: allEmergencyContactData = [] } = {},
    allEmergencyContactLoading,
  ] = useQuery({
    listId: `${GET_EMERGENCY_CONTACT}-${patientId}`,
    url: API_URL.emergencyContact,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId, limit: 100 },
  });


  const [response, , loading, callSaveAPI, clearData] = useCRUD({
    id: SAVE_EMERGENCY_CONTACT,
    url: API_URL.emergencyContact,
    type: REQUEST_METHOD.post,
  });
  const onHandleSubmit = useCallback((data) => {
    callSaveAPI({ data: { ...data, patientId } });
  }, []);

  const resetForm = () => {
    reset()
  }

  useEffect(() => {
    if (!isEmpty(response)) {
      Events.trigger(`REFRESH-TABLE-${GET_EMERGENCY_CONTACT}-${patientId}`);

      reset();
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData(true);
    }
  }, [response, reset]);
  return (
    <Container loading={allEmergencyContactLoading || loading}>
      <CardContent
        style={{ width: '75%', paddingTop: '54px', paddingBottom: 12 }}
      >
        <div>
          <CustomForm
            form={form}
            formGroups={emergencyContactFormGroups}
            columnsPerRow={1}
          />
           <Box style={{ display: 'flex', gap: 20, paddingTop: 20 }}>
            <LoadingButton
              label="RESET"
              variant="outlinedSecondary"
              onClick={resetForm}
            />
            {isCreate && <LoadingButton
              loading={loading}
              onClick={handleSubmit(onHandleSubmit)}
              label="ADD"
            />

            }
          </Box>
        </div>
        <div></div>
      </CardContent>
      <CardContent style={{ width: '75%', paddingTop: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {allEmergencyContactData.map((emergencyData) => (
            <EmergencyContactRendrer emergencyData={emergencyData} />
          ))}
        </div>
      </CardContent>
    </Container>
  );
};

export default EmergencyContact;
