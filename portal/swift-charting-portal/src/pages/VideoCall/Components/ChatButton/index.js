import PropTypes from 'prop-types';
import { Chat } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

export default function ChatButton({ classes, handleSubmit }) {
  return (
    <Tooltip title="Chat" aria-label="add">
      <IconButton
        edge="start"
        color="inherit"
        className={classes?.toolbarButtons}
        onClick={handleSubmit}
      >
        <Chat fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

ChatButton.propTypes = {
  classes: PropTypes.objectOf,
  handleSubmit: PropTypes.func,
};

ChatButton.defaultProps = {
  classes: {},
  handleSubmit: () => {},
};
