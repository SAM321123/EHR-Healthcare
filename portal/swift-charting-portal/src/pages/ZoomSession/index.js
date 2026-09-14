import ZoomVideo from '@zoom/videosdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import { regexCustomText, requiredField, roleTypes } from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import { ADD_APPOINTMENT, PRACTICE_SETTING, VALIDATE_ZOOM_SESSION_INVITE } from 'src/store/types';
import PreJoinScreen from './preJoinScreen';
import ZoomAppV2 from './zoomV2/src/ZoomAppV2';
import ZoomContext from './zoomV2/src/context/zoom-context';
import { isEmpty } from 'lodash';
import Loader from 'src/components/Loader';
import palette from 'src/theme/palette';
import ErrorComponent from './errorComponentZoom';
import SideFeature from './zoomV2/src/feature/sideFeature';
// import Logo from 'src/components/Logo';

export const formGroups = [
  {
    inputType: 'text',
    type: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    pattern: regexCustomText,

  },
];
const ZoomSessionScreen = () => {
  let { sessionId } = useParams();
  sessionId = decrypt(sessionId);
  console.log("🚀 ~ ZoomSessionScreen ~ sessionId:", sessionId)
  const [user,userError ,userLoading ,,,validateToken ] = useAuthUser();
  const [joined,setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

const zmClient = ZoomVideo.createClient();
  const [isHostOrManager, setIsHostOrManager] = useState(false); 

  const [userName,setUserName] = useState('');
  const [validateSessionInviteResponse,validateSessionInviteError ,sessionLoading , callValidateSessionInviteAPI] = useCRUD({
    id: VALIDATE_ZOOM_SESSION_INVITE,
    url: API_URL.validateZoomSessionInvite,
    type: REQUEST_METHOD.post,
    shouldClearError:false,
  });

  const [practiceSetting,practiceSettingError ,practiceSettingLoading , callGetPracticeSetting, ] = useCRUD({
    id: PRACTICE_SETTING,
    url: API_URL.practiceSetting,
    type: REQUEST_METHOD.get,
  });

  const [response, , loading, callAppointmentSaveAPI, clearData] = useCRUD({
    id: ADD_APPOINTMENT,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });

  useEffect(()=>{
    if(!user){
    validateToken();
    }
  },[user]);

  useEffect(()=>{
    if(user && sessionId){
      const roleType = user.role ===roleTypes.patient?0:1;
      callGetPracticeSetting();
      callValidateSessionInviteAPI({data:{invitedUserId:user.userId,sessionId:sessionId,roleType}})
    }
  },[user,sessionId])


  useEffect(()=>{
if(user && validateSessionInviteResponse && practiceSetting){
  setIsLoading(false);
}
  },[user,validateSessionInviteResponse,practiceSetting]);

  // Handle the join button action
  const handleJoinSession = useCallback((data) => {
    setJoined(true);
    setUserName(data.name);
  },[]);

  const updateHostCheckState = (newState) => {
    setIsHostOrManager(newState);
  };


  if(validateSessionInviteError || userError || practiceSettingError){
  return <ErrorComponent practiceSetting={practiceSetting}/>
  }

  if(isLoading){
    return <Loader backgroundColor={palette.background.paper} loading={practiceSettingLoading || userLoading || sessionLoading} type="fullScreen" />
   }
  return (
    <>
  {joined?
    <div
      style={{
        display: 'flex',
        height: '100vh', // Use full viewport height
        overflow: 'hidden', // Prevent horizontal scrolling
        width: '100vw', // Use full viewport width
      }}
    >
      <div
        style={{
          flex: 3, // Occupy more space for ZoomAppV2
          overflow: 'hidden', // Prevent content overflow
          display: 'flex', // Ensure internal content uses flex
        }}
      >
      <ZoomContext.Provider value={zmClient}>
        <ZoomAppV2
          meetingArgs={{
            topic: sessionId,
            signature: validateSessionInviteResponse?.sessionToken,
            name: userName,
          }}
          userName={userName}
          sessionId={sessionId}
          sessionToken={validateSessionInviteResponse?.sessionToken}
          onZmClientUpdate={updateHostCheckState}

          onSessionComplete={() =>
            callAppointmentSaveAPI(
              { statusCode: 'complete' },
              `/${validateSessionInviteResponse?.sessionDetail?.appointment?.id}`
            )
          }
        />
   </ZoomContext.Provider>
       </div>
       { isHostOrManager && (
        <div
          style={{
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            height: '100%', // Match height with the parent container
            overflow: 'auto', // Ensure scroll if content overflows
            width: '100%',
          }}
        >  
          <SideFeature />
        </div>
       )}
     </div>
  // <ZoomContext.Provider value={zmClient}> 
  //     <ZoomAppV2 
  //       meetingArgs={{topic:sessionId, 
  //       signature:validateSessionInviteResponse?.sessionToken, 
  //       name:userName}} 
  //       userName={userName} 
  //       sessionId={sessionId} 
  //       sessionToken={validateSessionInviteResponse?.sessionToken} 
  //       onSessionComplete={() => callAppointmentSaveAPI({ statusCode: 'complete' }, 
  //       `/${validateSessionInviteResponse?.sessionDetail?.appointment?.id}`)}
  //     />
  //     <div 
  //       style={{
  //         flex: 1,
  //         display: 'flex',
  //         flexDirection: 'column',
  //         backgroundColor: '#fff',
  //         borderRadius: '12px',
  //         padding: '16px',
  //         boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  //         overflow: 'hidden', // Optional: Avoid scrollbars if content overflows
  //       }}
  //     >
  //       <SideFeature />
  //     </div>
  //   </div>
  //   </ZoomContext.Provider>
    :<PreJoinScreen handleJoinSession={handleJoinSession}/>}
    </>
  );
};

export default ZoomSessionScreen;
