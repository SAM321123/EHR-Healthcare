import React from 'react';
import { useTemplate } from '../templateContext';
import { Typography, CardContent, Box } from '@mui/material';
import palette from 'src/theme/palette';

const SingleSummary = ({ objectiveId, goalId, label }) => {
  const {
    objectives,
    interventions,
    selectedBehaviors,
    selectedProblems,
    goals,
    selectedGoals,
    selectedInterventions,
    behaviors,
    problems,
    selectedDiagnosis,
  } = useTemplate();

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
      {(selectedInterventions[objectiveId] || []).map((intervention) => (
        <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}>
          <strong>{interventionLabel}:</strong>
          {interventions[objectiveId]?.find((o) => o.id === intervention.id)?.name}
        </Typography>
      ))}
    </Box>
  );
};
const TreatmentPlanSummary = ({label}) => {
  const { selectedObjectives } = useTemplate();
  console.log("🚀 ~ TreatmentPlanSummary ~ selectedObjectives:", selectedObjectives)

  return (
    <div style={{ margin: '10px', overflowY: 'auto', maxHeight: '400px' }}>
      <CardContent style={{ padding: '12px' }}>
        {Object.entries(selectedObjectives).map(([goalId, objectiveIds]) =>
          objectiveIds.map((objectiveId) => (
            <SingleSummary goalId={goalId} objectiveId={objectiveId.id} label={label} />
          ))
        )}
      </CardContent>
    </div>
  );
};
export default TreatmentPlanSummary;
