import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import FormBuilder from './index';
import FormLibraryTable from './formLibraryTable';
import FormBuilderListView from './FormBuilderListView';

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

const FORM_TABS = [
  {
    label: 'Questionnaires',
    type: 'FT_QUESTIONNAIRES',
  },
  {
    label: 'Consent Forms',
    type: 'FT_CONSENT_FORMS',
  },
  {
    label: 'Note Templates',
    type: 'FT_NOTE_TEMPLATES',
  },
  {
    label: 'History Forms',
    type: 'FT_HISTORY_TEMPLATES',
    extraProps: { isActive: false, addMoreForm: false },
  },
  {
    label: 'Encounter Forms',
    type: 'FT_ENCOUNTER_TEMPLATES',
  },
];

const VIEW_GRID = 'grid';
const VIEW_LIST = 'list';

const FormHome = () => {
  const tabClasses = useStyles();
  const [view, setView] = useState(VIEW_GRID);
  const [activeTab, setActiveTab] = useState(FORM_TABS[0].label);

  const tabData = [
    ...FORM_TABS.map(({ label, type, extraProps = {} }) => ({
      label,
      component: view === VIEW_LIST ? FormBuilderListView : FormBuilder,
      componentProps: {
        type,
        tabId: `${type}_tab`,
        ...extraProps,
      },
    })),
    {
      label: 'Form Library',
      component: FormLibraryTable,
    },
  ];

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ViewToggle = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
        pr: 1,
        pt: '2px',
      }}
    >
      <Tooltip title="Grid View">
        <IconButton
          size="small"
          onClick={() => setView(VIEW_GRID)}
          sx={{
            borderRadius: '4px',
            padding: '4px',
            backgroundColor:
              view === VIEW_GRID
                ? palette.background.accentBlue
                : 'transparent',
            color:
              view === VIEW_GRID ? palette.primary.main : palette.grey[500],
            '&:hover': {
              backgroundColor: palette.background.accentBlue,
            },
          }}
        >
          <ViewModuleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="List View">
        <IconButton
          size="small"
          onClick={() => setView(VIEW_LIST)}
          sx={{
            borderRadius: '4px',
            padding: '4px',
            backgroundColor:
              view === VIEW_LIST
                ? palette.background.accentBlue
                : 'transparent',
            color:
              view === VIEW_LIST ? palette.primary.main : palette.grey[500],
            '&:hover': {
              backgroundColor: palette.background.accentBlue,
            },
          }}
        >
          <ViewListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {activeTab !== 'Form Library' && ViewToggle}
      <Tabs
        data={tabData}
        tabClasses={tabClasses}
        tabIndicatorProps={tabIndicatorProps}
        tabPanelStyle={{ padding: 0, paddingTop: view === VIEW_LIST ? '16px' : '2px' }}
        onChange={handleChange}
      />
    </Box>
  );
};

export default FormHome;
