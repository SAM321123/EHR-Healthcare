import React, { useEffect, useState } from 'react';
import OT from '@opentok/client';
import { getUserProfilePictureFromName } from '../utility';

const OpenTalkWaitingRoom = ({
  setPublisher,
  isMobile,
  hasVideo,
  calculateAudioLevel = () => {},
  userName = '',
}) => {
  const [publisherProfilePic, setPublisherProfilePic] = useState('');

  useEffect(() => {
    const publisher = OT.initPublisher(
      'publisher',
      {
        insertMode: 'append',
        height: '100%',
        width: isMobile ? '98vw' : '100%',
        borderRadious: 11,
      },
      (error) => {
        if (error) {
          // The client could not publish.
          console.log('There was an error initializing the Publisher: ', error);
        } else {
          console.log('Publisher initialized.');
        }
      }
    );
    publisher.on('audioLevelUpdated', (event) => {
      calculateAudioLevel(event.audioLevel);
    });
    setPublisher(publisher);
  }, []);

  useEffect(() => {
    setPublisherProfilePic(
      getUserProfilePictureFromName({
        name: userName,
        size: 150,
        textFont: 0.5,
      })
    );
  }, [userName]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '85%',
        borderRadious: 11,
        ...(!hasVideo
          ? {
              width: isMobile ? '98vw' : '100%',
              borderRadious: 11,
              backgroundColor: '#1f1f1f',
              backgroundImage: `url(${publisherProfilePic})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              zIndex: 5,
            }
          : {}),
      }}
    >
      <div
        id="publisher"
        style={{
          height: '100%',
          width: isMobile ? '98vw' : '100%',
          borderRadious: 11,
          ...(!hasVideo ? { display: 'none' } : {}),
        }}
      />
    </div>
  );
};

export default OpenTalkWaitingRoom;
