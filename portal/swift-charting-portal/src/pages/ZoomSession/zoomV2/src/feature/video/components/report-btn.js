import ZoomVideo from '@zoom/videosdk';
import { Button, Dialog, DialogTitle, DialogContent, Typography, List, ListItem, ListItemText, Snackbar, IconButton } from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import ZoomContext from '../../../context/zoom-context';
import { CircleNotificationsOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import './report-btn.scss';

const trackingId = Object.fromEntries(new URLSearchParams(window.location.search))?.customerJoinId;

const ReportBtn = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const zmClient = useContext(ZoomContext);

  const infoList = useMemo(() => {
    const data = [
      { label: 'Video SDK version', value: ZoomVideo.VERSION },
      { label: 'JsMedia version', value: window.JsMediaSDK_Instance?.version || 'N/A' },
      { label: 'SharedArrayBuffer', value: `${window.crossOriginIsolated}` },
      { label: 'Session id(mid)', value: zmClient.getSessionInfo().sessionId },
      { label: 'Telemetry tracking id', value: trackingId ? window.atob(trackingId) : '' }
    ];
    return data;
  }, [zmClient]);

  const handleInfoClick = async () => {
    setIsDialogOpen(true);
  };

  const handleReportLog = async () => {
    await zmClient.getLoggerClient().reportToGlobalTracing();
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button
        type="text"
        startIcon={<CircleNotificationsOutlined />}
        size="large"
        onClick={handleInfoClick}
        style={{position:'absolute'}}
      >
        Session Info
      </Button>
      
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Info</DialogTitle>
        <DialogContent>
          <List>
            {infoList.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={<Typography variant="subtitle1">{item.label}</Typography>}
                  secondary={<Typography variant="body2" style={{ textAlign: 'right' }}>{item.value}</Typography>}
                />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleReportLog}
            style={{ marginTop: 16 }}
          >
            Report Log
          </Button>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Successfully reported the log."
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default ReportBtn;
