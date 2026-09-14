import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import MedicationList from './medicationList';
import ERxPrescriptionList from './eRxPrescription';
import useAuthUser from 'src/hooks/useAuthUser';

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
    label: 'Medications',
    component: MedicationList,
    componentProps: {
      type: '1',
    },
  },
  // {
  //   label: 'E-Rx',
  //   component: ERxPrescriptionList,
  //   componentProps: {
  //     type: '2',
  //   },
  // },
];

const Medication = () => {
  const tabClasses = useStyles();
  const [userData, , , refetchUser] = useAuthUser();

  if(userData?.isPrescriber && !data.some(tab => tab.label === 'E-Rx')){
    data.push(
      {
        label: 'E-Rx',
        component: ERxPrescriptionList,
        componentProps: {
          type: '2',
        },
      }
    )
  }

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

export default Medication;
