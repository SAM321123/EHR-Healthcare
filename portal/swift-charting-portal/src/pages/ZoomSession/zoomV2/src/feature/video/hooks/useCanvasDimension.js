import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSizeCallback } from '../../../hooks/useSizeCallback';
import { useMount } from '../../../hooks/useUnmount';
export function useCanvasDimension(
  mediaStream,
  videoRef,
) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const debounceRef = useRef(_.debounce(setDimension, 0));
  const onCanvasResize = useCallback(
    ({ width, height }) => {
      if (videoRef) {
        // eslint-disable-next-line no-useless-call
        debounceRef.current({ width, height });
      }
    },
    [videoRef]
  );
  useSizeCallback(videoRef.current, onCanvasResize);
  useMount(() => {
    if (videoRef.current) {
      const { width, height } = videoRef.current.getBoundingClientRect();
      setDimension({ width, height });
    }
  });
  useEffect(() => {
    const { width, height } = dimension;
    try {
      if (videoRef.current) {
        videoRef.current.width = width;
        videoRef.current.height = height;
      }
    } catch (e) {
      mediaStream?.updateVideoCanvasDimension(videoRef.current, width, height);
    }
  }, [mediaStream, dimension, videoRef]);
  return dimension;
}
