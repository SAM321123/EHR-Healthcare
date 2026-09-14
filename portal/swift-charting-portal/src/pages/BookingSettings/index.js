import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import Location from '../Staff/location';
import BookingSetting from '../Staff/BookingSetting/bookingSettings';
import CalendarSchedule from './Calendar';
import OutOfOfficeSchedule from './OutOfOfficeSchedule';



const useStyles = makeStyles({
  root: {
    ...tabsStyling.root,
    backgroundColor: palette.background.offWhite,
  },
  selected: {
    ...tabsStyling.selected,
    backgroundColor: palette.grey[0],
    borderRadius: '8px 8px 0 0',
    boxShadow: `0px 5px 9px 0px ${palette.grey[400]}`,
  },
});

const tabIndicatorProps = {
  display: 'none',
};

const BookingSettings = () => {


  const tabClasses = useStyles();
  const data = [
    {
      label: 'Location Setting',
      component: Location,
    },
    {
      label: 'Booking Setting',
      component: BookingSetting,
    },
    {
      label: 'Calendar Schedule',
      component: CalendarSchedule,
    },
    {
      label: 'Out Of Office Schedule',
      component: OutOfOfficeSchedule,
    },
  ];
  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
  );
};

export default BookingSettings;
