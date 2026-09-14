import { useRef, useEffect } from 'react';

export function usePrevious(props) {
  const ref = useRef();
  useEffect(() => {
    ref.current = props;
  }, [props]);
  return ref.current;
}
