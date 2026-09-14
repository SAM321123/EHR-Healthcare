import { makeStyles } from '@mui/styles';

export default makeStyles(() => ({
  banner: {
    zIndex: 1,
    // flexGrow: 0.1,
    margin: '200px',
    height: '100px',
    width: '50%',
    // position: 'absolute'
    alignItems: 'center',
    borderRadius: '30px',
    backgroundColor: 'black',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
  },
  new__meeting: {
    color: 'rgb(43,158,250)',
  },

  meetingInfo: {
    marginTop: '10%',
  },
  recording: {
    display: 'flex',
    flexDirection: 'row',
  },
  root: {
    minWidth: 275,
    margin: 'auto',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  centeredFlex: {
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'black',
    color: 'white',
    borderRadius: '30px',
  },
}));
