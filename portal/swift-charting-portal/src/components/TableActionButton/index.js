import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import TableIcons from '../Table/TableActionIcons';

function TableActionButton(props) {
  const { buttons, row } = props;
return (
  <Box sx={{display:'flex', flexDirection: 'row', flexWrap: 'wrap',gap:'1px' }}>
    {buttons.map((item, index) => {
      // Support a custom renderIcon function for special cases (e.g. new row actions)
      if (item?.renderIcon) {
        return (
          <React.Fragment key={item?.label || index}>
            {item.renderIcon(row)}
          </React.Fragment>
        );
      }
      return (
        <Tooltip key={item?.label} title={item?.label}>
          <IconButton
            size="small"
            sx={{
              ...(item?.preRender?.(row)),
            }}
            onClick={(event) => item?.action(row,event)}
          >
            {TableIcons(item.icon)}
          </IconButton>
        </Tooltip>
      );
    })}
  </Box>
);
}

export default TableActionButton;
