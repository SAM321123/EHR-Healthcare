import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import { UI_ROUTES } from 'src/lib/routeConstants';
import ClaimReport from './claimReport';
import EncounterReport from './encounterReport';
import ProcedureReport from './procedureReport';
import PaymentCollectionReport from './paymentCollectionReport';
import InvoiceReport from './invoiceReport';


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
    label: 'Claim Report',
    component: ClaimReport,
    componentProps: {
      type: 'claimReport',
    },
  },
  {
    label: 'Encounter Report',
    component: EncounterReport,
    componentProps: {
      type: 'encounterReport',
    },
  },
  {
    label: 'Procedure Report',
    component: ProcedureReport,
    componentProps: {
      type: 'procedureReport',
    },
  },
  {
    label: 'Invoice Report',
    component: InvoiceReport,
    componentProps: {
      type: 'invoiceReport',
    },
  },
  {
    label: 'Payment Collection Report',
    component: PaymentCollectionReport,
    componentProps: {
      type: 'paymentCollectionReport',
    },
  },
];

const MedicalBillingReport= () => {
  const tabClasses = useStyles();

  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
      path={UI_ROUTES.systemSettingsTab}
    />
  );
};

export default MedicalBillingReport;
