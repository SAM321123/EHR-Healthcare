import { CardActions, CardContent } from '@mui/material'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { API_URL, REQUEST_METHOD } from 'src/api/constants'
import Container from 'src/components/Container'
import LoadingButton from 'src/components/CustomButton/loadingButton'
import CustomForm from 'src/components/form'
import useAuthUser from 'src/hooks/useAuthUser'
import useCRUD from 'src/hooks/useCRUD'
import { regTextArea, requiredField, roleTypes } from 'src/lib/constants'
import { getFullName } from 'src/lib/utils'
import { SAVE_CHAT_DATA } from 'src/store/types'
import { WiredPatientAutoComplete } from 'src/wiredComponent/Form/FormFields'


const NewChatForm = ({onClose,NewChatWindow}) => {
    const form = useForm();
    const {handleSubmit} = form;
   const [loginData] = useAuthUser();
   const { role,userId } = loginData || {};

   const isPatient = role===roleTypes.patient;
   
   let patientFormGroup;
if(isPatient)
{
 patientFormGroup = [  {
  ...WiredPatientAutoComplete({
    name: 'patient',
    label: 'Practitioner',
    url: API_URL.staff,
    params: { isActive: true },
    required: requiredField,
  }),

},
{
  inputType: 'textArea',
  name: 'message',
  textLabel: 'Message',
  colSpan: 1,
  pattern:regTextArea,
  required: requiredField,

},
]
}
else{
  patientFormGroup = [  {
    ...WiredPatientAutoComplete({
      name: 'patient',
      label: 'Patient',
      url: API_URL.getPatients,
      params: { isActive: true },
      required: requiredField,         
    }),
  
  },
  {
    inputType: 'textArea',
    name: 'message',
    textLabel: 'Message',
    colSpan: 1,
    pattern:regTextArea,
    required: requiredField,

  },
  ]

}
   const [response, , loading, callChatSaveAPI, clearData] = useCRUD({
    id: SAVE_CHAT_DATA,
    url: API_URL.chats,
    type: REQUEST_METHOD.post,
  });

 
useEffect(() => {
  if (response) {
    clearData(true);
     NewChatWindow(
      response?.id,
      response?.channelId,
      response?.receiverId,
      getFullName(response?.Receiver?.staff ||response?.Receiver?.patient),
      response?.Receiver?.staff?.file?.file ||response?.Receiver?.patient?.file?.file,
      response?.Receiver?.staff?.user?.lastActivity ||response?.Receiver?.patient?.user?.lastActivity,
    )
      onClose();
  }
}, [response, onClose]);

const onHandleSubmit = useCallback((data) => {
  const { patient, message } = data || {};
  if (patient) {
      callChatSaveAPI({ data: { ...patient, message, senderId: userId } });
  }
}, [callChatSaveAPI, userId]);

  return (
    <Container>
    <CardContent>
        <CustomForm form={form} formGroups={patientFormGroup}/>
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
          onClick={handleSubmit(onHandleSubmit)}
          label={'Create'}
          loading={loading}
        />
      </CardActions>
    </Container>
  )
}

export default NewChatForm