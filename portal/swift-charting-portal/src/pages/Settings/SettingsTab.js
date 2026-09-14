import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import EmailTemplate from '../BookingSetting/EmailTemplate';
// import {
//   Route,
//   Routes,
//   generatePath,
//   useNavigate,
//   useParams,
// } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import MasterConfig from './masterConfig';
import ClinicConfig from './clinicConfig';
import BlockedUser from './clinicConfig/blockedUser';
import EmailCampaign from './clinicCampaign';
import ProspectRegistration from './prospectRegistration';

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
    component: EmailTemplate,
    componentProps: {
      type: 'email',
    },
  },
  {
    label: 'Master Config',
    component: MasterConfig,
    componentProps: {
      type: 'master',
    },
  },
  {
    label: 'Clinic Config',
    component: ClinicConfig,
    componentProps: {
      type: 'clinic',
    },
  },
  {
    label: 'Blocked User',
    component: BlockedUser,
    componentProps: {
      type: 'clinic',
    }
  },
   {
    label: 'Email Campaign',
    component: EmailCampaign,
    componentProps: {
      type: 'clinic',
    }
  },
    {
    label: 'Prospect Registration',
    component: ProspectRegistration,
    componentProps: {
      type: 'clinic',
    }
  },
];

const SettingsTab = () => {
  const tabClasses = useStyles();
//   const navigate = useNavigate();
//   const params = useParams();

//   useEffect(() => {
//     navigate(
//       generatePath(UI_ROUTES.systemSettingsTab, {
//         ...params,
//         subTabName: params?.subTabName || 'Users',
//       })
//     );
// }, []);

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
// const Settings = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<SettingsTab />} />
//     </Routes>
//   );
// };

export default SettingsTab;
