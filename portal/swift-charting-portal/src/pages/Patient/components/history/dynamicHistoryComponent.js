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
import { successMessage } from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview';
import { GET_ALL_PATIENT_HISTORY, SAVE_ALL_PATIENT_HISTORY } from 'src/store/types';

const cardStyle={boxShadow:'none'};
const cardContentStyle={padding:0};

const DynamicHistoryComponent = ({formTypeCode,type}) => {
  let {patientId} = useParams();
  patientId =decrypt(patientId);
  const [rules, setRules] = useState([]);
  const [formGroups, setFormGroups] = useState([]);

  const [patientData] = usePatientDetail({
    patientId,
  });

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit,reset } = form;
  const [
    {results: [allPatientHistoryData]=[]}={},,
    allPatientHistoryLoading,
    getAllPatientHisotry,
    clearAllPatientHistory,
  ] = useCRUD({
    id: `${GET_ALL_PATIENT_HISTORY}-${type}`,
    url: API_URL.allPatientHistory,
    type: REQUEST_METHOD.get,
  });

  const [
{results:[formResponse]=[]}={}, ,
formResponseLoading,
getForm,
clearFormResponse,
] = useCRUD({
  id: `get-patient-medical-history-form-${type}`,
  url: API_URL.getFormList,
  type: REQUEST_METHOD.get,
  });
console.log("🚀 ~ DynamicHistoryComponent ~ formResponse:", allPatientHistoryData)
useEffect(()=>{
  getForm({formTypeCode,formCategoryCode:type});
  getAllPatientHisotry({patientId,limit:100,typeCode:type})
},[type,patientId,getAllPatientHisotry,formTypeCode,getForm])

useEffect(()=>{
  return ()=>{
    clearFormResponse(true)
    clearAllPatientHistory(true)
  }
},[clearFormResponse,clearAllPatientHistory]);

  useEffect(() => {
    if (!isEmpty(formResponse)) {
      setRules(JSON.parse(formResponse?.rules || '[]'));
      setFormGroups(
        JSON.parse(formResponse?.questions || '[]')
      );
    }
  }, [formResponse]);

  const [response, , loading, callSaveAPI, clearData] = useCRUD({
    id: SAVE_ALL_PATIENT_HISTORY,
    url: API_URL.allPatientHistory ,
    type:  REQUEST_METHOD.post,
  });


const onHandleSubmit=useCallback(()=>{
  
  callSaveAPI({data:{typeCode:type, response: JSON.stringify(form.getValues()),questions:formResponse?.questions,patientId}})
},[form,formResponse]);



useEffect(()=>{
  if(!isEmpty(response)){
    Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
    showSnackbar({
      message:  response?.created? successMessage.create:successMessage.update,
      severity: 'success',
    });
    clearData(true);
    
  }
},[response,reset,patientId])

const defaultSubmissionValue = useMemo(() => {
if(!isEmpty(allPatientHistoryData) && allPatientHistoryData?.response){
  return JSON.parse(allPatientHistoryData?.response || '{}')
}
    return {};
}, [allPatientHistoryData]);

  return (
    <Container loading={allPatientHistoryLoading || loading || formResponseLoading}>
      <CardContent style={{width:'86%',paddingTop:'54px',paddingBottom:12,}}>
        <div>
         <BuilderPreview
                form={form}
                formGroups={formGroups}
                setFormGroups={setFormGroups}
                defaultValue={defaultSubmissionValue}
                cardStyle={cardStyle}
                cardContentStyle={cardContentStyle}
              />
        <div style={{marginTop:10}}>
        {!isEmpty(formResponse) && <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label={allPatientHistoryData?.response ? "Update" :"ADD"}
          disabled={loading || formResponseLoading || allPatientHistoryLoading}
        />}
        </div>
        </div>
        <div>

        </div>
      </CardContent>
    </Container>
  )
}
export default DynamicHistoryComponent;