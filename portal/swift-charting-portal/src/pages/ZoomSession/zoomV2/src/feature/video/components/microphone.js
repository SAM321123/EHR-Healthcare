import { ArrowDropUp, Check, ExpandMore } from '@mui/icons-material';
import { Box, ButtonGroup, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { AudoiAnimationIcon } from '../../../component/audio-animation-icon';
import { IconFont } from '../../../component/icon-font';
import { useAudioLevel } from '../hooks/useAudioLevel';
import CallOutModal from './call-out-modal';
import CRCCallOutModal from './crc-call-out-modal';

const MicrophoneButton = (props) => {
  const {
    isStartedAudio,
    isSupportPhone,
    isMuted,
    audio,
    className,
    microphoneList,
    speakerList,
    phoneCountryList,
    activeMicrophone,
    activeSpeaker,
    phoneCallStatus,
    disabled,
    isMicrophoneForbidden,
    isSecondaryAudioStarted,
    onMicrophoneClick,
    onMicrophoneMenuClick,
    onPhoneCallClick,
    onPhoneCallCancel
  } = props;

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isCrcModalOpen, setIsCrcModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const level = useAudioLevel();
  const tooltipText = isStartedAudio ? (isMuted ? 'Unmute' : 'Mute') : 'Start Audio';

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const onMenuItemClick = (payload) => {
    onMicrophoneMenuClick(payload);
    handleMenuClose();
  };

  const onPhoneMenuClick = (key) => {
    if (key === 'phone') {
      setIsPhoneModalOpen(true);
    } else if (key === 'crc') {
      setIsCrcModalOpen(true);
    }
    handleMenuClose();
  };

  const audioIcon = useMemo(() => {
    let iconType = '';
    if (isStartedAudio) {
      if (isMuted) {
        iconType = audio === 'phone' ? 'icon-phone-off' : 'icon-audio-muted';
      } else {
        iconType = audio === 'phone' ? 'icon-phone' : level !== 0 ? null : 'icon-audio-unmuted';
      }
    } else {
      iconType = isMicrophoneForbidden ? 'icon-audio-disallow' : 'icon-headset';
    }
    return iconType ? <IconFont type={iconType} /> : <AudoiAnimationIcon level={level} />;
  }, [level, audio, isMuted, isMicrophoneForbidden, isStartedAudio]);

  useEffect(() => {
    if (isStartedAudio) {
      setIsPhoneModalOpen(false);
    }
  }, [isStartedAudio]);

  return (
    <Box className={classNames('microphone-footer', className)}>
      {isStartedAudio ? (
        <>
        <ButtonGroup variant="outlined" className="vc-dropdown-button">
            <IconButton  sx={{ paddingRight: '8px' }}  color="primary" disabled={disabled} onClick={onMicrophoneClick}>
              {audioIcon}
            </IconButton>
          <IconButton   disabled={disabled} onClick={handleMenuOpen} style={{ color:'white' }}>
              <ExpandMore />
            </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {microphoneList?.length && audio !== 'phone' && (
              <>
                <MenuItem disabled>Select a Microphone</MenuItem>
                {microphoneList.map((i) => (
                  <MenuItem key={i.deviceId} onClick={() => onMenuItemClick(`microphone|${i.deviceId}`)}>
                    {i.label}
                    {activeMicrophone === i.deviceId && <Check fontSize="small" />}
                  </MenuItem>
                ))}
                <MenuItem divider />
              </>
            )}
            {speakerList?.length && audio !== 'phone' && (
              <>
                <MenuItem disabled>Select a Speaker</MenuItem>
                {speakerList.map((i) => (
                  <MenuItem key={i.deviceId} onClick={() => onMenuItemClick(`speaker|${i.deviceId}`)}>
                    {i.label}
                    {activeSpeaker === i.deviceId && <Check fontSize="small" />}
                  </MenuItem>
                ))}
                <MenuItem divider />
              </>
            )}
            <MenuItem onClick={() => onMenuItemClick('secondary audio')}>
              {isSecondaryAudioStarted ? 'Stop Secondary Audio' : 'Start Secondary Audio'}
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={() => onMenuItemClick('statistic')}>Audio Statistic</MenuItem>
            <MenuItem onClick={() => onMenuItemClick('leave audio')}>
              {audio === 'phone' ? 'Hang Up' : 'Leave Audio'}
            </MenuItem>
          </Menu>
          </ButtonGroup>

        </>
      ) : (
        <Tooltip title={tooltipText}>
          <Box>
            {isSupportPhone ? (
              <ButtonGroup variant="outlined" className="vc-dropdown-button">
              <IconButton onClick={onMicrophoneClick}>
                {audioIcon}
              </IconButton>
              <IconButton style={{ color:'white' }} onClick={handleMenuOpen}>
                <ExpandMore />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>

            <MenuItem onClick={() => onPhoneMenuClick('phone')}>Invite by phone</MenuItem>
          </Menu>
              </ButtonGroup>
            ) : (
              <IconButton className={classNames('vc-button', className)} color="primary" onClick={onMicrophoneClick}>
                {audioIcon}
              </IconButton>
            )}
          </Box>
        </Tooltip>
      )}
      <CallOutModal
        visible={isPhoneModalOpen}
        setVisible={(visible) => setIsPhoneModalOpen(visible)}
        phoneCallStatus={phoneCallStatus}
        phoneCountryList={phoneCountryList}
        onPhoneCallCancel={onPhoneCallCancel}
        onPhoneCallClick={onPhoneCallClick}
      />
    </Box>
  );
};

export default MicrophoneButton;
