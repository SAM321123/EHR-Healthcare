/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon } from '@mui/x-date-pickers';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';

import './monthlyDatePicker.scss';
import { getNewDate } from 'src/lib/utils';

const MonthlyDatePicker = ({ setStatsFilters = () => {} }) => {
  const [date, setDate] = useState(getNewDate().toDate());

  const handleIconClick = useCallback(
    (e) => {
      if (e) {
        const iconId = e?.currentTarget?.id;
        if (iconId === 'left-icon') {
          const newDate = getNewDate(date, 'MM-DD-YY')
            .subtract(1, 'month')
            .toDate();
          setDate(newDate);
          setStatsFilters({
            month: newDate.getMonth(),
            year: newDate.getFullYear(),
          });
        } else {
          const newDate = getNewDate(date, 'MM-DD-YY').add(1, 'month').toDate();
          setDate(newDate);
          setStatsFilters({
            month: newDate.getMonth(),
            year: newDate.getFullYear(),
          });
        }
      }
    },
    [date]
  );

  useEffect(() => {
    handleIconClick();
  }, [handleIconClick]);

  return (
    <div
      className="dashboard-filter-header-section"
      data-testid="filters-main-component"
    >
      <div className="calendar-header-filter-wrapper">
        <Box
          className="next-prev-wrapper"
          sx={{
            justifyContent: { md: 'flex-end', sm: 'unset' },
          }}
          style={{ alignItems: 'center', padding: 0 }}
        >
          <ArrowLeftIcon
            id="left-icon"
            onClick={handleIconClick}
            className="icon-wrapper"
            style={{ border: 'none' }}
          />
          <Typography
            className="date-text"
            style={{ width: 'max-content', fontSize: '14px', color: 'black' }}
          >
            {getNewDate(date, 'MM-DD-YY').format('MMMM YYYY')}
          </Typography>
          <ArrowRightIcon
            id="right-icon"
            onClick={handleIconClick}
            className="icon-wrapper"
            style={{ border: 'none' }}
          />
        </Box>
      </div>
    </div>
  );
};

export default MonthlyDatePicker;
