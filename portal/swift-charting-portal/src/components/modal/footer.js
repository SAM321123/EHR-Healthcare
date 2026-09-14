import Grid from '@mui/material/Grid';
import React from 'react';
import LoadingButton from '../CustomButton/loadingButton';

const ModalFooter = (props) => {
  const { footer } = props || {};
  const { leftActions = [], rightActions = [] } = footer || {};

  return (
    <Grid
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        padding:'0px 24px'
      }}
    >
      <Grid style={{ display: 'flex', gap: 15 }}>
        {leftActions.map((item) => (
          <LoadingButton
            key={item.name}
            loading={item.loading}
            loadingPosition="start"
            variant={item.variant || 'contained'}
            onClick={item.action}
            disabled={item.disabled}
            style={item.style}
            label={item.name}
         />

        ))}
      </Grid>
      <Grid>
        {rightActions.map((item) => (
          <LoadingButton
            key={item.name}
            loading={item.loading}
            variant={item.variant || 'contained'}
            onClick={item.action}
            disabled={item.disabled}
            style={item.style}
            label={item.name}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default React.memo(ModalFooter);
