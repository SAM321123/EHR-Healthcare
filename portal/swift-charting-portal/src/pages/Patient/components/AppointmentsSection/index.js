import React from 'react';
import { Typography, Link, Grid } from '@mui/material';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { dateFormats } from 'src/lib/constants';
import { dateFormatter, getFullName } from 'src/lib/utils';
import { encrypt } from 'src/lib/encryption';

export const AppointmentsSection = ({ patientData }) => {
  const params = useParams();
  const navigate = useNavigate();
  const onClick = () => {
    navigate(
      generatePath(UI_ROUTES.appointment, {
        ...params,
        patientId: encrypt(String(patientData?.id)),
      })
    );
  };
  return (
    <div>
      <Grid container>
        <Grid item xs={10} md={9} style={{ paddingTop: '1.5em 0' }}>
          <Typography
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Appointments
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
      <div
        style={{
          padding: '1em 0',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {patientData?.appointments?.map((appointment) => (
          <div style={{ display: 'flex' }}>
            <div>
              <CalendarMonthRoundedIcon color="primary" />
            </div>
            <div>
              <Typography
                color={palette.text.dark}
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                  paddingBottom: '0.5em',
                }}
              >
                {appointment?.title}
              </Typography>
              <Typography
                color={palette.text.offWhite}
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                  paddingBottom: '0.5em',
                }}
              >
                with {getFullName(appointment?.practitioner)}
              </Typography>
              <Typography
                color={palette.text.offWhite}
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                  paddingBottom: '0.5em',
                }}
              >
                {dateFormatter(
                  appointment?.startDateTime,
                  dateFormats.MMMDDYYYYHHMMSS
                )}
                {'-'}
                {dateFormatter(appointment?.endDateTime, dateFormats.hhmmA)}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
