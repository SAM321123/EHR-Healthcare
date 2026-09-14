import classnames from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import ZoomMediaContext from '../../context/media-context';
import ZoomContext from '../../context/zoom-context';
import Avatar from './components/avatar';
import Pagination from './components/pagination';
import RemoteCameraControlPanel from './components/remote-camera-control';
import ReportBtn from './components/report-btn';
import ShareView from './components/share-view';
import VideoFooter from './components/video-footer';
import AvatarActionContext from './context/avatar-context';
import { useAvatarAction } from './hooks/useAvatarAction';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { usePagination } from './hooks/usePagination';
import { SELF_VIDEO_ID } from './video-constants';
import SideFeature from '../sideFeature';

import './video.scss';
const VideoContainer = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef(null);
  const shareViewRef = useRef(null);
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const isHostOrManager= (zmClient?.isHost() || zmClient?.isManager()) ? true : false;
  const [hasLeft, setHasLeft] = useState(false);

  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );
  /**
   * position for self video
   */
  const currentUserIndex = visibleParticipants.findIndex(
    (user) => user.userId === zmClient.getCurrentUserInfo()?.userId
  );
  let selfVideoLayout = null;
  if (currentUserIndex > -1) {
    const item = videoLayout[currentUserIndex];
    if (item && canvasDimension) {
      selfVideoLayout = { ...item, y: canvasDimension.height - item.y - item.height };
    }
  }
  useEffect(()=> {
    props.onZmClientUpdate(isHostOrManager);
  }, [isHostOrManager])
  const avatarActionState = useAvatarAction(zmClient, visibleParticipants);
  const networkQuality = useNetworkQuality(zmClient);
  return (
    <div className="viewport" style={isHostOrManager ? { width: '70vw' } : {}}>
      <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} />
      <div
        className={classnames('video-container', {
          'video-container-in-sharing': isRecieveSharing
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} style={{ borderRadius: '8px', marginBottom: '16px' }}/>
        {selfVideoLayout && mediaStream?.isRenderSelfViewWithVideoElement() && (
          <video
            id={SELF_VIDEO_ID}
            className="self-video-tag"
            playsInline
            muted
            autoPlay
            style={{
              display: 'block',
              width: `${selfVideoLayout.width}px`,
              height: `${selfVideoLayout.height}px`,
              top: `${selfVideoLayout.y}px`,
              left: `${selfVideoLayout.x}px`,
              pointerEvents: 'none'
            }}
          />
        )}
        <AvatarActionContext.Provider value={avatarActionState}>
          <ul className="avatar-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {visibleParticipants.map((user, index) => {
              if (index > videoLayout.length - 1) {
                return null;
              }
              const dimension = videoLayout[index];
              const { width, height, x, y } = dimension;
              const { height: canvasHeight } = canvasDimension;
              return (
                <Avatar
                  participant={user}
                  key={user.userId}
                  isActive={activeVideo === user.userId}
                  networkQuality={networkQuality[`${user.userId}`]}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `${canvasHeight - y - height}px`,
                    left: `${x}px`
                  }}
                />
              );
            })}
          </ul>
          <RemoteCameraControlPanel />
        </AvatarActionContext.Provider>
      </div>
      {!hasLeft && (
        <VideoFooter className="video-operations" sharing selfShareCanvas={shareViewRef.current?.selfShareRef} onSessionComplete={props.onSessionComplete} setHasLeft={() => setHasLeft(true)}/>
      )}

      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isRecieveSharing} />}
      <ReportBtn />
    </div>
  );
};

export default VideoContainer;
