/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Card, Typography, Button, Link } from '@mui/material';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import TableTextRendrer from 'src/components/TableTextRendrer';

export const MedicationCard = ({ patientData }) => {
  const params = useParams();
  const navigate = useNavigate();
  const onAllClick = () => {
    navigate(
      generatePath(UI_ROUTES.patientMedication, {
        ...params,
      })
    );
  };
  const onCreateClick = () => {
    navigate(
      generatePath(UI_ROUTES.addPatientMedication, {
        ...params,
      })
    );
  };
  const onSingleMedicationClick = (medicationId) => {
    navigate(
      generatePath(UI_ROUTES.editPatientMedication, {
        ...params,
        medicationId:encrypt(String(medicationId))
      })
    );
  };
  return (
    <Card
      style={{
        border: '1px solid #E8E8E8',
        margin: '1em 2em',
        padding: '1em 0.5em',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 1em',
          }}
        >
          <Typography
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '20px',
              color: palette.text.dark,
            }}
          >
            Medications
          </Typography>
          <Button variant="contained" color="primary" onClick={onCreateClick}>
            Add
          </Button>
        </div>
        <div
          style={{
            paddingLeft: '0.5em',
            overflowY: 'auto',
            maxHeight: '200px',
          }}
        >
          {patientData?.medications?.map((medication, index) => (
            <Button
            onClick={()=>onSingleMedicationClick(medication.id)}
              key={index}
              variant="outlined"
              color="primary"
              style={{
                color: palette.text.offWhite,
                margin: '8px',
                borderColor: ' #E8E8E8',
                fontWeight: 100,
              }}
            >
             <TableTextRendrer style={{maxWidth:'17rem',fontSize:14}}> {medication?.items?.map(item=>`${item?.genericDrug} (${item?.brandNameDrug})`).join(', ') || 'N/A'}</TableTextRendrer>
            </Button>
          ))}
          <Link
            onClick={onAllClick}
            style={{
              color: palette.background.main,
              margin: '8px',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '20px',
              cursor: 'pointer',
            }}
          >
            View all
          </Link>
        </div>
      </div>
    </Card>
  );
};
