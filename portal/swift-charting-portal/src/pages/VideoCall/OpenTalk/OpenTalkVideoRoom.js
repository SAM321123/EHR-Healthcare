import React, { useEffect, useMemo, useState } from 'react';
import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { JOIN_APPOINTMENT_SESSION } from 'src/store/types';
import { API_URL, REQUEST_METHOD, OPENTOK_API_KEY } from 'src/api/constants';
import { mobileWidth } from 'src/lib/constants';
import { getUserRole } from 'src/lib/utils';
import ToolBar from '../Components/ToolBar';
import Participants from '../Components/Participants/Participants';
import { getUserProfilePictureFromName } from '../utility';
import './OpenTalkVideoRoom.css';
import {
  getPublisherContainerStyle,
  getPublisherProperties,
  getPublisherStyle,
  getSubscriberContainerStyle,
  getSubscriberProperties,
} from './utility';

const OpenTalkVideoRoom = () => {
  const {
    state: {
      data: {
        appointmentResponse = {},
        localAudio = true,
        localVideo = true,
      } = {},
    } = {},
  } = useLocation();
  const role = getUserRole() || '';
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantProfilePics, setParticipantProfilePics] = useState({});
  const [sessionHelper, setSessionHelper] = useState();
  const [streams, setStreams] = useState([]);
  const [publisher, setPublisher] = useState();
  const [hasAudio, setHasAudio] = useState(localAudio);
  const [hasVideo, setHasVideo] = useState(localVideo);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSendInvite, setShowSendInvite] = useState(false);
  const [publisherProfilePic, setPublisherProfilePic] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState();
  const isMobile = useMediaQuery(mobileWidth);

  const [
    { result: { sessionId = '', token = '' } = {} } = {},
    ,
    ,
    getAppointmentCreds,
  ] = useCRUD({
    id: JOIN_APPOINTMENT_SESSION,
    url: `${API_URL.appointment}/joinAppointmentSession/${role}/${appointmentResponse?.id}`,
    type: REQUEST_METHOD.get,
  });

  const addParticipants = ({ participant }) => {
    let { data } = participant?.connection || {};
    data = JSON.parse(data);
    const {
      userId = '',
      fullName = '',
      role: participantRole = '',
    } = data || {};
    const profilePic = getUserProfilePictureFromName({
      name: fullName,
    });
    setParticipantProfilePics((prev) => ({
      ...prev,
      [`${userId}_${participantRole}`]: profilePic,
    }));
    setParticipants((prev) => [...prev, participant]);
  };

  const removeParticipants = ({ participant }) => {
    let { data } = participant?.connection || {};
    data = JSON.parse(data);
    const { userId = '' } = data || {};
    setParticipantProfilePics((prev) => {
      const updates = {
        ...prev,
      };
      delete updates[userId];
      return updates;
    });
    setParticipants((prev) =>
      prev.filter(
        (prevparticipant) =>
          prevparticipant?.connection?.id !== participant?.connection?.id
      )
    );
  };

  useEffect(() => {
    getAppointmentCreds();
  }, []);

  const sessionEvents = useMemo(
    () => ({
      sessionConnected: (event) => {
        setSessionHelper(event.target);
        setConnected(true);
      },
      streamCreated: (event) => {
        setStreams((prevStreams) => {
          if (!prevStreams.filter((ele) => ele.id === event.stream.id).length) {
            const newStreams = [...prevStreams, event.stream];
            if (!activeSpeaker) {
              setActiveSpeaker(newStreams[0]);
            }
            return newStreams;
          }
          return prevStreams;
        });
      },
      streamDestroyed: (event) => {
        setStreams((prevStreams) => {
          const newStreams = prevStreams.filter(
            (stream) => stream?.streamId !== event?.stream?.streamId
          );
          setActiveSpeaker(newStreams[0]);
          return newStreams;
        });
      },
      connectionCreated: (participant) => {
        addParticipants({ participant });
      },
      connectionDestroyed: (participant) => {
        removeParticipants({ participant });
      },
    }),
    []
  );

  useEffect(() => {
    getAppointmentCreds();
  }, []);

  const subscriberEvents = {
    audioLevelUpdated: (event) => {
      if (event?.audioLevel && event.audioLevel > 0.2) {
        if (!activeSpeaker || activeSpeaker.id !== event.target.stream.id) {
          setActiveSpeaker(event.target.stream);
        }
      }
    },
  };

  const getSubscriber = (stream) => (
    <OTSubscriber
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '0.6rem',
      }}
      key={stream?.id}
      session={sessionHelper}
      stream={stream}
      eventHandlers={subscriberEvents}
      properties={{
        height: '100%',
        width: '100%',
        borderRadius: '0.6rem',
      }}
    />
  );

  useEffect(() => {
    if (!hasAudio && publisher) {
      publisher?.publishAudio(false);
      publisher?.getMicrophoneGain(0);
    }
    if (sessionHelper?.connection?.data) {
      const data = JSON.parse(sessionHelper?.connection?.data);
      setPublisherProfilePic(
        getUserProfilePictureFromName({
          name: data?.fullName,
          size: streams.length ? 80 : 150,
          textFont: 0.5,
        })
      );
    }
  }, [publisher, streams]);

  return OPENTOK_API_KEY && sessionId ? (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#202124',
        padding: '10px',
        ...(isMobile
          ? {
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            }
          : {}),
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: showParticipants ? '66vw' : '100%',
          display: 'flex',
          justifyContent: 'center',
          alignSelf: 'center',
          flexDirection: 'row',
          padding: 10,
          ...(isMobile && showParticipants ? { display: 'none' } : {}),
        }}
        className="OTcontainer"
      >
        <OTSession
          apiKey={OPENTOK_API_KEY}
          sessionId={sessionId}
          token={token}
          eventHandlers={sessionEvents}
        >
          <div
            style={{
              ...getPublisherContainerStyle({
                hasVideo,
                streams,
                showParticipants,
                publisherProfilePic,
                isMobile,
              }),
            }}
          >
            <OTPublisher
              style={{
                ...getPublisherStyle({
                  hasVideo,
                  showParticipants,
                  streams,
                }),
              }}
              properties={{
                ...getPublisherProperties({ showParticipants }),
              }}
              ref={(ref) => {
                if (ref?.state?.publisher) {
                  setPublisher(ref?.state?.publisher);
                }
              }}
            />
          </div>
          <ToolBar
            participants={participants}
            connected={connected}
            appointment={appointmentResponse}
            room={sessionHelper}
            publisher={publisher}
            hasAudio={hasAudio}
            hasVideo={hasVideo}
            setHasAudio={setHasAudio}
            setHasVideo={setHasVideo}
            showParticipants={showParticipants}
            setShowParticipants={setShowParticipants}
            showSendInvite={showSendInvite}
            setShowSendInvite={setShowSendInvite}
            streams={streams}
            isMobile={isMobile}
          />
          <div
            className={isMobile ? '' : 'subscriberContainer'}
            style={{
              ...getSubscriberContainerStyle({
                streams,
                isMobile,
              }),
              bottom: 10,
              ...(isMobile ? { display: 'none' } : {}),
            }}
          >
            {activeSpeaker &&
              streams
                ?.filter((ele) => ele?.id !== activeSpeaker?.id)
                ?.map((ele, index) => {
                  if (index <= 3)
                    return (
                      <OTSubscriber
                        key={ele.id}
                        session={sessionHelper}
                        stream={ele}
                        properties={{
                          ...getSubscriberProperties({}),
                        }}
                        eventHandlers={subscriberEvents}
                      />
                    );
                  return null;
                })}
            {streams?.length > 4 ? (
              <div
                style={{
                  height: '25vh',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '0.6rem',
                  backgroundColor: '#D26666',
                  marginLeft: 10,
                  cursor: 'pointer',
                }}
                role="button"
                tabIndex="0"
                onClick={() => setShowParticipants((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowParticipants((prev) => !prev);
                  }
                }}
              >
                <div
                  style={{
                    height: '25vh',
                    width: '100%',
                    color: '#FFF',
                    fontFamily: 'Inter',
                    fontSize: 52,
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  +{streams.length - 4}
                </div>
              </div>
            ) : null}
          </div>
        </OTSession>
        {activeSpeaker?.id || streams?.length ? (
          <div
            style={{
              position: 'absolute',
              top: 10,
              height: '70vh',
              width: showParticipants ? '66vw' : '98%',
              alignSelf: 'center',
              borderRadius: '0.6rem',
            }}
          >
            {activeSpeaker?.id
              ? getSubscriber(activeSpeaker)
              : getSubscriber(streams[0])}
          </div>
        ) : null}
      </div>
      {showParticipants ? (
        <Participants
          containerStyle={{
            position: 'absolute',
            right: 10,
            top: 19,
            bottom: 10,
            height: '94vh',
            width: isMobile ? '96vw' : '30vw',
            border: '1px solid rgb(218,220,224)',
            borderRadius: 8,
            alignSelf: 'center',
            padding: 20,
            backgroundColor: '#FFFFFF',
          }}
          participants={participants}
          setShowSendInvite={setShowSendInvite}
          setShowParticipants={setShowParticipants}
          userRole={role}
          participantProfilePics={participantProfilePics}
        />
      ) : null}
    </div>
  ) : null;
};

export default OpenTalkVideoRoom;
