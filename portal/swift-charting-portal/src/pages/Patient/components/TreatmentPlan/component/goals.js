import React, { useEffect, useState } from 'react';
import { useTreatmentPlan } from '../treatmentPlanContext';
import {
  Typography,
  Box,
  FormControlLabel,
  CardContent,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { BEHAVIOR_GOAL } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CardActions from '@mui/material/CardActions';
import { isEmpty } from 'lodash';
import { v4 } from 'uuid';
import palette from 'src/theme/palette';
import deleteIcon from 'src/assets/images/deleteIcon.png';
import saveIcon from 'src/assets/images/saveIcon.png';
import TearmentPlanCheckBox from './tearmentPlanCheckBox';
import Container from 'src/components/Container';

const Goal = ({ behaviorId, problemId, defaultData, label }) => {
  const {
    selectedProblems,
    behaviors,
    goals,
    selectedGoals,
    setSelectedGoals,
    setGoals,
    problems,
    selectedDiagnosis,
  } = useTreatmentPlan();
  const [showInput, setShowInput] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const [response, ,loading , callGoalListAPI, clear] = useCRUD({
    id: `${BEHAVIOR_GOAL}_${behaviorId}`,
    url: API_URL.behaviorGoal,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (
      behaviorId &&
      !(typeof behaviorId === 'string' && behaviorId.startsWith('new_')) &&
      isEmpty(goals[behaviorId])
    ) {
      callGoalListAPI({ behaviorId: behaviorId, limit: 100 });
    }
  }, [behaviorId]);
  useEffect(() => {
    if (response) {
      setGoals((prev) => ({ ...prev, [behaviorId]: response?.results }));
      clear(true);
    }
  }, [response]);
  useEffect(() => {
    if (defaultData && defaultData.diag) {
      // Initialize selected goals based on defaultData
      const initialSelectedGoals = {};
      defaultData.diag.forEach((d) => {
        d.prob.forEach((p) => {
          p.beha.forEach((b) => {
            b.goals.forEach((g) => {
              const goalId = g.BGId;
              const selectedBehaviorId = g.BGId.behaviorId;
              if (behaviorId === selectedBehaviorId) {
                initialSelectedGoals[selectedBehaviorId] = [
                  ...(initialSelectedGoals[selectedBehaviorId] || []),
                  goalId,
                ];
              }
            });
          });
        });
      });

      setSelectedGoals((prev) => ({
        ...prev,
        ...initialSelectedGoals,
      }));
    }
  }, [setSelectedGoals]);
  const handleAddGoal = () => {
    if (newGoal.trim() !== '') {
      const newGoalObject = {
        id: `new_${v4()}`,
        name: newGoal,
        behaviorId: behaviorId,
      };
      setGoals((prev) => ({
        ...prev,
        [behaviorId]: [...(prev[behaviorId] || []), newGoalObject],
      }));
      setSelectedGoals((prev) => ({
        ...prev,
        [behaviorId]: [...(prev[behaviorId] || []), newGoalObject],
      }));
      setNewGoal('');
      setShowInput(false);
    }
  };
  const diagnosisId = Object.keys(selectedProblems).find((key) =>
    selectedProblems[key].some((item) => item.id == problemId)
  );
  const problem = problems[diagnosisId]?.find((b) => b.id == problemId)?.name;
  const diagnosis = selectedDiagnosis?.find((b) => b.id == diagnosisId);


  const problemLabel = label?.find((data) => data?.code === "problems")?.name || "";
  const behaviorLabel = label?.find((data) => data?.code === "behaviors")?.name || "";
  const goalLabel = label?.find((data) => data?.code === "goals")?.name || "";
  
  return (
    <Box
      key={behaviorId}
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
        <strong>  {problemLabel}:</strong>
        {problem}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>  {behaviorLabel}:</strong>
        {behaviors[problemId]?.find((b) => b.id == behaviorId)?.name}
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: '18px' }}>
          {goalLabel}
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
            checked={newGoal.trim() !== ''}
            onChange={(e) => setNewGoal(e.target.checked ? newGoal : '')}
          />
          <TextField
            placeholder={`Add new ${goalLabel} here`}
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            size="small"
            style={{ marginRight: '10px', width: '100%' }}
          />
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleAddGoal}
            disabled={newGoal.trim() === ''}
          >
            <img src={saveIcon} style={{ width: 24, height: 24 }} alt="save" />
          </IconButton>
          <IconButton
            onClick={() => {
              setShowInput(false);
              setNewGoal('');
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
      {(goals[behaviorId] || []).map((goal) => (
        <FormControlLabel
          key={goal.id}
          control={
            <TearmentPlanCheckBox
              checked={(selectedGoals[behaviorId] || []).some(
                (g) => g.id === goal.id
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedGoals((prev) => ({
                    ...prev,
                    [behaviorId]: [...(prev[behaviorId] || []), goal],
                  }));
                } else {
                  setSelectedGoals((prev) => ({
                    ...prev,
                    [behaviorId]: (prev[behaviorId] || []).filter(
                      (g) => g.id !== goal.id
                    ),
                  }));
                }
              }}
            />
          }
          label={goal.name}
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

const Goals = ({ defaultData, label }) => {
  const { selectedBehaviors, setActiveStep, setSelectedGoals, selectedGoals , goals} =
  useTreatmentPlan();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSelectedGoals({});
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
          {Object.entries(selectedBehaviors).map(([problemId, behaviorIds]) =>
            behaviorIds.map((behaviorId) => (
              <Goal
                behaviorId={behaviorId.id}
                problemId={problemId}
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
            paddingLeft: '24px',
            paddingRight: '24px',
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
            disabled={isEmpty(selectedGoals)|| isEmpty(goals)}
          />
        </CardActions>
      </Box>
    </>
  );
};
export default Goals;
