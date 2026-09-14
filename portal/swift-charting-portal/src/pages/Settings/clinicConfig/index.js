import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import { UI_ROUTES } from 'src/lib/routeConstants';
import PracticeSettings from './practiceSettings';
import PracticeLocation from './practiceLocation'; 
import MdToolboxConfig from './mdToolboxConfig';
import OfficeallyConfig from './officeallyConfig';
import TreatmentPlanTemplateConfig from './treatmentPlanTemplateConfig';

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
    label: 'Practice Settings',
    component: PracticeSettings,
    componentProps: {
      type: 'practiceSettings',
    },
  },
  {
    label: 'Practice Location',
    component: PracticeLocation,
    componentProps: {
      type: 'practiceLocation',
    },
  },
  {
    label: 'Md Toolbox Config',
    component: MdToolboxConfig,
    componentProps: {
      type: 'mdtoolboxconfig',
    },
  },
  {
    label: 'Office Ally Config',
    component: OfficeallyConfig,
    componentProps: {
      type: 'officeallyconfig',
    },
  },
  // {
  //   label: 'Treatment Plan Template Config',
  //   component: TreatmentPlanTemplateConfig,
  //   componentProps: {
  //     type: 'treatmentPlanTemplateConfig',
  //   },
  // },
];

const ClinicConfig= () => {
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

export default ClinicConfig;