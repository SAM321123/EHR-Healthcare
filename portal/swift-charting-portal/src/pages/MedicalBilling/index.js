import React from 'react';
import Tabs from 'src/components/Tabs';
import { UI_ROUTES } from 'src/lib/routeConstants';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import makeStyles from '@mui/styles/makeStyles';
import GenerateBills from './generateBills';
import Claims from './claims';
import Invoices from './invoices';

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
    label: 'Generate Bills',
    component: GenerateBills,
    componentProps: {
      type: 'email',
    },
  },
  {
    label: 'Claims',
    component: Claims,
    componentProps: {
      type: 'master',
    },
  },
  {
    label: 'Invoices',
    component: Invoices,
    componentProps: {
      type: 'invoices',
    },
  },
];

const MedicalBilling = () => {
  const tabClasses = useStyles();

  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    //   path={UI_ROUTES.systemSettingsTab}
    />
  );
};

export default MedicalBilling;
