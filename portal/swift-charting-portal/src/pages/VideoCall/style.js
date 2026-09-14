import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
  waitingRoomContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6F6F6',
    height: '100vh',
    width: '100vw',
    overflow: 'auto',
    flexWrap: 'wrap',
    gap:40,
  },
  mediaSources: {
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  waitingRoomVideoPreview: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    width: '100%',
  },
  deviceContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: '10px 5px',
    width: '55%',
  },
  deviceSettings: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  networkTestContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: '10px 5px',
  },
  flex: {
    display: 'flex',
  },
  root: {
    width: '20%',
  },
  callContainer: {
    height: '100vh',
    width: '100vw',
    background: 'red',
  },
  roomContainer: {
    height: '100vh',
    width: '100vw',
  },
}));
