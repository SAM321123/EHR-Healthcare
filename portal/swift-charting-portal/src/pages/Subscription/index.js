import React, { useEffect } from "react";
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import useCRUD from "src/hooks/useCRUD";
import { GET_SUBSCRIPTION_DATA } from "src/store/types";
import TrialSubscription from "./trialSubscription";
import SubscriptionInfo from "./subscriptionInfo";
import Container from "src/components/Container";
import Tabs from 'src/components/Tabs';
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Invoices from "./invoices";

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

const Subscription = () => {
  const [getSubscriptionResponse, ,getSubscriptionLoading ,getSubscription, clearSubscription] = useCRUD({
    id: GET_SUBSCRIPTION_DATA,
    url: `${API_URL.clinic}/subscription-data`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
   getSubscription(); 
  }, [])

  const tabClasses = useStyles();

  const data = [
    {
      label: 'Overview',
      component: () => {
        return (
        <>
          <Container loading={getSubscriptionLoading}>
            {getSubscriptionResponse?.isTrial && <TrialSubscription/>}
            {!getSubscriptionResponse?.isTrial && <SubscriptionInfo />}
          </Container>
        </>
        )
      },
      componentProps: {
        type: 'overview',
      },
    },
    {
      label: 'Invoices',
      component: Invoices,
      componentProps: {
        type: 'invoice',
      },
    },
  ];
  
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
  );

}

export default Subscription;
