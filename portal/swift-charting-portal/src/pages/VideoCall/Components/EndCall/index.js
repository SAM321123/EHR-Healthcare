import { IconButton } from '@mui/material';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import styles from './styles';

export default function EndCall() {
  const { state: { data: appointment = {} } = {} } = useLocation();
  const navigate = useNavigate();
  const classes = styles();
  const rejoin = () => {
    if (appointment?.id) {
      const path = generatePath(UI_ROUTES.waitingroom, {
        appointmentId: appointment?.id,
      });
      navigate(`/${path}`);
    }
  };
  return (
    <div className={classes.container}>
      <div className={classes.meetingInfo}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
          }}
        >
          You left the meeting
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <IconButton
          style={{
            height: 40,
            width: 100,
            borderRadius: 8,
            border: '1px solid #337AB7',
          }}
          color="primary"
          onClick={rejoin}
        >
          <div>Rejoin</div>
        </IconButton>
      </div>
    </div>
  );
}
