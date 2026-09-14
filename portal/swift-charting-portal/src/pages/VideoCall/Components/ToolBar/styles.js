import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90px',
    margin: theme.spacing(2),
    borderRadius: '25px',
    zIndex: 999,
  },
  paper: {
    position: 'absolute',
    display: 'flex',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  toolbarMobileContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    margin: theme.spacing(2),
    borderRadius: '25px',
  },
  toolbarButtons: {
    margin: theme.spacing(1),
    borderRadius: '5em',
    backgroundColor: '#fff4',
    color: '#fff',
    height: '50px',
    width: '50px',
  },
  arrowButton: {
    borderRadius: '5em',
    height: '50px',
    width: '50px',
    backgroundColor: '#32353A',
    color: '#fff',
  },
  infoButton: {
    position: 'absolute',
    left: '0',
    margin: theme.spacing(1),
    borderRadius: '5em',
    height: '50px',
    width: '50px',
    backgroundColor: '#32353A',
    color: '#fff',
  },
  groupButton: {
    margin: '8px',
  },
  disabledButton: {
    backgroundColor: 'red',
    '&:hover': {
      backgroundColor: 'red',
    },
  },
  activeButton: {
    backgroundColor: 'green',
    '&:hover': {
      backgroundColor: 'green',
    },
  },
  activeButtonIcon: {
    color: 'green',
  },
}));
