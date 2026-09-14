import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import palette from "src/theme/palette";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";

const Histories = [
  {
    title:
      "Semaglutide with Vitamin B12 -1st Month Membership Program Social Media Special(Credit Card)",
    appointmentDate: "Jun 19,2023",
    time: "12:00 PM",
    duration: "5",
    status: true,
  },
  {
    title:
      "Semaglutide with Vitamin B12 -2nd Month Membership Program Social Media Special(Credit Card)",
    appointmentDate: "Jun 16,2023",
    time: "12:10 PM",
    duration: "10",
    status: false,
  },
  {
    title:
      "Semaglutide with Vitamin B12 -2nd Month Membership Program Social Media Special(Credit Card)",
    appointmentDate: "May 9,2023",
    time: "11:10 AM",
    duration: "10",
    status: false,
  },
];

const AppointmentHistory = () => (
  <Container>
    <Box sx={{ marginBottom: '20px' }}>
      <Typography sx={{ fontSize: '22px', marginBottom: '10px' }}>
        Past Appointments
      </Typography>
      <Divider />
    </Box>
    <Box>
      {Histories.map((history,index) => (
        <Card
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRadius: 1,
            width: '100%',
            padding: '10px',
            marginBottom: '30px',
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid history xs={12} md={6}>
                <Typography
                  variant="body1"
                  color={palette.primary.main}
                  sx={{ marginTop: 1 }}
                >
                  {history.title}
                </Typography>
                <Stack direction="row" sx={{ marginTop: '10px' }}>
                  <PersonOutlineOutlined />
                  <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                    Dope Doctors
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ marginTop: '10px' }}>
                  <AccessTimeOutlined />
                  <Typography variant="body1" sx={{ marginLeft: '5px' }}>
                    {history.duration} min
                  </Typography>
                </Stack>
              </Grid>
              <Grid history xs={12} md={2}>
                <Typography variant="subtitle1" sx={{ marginTop: 1 }}>
                  {history.appointmentDate}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginTop: 1 }}>
                  {history.time} IST
                </Typography>
              </Grid>
              <Grid history xs={12} md={2}>
                <Typography
                  variant="h6"
                  sx={{
                    marginTop: 1,
                    color: history.status
                      ? palette.warning.main
                      : palette.error.main,
                  }}
                >
                  {history.status ? 'Canceled ' : 'Missed'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Container>
);

export default AppointmentHistory;
