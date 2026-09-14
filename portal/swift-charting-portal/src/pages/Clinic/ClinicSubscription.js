import React, { useEffect } from "react";
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import useCRUD from "src/hooks/useCRUD";
import { GET_SUBSCRIPTION_DATA } from "src/store/types";
import ClinicSubscriptionInfo from "./ClinicSubscriptionInfo";
import ClinicTrialSubscription from "./ClinicTrialSubscription";
import Container from "src/components/Container";
import { useParams } from 'react-router-dom';
import Tabs from 'src/components/Tabs';
import ClinicInvoices from "./ClinicInvoices";
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';

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

const ClinicSubscription = () => {
  const [getSubscriptionResponse, ,getSubscriptionLoading ,getSubscription, clearSubscription] = useCRUD({
    id: GET_SUBSCRIPTION_DATA,
    url: `${API_URL.clinic}/subscription-data`,
    type: REQUEST_METHOD.get,
  });

  const params = useParams();
  const tabClasses = useStyles();
  
  const data = [
    {
      label: 'Overview',
      component: () => {
        return (
          <Container loading={getSubscriptionLoading}>
            {getSubscriptionResponse?.isTrial && <ClinicTrialSubscription/>}
            {!getSubscriptionResponse?.isTrial && <ClinicSubscriptionInfo />}
          </Container>
        );
      },
      componentProps: {
        type: 'overview',
      },
    },
    {
      label: 'Invoices',
      component: ClinicInvoices,
      componentProps: {
        type: 'invoice',
      },
    },
  ];

  useEffect(() => {
   getSubscription({id: params?.clinicId}); 
  }, [])

  const tabIndicatorProps = {
    display: 'none',
  };


  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
  )
  
}

export default ClinicSubscription;