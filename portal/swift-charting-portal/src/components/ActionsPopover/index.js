import React, { useState, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Typography from 'src/components/Typography';

const ActionsPopOver = ({ actions }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div style={{ cursor: 'pointer' }}>
      <MoreVertIcon
        id="more-actions"
        aria-describedby={id}
        onClick={handleClick}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {actions?.map((item, index) => (
          <>
            <Typography
              variant="body2"
              key={`action${index}`}
              sx={{ p: 1, cursor: 'pointer' }}
              onClick={item.action}
            >
              {item.label}
            </Typography>
            <Divider />
          </>
        ))}
      </Popover>
    </div>
  );
};

export default ActionsPopOver;
