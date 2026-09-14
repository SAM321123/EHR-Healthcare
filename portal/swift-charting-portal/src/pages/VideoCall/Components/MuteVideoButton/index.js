import React, { useEffect, useRef, useState } from 'react';
import VideoCam from '@mui/icons-material/Videocam';
import VideocamOff from '@mui/icons-material/VideocamOff';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import useDevices from '../../Hooks/useDevices';

export default function MuteVideoButton({
  classes,
  hasVideo,
  toggleVideo,
  getVideoSource,
  cameraPublishing,
  backgroundColor = '',
}) {
  const title = hasVideo ? 'Disable Camera' : 'Enable Camera';
  const { deviceInfo } = useDevices();
  const [devicesAvailable, setDevicesAvailable] = useState(null);
  const anchorRef = useRef(null);

  useEffect(() => {
    setDevicesAvailable(deviceInfo.videoInputDevices);
  }, [cameraPublishing, getVideoSource, deviceInfo, devicesAvailable]);

  return (
    <ButtonGroup
      className={classes.groupButton}
      disableElevation
      variant="contained"
      ref={anchorRef}
      aria-label="split button"
    >
      <Tooltip title={title} aria-label="Video">
        <IconButton
          onClick={toggleVideo}
          edge="start"
          aria-label="videoCamera"
          size="small"
          className={classes.toolbarButtons}
          style={{
            ...(backgroundColor ? { backgroundColor } : {}),
          }}
        >
          {!hasVideo ? <VideocamOff /> : <VideoCam />}
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
}
