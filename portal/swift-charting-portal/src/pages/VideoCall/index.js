import { Mic, Videocam } from '@mui/icons-material';
import { Button, Switch, useMediaQuery, useTheme } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { UI_ROUTES } from 'src/lib/routeConstants';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { roleTypes } from 'src/lib/constants';
import { getUserRole } from 'src/lib/utils';
import { GET_APPOINTMENT } from 'src/store/types';
import PreviewScreenCard from './Components/PreviewScreenCard';
import OpenTalkWaitingRoom from './OpenTalk/OpenTalkWaitingRoom';
import useStyles from './style';
import Typography from 'src/components/Typography';
import logo from 'src/assets/images/logoMain.png';
import clockIcon from 'src/assets/images/wall-clock.png';
import palette from 'src/theme/palette';
import moment from 'moment';


function checkStarted(startDateTime) {
  // Parse the startDateTime string using Moment.js
  var startMoment = moment(startDateTime, "YYYY-MM-DD HH:mm:ss");

  // Get the current moment
  var currentMoment = moment();

  // Calculate the difference between the current time and the start time
  var diff = moment.duration(startMoment.diff(currentMoment));

  // Get the absolute values of days, hours, minutes, and seconds
  var days = Math.abs(diff.days());
  var hours = Math.abs(diff.hours());
  var minutes = Math.abs(diff.minutes());
  var seconds = Math.abs(diff.seconds());

  // Construct the time remaining string
  var scheduleStart = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Check if the event has started
  var started = currentMoment.isAfter(startMoment);

  // Return an object with scheduled start time and started flag
  return {
      scheduledStart: scheduleStart,
      started: started
  };
}


