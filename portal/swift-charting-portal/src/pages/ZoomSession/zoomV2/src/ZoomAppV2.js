import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import './App.css';
import LoadingLayer from './component/loading-layer';
import ZoomMediaContext from './context/media-context';
import ZoomContext from './context/zoom-context';
import Video from './feature/video/video';
import VideoAttach from './feature/video/video-attach';
import VideoSingle from './feature/video/video-single';

const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  }
};
const mediaReducer = (state, action) => {
  switch (action.type) {
    case "audio-encode":
      return {
        ...state,
        audio: { ...state.audio, encode: action.payload },
      };
    case "audio-decode":
      return {
        ...state,
        audio: { ...state.audio, decode: action.payload },
      };
    case "video-encode":
      return {
        ...state,
        video: { ...state.video, encode: action.payload },
      };
    case "video-decode":
      return {
        ...state,
        video: { ...state.video, decode: action.payload },
      };
    case "share-encode":
      return {
        ...state,
        share: { ...state.share, encode: action.payload },
      };
    case "share-decode":
      return {
        ...state,
        share: { ...state.share, decode: action.payload },
      };
    default:
      return state;
  }
};



function ZoomAppV2(props) {
  const {
    meetingArgs: {
      topic,
      signature,
      name,
      enforceGalleryView,
      enforceVB,
      customerJoinId,
      lang,
      useVideoPlayer,
      onSessionComplete
    },
    onZmClientUpdate,
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState(false);
  const [status, setStatus] = useState('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState(false);
  console.log("🚀 ~ ZoomAppV2 ~ isSupportGalleryView:", isSupportGalleryView)
  const zmClient = useContext(ZoomContext);
   // Memoize the callback function to avoid unnecessary re-renders
  //  const memoizedOnZmClientUpdate = useCallback(() => {
  //   if (zmClient) {
  //     const isHostOrManager = (zmClient?.isHost() || zmClient?.isManager()) ? true : false;
  //     console.log('join--------three-------',zmClient?.isHost(), zmClient?.isManager())
  //     onZmClientUpdate(isHostOrManager);  // Call onZmClientUpdate with updated status
  //   }
  // }, [zmClient, onZmClientUpdate]);

  // useEffect(() => {
  //   // Call the memoized function when zmClient changes
  //   if (zmClient) {
  //     memoizedOnZmClientUpdate();
  //     console.log('join--------two------------')
  //   }
  // }, [zmClient, memoizedOnZmClientUpdate]); // Dependency on zmClient ensures effect runs when zmClient changes


  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);
  const galleryViewWithoutSAB = Number(enforceGalleryView) === 1 && !window.crossOriginIsolated;
  const vbWithoutSAB = Number(enforceVB) === 1 && !window.crossOriginIsolated;
  const galleryViewWithAttach = Number(useVideoPlayer) === 1 && (window.crossOriginIsolated || galleryViewWithoutSAB);

  if (galleryViewWithAttach) {
    console.log({
      galleryViewWithAttach,
      use: '<video-player-container> video tag render video',
      doc: 'https://marketplacefront.zoom.us/sdk/custom/web/modules/Stream.html#attachVideo'
    });
  } else {
    console.log({
      galleryViewWithAttach,
      use: '<canvas>',
      doc: 'https://marketplacefront.zoom.us/sdk/custom/web/modules/Stream.html#startVideo'
    });
  }
  console.log(">>>>>",{
    enforceMultipleVideos: galleryViewWithoutSAB,
    enforceVirtualBackground: vbWithoutSAB,
    stayAwake: true,
    patchJsMedia: true,
    leaveOnPageUnload: false
  })
  useEffect(() => {
    const init = async () => {
      await zmClient.init("en-US", 'Global', {
        enforceMultipleVideos: true,
        enforceVirtualBackground: true,
        stayAwake: true,
        patchJsMedia: true,
        leaveOnPageUnload: false
      })
      try {
        setLoadingText('Joining the session...');
        await zmClient.join(topic, signature, name).catch((e) => {
          console.log(e);
        });
        const stream = zmClient.getMediaStream();
        setMediaStream(stream);
        setIsSupportGalleryView(stream.isSupportMultipleVideos());
        setIsLoading(false);
        // Add this after join
        const isHostOrManager = (zmClient?.isHost() || zmClient?.isManager()) ? true : false;
        onZmClientUpdate(isHostOrManager);
      } catch (e) {
        setIsLoading(false);
        console.error(e.reason);
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [
    signature,
    zmClient,
    topic,
    name,
    galleryViewWithoutSAB,
    customerJoinId,
    lang,
    vbWithoutSAB
  ]);
  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected,Try to reconnect');
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
        window.zmClient = zmClient;
        window.mediaStream = zmClient.getMediaStream();

        console.log('getSessionInfo', zmClient.getSessionInfo());
      } else if (payload.state === ConnectionState.Closed) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.reason === 'ended by host') {
          console.warn({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover, zmClient]
  );
  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === 'closed') {
      setIsLoading(true);
      await zmClient.join(topic, signature, name);
      setIsLoading(false);
    } else if (status === 'connected') {
      await zmClient.leave();
      console.warn('You have left the session.');
    }
  }, [zmClient, status, topic, signature, name]);
  useEffect(() => {
    zmClient.on('connection-change', onConnectionChange);
    zmClient.on('media-sdk-change', onMediaSDKChange);
    return () => {
      zmClient.off('connection-change', onConnectionChange);
      zmClient.off('media-sdk-change', onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);
  console.log({ isSupportGalleryView, galleryViewWithAttach });
  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={mediaContext}>
         {isSupportGalleryView ? (galleryViewWithAttach ? <VideoAttach onSessionComplete={props?.onSessionComplete} /> : <Video onSessionComplete={props?.onSessionComplete} onZmClientUpdate={onZmClientUpdate} />) : <VideoSingle onSessionComplete={props?.onSessionComplete}/>}
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
}

export default ZoomAppV2;
