/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';

import Tabs from 'src/components/Tabs/tabsWithNavigation';
import palette from 'src/theme/palette';
import { useLocation } from 'react-router-dom';
import { roleTypes, tabsStyling } from 'src/lib/constants';
import useAuthUser from 'src/hooks/useAuthUser';
import { getUserRole } from 'src/lib/utils';
import { UI_ROUTES } from 'src/lib/routeConstants';
import Team from '../Team';
import AddClinic from '../admin/AddClinic';
import BookingWidget from '../BookingWidget';
import { API_URL } from 'src/api/constants';
import { CLINIC_ADMIN_COLUMNS } from 'src/lib/tableConstants';
import TeamList from '../Team/TeamList';
import PracticeSettings from '../Settings/clinicConfig/practiceSettings';
import { clinicAddFormField } from '../admin/clinicAddForm';
import ClinicProfile from './ClincProfile';
import ClinicSubscription from './ClinicSubscription';

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
  backgroundColor: 'transparent',
};
const tabs = [
  {
    label: 'Overview',
    component: ClinicProfile,
    // component: PracticeSettings,
    // component: AddClinic,
    componentProps: {},
  },
  {
    label: 'Clinic Admin',
    component: TeamList,
    componentProps: {
      type: roleTypes.clinicAdmin,
      api: API_URL.clinicAdmin,
      columns: CLINIC_ADMIN_COLUMNS,
    },
  },
  {
    label: 'Subscription',
    component: ClinicSubscription,
    componentProps: {
    },
  },
  // {
  //   label: 'Team',
  //   component: Team,
  //   componentProps: {},
  // },
  // {
  //   label: 'Widget',
  //   component: BookingWidget,
  //   componentProps: {},
  // },
];
const ClinicDetails = ({ routingPath }) => {
  const { state } = useLocation();
  const tabClasses = useStyles();
  const [userData] = useAuthUser();
  const updatedTabs = [...tabs];

  if (getUserRole() === roleTypes.superAdmin) {
    updatedTabs.splice(3);
  }
  useMemo(
    () =>
      updatedTabs.map((x) => {
        const tab = x;
        tab.componentProps.selectedClinic = state?.data || userData?.id;
        tab.componentProps.isButton = true;
        return tab;
      }),
    [userData]
  );

  return (
    <Box>
      <Tabs
        data={updatedTabs}
        tabClasses={tabClasses}
        tabIndicatorProps={tabIndicatorProps}
        tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
        path={routingPath || UI_ROUTES.editClinicsDetails}
      />
    </Box>
  );
};

export default ClinicDetails;
