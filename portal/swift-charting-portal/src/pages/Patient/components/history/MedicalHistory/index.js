import { CardContent } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import useQuery from 'src/hooks/useQuery';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview';
import { GET_MEDICAL_HISTORY, SAVE_MEDICAL_HISTORY } from 'src/store/types';

const MedicalHistory = () => {
  const {patientId} = useParams();
  const [rules, setRules] = useState([]);
  const [formGroups, setFormGroups] = useState([]);

  const [patientData] = usePatientDetail({
    patientId,
  });

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit,reset } = form;
  const [
    {results: [allMedicalHistoryData]=[]}={},
    allMedicalHistoryLoading,
  ] = useQuery({
    listId: GET_MEDICAL_HISTORY,
    url: API_URL.medicalHistory,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId,limit:100 },
  });

  const [
{results:[formResponse]=[]}={}, ,
    formResponseLoading,
    getForm,
    clearFormResponse,
  ] = useCRUD({
    id: `get-patient-medical-history-form-${patientId}`,
    url: API_URL.getFormList,
    type: REQUEST_METHOD.get,
  });
useEffect(()=>{
  getForm({formTypeCode:'FT_HISTORY_TEMPLATES',formCategoryCode:'fc_patient_medical_history'})
},[])

useEffect(()=>{
  return ()=>{
    clearFormResponse(true)
  }
},[clearFormResponse])
  useEffect(() => {
    if (!isEmpty(formResponse)) {
      setRules(JSON.parse(formResponse?.rules || '[]'));
      setFormGroups(
        JSON.parse(formResponse?.questions || '[]')
      );
    }
  }, [formResponse]);

  const [response, , loading, callSaveAPI, clearData] = useCRUD({
    id: SAVE_MEDICAL_HISTORY,
    url: API_URL.medicalHistory ,
    type:  REQUEST_METHOD.post,
  });


const onHandleSubmit=useCallback(()=>{
  
  callSaveAPI({data:{ response: JSON.stringify(form.getValues()),questions:formResponse?.questions,patientId}})
},[form,formResponse]);



useEffect(()=>{
  if(!isEmpty(response)){
    Events.trigger(`REFRESH-TABLE-${GET_MEDICAL_HISTORY}`);
    Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
    showSnackbar({
      message:  response?.created? successMessage.create:successMessage.update,
      severity: 'success',
    });
    clearData(true)
  }
},[response,reset,patientId])

const defaultSubmissionValue = useMemo(() => {
if(!isEmpty(allMedicalHistoryData) && allMedicalHistoryData?.response){
  return JSON.parse(allMedicalHistoryData?.response || '{}')
}
    return {};
}, [allMedicalHistoryData]);

  return (
    <Container loading={allMedicalHistoryLoading || loading}>
      <CardContent style={{width:'86%',paddingTop:'54px',paddingBottom:12,}}>
        <div>
        {(formGroups?.length > 0 || rules?.length > 0) && ( <BuilderPreview
                form={form}
                rules={rules}
                formGroups={formGroups}
                setFormGroups={setFormGroups}
                defaultValue={defaultSubmissionValue}
                patient = {patientData}
                cardStyle={{boxShadow:'none'}}
                cardContentStyle={{padding:0}}
                showSectionTitle={false}
              />) }
        <div style={{marginTop:10}}>
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label={allMedicalHistoryData?.response ? "Update" :"ADD"}
          disabled={loading || formResponseLoading}
        />
        </div>
        </div>
        <div>

        </div>
      </CardContent>
    </Container>
  )
}
export default MedicalHistory;