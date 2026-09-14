import { CheckOutlined, ExpandMore } from '@mui/icons-material';
import { Button, Menu, MenuItem, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useContext, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { IconFont } from '../../../component/icon-font';
import ZoomMediaContext from '../../../context/media-context';
import './share-indication.scss';
import { getAntdItem } from './video-footer-utils';

const ShareIndicationBar = (props) => {
  const { sharUserList, activeSharingId, isControllingUser, viewType, setViewType } = props;
  const draggableRef = useRef(null);
  const { mediaStream } = useContext(ZoomMediaContext);
  const [mutedShareAudioList, setMutedShareAudioList] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const activeUser = (sharUserList ?? []).find((user) => user.userId === activeSharingId);
  
  const menuItems = [
    getAntdItem('View', 'view', undefined, [
      getAntdItem('Fit to Window', 'view|fit', 'view|fit'.endsWith(viewType) && <CheckOutlined />),
      getAntdItem('Original Size', 'view|original', 'view|original'.endsWith(viewType) && <CheckOutlined />)
    ], 'group')
  ];
  
  if (mediaStream?.isRemoteControlEnabled() && mediaStream?.isTargetShareSupportRemoteControl(activeSharingId)) {
    menuItems.push(getAntdItem('', 'd1', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(isControllingUser ? 'Give up Remote Control' : 'Request Remote Control', 'remote control')
    );
  }
  
  if (activeUser?.bShareAudioOn) {
    menuItems.push(getAntdItem('', 'd2', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(
        `${mediaStream?.isOthersShareAudioMutedLocally(activeSharingId) ? 'Unmute' : 'Mute'} ${activeUser.displayName}'s Computer Audio`,
        'share audio'
      )
    );
  }
  
  if ((sharUserList ?? []).length > 1) {
    menuItems.push(getAntdItem('', 'd3', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(
        'Shared Screens',
        'share users',
        undefined,
        (sharUserList ?? []).map((user) =>
          getAntdItem(user.displayName, `share|${user.userId}`, activeSharingId === user.userId && <CheckOutlined />)
        ),
        'group'
      )
    );
  }
  
  const onMenuClick = (key) => {
    if (key.startsWith('view|')) {
      const [, type] = key.split('|');
      setViewType(type);
    } else if (key.startsWith('share|')) {
      const [, shareUserId] = key.split('|');
      if (Number(shareUserId) !== activeSharingId) {
        mediaStream?.switchShareView(Number(shareUserId));
      }
    } else if (key === 'share audio') {
      if (mediaStream?.isOthersShareAudioMutedLocally(activeSharingId)) {
        mediaStream.unmuteShareAudio(activeSharingId);
        setMutedShareAudioList(mutedShareAudioList.filter((u) => u !== activeSharingId));
      } else {
        mediaStream?.muteShareAudio(activeSharingId);
        setMutedShareAudioList([...mutedShareAudioList, activeSharingId]);
      }
    } else if (key === 'remote control') {
      if (isControllingUser) {
        mediaStream?.giveUpRemoteControl();
      } else {
        // Replace with a confirmation dialog from MUI
        if (window.confirm(`You are about to request remote control of ${activeUser?.displayName}'s shared content`)) {
          mediaStream?.requestRemoteControl();
        }
      }
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Draggable nodeRef={draggableRef} axis="x" bounds="parent">
      <div className="share-indication-bar" ref={draggableRef}>
        <p className={classNames('share-indication-tip', { 'share-indication-in-control': isControllingUser })}>
          {activeUser?.bShareAudioOn && (
            <IconFont type={mutedShareAudioList.includes(activeSharingId) ? 'icon-audio-off' : 'icon-audio-on'} />
          )}
          {`You are ${isControllingUser ? 'controlling' : 'viewing'} ${activeUser?.displayName}'s screen`}
        </p>
        <Tooltip title="View Options">
          <Button size="small" className={classNames('share-bar-btn', 'share-bar-more')} onClick={handleMenuOpen}>
            View Options <ExpandMore />
          </Button>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {menuItems.map((item) => (
            <MenuItem key={item.key} onClick={() => { onMenuClick(item.key); handleMenuClose(); }}>
              {item.label}
              {item.icon && <span>{item.icon}</span>}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </Draggable>
  );
};

export default ShareIndicationBar;
