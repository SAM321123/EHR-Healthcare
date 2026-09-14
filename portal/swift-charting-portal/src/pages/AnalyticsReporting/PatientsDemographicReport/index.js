import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Container, Grid , Typography } from '@mui/material';
import AgeChart from './ageChart'
import GenderChart from './genderChart'
import EthnicityChart from './ethnicityChart'
import LocationChart from './locationChart'

import palette from 'src/theme/palette';

ChartJS.register(ArcElement, Tooltip, Legend);

const PatientDemographicReport = () => {
  return (
    <Container>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
          Patient Demographics Report
        </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={3}>
        <div
            style={{
              padding: 16,
              border: `1px solid ${palette.border.main}`,
              borderRadius: 16,
              flex: 1,
            }}
          >
         <AgeChart/>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
        <div
            style={{
              padding: 16,
              border: `1px solid ${palette.border.main}`,
              borderRadius: 16,
              flex: 1,
            }}
          >
         <GenderChart/>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
        <div
            style={{
              padding: 16,
              border: `1px solid ${palette.border.main}`,
              borderRadius: 16,
              flex: 1,
            }}
          >
         <EthnicityChart/>
          </div>
        </Grid>
        <Grid item xs={12} sm={3}>
        <div
            style={{
              padding: 16,
              border: `1px solid ${palette.border.main}`,
              borderRadius: 16,
              flex: 1,
            }}
          >
         <LocationChart/>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDemographicReport;
