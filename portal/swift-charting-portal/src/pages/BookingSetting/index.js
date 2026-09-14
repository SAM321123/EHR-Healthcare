/* eslint-disable no-unused-vars */
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { roleTypes, tabsStyling } from 'src/lib/constants';
import { getUserRole } from 'src/lib/utils';
import Tabs from 'src/components/Tabs';
import Location from './Location/index';
import Service from './Service';
import BookingSetting from './BookingSettings';
import EmailTemplate from './EmailTemplate';
import Education from './Education';
import Products from '../Products';
import Medicine from './Medicine';
import ChatTemplate from './ChatTemplate';
import MedicineTemplate from './MedicineTemplate';
import ThirdPartySettings from './ThirdPartySetting';

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

const BookingSettingContainer = () => {
  const tabClasses = useStyles();
  let data = [
    {
      label: 'Locations',
      component: Location,
      componentProps: {
        type: '1',
        api: '',
      },
    },
    {
      label: 'Services',
      component: Service,
      componentProps: {},
    },
    {
      label: 'Setting',
      component: BookingSetting,
      componentProps: {
        type: '2',
        api: '',
      },
    },
    {
      label: 'Email Templates',
      component: EmailTemplate,
      componentProps: {
        type: '3',
        api: '',
      },
    },
    {
      label: 'Education',
      component: Education,
      componentProps: {
        type: '4',
      },
    },
    {
      label: 'Products',
      component: Products,
      componentProps: {
        type: '5',
      },
    },
    {
      label: 'Medicine',
      component: Medicine,
      componentProps: {
        type: '6',
      },
    },
    {
      label: 'Chat Templates',
      component: ChatTemplate,
      componentProps: {
        type: '7',
      },
    },
    {
      label: 'Medicine Templates',
      component: MedicineTemplate,
      componentProps: {
        type: '8',
      },
    },
  ];

  if (getUserRole() === roleTypes.superAdmin) {
    data = [
      {
        label: 'Email Templates',
        component: EmailTemplate,
        componentProps: {
          type: '3',
          api: '',
        },
      },
    ];
  }

  if (getUserRole() === roleTypes.clinicAdmin) {
    data.push({
      label: 'Third Party Settings',
      component: ThirdPartySettings,
      componentProps: {
        type: '8',
      },
    });
  }

  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
  );
};

export default BookingSettingContainer;
