import { CircularProgress, IconButton } from '@mui/material';
import { clone, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import Events from 'src/lib/events';
import { GET_MEDICAL_HISTORY, UPDATE_MEDICAL_HISTORY,   } from 'src/store/types';
import palette from 'src/theme/palette';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';
import del from 'src/assets/images/delimg.png';
import  edit  from 'src/assets/images/editimg.png'
import MedicalHistoryFormGroups from './formGroups';
import AlertDialog from 'src/components/AlertDialog';
import { useParams } from 'react-router-dom';

const MedicalHistoryRendrer = ({historyDataItem={}}) => {
    const [mode,setMode] = useState('view');
    const [open,setOpen] = useState(false);
    const params = useParams();
    const {patientId}= params || {}
    const [response, , loading, callUpdateAPI, clearData] = useCRUD({
        id: `${UPDATE_MEDICAL_HISTORY}-${historyDataItem?.id}`,
        url: `${API_URL.medicalHistory}/${historyDataItem?.id}`,
        type:  REQUEST_METHOD.update,
      });
    const form = useForm({ mode: 'onChange' });
    const { handleSubmit,reset } = form;

    useEffect(()=>{
        if(!isEmpty(response)){
            Events.trigger(`REFRESH-TABLE-${GET_MEDICAL_HISTORY}`);
            Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)

            reset()
            showSnackbar({
                message:  successMessage.update,
                severity: 'success',
              });
            setViewMode();
            clearData(true);
            setOpen(false)

        }
    },[response]);

    const defaultValue= useMemo(()=>{
        return MedicalHistoryFormGroups.reduce((acc,item)=>{
            const clonedhistoryDataItem = clone(historyDataItem)
            if(item.name){
             acc[item.name]=clonedhistoryDataItem[item.name];
            }
             return acc
        },{})
    },[historyDataItem])
    const setEditMode=()=>{
        setMode('edit');
    }
    const setViewMode = ()=>{
        setMode('view')
    }

    const deleteData = useCallback(()=>{
        callUpdateAPI({isDeleted:true});
    },[callUpdateAPI]);

    const deleteDialogBox = useCallback((data) => {
        setOpen((value) => !value);
      }, []);

      const dialogActions = useMemo(
        () => [
          {
            title: 'Cancel',
            action: () => setOpen((current) => !current),
            actionStyle: { color: palette.common.black, padding: '8px' },
            variant: 'secondary',
          },
          {
            title: 'Confirm',
            action: deleteData,
            actionStyle: { color: palette.primary.main, padding: '8px' },
            variant: 'secondary',
          },
        ],
        [deleteData]
      );
    

    const onHandleSubmit = useCallback((data)=>{
        const updatedFields = getUpdatedFieldsValue(data, defaultValue);
        if (!isEmpty(updatedFields)) {
        callUpdateAPI(updatedFields)
        }else{
            showSnackbar({
                message: 'No changes found',
                severity: 'error',
              });
        }
    },[defaultValue])
  return (
    <>
    {mode==='edit' &&   <div>
      <CustomForm
          form={form}
          formGroups={MedicalHistoryFormGroups}
          columnsPerRow={1}
          defaultValue={defaultValue}
        />
        <div style={{marginTop:10,display:'flex',gap:10}}>
        <LoadingButton
          onClick={setViewMode}
          label="Cancel"
          variant="outlinedSecondary"
        /> 
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
        </div>
        </div>}
        {mode==='view' && <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{backgroundColor:'#F8F9FC',padding:12,display:'flex',justifyContent:'space-between',gap:82.25,borderRadius:4,alignItems:'center'}}>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        <div style={{display:'flex',gap:10}}>
                            <div><Typography  style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>{`${historyDataItem?.relationship?.name || `Tobacco`} `}</Typography></div>
                            <div><Typography  style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>{`${historyDataItem?.condition?.name || `Since 02/11/2020`}`}</Typography></div>
                        </div>
                        <div style={{border:`1px solid ${historyDataItem?.status?.colorCode || palette.border.main}`,borderRadius:3.89,padding:'5px 22px'}}>
                            <Typography color={historyDataItem?.status?.colorCode} style={{fontSize:12,fontWeight:400,lineHeight:'18px'}}>{historyDataItem?.status?.name || 'Active'}</Typography>
                        </div>
                    </div>
                    <div style={{display:'flex',gap:12}}>
                       {loading && <CircularProgress size={20} />}
                        <IconButton onClick={setEditMode} style={{border:"none",backgroundColor:"unset",padding:'0px'}}><img src={edit} alt="edit" style={{width:"24px",height:"24px"}}/></IconButton>
                        <IconButton onClick={deleteDialogBox} style={{border:"none",backgroundColor:"unset",padding:'0px'}}><img src={del} alt='del' style={{width:"24px",height:"24px"}} /></IconButton>

                    </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,padding:12,border:`1px solid ${palette.border.main}`,borderRadius:4}}>
                <div>
                    <Typography  style={{fontSize:12,fontWeight:500,lineHeight:'18px'}}>Details</Typography>
                </div>
                <div><Typography color={palette.text.secondary} style={{fontSize:12,fontWeight:400,lineHeight:'18px',width:'80%'}} >{historyDataItem?.description || 'Vestibulum tempus imperdiet sem ac porttitor. Vivamus pulvinar commodo orci, suscipit porttitor velit elementum non. Fusce nec pellentesque erat, id lobortis nunc. Donec dui leo, ultrices quis turpis nec'}</Typography></div>
                </div>
            </div>}
            <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
            </>

  )
}

export default MedicalHistoryRendrer;