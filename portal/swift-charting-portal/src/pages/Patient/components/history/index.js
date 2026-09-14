/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';

import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import EmailTemplate from 'src/pages/BookingSetting/EmailTemplate';
import FamilyHistory from './familyHistory';
import SocialHistory from './socialHistory';
import MedicalHistory from './MedicalHistory';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { isEmpty } from 'lodash';
import DynamicHistoryComponent from './dynamicHistoryComponent';



const tabIndicatorProps = {
  display: 'none',
};
const type= 'FT_HISTORY_TEMPLATES';

const HistoryContainer = () => {
  
  const [formCategory, , , getFormCategory] = useCRUD({
    id: `history-tabs-${type}`,
    type: REQUEST_METHOD.get,
    url: `${API_URL.getMasters}/form_category`,
  });
  useEffect(()=>{
    getFormCategory({parentCode:'FT_HISTORY_TEMPLATES',isActive:true});
  },[]);

  let data = useMemo(() => {
    let tabs = [];
  
    if (!isEmpty(formCategory?.results)) {
      // Insert the first item at index 0
      const firstItem = formCategory.results[0];
      tabs.push({
        label: firstItem.name,
        component: DynamicHistoryComponent,
        componentProps: {
          type: firstItem.code,
          api: '',
          formTypeCode: firstItem.parentCode,
          formCategoryCode: firstItem.globalCategoryTypeCode,
        },
      });
  
      // Push the 'Family History' tab
      tabs.push({
        label: 'Family History',
        component: FamilyHistory,
        componentProps: {
          type: '1',
          api: '',
        },
      });
  
      // Push the rest of the items
      formCategory.results.slice(1).forEach(item => {
        tabs.push({
          label: item.name,
          component: DynamicHistoryComponent,
          componentProps: {
            type: item.code,
            api: '',
            formTypeCode: item.parentCode,
            formCategoryCode: item.globalCategoryTypeCode,
          },
        });
      });
    } else {
      // If formCategory.results is empty, just push the 'Family History' tab
      tabs.push({
        label: 'Family History',
        component: FamilyHistory,
        componentProps: {
          type: '1',
          api: '',
        },
      });
    }
  
    return tabs;
  }, [formCategory]);
  


  return (
    <div style={{border:`1px solid ${palette.border.main}`,borderRadius:7.79}}>
    <Tabs

      data={data}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
    />
    </div>
  );
};

export default HistoryContainer;
