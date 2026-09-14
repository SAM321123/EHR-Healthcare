import React, { useCallback, useEffect, useMemo } from 'react';
import { CardActions, CardContent } from '@mui/material'
import Container from 'src/components/Container'
import familyHistoryFormGroups from './formGroups'
import CustomForm from 'src/components/form'
import { useForm } from 'react-hook-form'
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import {  GET_FAMILY_HISTORY, SAVE_FAMILY_HISTORY } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { useParams } from 'react-router-dom';
import { showSnackbar } from 'src/lib/utils';
import isEmpty  from 'lodash/isEmpty';
import { successMessage } from 'src/lib/constants';
import FamilyHistoryRendrer from './rendrer';
import Events from 'src/lib/events';
import useQuery from 'src/hooks/useQuery';
import { v4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { decrypt } from 'src/lib/encryption';

const FamilyHistory = () => {
  let {patientId} = useParams();
  patientId =decrypt(patientId);

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit,reset } = form;
  const [
    {results: allFamilyHistoryData=[]}={},
    allFamilyHistoryLoading,
  ] = useQuery({
    listId: `${GET_FAMILY_HISTORY}-${patientId}`,
    url: API_URL.familyHistory,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId,limit:100 },
  });


  const [response, , loading, callSaveAPI, clearData] = useCRUD({
    id: SAVE_FAMILY_HISTORY,
    url: API_URL.familyHistory,
    type:  REQUEST_METHOD.post,
  });
const onHandleSubmit=useCallback((data)=>{
  data.isActive =data.isActive ==='true'?true:false
  callSaveAPI({data:{...data,patientId}})
  form.setValue('description' , '')
},[]);

const parsedFormGroup = useMemo(()=>{
  const temp = cloneDeep(familyHistoryFormGroups);
  return temp.map(item=>{
   item.extraId=v4();
   return item;
  })
 },[]);
 
useEffect(()=>{
  if(!isEmpty(response)){
    Events.trigger(`REFRESH-TABLE-${GET_FAMILY_HISTORY}-${patientId}`);
    Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)

    reset()
    showSnackbar({
      message:  successMessage.create,
      severity: 'success',
    });
    clearData(true)
  }
},[response,reset,patientId])
  return (
    <Container loading={allFamilyHistoryLoading || loading}>
      <CardContent style={{width:'75%',paddingTop:'54px',paddingBottom:12}}>
        <div>
      <CustomForm
          form={form}
          formGroups={parsedFormGroup}
          columnsPerRow={1}
        />
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
      <div style={{display:'flex',flexDirection:'column',gap:40}}>
        {
          allFamilyHistoryData.map(historyDataItem=><FamilyHistoryRendrer historyDataItem={historyDataItem} />)
}
</div>
      </CardContent>
    </Container>
  )
}

export default FamilyHistory