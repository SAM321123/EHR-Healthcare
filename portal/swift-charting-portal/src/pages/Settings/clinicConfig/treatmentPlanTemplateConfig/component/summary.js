import React, { useCallback, useEffect } from 'react';
import { useTemplate } from '../templateContext';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CardActions from '@mui/material/CardActions';
import TreatmentPlanSummary from './treatmentPlanSummary';
import { Box } from '@mui/material';
import {  SAVE_TREATMENT_PLAN_TEMPLATE_DATA } from 'src/store/types';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import { templateFormGroups } from './formGroup';
import { CardContent } from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { isEmpty } from 'lodash';
import { successMessage } from 'src/lib/constants';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import palette from 'src/theme/palette';

const initialData = { isActive: true };

const Summary = ({ refetchData, modalCloseAction, defaultData, label}) => {
  const {
    selectedInterventions,
    selectedObjectives,
    selectedGoals,
    selectedBehaviors,
    selectedProblems,
    selectedDiagnosis,
    setActiveStep,
  } = useTemplate();
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const [response, , loading, callTemplateSaveAPI, clearData] = useCRUD({
    id: SAVE_TREATMENT_PLAN_TEMPLATE_DATA,
    url: API_URL.treatmentPlanTemplate,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
  


  const onHandleSubmit = useCallback(
    (data) => {
      if (loading) return;
      const treatmentPlanData = {
        diagnoses: selectedDiagnosis,
        problemList: selectedProblems,
        behaviorList: selectedBehaviors,
        goalList: selectedGoals,
        objectiveList: selectedObjectives,
        interventionList: selectedInterventions,
      };
      if (isEmpty(defaultData)) {
        callTemplateSaveAPI({ data: { ...treatmentPlanData, ...data } });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        delete updatedFields.id;
        delete updatedFields.createdBy;
        delete updatedFields.diag;
        delete updatedFields.reviewedBy;

        const { id } = defaultData;
       return callTemplateSaveAPI(
          { ...treatmentPlanData, ...updatedFields },
          `/${id}`
        );
      }
    },
    [callTemplateSaveAPI, loading]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: !defaultData?.id 
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <div
        style={{
          padding: '12px',
          border: `1px solid ${palette.border.main}`,
          borderRadius: '4px',
        }}
      >
        <TreatmentPlanSummary label={label} />
      </div>
      <CardContent style={{ paddingLeft: '0px', paddingRight: '0px' }}>
        <CustomForm
          form={form}
          formGroups={templateFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? initialData : defaultData}
        />
      </CardContent>
      <Box>
        <CardActions
          sx={{
            justifyContent: 'flex-end',
            marginTop: '40px',
          }}
        >
          <LoadingButton
            onClick={handleBack}
            variant="outlinedSecondary"
            label="Back"
            disabled={loading}
          />
          <LoadingButton
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
            loading={loading}
            disabled={loading}
          />
        </CardActions>
      </Box>
    </>
  );
};

export default Summary;
