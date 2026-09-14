import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, IconButton, ButtonGroup } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import useDevices from '../../Hooks/useDevices';

export default function MuteAudioButton({
  toggleAudio,
  hasAudio,
  classes,
  getAudioSource,
  cameraPublishing,
  backgroundColor = '',
}) {
  const title = hasAudio ? 'Disable Microphone' : 'Enable Microphone';
  const { deviceInfo } = useDevices();
  const [devicesAvailable, setDevicesAvailable] = useState(null);
  const anchorRef = useRef(null);
  const [audioDeviceId, setAudioDeviceId] = useState('');

  useEffect(() => {
    setDevicesAvailable(deviceInfo.audioInputDevices);

    if (cameraPublishing && devicesAvailable) {
      getAudioSource().then((id) => setAudioDeviceId(id));
    }
  }, [
    cameraPublishing,
    getAudioSource,
    deviceInfo,
    audioDeviceId,
    devicesAvailable,
  ]);

  return (
    <ButtonGroup
      disableElevation
      className={classes.groupButton}
      variant="contained"
      ref={anchorRef}
      aria-label="split button"
    >
      <Tooltip title={title} aria-label="add">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="mic"
          onClick={toggleAudio}
          className={classes.toolbarButtons}
          style={{
            ...(backgroundColor ? { backgroundColor } : {}),
          }}
        >
          {!hasAudio ? (
            <MicOff fontSize="inherit" />
          ) : (
            <Mic fontSize="inherit" />
          )}
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
}
