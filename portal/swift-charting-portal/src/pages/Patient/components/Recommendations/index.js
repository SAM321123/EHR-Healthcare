import React from 'react';
import { Typography, Link, Grid } from '@mui/material';
import FontDownloadRoundedIcon from '@mui/icons-material/FontDownloadRounded';
import palette from 'src/theme/palette';

export const Recommendations = () => {
  return (
    <div style={{ padding: '1em 0' }}>
      <Grid container style={{ alignItems: 'center' }}>
        <Grid item xs={10} md={9}>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Clinical Recommendations
          </Typography>
        </Grid>
        <Grid item xs={2} md={3}>
          <Link
            style={{
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
            }}
            onClick={()=>{}}
          >
            View All
          </Link>
        </Grid>
      </Grid>
      <div style={{ display: 'flex', padding: '0.5em 0' }}>
        <div>
          <FontDownloadRoundedIcon color="primary" />
        </div>
        <div>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Donec a eros justo. Fusce egestas tristique ultrics. Nam trmpot,
            augue nec tincidunt molestie, massa nunc varius arcu
          </Typography>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0.5em 0' }}>
        <div>
          <FontDownloadRoundedIcon color="primary" />
        </div>
        <div>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Donec a eros justo. Fusce egestas tristique ultrics. Nam trmpot,
            augue nec tincidunt molestie, massa nunc varius arcu
          </Typography>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0.5em 0' }}>
        <div>
          <FontDownloadRoundedIcon color="primary" />
        </div>
        <div>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Donec a eros justo. Fusce egestas tristique ultrics. Nam trmpot,
            augue nec tincidunt molestie, massa nunc varius arcu
          </Typography>
        </div>
      </div>
      <div style={{ display: 'flex', padding: '0.5em 0' }}>
        <div>
          <FontDownloadRoundedIcon color="primary" />
        </div>
        <div>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Donec a eros justo. Fusce egestas tristique ultrics. Nam trmpot,
            augue nec tincidunt molestie, massa nunc varius arcu
          </Typography>
        </div>
      </div>
    </div>
  );
};
