import React from 'react';
import PropTypes from 'prop-types';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import { Grid } from '@mui/material';
import Currency from 'src/components/Currency';

const InvoiceTotalAmount = ({ data, responseAggregate }) => (
  <Grid container spacing={3} mb={2}>
    {data?.map((item) => (
      <Grid key={item?.label} item xs={12} sm={6} md={4}>
        <Box
          sx={{
            backgroundColor: item?.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            padding: '32px',
            gap: { sm: '40px', md: '50px', xs: '80px' },
            flexShrink: 0,
            borderRadius: '12px',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '19.6px',
                color: 'white',
                mb: '16px',
              }}
            >
              {item?.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '32px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '35.2px',
                color: 'white',
              }}
            >
              <Currency />
              {responseAggregate?.[item?.dataKey]?.toFixed(2)}
            </Typography>
          </Box>
          <img
            style={{ marginLeft: '16px' }}
            alt={item?.label}
            src={item?.icon}
          />
        </Box>
      </Grid>
    ))}
  </Grid>
);

InvoiceTotalAmount.defaultProps = {
  data: {},
};

InvoiceTotalAmount.propTypes = {
  data: PropTypes.instanceOf(Object),
};

export default InvoiceTotalAmount;
