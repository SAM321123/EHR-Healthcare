import React, { useEffect, useState } from 'react';
import { useTemplate } from '../templateContext';
import {
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  CardContent,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { OBJECTIVE_INTERVENTION } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CardActions from '@mui/material/CardActions';
import { isEmpty } from 'lodash';
import { v4 } from 'uuid';
import deleteIcon from 'src/assets/images/deleteIcon.png';
import saveIcon from 'src/assets/images/saveIcon.png';
import palette from 'src/theme/palette';
import TearmentPlanCheckBox from './tearmentPlanCheckBox';
import Container from 'src/components/Container';

const Intervention = ({ objectiveId, goalId, defaultData, label }) => {
  const {
    objectives,
    setInterventions,
    interventions,
    selectedBehaviors,
    selectedProblems,
    goals,
    selectedGoals,
    setSelectedInterventions,
    selectedInterventions,
    behaviors,
    problems,
    selectedDiagnosis,
  } = useTemplate();
  const [showInput, setShowInput] = useState(false);
  const [newIntervention, setNewIntervention] = useState('');
  const [response, ,loading , callInterventionListAPI, clear] = useCRUD({
    id: `${OBJECTIVE_INTERVENTION}_${objectiveId}`,
    url: API_URL.objectiveIntervention,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {
    if (
      objectiveId &&
      !(typeof objectiveId === 'string' && objectiveId.startsWith('new_')) &&
      isEmpty(interventions[objectiveId])
    ) {
      callInterventionListAPI({ objectiveId: objectiveId, limit: 100 });
    }
  }, [objectiveId]);

  useEffect(() => {
    if (response) {
      setInterventions((prev) => ({
        ...prev,
        [objectiveId]: response?.results,
      }));
      clear(true);
    }
  }, [response]);
  useEffect(() => {
    if (defaultData && defaultData.diag) {
      const initialSelectedInterventions = {};

      defaultData.diag.forEach((d) => {
        d.prob.forEach((p) => {
          p.beha.forEach((b) => {
            b.goals.forEach((g) => {
              g.obj.forEach((o) => {
                o.inter.forEach((i) => {
                  const interventionId = i.OIId;
                  if (objectiveId === i.OIId.objectiveId) {
                    initialSelectedInterventions[i.OIId.objectiveId] = [
                      ...(initialSelectedInterventions[i.OIId.objectiveId] ||
                        []),
                      interventionId,
                    ];
                  }
                });
              });
            });
          });
        });
      });

      setSelectedInterventions((prev) => ({
        ...prev,
        ...initialSelectedInterventions,
      }));
    }
  }, [setSelectedInterventions]);

  const behaviorId = Object.keys(selectedGoals).find((key) =>
    selectedGoals[key].some((item) => item.id == goalId)
  );
  const goal = goals[behaviorId]?.find((b) => b.id == goalId)?.name;

  const problemId = Object.keys(selectedBehaviors).find((key) =>
    selectedBehaviors[key].some((item) => item.id == behaviorId)
  );
  const diagnosisId = Object.keys(selectedProblems).find((key) =>
    selectedProblems[key].some((item) => item.id == problemId)
  );
  const problem = problems[diagnosisId]?.find((b) => b.id == problemId)?.name;

  const behavior = behaviors[problemId]?.find((b) => b.id == behaviorId)?.name;
  const diagnosis = selectedDiagnosis?.find((b) => b.id == diagnosisId);

  const handleAddIntervention = () => {
    if (newIntervention.trim() !== '') {
      const newInterventionObject = {
        id: `new_${v4()}`,
        name: newIntervention,
        objectiveId: objectiveId,
      };
      setInterventions((prev) => ({
        ...prev,
        [objectiveId]: [...(prev[objectiveId] || []), newInterventionObject],
      }));
      setSelectedInterventions((prev) => ({
        ...prev,
        [objectiveId]: [...(prev[objectiveId] || []), newInterventionObject],
      }));
      setNewIntervention('');
      setShowInput(false);
    }
  };

  const problemLabel = label?.find((data) => data?.code === "problems")?.name || "";
  const behaviorLabel = label?.find((data) => data?.code === "behaviors")?.name || "";
  const goalLabel = label?.find((data) => data?.code === "goals")?.name || "";
  const objectiveLabel = label?.find((data) => data?.code === "objectives")?.name || "";
  const interventionLabel = label?.find((data) => data?.code === "interventions")?.name || "";

  return (
    <Box
      key={objectiveId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 0px',
        padding: '10px 0px',
        borderBottom: `1px dashed ${palette.border.main}`,
      }}
    >
      <Container loading={loading}>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>Diagnosis: </strong>
        {diagnosis?.name}
        {diagnosis?.description ? ` (${diagnosis.description})` : ''}{' '}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{problemLabel}: </strong>
        {problem}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{behaviorLabel}: </strong>
        {behavior}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{goalLabel}: </strong>
        {goal}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{objectiveLabel}: </strong>
        {objectives[goalId]?.find((o) => o.id === objectiveId)?.name}
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: '18px' }}>
          {interventionLabel}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={{ marginLeft: '10px', width: '60px', height: '30px' }}
          onClick={() => setShowInput(true)}
        >
          Add
        </Button>
      </div>
      {showInput && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
          }}
        >
          <TearmentPlanCheckBox
            checked={newIntervention.trim() !== ''}
            onChange={(e) =>
              setNewIntervention(e.target.checked ? newIntervention : '')
            }
          />
          <TextField
            placeholder={`Add new ${interventionLabel} here`}
            value={newIntervention}
            onChange={(e) => setNewIntervention(e.target.value)}
            size="small"
            style={{ marginRight: '10px', width: '100%' }}
          />
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleAddIntervention}
            disabled={newIntervention.trim() === ''}
            sx={{ opacity: newIntervention.trim() === '' ? 0.7 : 1 }}
          >
            <img src={saveIcon} style={{ width: 24, height: 24 }} alt="save" />
          </IconButton>
          <IconButton
            onClick={() => {
              setShowInput(false);
              setNewIntervention('');
            }}
          >
            <img
              src={deleteIcon}
              style={{ width: 24, height: 24 }}
              alt="delete"
            />
          </IconButton>
        </div>
      )}
      {(interventions[objectiveId] || []).map((intervention) => (
        <FormControlLabel
          key={intervention.id}
          control={
            <TearmentPlanCheckBox
              checked={(selectedInterventions[objectiveId] || []).some(
                (i) => i.id === intervention.id
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedInterventions((prev) => ({
                    ...prev,
                    [objectiveId]: [...(prev[objectiveId] || []), intervention],
                  }));
                } else {
                  setSelectedInterventions((prev) => ({
                    ...prev,
                    [objectiveId]: (prev[objectiveId] || []).filter(
                      (i) => i.id !== intervention.id
                    ),
                  }));
                }
              }}
            />
          }
          label={intervention.name}
          sx={{
            '& .MuiFormControlLabel-label': {
              paddingTop: '10px',
              paddingBottom: '10x',
              color: palette.text.secondary,
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              fontFamily: 'Poppins',
            },
          }}
        />
      ))}
      </Container>
    </Box>
  );
};

const Interventions = ({ defaultData, label }) => {
  const {
    selectedObjectives,
    setActiveStep,
    setSelectedInterventions,
    selectedInterventions,
    interventions,
  } = useTemplate();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSelectedInterventions({});
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
        <CardContent style={{ padding: '12px' }}>
          {Object.entries(selectedObjectives).map(([goalId, objectiveIds]) =>
            objectiveIds.map((objectiveId) => (
              <Intervention
                goalId={goalId}
                objectiveId={objectiveId.id}
                defaultData={defaultData}
                label={label}
              />
            ))
          )}
        </CardContent>
      </div>
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
            onClick={handleNext}
            label="Next"
            disabled={isEmpty(selectedInterventions)|| isEmpty(interventions)}
          />
        </CardActions>
      </Box>
    </>
  );
};
export default Interventions;
