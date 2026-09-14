import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton, Popover } from '@mui/material';
import palette from 'src/theme/palette';
import Typography from '../Typography';
import Iconify from '../iconify/Iconify';
import TableActionIcons from './TableActionIcons';
import Box from '../Box';

const MoreActions = ({ actions, data }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (item,e) => {
    if (item.disabled) return;
    setAnchorEl(null);
    item?.action(data,e);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'modal-popover' : undefined;

  return (
    <div>
      <IconButton>
        <Iconify
          color={palette.grey[700]}
          onClick={handleClick}
          icon="eva:more-vertical-fill"
          cursor="pointer"
        />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        minWidth={100}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'white',
            minWidth: '150px',
            alignItems: 'start',
          },
        }}
      >
        {actions?.map((item) => (
          <Box
            key={item?.label}
            onClick={(e) => handleActionClick(item,e)}
            sx={{
              ...(item?.preRender && item.preRender(data)),
              m: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              {TableActionIcons(item.icon)}
              <Typography
                sx={{
                  ml: 1.5,
                  cursor: !item?.disabled ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                }}
                key={item?.label}
                cursor="pointer"
                color={item?.disabled ? palette.grey[600] : palette.grey[800]}
              >
                {item?.label}
              </Typography>
            </div>
          </Box>
        ))}
      </Popover>
    </div>
  );
};

MoreActions.defaultProps = {
  data: {},
  actions: [],
};

MoreActions.propTypes = {
  data: PropTypes.instanceOf(Object),
  actions: PropTypes.instanceOf(Object),
};

export default MoreActions;
