import React, { useState } from 'react';
import { RecordingStatus } from '@zoom/videosdk';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { Button, IconButton, Tooltip } from '@mui/material';


export const recordStatusIcon = {
  text: 'Status',
  tipText: 'Record Status',
  icon: 'icon-recording-animated',
  hoverIcon: 'icon-recording-animated-hover'
};

export const getRecordingButtons = (status, isHost) => {
  // Stopped = recording
  // Recording = pause recording/ stop recording
  // Paused = resume recording/ stop recording
  let buttons = [];

  if (status === RecordingStatus.Stopped || status === '') {
    buttons = [
      {
        text: 'Record',
        tipText: 'Start Recording',
        icon: 'icon-recording',
        hoverIcon: 'icon-recording-hover'
      }
    ];
  } else if (status === RecordingStatus.Recording) {
    if (!isHost) return [recordStatusIcon];
    buttons = [
      recordStatusIcon,
      {
        text: 'Pause',
        tipText: 'Pause Recording',
        icon: 'icon-recording-pause',
        hoverIcon: 'icon-recording-pause-hover'
      },
      {
        text: 'Stop',
        tipText: 'Stop Recording',
        icon: 'icon-recording-stop',
        hoverIcon: 'icon-recording-stop-hover'
      }
    ];
  } else if (status === RecordingStatus.Paused) {
    if (!isHost) return [recordStatusIcon];
    buttons = [
      recordStatusIcon,
      {
        text: 'Resume',
        tipText: 'Resume Recording',
        icon: 'icon-recording-resume',
        hoverIcon: 'icon-recording-resume-hover'
      },
      {
        text: 'Stop',
        tipText: 'Stop Recording ?',
        icon: 'icon-recording-stop',
        hoverIcon: 'icon-recording-stop-hover'
      }
    ];
  }
  return buttons;
};

const RecordingButton = (props) => {
  const { tipText, icon, hoverIcon, onClick } = props;
  const [isHover, setIsHover] = useState(false);
  return (
    <Tooltip title={tipText}>
      <IconButton
        className={classNames('vc-button')}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onClick}
        onMouseEnter={() => {
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
      ><IconFont type={isHover ? hoverIcon : icon} /></IconButton>
    </Tooltip>
  );
};

export { RecordingButton };
