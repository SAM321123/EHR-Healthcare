import React from 'react';
import { Button, ButtonGroup, IconButton, Menu, MenuItem } from '@mui/material';
import { ArrowDropUp, ExpandMore } from '@mui/icons-material';
import { IconFont } from '../../../component/icon-font'; // assuming you have a custom IconFont component
import classNames from 'classnames';

const LeaveButton = (props) => {
  const { onLeaveClick, onEndClick, isHost } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return isHost ? (
    <>
      <ButtonGroup
        variant="outlined" className="vc-dropdown-button"
      >
                    <IconButton  sx={{ paddingRight: '8px',color:'red' }}  color="primary"  onClick={onLeaveClick}>
                    <IconFont type="icon-leave" />
            </IconButton>
          <IconButton  onClick={handleClick} style={{ color:'white' }}>
              <ExpandMore />
            </IconButton>
            <Menu
        id="leave-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted // Keep the menu in the DOM while closed for better performance
      >
        <MenuItem onClick={() => { onEndClick(); handleClose(); }}>
          End session
        </MenuItem>
      </Menu>
      </ButtonGroup>
      
    </>
  ) : (
    <Button
      className={classNames('vc-button')}
      variant="outlined"
      startIcon={<IconFont type="icon-leave" />}
      onClick={onLeaveClick}
      title="Leave session"
      size="large"
    />
  );
};

export { LeaveButton };
