import { DateRange, LocationOn, Videocam, VideocamOff } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import logoIcon from "src/assets/images/logoMain.png";
import userImage from "src/assets/images/user.png";
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useAuthUser from 'src/hooks/useAuthUser';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormats, regexCustomText, requiredField } from 'src/lib/constants';
import { convertWithTimezone, getFullName, getImageUrl } from 'src/lib/utils';
import { PRACTICE_SETTING, VALIDATE_ZOOM_SESSION_INVITE } from 'src/store/types';
import MicVisualizerIcon from './micVisualizerIcon';

export const formGroups = [
  {
    inputType: 'text',
    type: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    pattern: regexCustomText,
    disabled: true,
  },
];

const PreJoinScreen = ({ handleJoinSession, sessionId } = {}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form || {};
  const [user, , userLoading] = useAuthUser();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null); // Reference to the media stream
  const [{ sessionDetail: { appointment = {} } = {} } = {}, , sessionLoading] = useCRUD({
    id: VALIDATE_ZOOM_SESSION_INVITE,
    url: API_URL.validateZoomSessionInvite,
    type: REQUEST_METHOD.post,
  });
  const [practiceSetting, , , ,] = useCRUD({
    id: PRACTICE_SETTING,
    url: API_URL.practiceSetting,
    type: REQUEST_METHOD.get,
  });

  const defaultData = useMemo(() => {
    if (user) {
      return { name: getFullName(user) };
    }
    return null;
  }, [user]);

  const handleJoin = useCallback((data) => {
    handleJoinSession(data);
  }, [handleJoinSession]);

  // Set up camera stream
  useEffect(() => {
    const getMediaStream = async () => {
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: isMicOn,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    if (isVideoOn || isMicOn) {
      getMediaStream();
    } else {
      stopMediaStream();
    }

    return () => {
      stopMediaStream();
    };
  }, [isMicOn, isVideoOn]);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      mediaStreamRef.current = null; // Clear the reference
    }
  };

  const toggleMic = () => {
    setIsMicOn(prev => {
      if (prev) {
        // If mic is currently on, turn it off
        stopMediaStream(); // Stop all media streams
      }
      return !prev;
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(prev => {
      if (prev) {
        // If video is currently on, turn it off
        stopMediaStream(); // Stop all media streams
      }
      return !prev;
    });
  };

  return (
    <>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ height: 80, display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #ddd' }}>
          <img src={practiceSetting?.logo?.file ? getImageUrl(practiceSetting?.logo?.file) : logoIcon} style={{ width: '90px', height: '60px' }} alt="logo" />
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, p: 3 }}>
          {/* Left Section - Appointment Details */}
          <Box sx={{ flex: 0.65, pr: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" fontWeight="bold">{appointment?.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">{convertWithTimezone(appointment.startDateTime, { format: dateFormats.MMDDYYYYhhmmA })}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">{appointment?.location?.name}</Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 3, lineHeight: 1.6, color: 'text.secondary' }}>
              {appointment?.note}
            </Typography>
          </Box>

          {/* Right Section - User Preview and Join Options */}
          <Box sx={{ flex: 0.35, pl: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Camera Preview or Avatar */}
            <Box sx={{
              width: '100%',
              height: 200,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {isVideoOn ? (
                <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <img alt="user" src={user?.file?.file ? getImageUrl(user?.file?.file) : userImage} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
              )}
            </Box>

            {/* Mic and Video Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <MicVisualizerIcon isMicOn={isMicOn} toggleMic={toggleMic} />
              <IconButton onClick={toggleVideo}>
                {isVideoOn ? <Videocam /> : <VideocamOff />}
              </IconButton>
            </Box>

            {/* User Name Input */}
            <CustomForm
              formGroups={formGroups}
              columnsPerRow={1}
              form={form}
              defaultValue={defaultData}
            />

            {/* Join Button */}
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit(handleJoin)}
              disabled={userLoading || sessionLoading}
              loading={userLoading || sessionLoading}
              label="Join Appointment"
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PreJoinScreen;
