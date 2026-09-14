import { Check, ExpandMore, VideoCall, Videocam } from '@mui/icons-material';
import { Button, ButtonGroup, IconButton, Menu, MenuItem, Tooltip, Divider, Typography } from '@mui/material';
import classNames from 'classnames';
import { useContext, useState } from 'react';
import ZoomMediaContext from '../../../context/media-context';

const videoPlaybacks = [
  { title: 'ZOOM ZWA', url: 'https://source.zoom.us/brand/mp4/Using%20the%20Zoom%20PWA.mp4' },
  { title: 'ZOOM Cares', url: 'https://source.zoom.us/brand/mp4/Zoom%20Cares%20Nonprofit%20Impact.mp4' },
  { title: 'ZOOM One', url: 'https://source.zoom.us/brand/mp4/Zoom%20One%20-%20Team%20Chat%2C%20Phone%2C%20Email%2C%20and%20more.mp4' }
];

const CameraButton = (props) => {
  const {
    isStartedVideo,
    className,
    cameraList,
    activeCamera,
    isMirrored,
    isBlur,
    isPreview,
    activePlaybackUrl,
    onCameraClick,
    onSwitchCamera,
    onMirrorVideo,
    onVideoStatistic,
    onBlurBackground,
    onSelectVideoPlayback
  } = props;

  const { mediaStream } = useContext(ZoomMediaContext);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (key) => {
    if (key === 'mirror') {
      onMirrorVideo?.();
    } else if (key === 'statistic') {
      onVideoStatistic?.();
    } else if (key === 'blur') {
      onBlurBackground?.();
    } else if (/^https:\/\//.test(key)) {
      onSelectVideoPlayback?.(key);
    } else {
      onSwitchCamera(key);
    }
    handleClose();
  };

  const menuItems = (
    <>
      <Typography variant="subtitle2" sx={{ padding: '8px 16px' }}>Select a Camera</Typography>
      {cameraList?.map((item) => (
        <MenuItem
          key={item.deviceId}
          selected={item.deviceId === activeCamera}
          onClick={() => handleMenuItemClick(item.deviceId)}
        >
          {item.label} {item.deviceId === activeCamera && <Check fontSize="small" />}
        </MenuItem>
      ))}
      {!isPreview && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ padding: '8px 16px' }}>Select a Video Playback</Typography>
          {videoPlaybacks.map((item) => (
            <MenuItem
              key={item.url}
              selected={item.url === activePlaybackUrl}
              onClick={() => handleMenuItemClick(item.url)}
            >
              {item.title} {item.url === activePlaybackUrl && <Check fontSize="small" />}
            </MenuItem>
          ))}
        </>
      )}
      <Divider />
      {!isPreview && (
        <>
          <MenuItem onClick={() => handleMenuItemClick('mirror')}>
            Mirror My Video {isMirrored && <Check fontSize="small" />}
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('blur')}>
            {mediaStream?.isSupportVirtualBackground() ? 'Blur My Background' : 'Mask My Background'} 
            {isBlur && <Check fontSize="small" />}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuItemClick('statistic')}>
            Video Statistic
          </MenuItem>
        </>
      )}
    </>
  );

  return (
    <div className={classNames('camera-footer', className)}>
      {isStartedVideo ? (
        <ButtonGroup variant="outlined" className="vc-dropdown-button">
          <IconButton
            onClick={onCameraClick}
            style={{ color:'white' }}
          >
            <Videocam />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            style={{ color:'white' }}
          >
            <ExpandMore />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {menuItems}
          </Menu>
        </ButtonGroup>
      ) : (
        <Tooltip title={isStartedVideo ? 'Stop Camera' : 'Start Camera'}>
          <IconButton onClick={onCameraClick} className={classNames('vc-button', className)} style={{ color:'white' }}>
            {isStartedVideo ? <Videocam /> : <VideoCall />}
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default CameraButton;
