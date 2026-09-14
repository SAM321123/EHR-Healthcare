import React, { useEffect } from 'react';
import {  Box, CardContent } from '@mui/material';
import Diagnosis from './component/diagnosis';
import Problems from './component/problems';
import Behaviors from './component/behaviors';
import Goals from './component/goals';
import { useTreatmentPlan } from './treatmentPlanContext';
import Objectives from './component/objectives';
import Interventions from './component/interventions';
import Summary from './component/summary';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { MASTER_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';

const steps = [
  'Diagnosis',
  'Problems',
  'Behaviors',
  'Goals',
  'Objectives',
  'Interventions',
  'Summary',
];

const StepForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const { activeStep } = useTreatmentPlan();

  const [masterData, , , callMasterData, clearData] = useCRUD({
    id: MASTER_DATA,
    url: API_URL.getMasters,
    type: REQUEST_METHOD.get,
  });

  const labels = masterData?.results || [];

  useEffect(() => {
  callMasterData({}, `/${"treatment_plan_label"}`);
  // eslint-disable-next-line
}, []);
  return (
    <Box sx={{ width: '100%' }}>
      <CardContent sx={{paddingTop:'0px',marginTop:'38px',paddingBottom:'0px'}}>
        <div style={{backgroundColor:palette.background.offBlue,padding:'12px 12px'}}>
      <Typography style={{fontSize:16,fontWeight:600,lineHeight:'20px'}}>
        {activeStep === 6
          ? `${steps[activeStep]}`
          : `Step - ${activeStep + 1} of ${steps.length - 1} (${
              steps[activeStep]
            })`}
      </Typography>
      </div>
      </CardContent>
      <CardContent sx={{borderColor:palette.border.main,borderWidth:'1px'}}>
        {activeStep === steps.length ? (
          <Typography variant="h6" align="center">
            All steps completed - you&apos;re finished
          </Typography>
        ) : (
          <>
            {activeStep === 0 && (
             <Diagnosis
                modalCloseAction={modalCloseAction}
                defaultData={defaultData}
              />
            )}
            {activeStep === 1 && <Problems defaultData={defaultData} label={labels} />}
            {activeStep === 2 && <Behaviors defaultData={defaultData} label={labels} />}
            {activeStep === 3 && <Goals defaultData={defaultData} label={labels} />}
            {activeStep === 4 && <Objectives defaultData={defaultData} label={labels} />}
            {activeStep === 5 && <Interventions defaultData={defaultData} label={labels} />}
            {activeStep === 6 && (
              <Summary
                refetchData={refetchData}
                modalCloseAction={modalCloseAction}
                defaultData={defaultData}
                label={labels}
              />
            )}
          </>
        )}
      </CardContent>
    </Box>
  );
};

export default StepForm;