const WaitingRoom = () => {
  const role = getUserRole() || '';
  const classes = useStyles();
  const params = useParams();
  // const navigate = useNavigate();
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);
  const [logLevel, setLogLevel] = useState(0);
  const [publisher, setPublisher] = useState();
  const [start,setStart]=useState({started:false,scheduledStart:'00:00:00:00'})
  const [totalEducationContents, setTotalEducationContents] = useState(0);
  const [watchedEducationContents, setWatchedEducationContents] = useState({});
  const theme = useTheme();
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));

  const calculateAudioLevel = useCallback((audioLevel) => {
    let movingAvg = null;
    if (movingAvg === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg = 0.8 * movingAvg + 0.2 * audioLevel;
    }
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const currentLogLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    setLogLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  }, []);

  const [appointmentResponse, , , getAppointments] = useCRUD({
    id: GET_APPOINTMENT,
    url: `${API_URL.appointment}/${params.appointmentId}`,
    type: REQUEST_METHOD.get,
  });

  const defaultValue = useMemo(() => {
    if (appointmentResponse?.id) {

      return {
        ...appointmentResponse,
      };
    }
    return {};
  }, [appointmentResponse]);

  // const handleJoinClick = useCallback(() => {
  //   navigate(
  //     `/${UI_ROUTES.joinRoom}?session=${appointmentResponse?.sessionId}`,
  //     {
  //       state: {
  //         data: {
  //           appointmentResponse,
  //           localAudio,
  //           localVideo,
  //         },
  //       },
  //     }
  //   );
  // }, [appointmentResponse, localAudio, localVideo, navigate]);

  useEffect(() => {
    getAppointments();
  }, []);

  const toggleVideo = useCallback(() => {
    if (publisher) {
      publisher.publishVideo(!localVideo);
      setLocalVideo(!localVideo);
    }
  }, [localVideo, publisher]);

  const toggleAudio = useCallback(() => {
    if (publisher) {
      publisher.publishAudio(!localAudio);
      setLocalAudio(!localAudio);
    }
  }, [localAudio, publisher]);

  const [, , , updateBooking] = useCRUD({
    id: `update-appointment-data`,
    url: `${API_URL.appointment}`,
    type: REQUEST_METHOD.update,
    subscribeSocket: true,
  });

  useEffect(()=>{
    const timer=setInterval(()=>{
     const temp= checkStarted(defaultValue.startDateTime);
     setStart(temp);
    },1000)
    return ()=>{
      if(timer){
        clearInterval(timer)
      }
    }
  },[defaultValue])
  return (
    <div
      className={classes.waitingRoomContainer}
      style={
        isMobileWidth
          ? {
              flexDirection: 'column',
              display: 'flex',
            }
          : {backgroundColor:'#fff'}
      }
    >
      <div style={{display:'flex',gap:40,flex:0.7}}>
      <div style={{flex:0.5,display:'flex',padding:'20px 10px',alignItems:'center',flexDirection:'column',gap:30}}>
            <div style={{display:'flex',flexDirection:'column',gap:30}}>
              <img src={logo} style={{width:40,height:40}}/>
              <Typography variant="h2"> {defaultValue?.title || 'N/A'}</Typography>
             
            </div>
            <div style={{border:'1px solid #3BFF00',padding:20,borderRadius:10,display:'flex',gap:20,alignItems:'center'}}>
              <div>
                <img src={clockIcon} style={{width:30,height:30}}/>
              </div>
              <div>
                <Typography>Scheduled to start in</Typography>
                <Typography>{start.scheduledStart}</Typography>

              </div>
            </div>
          </div>

          <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >

        <div
          style={{
            position: 'relative',
            marginTop: 32,
            height: '400px',
            width: '575px',
            marginBottom: '20px',
            borderRadius:10,
          }}
        >
          <OpenTalkWaitingRoom
            appointment={appointmentResponse}
            publisher={publisher}
            setPublisher={setPublisher}
            isMobile={isMobileWidth}
            hasVideo={localVideo}
            calculateAudioLevel={calculateAudioLevel}
            userName={
              role === roleTypes.patient
                ? defaultValue?.patient?.name
                : defaultValue?.practitioner?.name
            }
          />
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div className={classes.deviceContainer}>
              <div className={classes.deviceSettings}>
                <Mic />
                <div>Microphone</div>
                <Switch
                  checked={localAudio}
                  onChange={toggleAudio}
                  name="AudioToggle"
                />
              </div>
              <LinearProgress variant="determinate" value={logLevel} />
              <div className={classes.deviceSettings}>
                <Videocam />
                <div>Video</div>
                <Switch
                  checked={localVideo}
                  onChange={toggleVideo}
                  name="VideoToggle"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '20px',
          }}
        >
          {role === roleTypes.patient ? (
            <div
              style={{
                marginTop: 10,
                color: '#303030',
                fontSize: isMobileWidth ? 14 : 16,
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: 600,
              }}
            >{`Appointment with ${
              defaultValue?.practitioner?.name || ''
            }(Practitioner)`}</div>
          ) : null}
          {role !== roleTypes.patient ||
          totalEducationContents ===
            Object.keys(watchedEducationContents).length ? (
            <>
              <div
                style={{
                  color: '#303030',
                  fontFamily: 'Poppins',
                  fontSize: 24,
                  fontStyle: 'normal',
                  fontWeight: 600,
                  marginTop: 10,
                }}
              >
                Ready to Join?
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  updateBooking(
                    { status: 'Waiting Room' },
                    `/${appointmentResponse?.id}`
                  );
                  window.open(appointmentResponse?.googleMeetLink, '_blank');
                }}
                style={{
                  boxShadow: '4px 8px 18px 0px rgba(68, 97, 242, 0.15)',
                  width: 115,
                  marginTop: 10,
                }}
              >
                Join Call
              </Button>
            </>
          ) : null}
        </div>
      </div>

      </div>

      <div style={{display:'flex',flex:0.2,flexDirection:'column',gap:5,borderLeft:`1px solid ${palette.border.main}`,padding:'20px 10px'}}>
          {defaultValue.patients?.map((patient, index) => (
            <PreviewScreenCard
              key={index}
              patient={patient}
              style={{ backgroundColor: '#EAF0F7' }}
            />
          ))}
        </div>
    </div>
  );
};

export default WaitingRoom;
