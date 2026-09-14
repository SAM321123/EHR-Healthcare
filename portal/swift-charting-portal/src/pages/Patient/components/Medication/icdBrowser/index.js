import { CardActions } from '@mui/material';
import { useState } from 'react';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Tabs from 'src/components/Tabs';
import PatientDxs from './patientDxs';
import Search from './search';

const tabIndicatorProps = {
  display: 'none',
};

const IcdBrowser = ({ modalCloseAction, onSave,patientId,singleSelection=false }) => {
  const [patientDiagnosis,setPatientDiagnosis]= useState([]);
  const onSaveHandle = ()=>{
    onSave(patientDiagnosis)
  }
  const data = [
    {
      label: 'Patient Dxs',
      component: PatientDxs,
      componentProps: {
        type: '2',
        api: '',
        patientId,
        patientDiagnosis,
        setPatientDiagnosis,
        singleSelection,
      },
    },
    {
      label: 'Search',
      component: Search,
      componentProps: {
        type: '3',
        api: '',
        patientDiagnosis,
        setPatientDiagnosis,
        singleSelection,
      },
    },
  ];

  // const handleTabChange = (event, newValue) => {
  //   setActiveTab(newValue);
  // };



  return (
    <div style={{ width: '100%' }}>
      <Tabs
        data={data}
        tabIndicatorProps={tabIndicatorProps}
        tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
      />
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          // loading={loading}
          onClick={onSaveHandle}
          label="Save"
        />
      </CardActions>
    </div>
  );
};

export default IcdBrowser;