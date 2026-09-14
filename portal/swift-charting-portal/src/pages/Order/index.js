import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import PatientOrder from './PatientOrder';
import PharmacyOrder from './PharmacyOrder';

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

const data = [
  {
    label: 'Patient Order',
    component: PatientOrder,
    componentProps: {
      type: '1',
    },
  },
  {
    label: 'Pharmacy Order',
    component: PharmacyOrder,
    componentProps: {
      type: '2',
    },
  },
];

const Order = () => {
  const tabClasses = useStyles();

  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
  );
};

export default Order;
