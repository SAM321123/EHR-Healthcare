import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Category } from 'src/components/service';
import Service from 'src/components/service/Service';
import palette from 'src/theme/palette';

const AppointmentBooking = () => {
  const [category, setCategory] = useState('');
  const handleCategory = (categories) => {
    setCategory(categories);
  };

  return (
    <>
      <Helmet>
        <title>Online Booking - intakeQ</title>
      </Helmet>
      <Container sx={{ marginTop: '20px' }}>
        <Box
          sx={{
            backgroundColor: `${palette.primary.main}`,
            color: `${palette.common.white}`,
            padding: '10px 15px',
            paddingBottom: '2px',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Lato, arial, sans-serif',
              fontSize: '44px',
              marginBottom: '10px',
            }}
          >
            Online Booking
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'Lato, arial, sans-serif', fontSize: '18px' }}
          >
            Book an appointment with Dope Doctors
          </Typography>
        </Box>
        {category ? (
          <Service category={category} handleCategory={handleCategory} />
        ) : (
          <Category handleCategory={handleCategory} />
        )}
      </Container>
    </>
  );
};

export default AppointmentBooking;
