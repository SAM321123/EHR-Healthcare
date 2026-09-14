import React, { useState, useEffect } from 'react';

import Box from '../Box';
import Typography from '../Typography';

const DateTimeComponent = ({ timeZone }) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatDate = (date) =>
    `${date.toLocaleDateString('en-US', { timeZone })}`;

  const formatTime = (date) =>
    `${date.toLocaleTimeString('en-US', { timeZone })}`;

  return (
    <Box>
      <Typography sx={{ fontSize: '12px' }}>
        {`${formatDate(dateTime)} 
        ${formatTime(dateTime)}`}
      </Typography>
    </Box>
  );
};

export default DateTimeComponent;
