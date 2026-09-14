import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import { UI_ROUTES } from 'src/lib/routeConstants';
import GlobalConfig from './globalConfig';
import LabTestConfig from './labTestConfig';
import TestingLabConfig from './testingLabConfig';
import BillingCodes from './billingCodes';
import RoleConfig from './roleConfig';
import ModuleConfig from './moduleConfig';
import RoleAndPermissions from './roleAndPermission';
import TreatmentPlanTemplateConfig from '../clinicConfig/treatmentPlanTemplateConfig';
import AuditLogs from './auditLogs';

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
    label: 'Global Config',
    component: GlobalConfig,
    componentProps: {
      type: 'global',
    },
  },
  {
    label: 'Lab Test Config',
    component: LabTestConfig,
    componentProps: {
      type: 'labTest',
    },
  },
  {
    label: 'Testing Lab Config',
    component: TestingLabConfig,
    componentProps: {
      type: 'testingLab',
    },
  },
  {
    label: 'Billing Codes/ Service Type',
    component: BillingCodes,
    componentProps: {
      type: 'billingCode',
    },
  },
  {
    label: 'Treatment Plan Template Config',
    component: TreatmentPlanTemplateConfig,
    componentProps: {
      type: 'treatmentPlanTemplateConfig',
    },
  },
  {
    label: 'Role Config',
    component: RoleConfig,
    componentProps: {
      type: 'roles',
    },
  },
  {
    label: 'Module Config',
    component: ModuleConfig,
    componentProps: {
      type: 'modules',
    },
  },
 {
    label: 'Role And Permissions',
    component: RoleAndPermissions,
    componentProps: {
      type: 'roleAndPermissions',
    },
  },
   {
    label: 'Audit Logs',
    component: AuditLogs,
    componentProps: {
      type: 'auditLogs',
    }
  },
];

const MasterConfig= () => {
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

export default MasterConfig;
