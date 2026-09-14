import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import deleteIcon from 'src/assets/images/deleteIcon.png';
import saveIcon from 'src/assets/images/saveIcon.png';

import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { GOAL_OBJECTIVE } from 'src/store/types';
import palette from 'src/theme/palette';
import { v4 } from 'uuid';
import { useTreatmentPlan } from '../treatmentPlanContext';
import TearmentPlanCheckBox from './tearmentPlanCheckBox';
import Container from 'src/components/Container';

const Objective = ({ behaviorId, goalId, defaultData, label }) => {
  const {
    objectives,
    goals,
    selectedObjectives,
    setObjectives,
    setSelectedObjectives,
    selectedBehaviors,
    selectedProblems,
    behaviors,
    problems,
    selectedDiagnosis,
  } = useTreatmentPlan();
  const [showInput, setShowInput] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [response, , loading, callObjectiveListAPI, clear] = useCRUD({
    id: `${GOAL_OBJECTIVE}_${goalId}`,
    url: API_URL.goalObjective,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {  
    if (goalId && !(typeof goalId === 'string' && goalId.startsWith('new_')) && isEmpty(objectives[goalId])) {
      callObjectiveListAPI({ goalId: goalId, limit: 100 });
    }
  }, [goalId]);

  useEffect(() => {
    if (response) {
      setObjectives((prev) => ({ ...prev, [goalId]: response?.results }));
      clear(true);
    }
  }, [response]);
  useEffect(() => {
    if (defaultData && defaultData.diag) {
      // Initialize selected objectives based on defaultData
      const initialSelectedObjectives = {};

      defaultData.diag.forEach((d) => {
        d.prob.forEach((p) => {
          p.beha.forEach((b) => {
            b.goals.forEach((g) => {
              g.obj.forEach((o) => {
                const objectiveId = o.GOId;
                if (goalId === o.GOId.goalId) {
                  initialSelectedObjectives[o.GOId.goalId] = [
                    ...(initialSelectedObjectives[o.GOId.goalId] || []),
                    objectiveId,
                  ];
                }
              });
            });
          });
        });
      });

      setSelectedObjectives((prev) => ({
        ...prev,
        ...initialSelectedObjectives,
      }));
    }
  }, [setSelectedObjectives]);

  const problemId = Object.keys(selectedBehaviors).find((key) =>
    selectedBehaviors[key].some((item) => item.id == behaviorId)
  );
  const diagnosisId = Object.keys(selectedProblems).find((key) =>
    selectedProblems[key].some((item) => item.id == problemId)
  );
  const problem = problems[diagnosisId]?.find((b) => b.id == problemId)?.name;
  const behavior = behaviors[problemId]?.find((b) => b.id == behaviorId)?.name;
  const diagnosis = selectedDiagnosis?.find((b) => b.id == diagnosisId);

  const handleAddObjective = () => {
    if (newObjective.trim() !== '') {
      const newObjectiveObject = {
        id: `new_${v4()}`,
        name: newObjective,
        goalId: goalId,
      };
      setObjectives((prev) => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), newObjectiveObject],
      }));
      setSelectedObjectives((prev) => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), newObjectiveObject],
      }));
      setNewObjective('');
      setShowInput(false);
    }
  };

  const problemLabel = label?.find((data) => data?.code === "problems")?.name || "";
  const behaviorLabel = label?.find((data) => data?.code === "behaviors")?.name || "";
  const goalLabel = label?.find((data) => data?.code === "goals")?.name || "";
  const objectiveLabel = label?.find((data) => data?.code === "objectives")?.name || "";
  

  return (
    <Box
      key={goalId}
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
        <strong>{behaviorLabel}:</strong>
        {behavior}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{goalLabel}: </strong>
        {goals[behaviorId]?.find((g) => g.id == goalId)?.name}
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: '18px' }}>
          {objectiveLabel}
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
            checked={newObjective.trim() !== ''}
            onChange={(e) =>
              setNewObjective(e.target.checked ? newObjective : '')
            }
          />
          <TextField
            placeholder={`Add new ${objectiveLabel} here`}
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            size="small"
            style={{ marginRight: '10px' , width: '100%'}}
          />
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleAddObjective}
            disabled={newObjective.trim() === ''}
            sx={{ opacity: newObjective.trim() === '' ? 0.7 : 1 }}
          >
            <img src={saveIcon} style={{ width: 24, height: 24 }} alt="save" />
          </IconButton>
          <IconButton
            onClick={() => {
              setShowInput(false);
              setNewObjective('');
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
      {(objectives[goalId] || []).map((objective) => (
        <FormControlLabel
          key={objective.id}
          control={
            <TearmentPlanCheckBox
              checked={(selectedObjectives[goalId] || []).some(
                (o) => o.id === objective.id
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedObjectives((prev) => ({
                    ...prev,
                    [goalId]: [...(prev[goalId] || []), objective],
                  }));
                } else {
                  setSelectedObjectives((prev) => ({
                    ...prev,
                    [goalId]: (prev[goalId] || []).filter(
                      (o) => o.id !== objective.id
                    ),
                  }));
                }
              }}
            />
          }
          label={objective.name}
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

const Objectives = ({ defaultData, label }) => {
  const {
    selectedGoals,
    setActiveStep,
    setSelectedObjectives,
    selectedObjectives,
    objectives,
  } = useTreatmentPlan();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSelectedObjectives({});
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
          {Object.entries(selectedGoals).map(([behaviorId, goalIds]) =>
            goalIds.map((goalId) => (
              <Objective
                goalId={goalId.id}
                behaviorId={behaviorId}
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
            disabled={isEmpty(selectedObjectives) || isEmpty(objectives)}
          />
        </CardActions>
      </Box>
    </>
  );
};
export default Objectives;
