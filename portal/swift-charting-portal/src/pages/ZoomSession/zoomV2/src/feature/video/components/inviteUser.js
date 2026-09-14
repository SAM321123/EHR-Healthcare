import { CardActions, CardContent } from '@mui/material';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { decrypt } from 'src/lib/encryption';
import { showSnackbar } from 'src/lib/utils';
import { INVITE_USER_ZOOM_SESSION } from 'src/store/types';
import { WiredPatientAutoComplete } from 'src/wiredComponent/Form/FormFields';

const formGroups = [
    {...WiredPatientAutoComplete({label:'Patients',name:'patients',multiple:true})},
    {
        name: 'practitioners',
        label: 'Practitioners',
        inputType: 'wiredAuto',
        url: API_URL.staff,
        disableClearable: true,
        labelAccessor: ['title.name', 'otherTitle', 'firstName', 'middleName', 'lastName'],
        valueAccessor: 'id',
        multiple:true,
      },
];
const InviteUser = ({onClose,}) => {
    let { sessionId } = useParams();
    sessionId = decrypt(sessionId);
    const form = useForm();
    const {handleSubmit} = form;

    const [inviteResponse, , inviteLoading,callInviteAPI,clearInviteResponse] = useCRUD({
        id: INVITE_USER_ZOOM_SESSION,
        url: API_URL.inviteUserToZoomSession,
        type: REQUEST_METHOD.post,
      });

    const onSubmit =useCallback((data)=>{
        const {patients,practitioners} = data || {};
        const allUsers = [...(patients || []),...(practitioners ||[])]
        const invitedUserIds = [];
        for(let singleUser of allUsers){
            if(!invitedUserIds.includes(singleUser.userId))
            invitedUserIds.push(singleUser.userId);
        }
        callInviteAPI({data:{sessionId,invitedUserIds,roleType:0}})
    },[sessionId]);

    useEffect(()=>{
        if(!isEmpty(inviteResponse)){
            showSnackbar({
                message: `Invited successfully`,
                severity: 'success',
              });
              clearInviteResponse(true)
              onClose();
        }
    },[inviteResponse]);

  return (
    <Box>
    <CardContent>
      <CustomForm
        form={form}
        formGroups={formGroups}
        columnsPerRow={1}
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
        onClick={onClose}
        label="Cancel"
      />
      <LoadingButton
        loading={inviteLoading}
        onClick={handleSubmit(onSubmit)}
        label="Save"
      />
    </CardActions>
  </Box>
  )
}

export default InviteUser