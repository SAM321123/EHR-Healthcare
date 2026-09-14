import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function MonthNavigator({ setMonth, setYear }) {
  const currentDate = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    currentDate.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const handleIconClick = (direction) => {
    if (direction === 'prev') {
      if (currentMonthIndex > 0) {
        setCurrentMonthIndex(currentMonthIndex - 1);
      } else {
        setCurrentMonthIndex(11);
        setCurrentYear(currentYear - 1);
      }
    } else if (direction === 'next') {
      if (currentMonthIndex < 11) {
        setCurrentMonthIndex(currentMonthIndex + 1);
      } else {
        setCurrentMonthIndex(0);
        setCurrentYear(currentYear + 1);
      }
    }
  };

  useEffect(() => {
    setMonth(currentMonthIndex);
  }, [currentMonthIndex]);

  useEffect(() => {
    setYear(currentYear);
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
      <ArrowLeftIcon onClick={() => handleIconClick('prev')} />
      <span>{`${monthNames[currentMonthIndex]} ${currentYear}`}</span>
      <ArrowRightIcon onClick={() => handleIconClick('next')} />
    </Box>
  );
}

export default MonthNavigator;
