import React from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import MUICloseIcon from '@mui/icons-material/Close';

export const ModalHeader = React.memo((props) => {
  const { header, modalCloseAction } = props || {};
  const { title, logo, closeIcon } = header || {};

  return (
    <Grid
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Grid
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Grid>
          {logo && (
            <img
              style={{ width: 40, height: 40 }}
              src={logo}
              alt=""
              loading="lazy"
            />
          )}
        </Grid>
        <Grid>
          <Typography id="modal-modal-description">{title}</Typography>
        </Grid>
      </Grid>
      <Grid>
        <IconButton aria-label="close" onClick={modalCloseAction}>
          {closeIcon || <MUICloseIcon />}
        </IconButton>
      </Grid>
    </Grid>
  );
});
