import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { tabsStyling } from 'src/lib/constants';
import { REQUEST_METHOD } from 'src/api/constants';
import Tabs from 'src/components/Tabs';
import EmailTemplateForm from '../BookingSetting/EmailTemplate/EmailTemplateForm';
import MasterConfig from '../Settings/masterConfig';
import ClinicConfig from '../Settings/clinicConfig';
import BlockedUser from '../Settings/clinicConfig/blockedUser';
import SuperAdminEmailTemplate from './EmailTemplate';
import ComposedEmail from './ComposedEmail';

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
    label: 'Email Templates',
    component: SuperAdminEmailTemplate,
    componentProps: {
      type: 'email',
      formState: {
        open: false,
        // other required fields
      },
    },
  },
  {
    label: 'Composed Email',
    component: ComposedEmail,
    componentProps: {
      type: 'email',
      formState: {
        open: false,
        // other required fields
      },
    },
  },
];

const SuperAdminEmailCampaign = () => {
  const tabClasses = useStyles();
  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
      defaultIndex={0}
    />
  );
};

export default SuperAdminEmailCampaign;
