import { ArrowDropUp, ExpandMore } from '@mui/icons-material';
import { ButtonGroup, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { IconFont } from '../../../component/icon-font'; // Assuming IconFont is your custom component

const LiveTranscriptionButton = (props) => {
  const {
    isStartedLiveTranscription,
    onDisableCaptions,
    isDisableCaptions,
    isHost,
    onLiveTranscriptionClick,
    className
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMenuItemClick = (key) => {
    handleClose();
    if (key === 'disable') {
      onDisableCaptions(true);
    } else if (key === 'enable') {
      onDisableCaptions(false);
    }
  };

  return (
    <div>
      {isHost ? (
        <>
        <ButtonGroup>
          <IconButton
            variant="outlined"
            size="large"
            onClick={onLiveTranscriptionClick}
            className={classNames('vc-dropdown-button', className)}
            aria-controls={Boolean(anchorEl) ? 'live-transcription-menu' : undefined}
            aria-haspopup="true"
          >
            <IconFont type="icon-subtitle" />
          </IconButton>
          <IconButton
            variant="outlined"
            startIcon={<ArrowDropUp />}
            size="large"
            onClick={handleMenuClick}
            className={classNames('vc-dropdown-button', className)}
            aria-controls={Boolean(anchorEl) ? 'live-transcription-menu' : undefined}
            aria-haspopup="true"
          >
            <ExpandMore />
          </IconButton>
          <Menu
            id="live-transcription-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => onMenuItemClick(isDisableCaptions ? 'enable' : 'disable')}>
              {isDisableCaptions ? 'Enable Captions' : 'Disable Captions'}
            </MenuItem>
          </Menu>
          </ButtonGroup>
        </>
      ) : (
        <Tooltip title="Toggle Live Transcription">
          <IconButton
            className={classNames('vc-button', className, {
              active: isStartedLiveTranscription
            })}
            onClick={onLiveTranscriptionClick}
            size="large"
          >
            <IconFont type="icon-subtitle" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export { LiveTranscriptionButton };
