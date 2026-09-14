import React from 'react';
import { Box, CardContent, Typography, Grid, Divider } from '@mui/material';
import { dateFormats } from 'src/lib/constants';
import {
  canculateEmarTimePeriod,
  convertWithTimezone,
  getFullName,
} from 'src/lib/utils';

const ViewEmarDetails = ({ emarData }) => {
  const medication = `${emarData?.medicationItem?.genericDrug} (${emarData?.medicationItem?.brandNameDrug})`;
  const patientName = emarData?.medicationItem?.medication?.patient;
  const date = convertWithTimezone(emarData?.slotDate, {
    format: dateFormats.MMDDYYYY,
  });
  const emarTime = convertWithTimezone(emarData?.date, {
    format: dateFormats.hhmmA,
  });
  const scheduleTime = convertWithTimezone(emarData?.slotDate, {
    format: dateFormats.hhmmA,
  });
  const comment = emarData?.comment;
  const overrideReason = emarData?.overrideReason;
  const clinicianInitial = emarData?.clinicianInitial;
  const givenByCaregiver = emarData?.givenByCaregiver;
  const timePeriod = canculateEmarTimePeriod(
    emarData?.actionCode,
    emarData?.date,
    emarData?.slotDate
  );
  const frequencyCode = emarData?.medicationItem?.frequencyCode;
  const routeCode = emarData?.medicationItem?.routeCode;
  const directionCode = emarData?.medicationItem?.directionCode;
  const frequencyOther = emarData?.medicationItem?.frequencyOther;
  const emarStatus = emarData?.action?.name;
  const clinician = emarData?.clinician;
  const amount = `${emarData?.medicationItem?.amount} ${emarData?.medicationItem?.unit?.name}`;
  const dosageForm = emarData?.medicationItem?.doseForm?.name;
  const route = emarData?.medicationItem?.route?.name;
  const routeOther = emarData?.medicationItem?.routeOther;

  const frequency = emarData?.medicationItem?.frequency?.name;
  const direction = emarData?.medicationItem?.direction?.name;
  const directionOther = emarData?.medicationItem?.directionOther;

  const diagnoses = (emarData?.medicationItem?.diagnoses || [])
    .map(({ icd: { name, description } = {} }) => `${name} (${description})`)
    .join(', ');

  const diagnosesOther = (emarData?.medicationItem?.diagnosesOther || []).join(
    ', '
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 800,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CardContent>
        <Grid container spacing={3}>
          {/* Patient and Clinician Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <strong>Patient Name:</strong> {getFullName(patientName)}
            </Typography>
          </Grid>

          {/* EMAR Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              EMAR Details
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Clinician:</strong> {getFullName(clinician)}
              </Typography>
            </Grid>
            <Typography variant="body1">
              <strong>Date:</strong> {date}
            </Typography>
            <Typography variant="body1">
              <strong>EMAR Status:</strong>
              {timePeriod ? `${emarStatus} (${timePeriod})` : `${emarStatus}`}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>EMAR Time:</strong> {emarTime}
            </Typography>
            <Typography variant="body1">
              <strong>Schedule Time:</strong> {scheduleTime}
            </Typography>
            <Typography variant="body1">
              <strong>Given By Caregiver:</strong>{' '}
              {givenByCaregiver ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {['Delayed', 'Before Time'].includes(timePeriod) && (
              <Typography variant="body1">
                <strong>Reason For Override:</strong> {overrideReason || 'N/A'}
              </Typography>
            )}

            <Typography variant="body1">
              <strong>Clinician Initial:</strong> {clinicianInitial || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Comment:</strong> {comment || 'N/A'}
            </Typography>
          </Grid>

          {/* Medication Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Medication Details
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>Medication:</strong> {medication}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {amount}
            </Typography>
            <Typography variant="body1">
              <strong>Dosage Form:</strong> {dosageForm}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">
              <strong>Route:</strong>{' '}
              {routeCode === 'other_route_type' ? routeOther : route}
            </Typography>
            <Typography variant="body1">
              <strong>Frequency:</strong>{' '}
              {frequencyCode === 'other_frequency_type'
                ? frequencyOther
                : frequency}
            </Typography>
            <Typography variant="body1">
              <strong>Direction:</strong>{' '}
              {directionCode === 'Other_direction_type'
                ? directionOther
                : direction}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Reason For Rx:</strong> {diagnoses || 'N/A'}
            </Typography>
            <Typography variant="body1">
              <strong>Reason For Rx (Other):</strong> {diagnosesOther || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Box>
  );
};

export default ViewEmarDetails;
