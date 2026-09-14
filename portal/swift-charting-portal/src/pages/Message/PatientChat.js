import { CardActions, CardContent } from '@mui/material'
import { useCallback, useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { API_URL, REQUEST_METHOD } from 'src/api/constants'
import Container from 'src/components/Container'
import LoadingButton from 'src/components/CustomButton/loadingButton'
import CustomForm from 'src/components/form'
import { ChatContext } from 'src/context/chatContext'
import useAuthUser from 'src/hooks/useAuthUser'
import useCRUD from 'src/hooks/useCRUD'
import usePatientDetail from 'src/hooks/usePatientDetail'
import { regTextArea, requiredField, roleTypes } from 'src/lib/constants'
import { getFullName } from 'src/lib/utils'
import { GET_EXISTING_CHAT, SAVE_CHAT_DATA } from 'src/store/types'
import { WiredPatientAutoComplete } from 'src/wiredComponent/Form/FormFields'


const PatientChat = ({onClose,NewChatWindow, initialValues, patientUserId, patient}) => {
    const form = useForm();
    const {handleSubmit} = form;
    const [loginData] = useAuthUser();
    const { role,userId } = loginData || {};

      const { response, loading, filters, handleFilters, handleOnFetchDataList } =
        useContext(ChatContext);

    const [isChatExist, , existingChatLoading, getExistingChat, clearExistingChatData] = useCRUD({
      id: GET_EXISTING_CHAT,
      url: `${API_URL.chats}/isExistingChat/${patientUserId}`,
      type: REQUEST_METHOD.get,
    });


    useEffect(()=> {
      getExistingChat();
      handleOnFetchDataList();
    }, [])
   
    const patientFormGroup = [  
    {
      inputType: 'textArea',
      name: 'message',
      textLabel: 'Message',
      colSpan: 1,
      pattern:regTextArea,
      required: requiredField,
    },
  ]

  const [saveChatResponse, , saveChatloading, callChatSaveAPI, clearData] = useCRUD({
    id: SAVE_CHAT_DATA,
    url: API_URL.chats,
    type: REQUEST_METHOD.post,
  });

  let chatData;
  if(isChatExist){
    chatData = response?.results?.find(
      (chat) => chat?.id === (saveChatResponse?.chatId || saveChatResponse?.id)
    );
  }

  
  useEffect(() => {
    if (saveChatResponse) {
      clearData(true);
      if(isChatExist){
        NewChatWindow(
          chatData?.id,
          chatData?.channelId,
          chatData?.receiverId,
          getFullName(chatData?.Receiver?.staff ||chatData?.Receiver?.patient),
          chatData?.Receiver?.staff?.file?.file ||chatData?.Receiver?.patient?.file?.file,
          chatData?.Receiver?.staff?.user?.lastActivity ||chatData?.Receiver?.patient?.user?.lastActivity,
        )
      }else{
         NewChatWindow(
          saveChatResponse?.id,
          saveChatResponse?.channelId,
          saveChatResponse?.receiverId,
          getFullName(saveChatResponse?.Receiver?.staff ||saveChatResponse?.Receiver?.patient),
          saveChatResponse?.Receiver?.staff?.file?.file ||saveChatResponse?.Receiver?.patient?.file?.file,
          saveChatResponse?.Receiver?.staff?.user?.lastActivity ||saveChatResponse?.Receiver?.patient?.user?.lastActivity,
        )
      }

      onClose();
    }
  }, [saveChatResponse, onClose]);

  

const onHandleSubmit = useCallback((data) => {
  const { message } = data || {};
  
  if (!isChatExist) {
    callChatSaveAPI({ data: { ...patient, message, senderId: userId } });
  }else{
    callChatSaveAPI({ data: { chatId: isChatExist?.id, message, receiverId: patientUserId, senderId: userId } }, `/${isChatExist?.id}`);
  }
}, [callChatSaveAPI, userId, patientUserId, isChatExist]);

  return (
    <Container loading={existingChatLoading}>
    <CardContent>
        <CustomForm 
          form={form} 
          formGroups={patientFormGroup} 
          defaultValue={initialValues}
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
          onClick={handleSubmit(onHandleSubmit)}
          label={'Create'}
          loading={saveChatloading}
        />
      </CardActions>
    </Container>
  )
}

export default PatientChat