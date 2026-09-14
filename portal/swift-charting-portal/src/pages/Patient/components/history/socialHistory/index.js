import { CardContent } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import { GET_SOCIAL_HISTORY, SAVE_SOCIAL_HISTORY } from 'src/store/types';
import SocialHistoryFormGroups from './formGroups';
import SocialHistoryRendrer from './render';
import usePatientDetail from 'src/hooks/usePatientDetail';
import BuilderPreview from 'src/pages/FormBuilder/NewForm/BuilderPreview';

const SocialHistory = () => {
  const {patientId} = useParams();
  const [rules, setRules] = useState([]);
  const [formGroups, setFormGroups] = useState([]);
  const [patientData] = usePatientDetail({
    patientId,
  });


  const form = useForm({ mode: 'onChange' });
  const { handleSubmit,reset } = form;
  const [
    {results: [allSocialHistoryData]=[]}={},
    allSocialHistoryLoading,
  ] = useQuery({
    listId: GET_SOCIAL_HISTORY,
    url: API_URL.socialHistory,
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

  const [response, , loading, callSaveAPI, clearData] = useCRUD({
    id: SAVE_SOCIAL_HISTORY,
    url: API_URL.socialHistory ,
    type:  REQUEST_METHOD.post,
  });
const onHandleSubmit=useCallback((data)=>{
  data.isActive =data.isActive ==='true'?true:false
  callSaveAPI({data:{...data,patientId}})
},[]);

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

useEffect(()=>{
  if(!isEmpty(response)){
    Events.trigger(`REFRESH-TABLE-${GET_SOCIAL_HISTORY}`);
    Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)

    reset()
    showSnackbar({
      message:  successMessage.create,
      severity: 'success',
    });
    clearData(true)
  }
},[response,reset,patientId]);

const defaultSubmissionValue = useMemo(() => {
  if(!isEmpty(allSocialHistoryData) && allSocialHistoryData?.response){
    return JSON.parse(allSocialHistoryData?.response || '{}')
  }
      return {};
  }, [allSocialHistoryData]);

  return (
    <Container loading={allSocialHistoryLoading || loading}>
      <CardContent style={{width:'75%',paddingTop:'54px',paddingBottom:12}}>
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
          label="ADD"
        />
        </div>
        </div>
        <div>

        </div>
      </CardContent>
      <CardContent style={{width:'75%',paddingTop:12}}>
      <div style={{display:'flex',flexDirection:'column',gap:40 ,}}>
        {
          allSocialHistoryData.map(historyDataItem=>< SocialHistoryRendrer historyDataItem={historyDataItem} />)
}
</div>
      </CardContent>
    </Container>
  )
}
export default SocialHistory;