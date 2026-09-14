import { Check, ExpandMore, Lock, LockOpen } from '@mui/icons-material';
import { ButtonGroup, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { SharePrivilege } from '@zoom/videosdk';
import classNames from 'classnames';
import { useState } from 'react';
import { IconFont } from '../../../component/icon-font';

const ScreenShareButton = (props) => {
  const { sharePrivilege, isHostOrManager, onScreenShareClick, onSharePrivilegeClick } = props;
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    {
      label: 'Lock share',
      privilege: SharePrivilege.Locked,
      icon: sharePrivilege === SharePrivilege.Locked && <Check />,
    },
    {
      label: 'One participant can share at a time',
      privilege: SharePrivilege.Unlocked,
      icon: sharePrivilege === SharePrivilege.Unlocked && <Check />,
    },
    {
      label: 'Multiple participants can share simultaneously',
      privilege: SharePrivilege.MultipleShare,
      icon: sharePrivilege === SharePrivilege.MultipleShare && <Check />,
    },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (privilege) => {
    onSharePrivilegeClick?.(privilege);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {isHostOrManager ? (
        <>
          <ButtonGroup
            variant="outlined" className="vc-dropdown-button"
           
          >
             <IconButton  sx={{ paddingRight: '8px' }}  color="primary"  onClick={onScreenShareClick}>
                    <IconFont type="icon-share" />
            </IconButton>
          <IconButton  color="primary" onClick={handleMenuClick} style={{ color:'white' }}>
              <ExpandMore />
            </IconButton>

          <Menu
            id="screen-share-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
          >
            {menuItems.map((item, index) => (
              <MenuItem key={index} onClick={() => handleMenuItemClick(item.privilege)}>
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
          </ButtonGroup>

        </>
      ) : (
        <IconButton
          className={classNames('screen-share-button', 'vc-button')}
          color="default"
          size="large"
          onClick={onScreenShareClick}
        >
          <IconFont type="icon-share" />
        </IconButton>
      )}
    </>
  );
};

const ScreenShareLockButton = (props) => {
  const { isLockedScreenShare, onScreenShareLockClick } = props;
  return (
    <Tooltip title={isLockedScreenShare ? 'Unlock screen share' : 'Lock screen share'}>
      <IconButton
        className="screen-share-button"
        color="default"
        size="large"
        onClick={onScreenShareLockClick}
      >
        {isLockedScreenShare ? <Lock /> : <LockOpen />}
      </IconButton>
    </Tooltip>
  );
};

export { ScreenShareButton, ScreenShareLockButton };
