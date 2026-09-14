import React, { useEffect } from 'react';
import {
  generatePath,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import palette from 'src/theme/palette';

import { UI_ROUTES } from 'src/lib/routeConstants';

import Box from 'src/components/Box';
import Tabs from 'src/components/Tabs/tabsWithNavigation';
import PageContent from 'src/components/PageContent';

import ConsentFormPreview from 'src/pages/PatientPortal/Forms/consentFormRender';
import FormRenderer from './formRenderer';
import PatientFormList from './index';

const tabIndicatorProps = {
  display: 'none',
};

const data = [
  {
    label: 'Questionnaires',
    component: PatientFormList,
    componentProps: {
      type: 'FT_QUESTIONNAIRES',
    },
  },
  {
    label: 'Consent Forms',
    component: PatientFormList,
    componentProps: {
      type: 'FT_CONSENT_FORMS',
    },
  },
  {
    label: 'Note Templates',
    component: PatientFormList,
    componentProps: {
      type: 'FT_NOTE_TEMPLATES',
    },
  },
];

const FormSubTabs = () => {
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
      navigate(
        generatePath(UI_ROUTES.patientFormTab, {
          ...params,
          subTabName: params?.subTabName || 'Questionnaires',
        })
      );
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: palette.background.paper,
        paddingLeft: 1,
        height: '100%',
      }}
    >
      <Tabs
        data={data}
        tabIndicatorProps={tabIndicatorProps}
        tabPanelStyle={{ padding: 0, paddingTop: '2px', height: '80%' }}
        style={{ height: '100%' }}
        path={UI_ROUTES.patientFormTab}
        isSubTabs
      />
    </Box>
  );
};

const FormTabsPatient = (props = {}) => (
  <Routes>
    <Route path="/" element={<FormSubTabs {...props} />} />
    <Route
      path=":formId"
      element={
        <PageContent style={{ overflow: 'auto' }}>
          <FormRenderer />
        </PageContent>
      }
    />
    <Route
      path=":formId/consent/:consentId"
      element={
        <PageContent style={{ overflow: 'auto' }}>
          <ConsentFormPreview />
        </PageContent>
      }
    />
  </Routes>
);

export default FormTabsPatient;
