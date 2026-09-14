import { useState } from 'react';
import { useEventListener } from './useEventListener';

export function useHover(ref, options) {
  const [isHover, setIsHover] = useState(false);
  const { onEnter, onLeave } = options || {};
  useEventListener(ref, 'mouseenter', () => {
    onEnter?.();
    setIsHover(true);
  });
  useEventListener(ref, 'mouseleave', () => {
    onLeave?.();
    setIsHover(false);
  });
  return isHover;
}
