import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import FaxContact from './FaxContact';
import FaxHistory from './FaxHistory';

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
    label: 'Fax Contact',
    component: FaxContact,
    componentProps: {
      type: '1',
    },
  },
  {
    label: 'Fax History',
    component: FaxHistory,
    componentProps: {
      type: '2',
    },
  },
];

const Fax = () => {
  const tabClasses = useStyles();

  return (
    <div style={{border:`1px solid ${palette.border.main}`,borderRadius:7.79}}>
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
    </div>
  );
};

export default Fax;
