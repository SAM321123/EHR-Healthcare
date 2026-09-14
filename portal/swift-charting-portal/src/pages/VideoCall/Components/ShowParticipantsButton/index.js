import PropTypes from 'prop-types';
import { People } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

export default function ShowParticipantsButton({ classes, handleSubmit }) {
  return (
    <Tooltip title="Participants" aria-label="add">
      <IconButton
        edge="start"
        color="inherit"
        className={classes?.toolbarButtons}
        onClick={handleSubmit}
      >
        <People fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

ShowParticipantsButton.propTypes = {
  classes: PropTypes.objectOf,
  handleSubmit: PropTypes.func,
};

ShowParticipantsButton.defaultProps = {
  classes: {},
  handleSubmit: () => {},
};
