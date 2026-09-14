import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import WestIcon from "@mui/icons-material/West";

import palette from "src/theme/palette";
import { fCurrency } from "src/utils/formatNumber";
import CustomButton from '../CustomButton';

export const Services = [
  {
    label: "weightLossProgram",
    title: "WEIGHT LOSS PROGRAM",
    service: [
      {
        title: "Free Semaglutide Weight Loss Telehealth Consultation",
        subTitle: "TALK TO OUR PROVIDER FROM THE COMFORT OF YOUR HOME",
      },
    ],
  },
  {
    label: "medicalMarijuana",
    title: "MEDICAL MARIJUANA",
    service: [
      {
        title:
          "Louisiana 12 Month Medical Marijuana Certification ($199 + Credit Card Fee)",
        subTitle:
          "Free online consultation - Credit card will only be charged if patient qualifies.",
        duration: "5",
        price: "205.08",
      },
      {
        title:
          "Florida Renewal 7 Month Medical Marijuana Certification ($149 + Credit Card Fee)",
        subTitle:
          "Free online consultation - Credit card will only be charged if patient qualifies.",
        duration: "30",
        price: "165",
      },
    ],
  },
];

const Service = ({ category, handleCategory }) => {
  const ser = Services.find((service) => service.label === category);

  return (
      <Container>
        <Stack>
          <Typography>{ser.title}</Typography>
          <Typography>Choose an option</Typography>
          <Divider />
          <Stack direction="row-reverse">
            <Typography>Manage Appointments</Typography>
          </Stack>
        </Stack>
        <Box>
          {ser.service.map((item,index) => (
            <Card key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 1,
                width: "100%",
                marginBottom: "30px",
              }}
            >
              <CardContent sx={{ flexGrow: 1, padding: 1, paddingLeft: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Service </Typography>
                    <Typography
                      variant="body1"
                      color={palette.primary.main}
                      sx={{ marginTop: 1 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body2">{item.subTitle} </Typography>
                  </Grid>
                  {item.duration ? (
                    <Grid item xs={6} md={3}>
                      <Typography variant="h6">Duration </Typography>
                      <Typography variant="body1" sx={{ marginTop: 1 }}>
                        {item.duration} min
                      </Typography>
                    </Grid>
                  ) : null}
                  {item.price ? (
                    <Grid item xs={6} md={3}>
                      <Typography variant="h6">Price </Typography>
                      <Typography variant="body1" sx={{ marginTop: 1 }}>
                        {fCurrency(item.price)}
                      </Typography>
                    </Grid>
                  ) : null}
                </Grid>
                <CustomButton
                  variant="contained"
                  sx={{ marginTop: '10px' }}
                  label="Book Now"
                />
              </CardContent>
            </Card>
          ))}
        </Box>
        <CustomButton
          onClick={() => handleCategory('')}
          startIcon={<WestIcon />}
          label="Back"
        />
      </Container>
      
  );
};

export default Service;
