import React, { useMemo } from 'react';
import Box from '@mui/material/Box';

import { roleTypes } from 'src/lib/constants';
import {
  ASSISTANT_COLUMNS,
  CLINIC_ADMIN_COLUMNS,
  PRACTITIONER_COLUMNS,
} from 'src/lib/tableConstants';
import { API_URL } from 'src/api/constants';
import palette from 'src/theme/palette';
import Tabs from 'src/components/Tabs';
import TeamList from './TeamList';

const data = [
  // {
  //   label: 'Assistants',
  //   component: TeamList,
  //   componentProps: {
  //     type: roleTypes.assistant,
  //     api: API_URL.assistant,
  //     columns: ASSISTANT_COLUMNS,
  //   },
  // },
  // {
  //   label: 'Practitioners',
  //   component: TeamList,
  //   componentProps: {
  //     type: roleTypes.practitioner,
  //     api: API_URL.practitioner,
  //     columns: PRACTITIONER_COLUMNS,
  //   },
  // },
  {
    label: 'Clinic Admin',
    component: TeamList,
    componentProps: {
      type: roleTypes.clinicAdmin,
      api: API_URL.clinicAdmin,
      columns: CLINIC_ADMIN_COLUMNS,
    },
  },
];

const ClinicTeams = (props) => {
  const tabDataProps = useMemo(() => data.map((x) => {
      const temp = x;
      temp.componentProps.selectedClinic = { ...props?.selectedClinic };
      return temp;
    }), [props?.selectedClinic]);

  return (
    <Box sx={{ backgroundColor: palette.background.paper, paddingLeft: 1 }}>
      <Tabs
        data={tabDataProps}
        tabPanelStyle={{ padding: 0 }}
        isRoutingAllow={false}
        selectedTab="Assistants"
      />
    </Box>
  );
};

export default ClinicTeams;
