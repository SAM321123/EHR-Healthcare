import { useContext, useEffect, useRef, useState } from 'react';

import { ArrowDownward, ArrowLeft, ArrowRight, MoveUpOutlined, PlusOneOutlined, PlusOneRounded, TwelveMpTwoTone } from '@mui/icons-material';
import classNames from 'classnames';
import Draggable from 'react-draggable';
import { IconFont } from '../../../component/icon-font';
import ZoomMediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import AvatarContext from '../context/avatar-context';
import { useCameraControl } from '../hooks/useCameraControl';
import './remote-camera-control.scss';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import { usePrevious } from '../../../hooks/usePrevious';
import { Button, Popover } from '@mui/material';


const RemoteCameraControlIndication = (props) => {
  const { stopCameraControl } = props;
  const menu = [getAntdItem('Stop camera control', 'stop')];
  const onMenuItemClick = (payload) => {
    stopCameraControl();
  };
  return (
    <Popover
      className={classNames('vc-dropdown-button')}
      menu={getAntdDropdownMenu(menu, onMenuItemClick)}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        icon={<IconFont type="icon-remote-control" />}
        size="large"
        ghost={true}
        shape="circle"
        className={classNames('vc-button', 'remote-control-dropdown')}
      />
    </Popover>
  );
};

const RemoteCameraControlPanel = (props) => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const {
    avatarActionState: { isControllingRemoteCamera }
  } = useContext(AvatarContext);
  const {
    currentControlledUser,
    isInControl,
    cameraCapability,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  } = useCameraControl(zmClient, mediaStream);

  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(0);
  const draggableRef = useRef(null);
  const controlRef = useRef(undefined);
  const isPreviousPressing = usePrevious(isPressing);
  useEffect(() => {
    if (isPressing && !isPreviousPressing) {
      timerRef.current = window.setInterval(() => {
        controlRef.current?.(4);
      }, 500);
    } else if (isPressing === false && isPreviousPressing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = 0;
        controlRef.current?.(2);
      }
    }
  }, [isPressing, isPreviousPressing]);
  return (
    <>
      {isControllingRemoteCamera && (
        <Draggable nodeRef={draggableRef} handle=".control-title">
          <div className="remote-camera-control-panel" ref={draggableRef}>
            <h3
              className="control-title"
              title={`${currentControlledUser.displayName}'s camera`}
            >{`${currentControlledUser.displayName}'s camera`}</h3>
            <div className="control-wrap">
              <div className="zoom-control">
                <Button
                  icon={<PlusOneRounded />}
                  ghost
                  disabled={!cameraCapability?.zoom}
                  onMouseDown={() => {
                    controlRef.current = zoomIn;
                    setIsPressing(true);
                  }}
                  onMouseUp={() => {
                    setIsPressing(false);
                  }}
                />
                <Button
                  icon={<PlusOneOutlined />}
                  ghost
                  disabled={!cameraCapability?.zoom}
                  onMouseDown={() => {
                    controlRef.current = zoomOut;
                    setIsPressing(true);
                  }}
                  onMouseUp={() => {
                    setIsPressing(false);
                  }}
                />
              </div>
              <nav className="pan-control">
                <div className={classNames('turn-up', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.tilt}
                    icon={<MoveUpOutlined />}
                    onMouseDown={() => {
                      controlRef.current = turnUp;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('turn-left', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.pan}
                    icon={<ArrowLeft />}
                    onMouseDown={() => {
                      controlRef.current = turnLeft;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('center-button', 'pan-control-btn')}>
                  <Button
                    ghost
                    icon={<TwelveMpTwoTone />}
                    onClick={() => {
                      switchCamera();
                    }}
                  />
                </div>
                <div className={classNames('turn-right', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.pan}
                    icon={<ArrowRight />}
                    onMouseDown={() => {
                      controlRef.current = turnRight;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
                <div className={classNames('turn-down', 'pan-control-btn')}>
                  <Button
                    ghost
                    disabled={!cameraCapability?.tilt}
                    icon={<ArrowDownward />}
                    onMouseDown={() => {
                      controlRef.current = turnDown;
                      setIsPressing(true);
                    }}
                    onMouseUp={() => {
                      setIsPressing(false);
                    }}
                  />
                </div>
              </nav>
            </div>
          </div>
        </Draggable>
      )}
      {isInControl && <RemoteCameraControlIndication stopCameraControl={stopControl} />}
    </>
  );
};

export default RemoteCameraControlPanel;
