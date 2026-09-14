/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { DiagnosisFormGroups } from './formGroup';
import { useTreatmentPlan } from '../treatmentPlanContext';

const initialData = { isActive: true };

const Diagnosis = ({ modalCloseAction, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const { setSelectedDiagnosis, setActiveStep } = useTreatmentPlan();
  const onHandleSubmit = useCallback((data) => {
    setSelectedDiagnosis(data.ICDId);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, []);

  const temp = useMemo(() => {
    return { ICDId: defaultData?.diag?.map((item) => item?.ICDId) };
  }, [defaultData]);
  return (
    <Box>
      <Box>
        <CardContent sx={{ padding: '12px' }}>
          <CustomForm
            form={form}
            formGroups={DiagnosisFormGroups}
            columnsPerRow={1}
            defaultValue={isEmpty(defaultData) ? initialData : temp}
          />
        </CardContent>
      </Box>
      <CardActions
        sx={{
          justifyContent: 'flex-end',
          paddingLeft: '24px',
          paddingRight: '24px',
          marginTop: '40px',
        }}
      >
        <LoadingButton
          onClick={modalCloseAction}
          variant="outlinedSecondary"
          label="Cancel"
        />
        <LoadingButton onClick={handleSubmit(onHandleSubmit)} label="Next" />
      </CardActions>
    </Box>
  );
};

export default Diagnosis;
