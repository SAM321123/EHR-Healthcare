/* eslint-disable no-unused-vars */
import {
  Box
} from '@mui/material';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import userIcon from 'src/assets/images/user.png';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import UploadFile from 'src/components/form/UploadFile';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { UI_ROUTES } from 'src/lib/routeConstants';
import {
  getUpdatedFieldsValue,
  showSnackbar
} from 'src/lib/utils';
import { PATIENT_DATA } from 'src/store/types';
// import palette from '../../../theme/palette';
import patientFormGroups from '../../../Patient/components/formGroups';
import { decrypt } from 'src/lib/encryption';

const ProspectRegistration = () => {
  const navigate = useNavigate();
  const params = useParams();
  let { patientId } = params || {};
  if(patientId){
  patientId =decrypt(patientId);
  }
  const goToPatientList = () => {
    navigate(UI_ROUTES.patient);
  };
  const [response, , loading, patientApi, clearData] = useCRUD({
    id: PATIENT_DATA,
    url: API_URL.patient,
    type: REQUEST_METHOD.post,
  });
  const [
    patientUpdateResponse,
    ,
    patientUpdateLoading,
    patientUpdateApi,
    clearDataPatientUpdate,
  ] = useCRUD({
    id: PATIENT_DATA,
    url: API_URL.patient,
    type: REQUEST_METHOD.update,
  });
  const [patientData, patientDataLoading, getDetail, clearResponse] =
    usePatientDetail({
      patientId,
    });

  const defaultData = useMemo(() => {
    if (isEmpty(patientData)) return {};
    const clonedData = { ...patientData };
    const defaultData = {};
    patientFormGroups.map(item=>{
      defaultData[item.name] = clonedData[item.name]
    })

    defaultData.dob= dayjs(clonedData?.dob);
    const phoneFields = [
      "workPhone",
      "homePhone",
      "textMessagePhone",
      "preferredPhone",
      "alternativePhone"
    ];
    
    phoneFields.forEach(field => {
      if (defaultData[field] === null) {
        delete defaultData[field];
      }
    });
    return defaultData;
  }, [patientData]);
  
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, register,setValue } = form;
  useEffect(()=>{
    if(patientData){
    setValue('file',patientData.file)
    }
  },[patientData,setValue])
  const handleSaveAccountDetails = useCallback(
    (data) => {
      if(!data?.file){
        data.file = {}
      }
      const payload = {
        ...data,
      };
      console.log('data', payload.address);
      if (patientId) {
        const updatedFields = getUpdatedFieldsValue(data, patientData);
        patientUpdateApi({ ...updatedFields }, `/${patientId}`);
      } else {
        patientApi({ data: payload });
      }
    },
    [patientData, patientId]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      goToPatientList();
    }
  }, [response]);

  useEffect(() => {
    if (!isEmpty(patientUpdateResponse)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
      goToPatientList();
    }
  }, [patientUpdateResponse]);

  useEffect(
    () => () => {
      clearDataPatientUpdate(true);
      clearData(true);
    },
    []
  );

  return (
    <PageContent
      loading={loading || patientUpdateLoading || patientDataLoading}
    >
      <Box sx={{ display: 'flex', gap: '25px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box style={{}}>
            <CustomForm
              formGroups={patientFormGroups}
              columnsPerRow={1}
              form={form}
              defaultValue={defaultData || {}}
            />
          </Box>
          <Box style={{ display: 'flex', gap: 20 }}>
            <LoadingButton
              label="Cancel"
              variant="outlinedSecondary"
              onClick={goToPatientList}
            />
            <LoadingButton
              label="Save"
              onClick={handleSubmit(handleSaveAccountDetails)}
              loading={patientUpdateLoading || loading}
            />
          </Box>
        </Box>
      </Box>
    </PageContent>
  );
};

export default ProspectRegistration;
