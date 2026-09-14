import React from "react";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';

import CustomButton from 'src/components/CustomButton';
import { fCurrency } from '../utils/formatNumber';

const Payment = () => {
  const handlePayment = () => {};

  return (
    <Box>
      <Typography sx={{ fontSize: '24px', margin: '10px 0px' }}>
        Please review and enter your Credit card
      </Typography>
      <Divider />
      <Card sx={{ marginTop: '20px' }}>
        <CardHeader title="Service Detail" />
        <CardContent>
          <Typography sx={{ marginBottom: '10px' }}>
            Louisiana 12 Month Medical Marijuana Certification ($199 + Credit
            Card Fee)
          </Typography>
          <Typography sx={{ marginBottom: '10px' }}>
            11:.15pm - Friday, June 16, 2023
          </Typography>
          <Typography sx={{ marginBottom: '10px' }}>India Time</Typography>
          <Typography sx={{ marginBottom: '10px' }}>
            Telehealth Consultation from Home
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ padding: '10px', marginTop: '20px' }}>
        <CardHeader title="Payment Detail" />
        <CardContent sx={{ padding: '10px', margin: '20px' }}>
          <Grid container spacing={2} gap={2}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Card Number"
                name="CardNumber"
                type="number"
                InputProps={{ endAdornment: <CreditCardOutlined /> }}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                label="Card Expiry"
                name="cardExpiry"
                type="number"
                placeholder="mm/yy"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField fullWidth label="CVV" name="cvv" type="password" />
            </Grid>
            <Grid xs={12} md={6} container alignItems="center">
              <Typography>Total Amount:</Typography>
              <Typography sx={{ marginLeft: '8px' }}>
                {fCurrency(199)}
              </Typography>
            </Grid>
            <Grid xs={12} md={12} container alignItems="center">
              <Typography>Cancellation Policy</Typography>
              <Typography>
                if you need to cancel and reschedule your appointment, please do
                so in our patient portal or email us at info@dopeclinics.com
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <CustomButton onClick={handlePayment} label="Pay" />
        </CardActions>
      </Card>
    </Box>
  );
};

export default Payment;
