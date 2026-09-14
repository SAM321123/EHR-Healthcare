import { useState, useCallback, useContext } from 'react';
import { Slider, Menu, MenuItem, IconButton } from '@mui/material';
import { Check, MoreVert } from '@mui/icons-material';
import classNames from 'classnames';
import AvatarActionContext from '../context/avatar-context';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
import { useSpotlightVideo } from '../hooks/useSpotlightVideo';

const isUseVideoPlayer = new URLSearchParams(window.location.search).get('useVideoPlayer') === '1';

const AvatarMore = (props) => {
  const { userId, isHover } = props;
  const { avatarActionState, dispatch } = useContext(AvatarActionContext);
  console.log("🚀 ~ AvatarMore ~ avatarActionState:", avatarActionState)
  const { mediaStream } = useContext(MediaContext);
  const zmClient = useContext(ZoomContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isControllingRemoteCamera, setIsControllingRemoteCamera] = useState(false);

  useSpotlightVideo(zmClient, mediaStream, (participants) => {
    dispatch({ type: 'set-spotlighted-videos', payload: participants });
  });

  const actionItem = avatarActionState[`${userId}`] || {};
  const { spotlightedUserList } = avatarActionState;

  const menuItems = [];
  if (actionItem) {
    if (actionItem.localVolumeAdjust?.enabled) {
      menuItems.push({
        label: 'Adjust volume locally',
        key: 'volume',
        icon: actionItem.localVolumeAdjust.toggled && <Check />
      });
    }
    if (actionItem.farEndCameraControl?.enabled) {
      menuItems.push({
        label: isControllingRemoteCamera ? 'Give up camera control' : 'Control far end camera',
        key: 'farend'
      });
    }
  }
  if (actionItem.videoResolutionAdjust?.enabled) {
    menuItems.push({
      label: 'Subscribe other video resolution',
      key: 'subscribeVideoQuality',
      icon: actionItem.videoResolutionAdjust?.toggled && <Check />
    });
  }
  if (isUseVideoPlayer) {
    const currentUserId = zmClient.getCurrentUserInfo()?.userId;
    const isHostOrManager = zmClient.isHost() || zmClient.isManager();
    if (
      currentUserId === userId &&
      spotlightedUserList?.find((user) => user.userId === currentUserId) &&
      spotlightedUserList.length === 1
    ) {
      menuItems.push({ label: 'Remove spotlight', key: 'removeSpotlight' });
    } else if (isHostOrManager) {
      if (spotlightedUserList?.some((user) => user.userId === userId)) {
        menuItems.push({ label: 'Remove spotlight', key: 'removeSpotlight' });
      } else {
        const user = zmClient.getUser(userId);
        if (user?.bVideoOn) {
          menuItems.push({ label: 'Add spotlight', key: 'addSpotlight' });
          menuItems.push({ label: 'Replace spotlight', key: 'replaceSpotlight' });
        }
      }
    }
  }

  const onSliderChange = useCallback(
    (value) => {
      mediaStream?.adjustUserAudioVolumeLocally(userId, value);
      dispatch({ type: 'update-local-volume', payload: { userId, volume: value } });
    },
    [userId, mediaStream, dispatch]
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onMenuItemClick = (key) => {
    if (key === 'volume') {
      dispatch({ type: 'toggle-local-volume', payload: { userId } });
    } else if (key === 'farend') {
      dispatch({ type: 'toggle-far-end-camera-control', payload: { userId } });
      if (isControllingRemoteCamera) {
        mediaStream?.giveUpFarEndCameraControl(userId);
        dispatch({ type: 'set-is-controlling-remote-camera', payload: false });
      } else {
        mediaStream?.requestFarEndCameraControl(userId);
      }
      setIsControllingRemoteCamera(!isControllingRemoteCamera);
    } else if (key === 'subscribeVideoQuality') {
      dispatch({ type: 'toggle-video-resolution-adjust', payload: { userId } });
    } else if (key === 'removeSpotlight') {
      mediaStream?.removeSpotlightedVideo(userId);
    } else if (key === 'addSpotlight') {
      mediaStream?.spotlightVideo(userId, false);
    } else if (key === 'replaceSpotlight') {
      mediaStream?.spotlightVideo(userId, true);
    }
    handleMenuClose();
  };

  return (
    <>
      {menuItems.length > 0 && (
        <>
          <IconButton
            onClick={handleMenuOpen}
            className={classNames('more-button', {
              'more-button-active': isHover || Boolean(anchorEl)
            })}
            size="small"
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            {menuItems.map((item) => (
              <MenuItem key={item.key} onClick={() => onMenuItemClick(item.key)}>
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
      {isHover && actionItem?.localVolumeAdjust?.enabled && actionItem?.localVolumeAdjust?.toggled && (
        <div className={classNames('avatar-volume')}>
          <label>Volume:</label>
          <Slider
            marks={{ 0: '0', 100: '100' }}
            defaultValue={100}
            onChange={(event, value) => onSliderChange(value)}
            value={actionItem?.localVolumeAdjust.volume}
          />
        </div>
      )}
    </>
  );
};

export default AvatarMore;
