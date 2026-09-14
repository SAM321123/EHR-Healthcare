import React from 'react';

const AvatarContext = React.createContext({
  avatarActionState: {
    isControllingRemoteCamera: false,
    spotlightedUserList: [],
    avatarActions: {
      localVolumeAdjust: { toggled: false, enabled: false, volume: 0 },
      farEndCameraControl: { toggled: false, enabled: false },
      videoResolutionAdjust: { toggled: false, enabled: false },
    }
  },
  dispatch: () => {}
});

export default AvatarContext;
