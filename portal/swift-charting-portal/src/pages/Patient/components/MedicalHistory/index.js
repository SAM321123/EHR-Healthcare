import React from 'react';
import { Typography, Link, Grid } from '@mui/material';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';

export const MedicalHistory = ({ patientData }) => {
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
    <div style={{ padding: '1em  0' }}>
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
            Past and Chronic Medical History
          </Typography>
        </Grid>
        <Grid
          style={{
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '20px',
            color: palette.text.dark,
          }}
          item
          xs={2}
          md={3}
        >
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
      <ul
        style={{
          paddingLeft: '20px',
          marginTop: '10px',
          height: '100px',
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        {patientData?.familyHistories?.map((familyHistory) => (
          <li>
            <Typography
              style={{
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: palette.text.dark,
              }}
            >
              {familyHistory?.condition?.name}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  );
};
