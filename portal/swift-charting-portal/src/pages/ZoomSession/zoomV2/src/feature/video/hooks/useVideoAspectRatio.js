import { useCallback, useEffect, useState } from 'react';
export function useVideoAspect(zmClient) {
  const [aspectRatio, setAspectRatio] = useState({});
  const onVideoAspectRatioChange = useCallback((payload) => {
    const { userId, aspectRatio } = payload;
    setAspectRatio((s) => {
      return { ...s, [`${userId}`]: aspectRatio };
    });
  }, []);
  useEffect(() => {
    zmClient.on('video-aspect-ratio-change', onVideoAspectRatioChange);
    return () => {
      zmClient.off('video-aspect-ratio-change', onVideoAspectRatioChange);
    };
  });
  return aspectRatio;
}
