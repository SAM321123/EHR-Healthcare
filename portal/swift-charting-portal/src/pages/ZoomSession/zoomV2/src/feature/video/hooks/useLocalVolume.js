import { produce } from 'immer';
import { useCallback, useContext, useMemo, useState } from 'react';
import MediaContext from '../../../context/media-context';
export function useLocalVolume() {
  const { mediaStream } = useContext(MediaContext);
  const [userVolumeList, setUserVolumeList] = useState([]);
  const setLocalVolume = useCallback(
    async (userId, volume) => {
      await mediaStream?.adjustUserAudioVolumeLocally(userId, volume);
      setUserVolumeList(
        produce((draft) => {
          const user = draft.find((u) => u.userId === userId);
          if (user) {
            user.volume = volume;
          } else {
            draft.push({ userId, volume });
          }
        })
      );
    },
    [mediaStream]
  );
  const value = useMemo(
    () => ({
      userVolumeList,
      setLocalVolume
    }),
    [userVolumeList, setLocalVolume]
  );
  return value;
}
