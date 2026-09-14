import { useCallback } from 'react';
export function useBackHome(history) {
  const backToHome = useCallback(() => {
    history(-1);
  }, [history]);
  return backToHome;
}
