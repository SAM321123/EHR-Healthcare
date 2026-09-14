import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CalendarDatePicker from './CalendarDatePicker';

function YearNavigator({ setYear }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleIconClick = (direction) => {
    if (direction === 'prev') {
      setCurrentYear(currentYear - 1);
    } else if (direction === 'next' && currentYear!== new Date().getFullYear()) {
      setCurrentYear(currentYear + 1);
    }
  };

  useEffect(() => {
    if (currentYear) {
      setYear(currentYear);
    }
  }, [currentYear]);

  return (
    <Box
      className="next-prev-wrapper"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { md: 'flex-end', sm: 'unset' },
      }}
    >
      <ArrowLeftIcon
        onClick={() => handleIconClick('prev')}
      />
      <CalendarDatePicker currentYear={currentYear} />
      <ArrowRightIcon
        sx={{ color: currentYear === new Date().getFullYear() ? 'grey' : 'black' }}
        onClick={() => handleIconClick('next')}
      />
    </Box>
  );
}

export default YearNavigator;
