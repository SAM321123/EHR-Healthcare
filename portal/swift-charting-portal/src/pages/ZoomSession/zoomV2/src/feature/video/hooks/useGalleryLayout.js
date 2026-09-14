import { useEffect, useState } from 'react';
import { getVideoLayout } from '../video-layout-helper';
import { useParticipantsChange } from './useParticipantsChange';
import { useRenderVideo } from './useRenderVideo';
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient,
  mediaStream,
  isVideoDecodeReady,
  videoRef,
  dimension,
  pagination
) {
  const [visibleParticipants, setVisibleParticipants] = useState([]);
  const [layout, setLayout] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [subscribedVideos, setSubscribedVideos] = useState([]);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  useEffect(() => {
    setLayout(getVideoLayout(dimension.width, dimension.height, size));
  }, [dimension, size]);

  useParticipantsChange(zmClient, () => {
    const participants = zmClient.getAllUser();
    setParticipants(participants);
  });

  useEffect(() => {
    if (participants.length > 0) {
      let pageParticipants = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        pageParticipants = participants
          .filter((user) => user.userId !== zmClient.getSessionInfo().userId)
          .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
        const currentUser = zmClient.getCurrentUserInfo();
        if (currentUser) {
          pageParticipants.splice(1, 0, currentUser);
        }
        pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
        if (pageParticipants.length < pageSize) {
          const vacantSize = pageSize - pageParticipants.length;
          const paddingParticipants = participants.filter(
            (_user, index) => index >= pageSize * (totalPage - 1) - vacantSize && index < pageSize * (totalPage - 1)
          );
          pageParticipants = paddingParticipants.concat(pageParticipants);
        }
      }
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants.filter((user) => user.bVideoOn).map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, pageSize, page, totalPage, participants]);
  useEffect(() => {
    setParticipants(zmClient.getAllUser());
  }, [zmClient]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
    zmClient.getSessionInfo().userId
  );
  return {
    visibleParticipants,
    layout
  };
}
