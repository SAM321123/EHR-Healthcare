import React from 'react';
import { Typography, CardContent, Box } from '@mui/material';
import palette from 'src/theme/palette';

const ViewTemplate = ({ data }) => {
  return (
    <CardContent style={{ padding: '12px' }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '10px 0px',
          padding: '10px 0px',
          borderBottom: `1px dashed ${palette.border.main}`,
        }}
      >
        {data.diag.map((diagnosis) => (
          <div key={diagnosis.id}>
            <Typography
              sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
            >
              <strong>Diagnosis: </strong>
              {diagnosis?.ICDId?.name}
              {diagnosis?.ICDId?.description
                ? ` (${diagnosis.ICDId.description})`
                : ''}
            </Typography>

            {diagnosis.prob.map((problem) => (
              <div key={problem.id}>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
                >
                  <strong>Problem: </strong>
                  {problem.IPId.name}
                </Typography>
                {problem.beha.map((behavior) => (
                  <div key={behavior.id}>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 400, lineHeight: '18px' }}
                    >
                      <strong>Behavior: </strong>
                      {behavior.PBId.name}
                    </Typography>

                    {behavior.goals.map((goal) => (
                      <div key={goal.id}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 400,
                            lineHeight: '18px',
                          }}
                        >
                          <strong>Goal: </strong>
                          {goal.BGId.name}
                        </Typography>

                        {goal.obj.map((objective) => (
                          <div key={objective.id}>
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 400,
                                lineHeight: '18px',
                              }}
                            >
                              <strong>Objective: </strong>
                              {objective.GOId.name}{' '}
                            </Typography>
                            {objective.inter.map((intervention) => (
                              <div key={intervention.id}>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                  }}
                                >
                                  <strong>Intervention:</strong>
                                  {intervention.OIId.name}{' '}
                                </Typography>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </Box>
    </CardContent>
  );
};

export default ViewTemplate;
