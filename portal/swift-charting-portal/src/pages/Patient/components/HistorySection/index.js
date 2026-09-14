import React from 'react';
import { Typography, Link, Grid } from '@mui/material';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';

export const HistorySection = ({ patientData }) => {
  const params = useParams();
  const navigate = useNavigate();
  const onClick = () => {
    navigate(
      generatePath(UI_ROUTES.patientHistory, {
        ...params,
        patientId: encrypt(String(patientData?.id)),
      })
    );
  };
  return (
    <div style={{ padding: '1em 0' }}>
      <Grid container>
        <Grid item xs={10} md={9}>
          <Typography
            style={{
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            History
          </Typography>
        </Grid>
        <Grid item xs={2} md={3}>
          <Link
            style={{
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
              cursor: 'pointer',
            }}
            onClick={onClick}
          >
            View All
          </Link>
        </Grid>
      </Grid>
      <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
        {patientData?.socialHistories?.map((socialHistory) => (
          <div style={{ padding: '1em 0' }}>
            <Typography
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: palette.text.dark,
                paddingBottom: '0.5em',
              }}
            >
              {socialHistory?.socialHistory?.name}
            </Typography>
            <Typography
              color={palette.text.offWhite}
              style={{
                fontSize: 12,
                lineHeight: '20px',
                fontWeight: 400,
                flexWrap: 'wrap',
              }}
            >
              {socialHistory?.description}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};
