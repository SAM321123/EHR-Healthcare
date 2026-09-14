import { CallEnd } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

export default function EndCallButton({ classes, handleEndCall }) {
  return (
    <Tooltip title="End call" aria-label="add">
      <IconButton
        edge="start"
        color="inherit"
        aria-label="videoCamera"
        className={classes.toolbarButtons}
        style={{ backgroundColor: '#E33636', height: 60, width: 60 }}
        onClick={handleEndCall}
      >
        <CallEnd style={{ height: 40, width: 30 }} />
      </IconButton>
    </Tooltip>
  );
}
