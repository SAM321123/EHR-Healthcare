import classNames from 'classnames';
import { useLayoutEffect, useRef, useState } from 'react';
import { IconFont } from '../../../component/icon-font';
import AvatarMore from './avatar-more';
import './avatar.scss';
import { useHover } from '../../../hooks/useHover';
import { MicOff } from '@mui/icons-material';

const networkQualityIcons = ['bad', 'bad', 'normal', 'good', 'good', 'good'];
const Avatar = (props) => {
  const { participant, style, isActive, className, networkQuality } = props;
  const { displayName, audio, muted, bVideoOn, userId, isInFailover } = participant;
  const [fontSize, setFontSize] = useState(38);
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  useLayoutEffect(() => {
    if (avatarRef.current) {
      const { width } = (avatarRef.current).getBoundingClientRect();
      setFontSize(Math.max(12, Math.min(38, Math.ceil(width / displayName.length))));
    }
  }, [displayName]);

  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
      ref={avatarRef}
    >
      {(bVideoOn || (audio === 'computer' && muted) || isInFailover) && (
        <div className="corner-name">
          {audio === 'computer' && muted && <MicOff style={{ color: '#f00' }} />}
          {bVideoOn && networkQuality !== undefined && (
            <IconFont
              type={`icon-network-${
                networkQualityIcons[
                  Math.min(networkQuality?.downlink ?? Number.MAX_VALUE, networkQuality?.uplink ?? Number.MAX_VALUE)
                ]
              }`}
            />
          )}
          {isInFailover && (
            <IconFont type="icon-reconnect" style={{ color: '#fff', animation: 'loading 3s linear infinite' }} />
          )}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && (
        <p className="center-name" style={{ fontSize: `${fontSize}px` }}>
          {displayName}
        </p>
      )}
      {!isInFailover && <AvatarMore userId={userId} isHover={isHover} />}
    </div>
  );
};

export default Avatar;
