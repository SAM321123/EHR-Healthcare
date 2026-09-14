import React, { useEffect, useState } from 'react';
import { useTemplate} from '../templateContext';
import {
  Box,
  FormControlLabel,
  CardContent,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import useCRUD from 'src/hooks/useCRUD';
import { PROBLEM_BEHAVIOR } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CardActions from '@mui/material/CardActions';
import { isEmpty } from 'lodash';
import { v4 } from 'uuid';
import palette from 'src/theme/palette';
import saveIcon from 'src/assets/images/saveIcon.png';
import deleteIcon from 'src/assets/images/deleteIcon.png';
import TearmentPlanCheckBox from './tearmentPlanCheckBox';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';


const Behavior = ({ problemId, diagnosisId, defaultData, label }) => {
  const {behaviors,selectedBehaviors, setSelectedBehaviors,setBehaviors,problems,selectedDiagnosis} = useTemplate();
  const [showInput, setShowInput] = useState(false);
  const [newBehavior, setNewBehavior] = useState('');

  const [response, ,loading , callBehaviorListAPI, clear] = useCRUD({
    id: `${PROBLEM_BEHAVIOR}_${problemId}`,
    url: API_URL.problemBehavior,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (
      problemId &&
      !(typeof problemId === 'string' && problemId.startsWith('new_')) &&
      isEmpty(behaviors[problemId])
    ) {
      callBehaviorListAPI({ problemId: problemId, limit: 100 });
    }
  }, [problemId]);
  useEffect(() => {
    if (response) {
      setBehaviors((prev) => ({ ...prev, [problemId]: response?.results }));
      clear(true);
    }
  }, [response]);
  useEffect(() => {
    if (defaultData && defaultData.diag) {
      // Initialize selected behaviors based on defaultData
      const initialSelectedBehaviors = {};
      defaultData.diag.forEach((d) => {
        d.prob.forEach((p) => {
          p.beha.forEach((b) => {
            const behaviorId = b.PBId;
            const selectedProblemId = b.PBId.problemId;
            if (problemId === selectedProblemId) {
              initialSelectedBehaviors[selectedProblemId] = [
                ...(initialSelectedBehaviors[selectedProblemId] || []),
                behaviorId,
              ];
            }
          });
        });
      });
      setSelectedBehaviors((prev) => ({
        ...prev,
        ...initialSelectedBehaviors,
      }));
    }
  }, [setSelectedBehaviors]);

  const handleAddBehavior = () => {
    if (newBehavior.trim() !== '') {
      const newBehaviorObject = {
        id: `new_${v4()}`,
        name: newBehavior,
        problemId: problemId,
      };
      setBehaviors((prev) => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []), newBehaviorObject],
      }));
      setSelectedBehaviors((prev) => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []), newBehaviorObject],
      }));
      setNewBehavior('');
      setShowInput(false);
    }
  };
  const diagnosis = selectedDiagnosis?.find((b) => b.id == diagnosisId);

  const problemLabel = label?.find((data) => data?.code === "problems")?.name || "";
  const behaviorLabel = label?.find((data) => data?.code === "behaviors")?.name || "";

  return (
    <Box
      key={problemId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 0px',
        padding: '5px 0px',
        borderBottom: `1px dashed ${palette.border.main}`,
      }}
    >
      <Container loading={loading} >
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>Diagnosis: </strong>
        {diagnosis?.name}
        {diagnosis?.description ? ` (${diagnosis.description})` : ''}{' '}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
        <strong>{problemLabel}: </strong>
        {problems[diagnosisId]?.find((b) => b.id == problemId)?.name}
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: '18px' }}>
          {behaviorLabel}
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
            checked={newBehavior.trim() !== ''}
            onChange={(e) =>
              setNewBehavior(e.target.checked ? newBehavior : '')
            }
          />
          <TextField
            placeholder={`Add new ${behaviorLabel} here`}
            value={newBehavior}
            onChange={(e) => setNewBehavior(e.target.value)}
            size="small"
            style={{ marginRight: '10px' ,width: '100%'}}
          />
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleAddBehavior}
            disabled={newBehavior.trim() === ''}
            sx={{ opacity: newBehavior.trim() === '' ? 0.7 : 1 }}
          >
            <img src={saveIcon} style={{ width: 24, height: 24 }} alt="save" />
          </IconButton>
          <IconButton
            onClick={() => {
              setShowInput(false);
              setNewBehavior('');
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
      {(behaviors[problemId] || []).map((behavior) => (
        <FormControlLabel
          key={behavior.id}
          control={
            <TearmentPlanCheckBox
              checked={(selectedBehaviors[problemId] || []).some(
                (b) => b.id === behavior.id
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedBehaviors((prev) => ({
                    ...prev,
                    [problemId]: [...(prev[problemId] || []), behavior],
                  }));
                } else {
                  setSelectedBehaviors((prev) => ({
                    ...prev,
                    [problemId]: (prev[problemId] || []).filter(
                      (b) => b.id !== behavior.id
                    ),
                  }));
                }
              }}
            />
          }
          label={behavior.name}
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

const Behaviors = ({ defaultData, label }) => {
  const {
    selectedProblems,
    setActiveStep,
    setSelectedBehaviors,
    selectedBehaviors,
    behaviors,
  } = useTemplate();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSelectedBehaviors({});
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
          {Object.entries(selectedProblems).map(([diagnosisId, problemIds]) =>
            problemIds.map((problemId) => (
              <Behavior
                problemId={problemId.id}
                diagnosisId={diagnosisId}
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
            disabled={isEmpty(selectedBehaviors) || isEmpty(behaviors)}
          />
        </CardActions>
      </Box>
    </>
  );
};

export default Behaviors;
