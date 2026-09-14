import {
  AudioChangeAction,
  DialoutState,
  LiveStreamStatus,
  MobileVideoFacingMode,
  MutedSource,
  RecordingStatus,
  SharePrivilege,
  ShareStatus,
  VideoCapturingState
} from '@zoom/videosdk';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { IconFont } from '../../../component/icon-font';
import ZoomMediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';
import { SELF_VIDEO_ID, getPhoneCallStatusDescription } from '../video-constants';
import AudioVideoStatisticModal from './audio-video-statistic';
import CameraButton from './camera';
import { LeaveButton } from './leave';
import { LiveStreamButton, LiveStreamModal } from './live-stream';
import { LiveTranscriptionButton } from './live-transcription';
import MicrophoneButton from './microphone';
import { RecordingButton, getRecordingButtons } from './recording';
import IsoRecordingModal from './recording-ask-modal';
import { ScreenShareButton } from './screen-share';
import { TranscriptionSubtitle } from './transcription-subtitle';
import './video-footer.scss';
import { VideoMaskModel } from './video-mask-modal';
import { useMount, useUnmount } from '../../../hooks/useUnmount';
import { SurroundSoundOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { showSnackbar } from 'src/lib/utils';
import ModalComponent from 'src/components/modal';
import InviteUser from './inviteUser';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

const isAudioEnable = typeof AudioWorklet === 'function';
const Modal= {confirm:()=>{}}
const VideoFooter = (props) => {
  const { className, selfShareCanvas, sharing, onSessionComplete=()=>{} } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const liveTranscriptionClient = zmClient.getLiveTranscriptionClient();
  const liveStreamClient = zmClient.getLiveStreamClient();
  const recordingClient = zmClient.getRecordingClient();
  const [isStartedAudio, setIsStartedAudio] = useState(
    zmClient.getCurrentUserInfo() && zmClient.getCurrentUserInfo().audio !== ''
  );
  const [isStartedVideo, setIsStartedVideo] = useState(zmClient.getCurrentUserInfo()?.bVideoOn);
  const [audio, setAudio] = useState(zmClient.getCurrentUserInfo()?.audio);
  const [isSupportPhone, setIsSupportPhone] = useState(false);
  const [phoneCountryList, setPhoneCountryList] = useState([]);
  const [phoneCallStatus, setPhoneCallStatus] = useState();
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [isDisableCaptions, setIsDisableCaptions] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const [isMuted, setIsMuted] = useState(!!zmClient.getCurrentUserInfo()?.muted);
  const [activeMicrophone, setActiveMicrophone] = useState(mediaStream?.getActiveMicrophone());
  const [activeSpeaker, setActiveSpeaker] = useState(mediaStream?.getActiveSpeaker());
  const [activeCamera, setActiveCamera] = useState(mediaStream?.getActiveCamera());
  const [micList, setMicList] = useState(mediaStream?.getMicList() ?? []);
  const [speakerList, setSpeakerList] = useState(mediaStream?.getSpeakerList() ?? []);
  const [cameraList, setCameraList] = useState(mediaStream?.getCameraList() ?? []);
  const [statisticVisible, setStatisticVisible] = useState(false);
  const [selecetedStatisticTab, setSelectedStatisticTab] = useState('audio');
  const [isComputerAudioDisabled, setIsComputerAudioDisabled] = useState(false);
  const [sharePrivilege, setSharePrivileg] = useState(SharePrivilege.Unlocked);
  const [caption, setCaption] = useState({ text: '', isOver: false });
  const [activePlaybackUrl, setActivePlaybackUrl] = useState('');
  const [isMicrophoneForbidden, setIsMicrophoneForbidden] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(
    recordingClient?.getCloudRecordingStatus() || ''
  );
  const [recordingIsoStatus, setRecordingIsoStatus] = useState('');
  const [liveStreamVisible, setLiveStreamVisible] = useState(false);
  const [liveStreamStatus, setLiveStreamStatus] = useState(liveStreamClient?.getLiveStreamStatus());
  // Video Mask
  const [videoMaskVisible, setVideoMaskVisible] = useState(false);

  const [isSecondaryAudioStarted, setIsSecondaryAudioStarted] = useState(false);
  const [openInviteModel, setOpenInviteModel] = useState(false);

  const secondaryMicForm = useForm();
  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo().catch(err=>{
        showSnackbar({
          message: err?.reason || 'Something wrong please connect clinic',
          severity: 'error',
        });
      });;
      setIsStartedVideo(false);
    } else {
      const startVideoOptions = {
        hd: true,
        fullHd: true,
        ptz: mediaStream?.isBrowserSupportPTZ(),
        originalRatio: true
      };
      if (mediaStream?.isSupportVirtualBackground() && isBlur) {
        Object.assign(startVideoOptions, { virtualBackground: { imageUrl: 'blur' } });
      }
      await mediaStream?.startVideo(startVideoOptions).catch(err=>{
        showSnackbar({
          message: err?.reason || 'Something wrong please connect clinic',
          severity: 'error',
        });
      });
      if (!mediaStream?.isSupportMultipleVideos()) {
        const canvasElement = document.querySelector(`#${SELF_VIDEO_ID}`);
        mediaStream?.renderVideo(
          canvasElement,
          zmClient.getSessionInfo().userId,
          canvasElement.width,
          canvasElement.height,
          0,
          0,
          3
        ).catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
      }
     
      setIsStartedVideo(true);
    }
  }, [mediaStream, isStartedVideo, zmClient, isBlur]);
  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
      } else {
        await mediaStream?.muteAudio().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
      }
    } else {
      try {
        await mediaStream?.startAudio({ highBitrate: true });
      } catch (e) {
        if (e.type === 'INSUFFICIENT_PRIVILEGES' && e.reason === 'USER_FORBIDDEN_MICROPHONE') {
          setIsMicrophoneForbidden(true);
        }
        console.warn(e);
      }
      // setIsStartedAudio(true);
    }
  }, [mediaStream, isStartedAudio, isMuted]);
  const onMicrophoneMenuClick = async (key) => {
    if (mediaStream) {
      const [type, deviceId] = key.split('|');
      if (type === 'microphone') {
        if (deviceId !== activeMicrophone) {
          await mediaStream.switchMicrophone(deviceId);
          setActiveMicrophone(mediaStream.getActiveMicrophone());
        }
      } else if (type === 'speaker') {
        if (deviceId !== activeSpeaker) {
          await mediaStream.switchSpeaker(deviceId);
          setActiveSpeaker(mediaStream.getActiveSpeaker());
        }
      } else if (type === 'leave audio') {
        if (audio === 'computer') {
          await mediaStream.stopAudio().catch(err=>{
            showSnackbar({
              message: err?.reason || 'Something wrong please connect clinic',
              severity: 'error',
            });
          });
        } else if (audio === 'phone') {
          await mediaStream.hangup().catch(err=>{
            showSnackbar({
              message: err?.reason || 'Something wrong please connect clinic',
              severity: 'error',
            });
          });
          setPhoneCallStatus(undefined);
        }
      } else if (type === 'statistic') {
        setSelectedStatisticTab('audio');
        setStatisticVisible(true);
      } else if (type === 'secondary audio') {
        if (isSecondaryAudioStarted) {
          await mediaStream.stopSecondaryAudio().catch(err=>{
            showSnackbar({
              message: err?.reason || 'Something wrong please connect clinic',
              severity: 'error',
            });
          });
          setIsSecondaryAudioStarted(false);
        } else {
          Modal.confirm({
            title: 'Start secondary audio',
            onOk: async () => {
              try {
                const data = await secondaryMicForm.validateFields();
                const { mic, constraints } = data;
                const option = {};
                if (constraints) {
                  constraints.forEach((key) => {
                    Object.assign(option, { [`${key}`]: true });
                  });
                }
                await mediaStream.startSecondaryAudio(mic, option);
                setIsSecondaryAudioStarted(true);
              } catch (e) {
                console.warn(e);
              }
            }
          });
        }
      }
    }
  };
  const onSwitchCamera = async (key) => {
    if (mediaStream) {
      if (activeCamera !== key) {
        await mediaStream.switchCamera(key);
        setActiveCamera(mediaStream.getActiveCamera());
        setActivePlaybackUrl('');
      }
    }
  };
  const onMirrorVideo = async () => {
    await mediaStream?.mirrorVideo(!isMirrored);
    setIsMirrored(!isMirrored);
  };
  const onBlurBackground = async () => {
    const isSupportVirtualBackground = mediaStream?.isSupportVirtualBackground();
    if (isSupportVirtualBackground) {
      if (isBlur) {
        await mediaStream?.updateVirtualBackgroundImage(undefined).catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
      } else {
        await mediaStream?.updateVirtualBackgroundImage('blur').catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
      }
    } else {
      setVideoMaskVisible(true);
    }

    setIsBlur(!isBlur);
  };
  const onPhoneCall = async (code, phoneNumber, name, option) => {
    await mediaStream?.inviteByPhone(code, phoneNumber, name, option);
  };
  const onPhoneCallCancel = async (code, phoneNumber, option) => {
    if ([DialoutState.Calling, DialoutState.Ringing, DialoutState.Accepted].includes(phoneCallStatus)) {
      await mediaStream?.cancelInviteByPhone(code, phoneNumber, option);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    }
    return Promise.resolve();
  };
  const onHostAudioMuted = useCallback(
    (payload) => {
      const { action, source, type } = payload;
      if (action === AudioChangeAction.Join) {
        setIsStartedAudio(true);
        setAudio(type);
        setTimeout(() => {
          setIsMuted(!!zmClient.getCurrentUserInfo()?.muted);
        }, 1000);
      } else if (action === AudioChangeAction.Leave) {
        setIsStartedAudio(false);
      } else if (action === AudioChangeAction.Muted) {
        setIsMuted(true);
        if (source === MutedSource.PassiveByMuteOne) {
          console.info('Host muted you');
        }
      } else if (action === AudioChangeAction.Unmuted) {
        setIsMuted(false);
        if (source === 'passive') {
          console.info('Host unmuted you');
        }
      }
    },
    [zmClient]
  );
  const onScreenShareClick = useCallback(async () => {
    if (mediaStream?.getShareStatus() === ShareStatus.End && selfShareCanvas) {
      await mediaStream?.startShareScreen(selfShareCanvas, { requestReadReceipt: true }).catch(err=>{
        showSnackbar({
          message: err?.reason || 'Something wrong please connect clinic',
          severity: 'error',
        });
      });;
    }
  }, [mediaStream, selfShareCanvas]);

  const onLiveTranscriptionClick = useCallback(async () => {
    if (isDisableCaptions) {
      console.info('Captions has been disable by host.');
    } else if (isStartedLiveTranscription) {
      console.info('Live transcription has started.');
    } else if (!isStartedLiveTranscription) {
      await liveTranscriptionClient?.startLiveTranscription().catch(err=>{
        showSnackbar({
          message: err?.reason || 'Something wrong please connect clinic',
          severity: 'error',
        });
      });
      setIsStartedLiveTranscription(true);
    }
  }, [isStartedLiveTranscription, isDisableCaptions, liveTranscriptionClient]);

  const onDisableCaptions = useCallback(
    async (disable) => {
      if (disable && !isDisableCaptions) {
        await liveTranscriptionClient?.disableCaptions(disable).catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
        setIsStartedLiveTranscription(false);
        setIsDisableCaptions(true);
      } else if (!disable && isDisableCaptions) {
        await liveTranscriptionClient?.disableCaptions(disable).catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
        setIsDisableCaptions(false);
      }
    },
    [isDisableCaptions, liveTranscriptionClient]
  );

  const onLeaveClick = useCallback(async () => {
    try{
    await zmClient.leave();
    props.setHasLeft();
    }catch(err){
      console.log("🚀 ~ onLeaveClick ~ err:", err)
      
    }
  
  }, [zmClient]);

  const onEndClick = useCallback(async () => {
    if(onSessionComplete){
      onSessionComplete();
    }
    await zmClient.leave(true);
    props.setHasLeft();
  }, [zmClient]);

  const onPassivelyStopShare = useCallback(({ reason }) => {
    console.log('passively stop reason:', reason);
  }, []);
  const onDeviceChange = useCallback(() => {
    if (mediaStream) {
      setMicList(mediaStream.getMicList());
      setSpeakerList(mediaStream.getSpeakerList());
      if (!isAndroidOrIOSBrowser()) {
        setCameraList(mediaStream.getCameraList());
      }
      setActiveMicrophone(mediaStream.getActiveMicrophone());
      setActiveSpeaker(mediaStream.getActiveSpeaker());
      setActiveCamera(mediaStream.getActiveCamera());
    }
  }, [mediaStream]);

  const onRecordingChange = useCallback(() => {
    setRecordingStatus(recordingClient?.getCloudRecordingStatus() || '');
  }, [recordingClient]);

  const onRecordingISOChange = useCallback(
    (payload) => {
      if (payload?.userId === zmClient.getSessionInfo().userId || payload?.status === RecordingStatus.Ask) {
        setRecordingIsoStatus(payload?.status);
      }
      console.log('recording-iso-change', payload);
    },
    [zmClient]
  );

  const onDialOutChange = useCallback((payload) => {
    setPhoneCallStatus(payload.code);
  }, []);

  const onRecordingClick = async (key) => {
    switch (key) {
      case 'Record': {
        await recordingClient?.startCloudRecording().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
        break;
      }
      case 'Resume': {
        await recordingClient?.resumeCloudRecording().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });;
        break;
      }
      case 'Stop': {
        await recordingClient?.stopCloudRecording().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });;
        break;
      }
      case 'Pause': {
        await recordingClient?.pauseCloudRecording().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });;
        break;
      }
      case 'Status': {
        break;
      }
      default: {
        await recordingClient?.startCloudRecording().catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });;
      }
    }
  };
  const onVideoCaptureChange = useCallback((payload) => {
    if (payload.state === VideoCapturingState.Started) {
      setIsStartedVideo(true);
    } else {
      setIsStartedVideo(false);
    }
  }, []);
  const onShareAudioChange = useCallback(
    (payload) => {
      const { state } = payload;
      if (state === 'on') {
        if (!mediaStream?.isSupportMicrophoneAndShareAudioSimultaneously()) {
          setIsComputerAudioDisabled(true);
        }
      } else if (state === 'off') {
        setIsComputerAudioDisabled(false);
      }
    },
    [mediaStream]
  );
  const onHostAskToUnmute = useCallback((payload) => {
    const { reason } = payload;
    console.log(`Host ask to unmute the audio.`, reason);
  }, []);

  const onCaptionStatusChange = useCallback((payload) => {
    const { autoCaption } = payload;
    if (autoCaption) {
      console.info('Auto live transcription enabled!');
    }
  }, []);

  const onCaptionMessage = useCallback((payload) => {
    const { text, done } = payload;
    setCaption({
      text,
      isOver: done
    });
  }, []);

  const onCaptionDisable = useCallback((payload) => {
    setIsDisableCaptions(payload);
    if (payload) {
      setIsStartedLiveTranscription(false);
    }
  }, []);

  const onCanSeeMyScreen = useCallback(() => {
    console.info('Users can now see your screen', 1);
  }, []);
  const onSelectVideoPlayback = useCallback(
    async (url) => {
      if (activePlaybackUrl !== url) {
        await mediaStream?.switchCamera({ url, loop: true }).catch(err=>{
          showSnackbar({
            message: err?.reason || 'Something wrong please connect clinic',
            severity: 'error',
          });
        });
        if (isStartedAudio) {
          await mediaStream?.switchMicrophone({ url, loop: true }).catch(err=>{
            showSnackbar({
              message: err?.reason || 'Something wrong please connect clinic',
              severity: 'error',
            });
          });
        } else {
          await mediaStream?.startAudio({ mediaFile: { url, loop: true } }).catch(err=>{
            showSnackbar({
              message: err?.reason || 'Something wrong please connect clinic',
              severity: 'error',
            });
          });
        }
        setActivePlaybackUrl(url);
      }
    },
    [isStartedAudio, activePlaybackUrl, mediaStream]
  );

  const onLiveStreamClick = useCallback(() => {
    if (liveStreamStatus === LiveStreamStatus.Ended) {
      setLiveStreamVisible(true);
    } else if (liveStreamStatus === LiveStreamStatus.InProgress) {
      liveStreamClient?.stopLiveStream();
    }
  }, [liveStreamStatus, liveStreamClient]);
  const onLiveStreamStatusChange = useCallback((status) => {
    setLiveStreamStatus(status);
    if (status === LiveStreamStatus.Timeout) {
      console.error('Start live streaming timeout');
    }
  }, []);
  useEffect(() => {
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    zmClient.on('device-change', onDeviceChange);
    zmClient.on('recording-change', onRecordingChange);
    zmClient.on('individual-recording-change', onRecordingISOChange);
    zmClient.on('dialout-state-change', onDialOutChange);
    zmClient.on('video-capturing-change', onVideoCaptureChange);
    zmClient.on('share-audio-change', onShareAudioChange);
    zmClient.on('host-ask-unmute-audio', onHostAskToUnmute);
    zmClient.on('caption-status', onCaptionStatusChange);
    zmClient.on('caption-message', onCaptionMessage);
    zmClient.on('caption-host-disable', onCaptionDisable);
    zmClient.on('share-can-see-screen', onCanSeeMyScreen);
    zmClient.on('live-stream-status', onLiveStreamStatusChange);
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
      zmClient.off('device-change', onDeviceChange);
      zmClient.off('recording-change', onRecordingChange);
      zmClient.off('individual-recording-change', onRecordingISOChange);
      zmClient.off('dialout-state-change', onDialOutChange);
      zmClient.off('video-capturing-change', onVideoCaptureChange);
      zmClient.off('share-audio-change', onShareAudioChange);
      zmClient.off('host-ask-unmute-audio', onHostAskToUnmute);
      zmClient.off('caption-status', onCaptionStatusChange);
      zmClient.off('caption-message', onCaptionMessage);
      zmClient.off('caption-host-disable', onCaptionDisable);
      zmClient.off('share-can-see-screen', onCanSeeMyScreen);
      zmClient.off('live-stream-status', onLiveStreamStatusChange);
    };
  }, [
    zmClient,
    onHostAudioMuted,
    onPassivelyStopShare,
    onDeviceChange,
    onRecordingChange,
    onDialOutChange,
    onVideoCaptureChange,
    onShareAudioChange,
    onHostAskToUnmute,
    onCaptionStatusChange,
    onCaptionMessage,
    onCanSeeMyScreen,
    onRecordingISOChange,
    onCaptionDisable,
    onLiveStreamStatusChange
  ]);
  useUnmount(() => {
    if (zmClient.getSessionInfo().isInMeeting) {
      if (isStartedAudio) {
        mediaStream?.stopAudio();
      }
      if (isStartedVideo) {
        mediaStream?.stopVideo();
      }
      mediaStream?.stopShareScreen();
    }
  });
  useMount(() => {
    if (mediaStream) {
      setIsSupportPhone(!!mediaStream.isSupportPhoneFeature());
      setPhoneCountryList(mediaStream.getSupportCountryInfo() || []);
      setSharePrivileg(mediaStream.getSharePrivilege());
      if (isAndroidOrIOSBrowser()) {
        setCameraList([
          { deviceId: MobileVideoFacingMode.User, label: 'Front-facing' },
          { deviceId: MobileVideoFacingMode.Environment, label: 'Rear-facing' }
        ]);
      }
    }
  });

  const recordingButtons= getRecordingButtons(recordingStatus, zmClient.isHost());
  const closeInviteModal = ()=>{
    setOpenInviteModel(false);
  };
  const openInviteModelFn = ()=>{
    setOpenInviteModel(true);
  }
   return (
    <div className={classNames('video-footer', className)}>
      {isAudioEnable && (
        <MicrophoneButton
          isStartedAudio={isStartedAudio}
          isMuted={isMuted}
          isSupportPhone={isSupportPhone}
          audio={audio}
          phoneCountryList={phoneCountryList}
          onPhoneCallClick={onPhoneCall}
          onPhoneCallCancel={onPhoneCallCancel}
          phoneCallStatus={getPhoneCallStatusDescription(phoneCallStatus)}
          onMicrophoneClick={onMicrophoneClick}
          onMicrophoneMenuClick={onMicrophoneMenuClick}
          microphoneList={micList}
          speakerList={speakerList}
          activeMicrophone={activeMicrophone}
          activeSpeaker={activeSpeaker}
          disabled={isComputerAudioDisabled}
          isMicrophoneForbidden={isMicrophoneForbidden}
          isSecondaryAudioStarted={isSecondaryAudioStarted}
        />
      )}
      <CameraButton
        isStartedVideo={isStartedVideo}
        onCameraClick={onCameraClick}
        onSwitchCamera={onSwitchCamera}
        onMirrorVideo={onMirrorVideo}
        onVideoStatistic={() => {
          setSelectedStatisticTab('video');
          setStatisticVisible(true);
        }}
        onBlurBackground={onBlurBackground}
        onSelectVideoPlayback={onSelectVideoPlayback}
        activePlaybackUrl={activePlaybackUrl}
        cameraList={cameraList}
        activeCamera={activeCamera}
        isMirrored={isMirrored}
        isBlur={isBlur}
      />
      {sharing && (
        <ScreenShareButton
          sharePrivilege={sharePrivilege}
          isHostOrManager={zmClient.isHost() || zmClient.isManager()}
          onScreenShareClick={onScreenShareClick}
          onSharePrivilegeClick={async (privilege) => {
            await mediaStream?.setSharePrivilege(privilege).catch(err=>{
              showSnackbar({
                message: err?.reason || 'Something wrong please connect clinic',
                severity: 'error',
              });
            });
            setSharePrivileg(privilege);
          }}
        />
      )}
      {recordingButtons.map((button) => {
        return (
          <RecordingButton
            key={button.text}
            onClick={() => {
              onRecordingClick(button.text);
            }}
            {...button}
          />
        );
      })}
      {liveTranscriptionClient?.getLiveTranscriptionStatus().isLiveTranscriptionEnabled && (
        <>
          <LiveTranscriptionButton
            isStartedLiveTranscription={isStartedLiveTranscription}
            isDisableCaptions={isDisableCaptions}
            isHost={zmClient.isHost()}
            onDisableCaptions={onDisableCaptions}
            onLiveTranscriptionClick={onLiveTranscriptionClick}
          />
          <TranscriptionSubtitle text={caption.text} />
        </>
      )}
      {isSecondaryAudioStarted && (
        <Tooltip title="Secondary audio on">
          <SurroundSoundOutlined style={{ position: 'fixed', top: '45px', left: '10px', color: '#f60', fontSize: '24px' }} />
        </Tooltip>
      )}
      {zmClient.isHost() && <div className='camera-footer'>
      <Tooltip title="Invite Users">
      <IconButton className='vc-button' onClick={openInviteModelFn}>
        <PersonAddAltIcon/>
      </IconButton>
      </Tooltip>
      </div>}
      <LeaveButton onLeaveClick={onLeaveClick} isHost={zmClient.isHost()} onEndClick={onEndClick} />

      <AudioVideoStatisticModal
        visible={statisticVisible}
        setVisible={setStatisticVisible}
        defaultTab={selecetedStatisticTab}
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        isStartedVideo={isStartedVideo}
      />

      {recordingIsoStatus === RecordingStatus.Ask && (
        <IsoRecordingModal
          onClick={() => {
            recordingClient?.acceptIndividualRecording();
          }}
          onCancel={() => {
            recordingClient?.declineIndividualRecording();
          }}
        />
      )}
      {!mediaStream?.isSupportVirtualBackground() && (
        <VideoMaskModel visible={videoMaskVisible} setVisible={setVideoMaskVisible} isMirrored={isMirrored} />
      )}

{openInviteModel && (
        <ModalComponent
          open={true}
          header={{
            title: "Invite Users",
            closeIconAction: closeInviteModal,
          }}
          // boxStyle = {{ width: '900px' }}
        >
          <InviteUser
            onClose={closeInviteModal}
          />
        </ModalComponent>
      )}
    </div>
  );
};
export default VideoFooter;
