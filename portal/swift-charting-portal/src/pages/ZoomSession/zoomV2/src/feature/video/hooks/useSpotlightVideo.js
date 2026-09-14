import { useCallback, useEffect, useRef } from 'react';
import { useMount } from '../../../hooks/useUnmount';
export function useSpotlightVideo(
  zmClient,
  mediaStream,
  fn,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const callback = useCallback(
    (updatedParticipants) => {
      const participants = mediaStream?.getSpotlightedUserList() ?? [];
      fnRef.current?.(participants, updatedParticipants);
    },
    [mediaStream]
  );
  useEffect(() => {
    zmClient.on('video-spotlight-change', callback);
    return () => {
      zmClient.off('video-spotlight-change', callback);
    };
  }, [zmClient, callback]);
  useMount(() => {
    callback();
  });
}
