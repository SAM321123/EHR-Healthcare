import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import PersonalInfoForm from './personalInfoForm';
import Location from './location';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import BookingSetting from './BookingSetting/bookingSettings';

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

const AddStaff = () => {
  const tabClasses = useStyles();
  const params = useParams();
  const data = [
    {
      label: 'Personal Info',
      component: PersonalInfoForm,
    },
   
  ];
  let { staffId } = params || {};
  if (staffId) {
    staffId = decrypt(staffId);
    data.push({
      label: 'Location Setting',
      component: Location,
    },
     {
      label: 'Booking Setting',
      component: BookingSetting,
    }
  );
  }
  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
  );
};

export default AddStaff;
