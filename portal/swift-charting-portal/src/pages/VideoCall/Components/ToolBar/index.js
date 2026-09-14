import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import styles from './styles';
import SendInvite from '../SendInvite';
import MuteAudioButton from '../MuteAudioButton';
import EndCallButton from '../EndCallButton';
import MuteVideoButton from '../MuteVideoButton';
import ShowParticipantsButton from '../ShowParticipantsButton';
import ChatButton from '../ChatButton';

export default function ToolBar({
  room,
  cameraPublishing,
  appointment,
  publisher,
  hasAudio,
  setHasAudio = () => {},
  hasVideo,
  setHasVideo = () => {},
  setShowParticipants = () => {},
  showSendInvite = false,
  setShowSendInvite = () => {},
  streams = [],
}) {
  const navigate = useNavigate();
  const classes = styles();

  const onCancel = useCallback(() => {
    setShowSendInvite(false);
  }, [setShowSendInvite]);

  const toggleVideo = () => {
    if (publisher) {
      publisher.publishVideo(!hasVideo);
      setHasVideo(!hasVideo);
    }
  };
  const toggleAudio = () => {
    if (publisher) {
      if (hasAudio) {
        publisher.publishAudio(false);
        setHasAudio(false);
        publisher.setMicrophoneGain(0);
      } else {
        publisher.publishAudio(true);
        setHasAudio(true);
        publisher.setMicrophoneGain(1);
      }
    }
  };

  const getVideoSource = () => {
    if (room?.camera) {
      return room.camera.getVideoDevice();
    }
    return null;
  };

  const changeVideoSource = (videoId) => {
    room?.camera?.setVideoDevice(videoId);
  };
  const changeAudioSource = (audioId) => {
    room?.camera?.setAudioDevice(audioId);
  };

  const getAudioSource = async () => {
    if (room?.camera) {
      const audioDevice = await room.camera.getAudioDevice();
      return audioDevice.deviceId;
    }
    return null;
  };

  const endCall = () => {
    navigate(`/${UI_ROUTES.endVideoCall}`, {
      state: { data: appointment },
      replace: true,
    });
  };

  return (
    <div
      className={classes.toolbarContainer}
      style={{
        bottom: streams?.length ? '25%' : 0,
      }}
    >
      <ShowParticipantsButton
        classes={classes}
        handleSubmit={() => setShowParticipants((prev) => !prev)}
      />
      {showSendInvite && (
        <SendInvite
          appointmentId={appointment?.id}
          clearSendInvite={onCancel}
        />
      )}
      <MuteVideoButton
        toggleVideo={toggleVideo}
        hasVideo={hasVideo}
        classes={classes}
        getVideoSource={getVideoSource}
        cameraPublishing={cameraPublishing}
        changeVideoSource={changeVideoSource}
      />
      <EndCallButton classes={classes} handleEndCall={endCall} />
      <MuteAudioButton
        toggleAudio={toggleAudio}
        hasAudio={hasAudio}
        classes={classes}
        changeAudioSource={changeAudioSource}
        getAudioSource={getAudioSource}
        cameraPublishing={cameraPublishing}
      />
      <ChatButton classes={classes} />
    </div>
  );
}
