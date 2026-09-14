import React, { useCallback, useEffect } from 'react';
import { useTreatmentPlan } from '../treatmentPlanContext';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CardActions from '@mui/material/CardActions';
import TreatmentPlanSummary from './treatmentPlanSummary';
import { Box } from '@mui/material';
import { SAVE_TREATMENT_PLAN_DATA } from 'src/store/types';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import {
  showAddTemplateCheckbox,
  showOverrideCheckBox,
  showOverrideTemplateField,
  showTemplateField,
} from './formGroup';
import { CardContent } from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { isEmpty } from 'lodash';
import {
  regexCustomText,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import palette from 'src/theme/palette';

const initialData = { isActive: true };

const Summary = ({ refetchData, modalCloseAction, defaultData,label }) => {
  console.log("🚀 ~ Summary ~ defaultData:", defaultData?.templateId)
  const params = useParams();
  let { patientId } = params || {};
  patientId = decrypt(patientId);
  const {
    selectedInterventions,
    selectedObjectives,
    selectedGoals,
    selectedBehaviors,
    selectedProblems,
    selectedDiagnosis,
    setActiveStep,
  } = useTreatmentPlan();
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const [response, , , callTreatmentPlanSaveAPI, clearData] = useCRUD({
    id: SAVE_TREATMENT_PLAN_DATA,
    url: API_URL.treatmentPlan,
    type: !defaultData?.id ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const treatmentPlanFormGroups = [
    {
      inputType: 'date',
      name: 'startDate',
      textLabel: 'Start Date',
      required: requiredField,
      disableFuture: false,
      colSpan: 0.33,
    },
    {
      inputType: 'date',
      name: 'endDate',
      textLabel: 'End Date',
      required: requiredField,
      disableFuture: false,
      colSpan: 0.33,
    },
    {
      inputType: 'text',
      type: 'number',
      name: 'treatmentDays',
      textLabel: 'Expected Length of Treatment Days',
      colSpan: 0.33,
    },
    {
      inputType: 'checkBox',
      name: 'addTreatmentPlanTemplate',
      label: 'Add this treatment plan as template',
      colSpan: 0.5,
      // dependencies: {
      //   keys: ['editTreatmentPlanTemplate'],
      //   calc: showAddTemplateCheckbox,
      // },
    },
    ...(defaultData?.templateId
      ? [
          {
            inputType: 'checkBox',
            name: 'editTreatmentPlanTemplate',
            label: 'Override Existing Template',
            colSpan: 0.5,
            // dependencies: {
            //   keys: ['addTreatmentPlanTemplate'],
            //   calc: showTemplateField,
            // },
          },
        ]
      : []),

    // {
    //   inputType: 'text',
    //   name: 'templateName',
    //   textLabel: 'Override Template Name',
    //   pattern: regexCustomText,
    //   colSpan: 1,
    //   dependencies: {
    //     keys: ['editTreatmentPlanTemplate'],
    //     calc: showOverrideTemplateField,
    //   },
    // },
    // {
    //   inputType: 'textArea',
    //   name: 'templateDescription',
    //   textLabel: 'Override Treatment Description',
    //   colSpan: 1,
    //   dependencies: {
    //     keys: ['editTreatmentPlanTemplate'],
    //     calc: showOverrideTemplateField,
    //   },
    // },
    {
      inputType: 'text',
      name: 'templateName',
      textLabel: 'Treatment Template Name',
      pattern: regexCustomText,
      colSpan: 1,
      dependencies: {
        keys: ['addTreatmentPlanTemplate'],
        calc: showTemplateField,
      },
    },
    {
      inputType: 'textArea',
      name: 'templateDescription',
      textLabel: 'Treatment Description',
      colSpan: 1,
      dependencies: {
        keys: ['addTreatmentPlanTemplate'],
        calc: showTemplateField,
      },
    },
  ];

  const onHandleSubmit = useCallback(
    (data) => {
      const treatmentPlanData = {
        patientId,
        diagnoses: selectedDiagnosis,
        problemList: selectedProblems,
        behaviorList: selectedBehaviors,
        goalList: selectedGoals,
        objectiveList: selectedObjectives,
        interventionList: selectedInterventions,
      };
      if (isEmpty(defaultData)) {
        return callTreatmentPlanSaveAPI({
          data: { ...treatmentPlanData, ...data },
        });
      }
      if (!defaultData.id) {
        delete data?.id;
        delete data.patient;
        delete data.createdBy;
        delete data.diag;
        delete data.reviewedBy;
        delete data.isActive;
        delete data.isDeleted;
        delete data.createdById;
        delete data.createdAt;
        delete data.updatedById;
        delete data.updatedAt;
        return callTreatmentPlanSaveAPI({
          data: { ...treatmentPlanData, ...data },
        });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        delete updatedFields.id;
        delete updatedFields.patient;
        delete updatedFields.createdBy;
        delete updatedFields.diag;
        delete updatedFields.reviewedBy;
        delete updatedFields.status;

        const { id } = defaultData;
        return callTreatmentPlanSaveAPI(
          { ...treatmentPlanData, ...updatedFields },
          `/${id}`
        );
      }
    },
    [callTreatmentPlanSaveAPI]
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
          formGroups={treatmentPlanFormGroups}
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
          />
          <LoadingButton
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </CardActions>
      </Box>
    </>
  );
};

export default Summary;
