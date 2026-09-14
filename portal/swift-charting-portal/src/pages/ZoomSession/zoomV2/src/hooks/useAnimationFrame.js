import { useRef, useEffect, useCallback } from 'react';
export const useAnimationFrame = (callback=()=>{}) => {
  const requestRef = useRef(0);
  const previousTimeRef = useRef();

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = window.requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
};
