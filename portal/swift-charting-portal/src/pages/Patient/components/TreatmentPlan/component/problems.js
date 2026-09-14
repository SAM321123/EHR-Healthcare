import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  TextField,
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
import { ICD_PROBLEM } from 'src/store/types';
import palette from 'src/theme/palette';
import { v4 } from 'uuid';
import { useTreatmentPlan } from '../treatmentPlanContext';
import TearmentPlanCheckBox from './tearmentPlanCheckBox';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';

const Problem = ({ diagnosis, defaultData, label }) => {
  const { problems, setProblems, selectedProblems, setSelectedProblems } =
    useTreatmentPlan();
  const [response, , loading, callProblemListSaveAPI, clear] = useCRUD({
    id: `${ICD_PROBLEM}_${diagnosis.id}`,
    url: API_URL.icdProblem,
    type: REQUEST_METHOD.get,
  });

  const [showInput, setShowInput] = useState(false);
  const [newProblem, setNewProblem] = useState('');

  useEffect(() => {
    if (isEmpty(problems[diagnosis.id])) {
      callProblemListSaveAPI({ icdId: diagnosis.id, limit: 100 });
    }
  }, [diagnosis]);

  useEffect(() => {
    if (response) {
      setProblems((prev) => ({ ...prev, [diagnosis.id]: response?.results }));
      clear(true);
    }
  }, [response]);

  useEffect(() => {
    if (defaultData && defaultData.diag) {
      const initialSelectedProblems = {};
      defaultData.diag.forEach((d) => {
        if (diagnosis.id === d.ICDId.id) {
          initialSelectedProblems[d.ICDId.id] = d.prob.map((p) => p.IPId);
        }
      });
      setSelectedProblems((prev) => ({
        ...prev,
        ...initialSelectedProblems,
      }));
    }
  }, [setSelectedProblems]);

  const handleAddProblem = () => {
    if (newProblem.trim() !== '') {
      const newProblemObject = {
        id: `new_${v4()}`,
        name: newProblem,
        icdId: diagnosis.id,
      };
      setProblems((prev) => ({
        ...prev,
        [diagnosis.id]: [...(prev[diagnosis.id] || []), newProblemObject],
      }));
      setSelectedProblems((prev) => ({
        ...prev,
        [diagnosis.id]: [...(prev[diagnosis.id] || []), newProblemObject],
      }));
      setNewProblem('');
      setShowInput(false);
    }
  };

  const problemLabel = label?.find((data) => data?.code === "problems")?.name || "";

  return (
    <Box
      key={diagnosis.id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '10px 0px',
        padding: '5px 0px',
        borderBottom: `1px dashed ${palette.border.main}`,
      }}
    >
      <Container loading={loading}>
        <CardContent style={{ padding: '12px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
            >
              <strong>Diagnosis: </strong>
              {diagnosis?.name}
              {diagnosis?.description ? ` (${diagnosis.description})` : ''}{' '}
            </Typography>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '10px',
              }}
            >
              <Typography
                sx={{ fontSize: 12, fontWeight: 900, lineHeight: '18px' }}
              >
                {problemLabel}
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
                  checked={newProblem.trim() !== ''}
                  onChange={(e) =>
                    setNewProblem(e.target.checked ? newProblem : '')
                  }
                />
                <TextField
                  placeholder={`Add new ${problemLabel} here`}
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  size="small"
                  style={{ marginRight: '10px', width: '100%' }}
                />
                <IconButton
                  variant="contained"
                  color="primary"
                  onClick={handleAddProblem}
                  disabled={newProblem.trim() === ''}
                >
                  <img
                    src={saveIcon}
                    style={{ width: 24, height: 24 }}
                    alt="save"
                  />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setShowInput(false);
                    setNewProblem('');
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
            {(problems[diagnosis.id] || []).map((problem) => (
              <FormControlLabel
                key={problem?.id}
                control={
                  <TearmentPlanCheckBox
                    checked={(selectedProblems[diagnosis.id] || []).some(
                      (p) => p?.id === problem?.id
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProblems((prev) => ({
                          ...prev,
                          [diagnosis.id]: [
                            ...(prev[diagnosis.id] || []),
                            problem,
                          ],
                        }));
                      } else {
                        setSelectedProblems((prev) => ({
                          ...prev,
                          [diagnosis.id]: (prev[diagnosis.id] || []).filter(
                            (b) => b.id !== problem.id
                          ),
                        }));
                      }
                    }}
                  />
                }
                label={problem?.name}
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
          </div>
        </CardContent>
      </Container>
    </Box>
  );
};

const Problems = ({ defaultData, label }) => {
  const {
    selectedDiagnosis,
    setActiveStep,
    selectedProblems,
    setSelectedProblems,
    problems,
  } = useTreatmentPlan();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setSelectedProblems({});
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
          {selectedDiagnosis.map((diagnosis) => (
            <Problem
              key={diagnosis.id}
              diagnosis={diagnosis}
              defaultData={defaultData}
              label={label}
            />
          ))}
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
            disabled={isEmpty(selectedProblems) || isEmpty(problems)}
          />
        </CardActions>
      </Box>
    </>
  );
};
export default Problems;
