import React from 'react';
import { Typography, Button } from '@mui/material';
import palette from 'src/theme/palette';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';

const ItemList = ({ title, items, patientId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const onClick = () => {
    navigate(
      generatePath(UI_ROUTES.patientDiagnosis, {
        ...params,
        patientId: encrypt(String(patientId)),
      })
    );
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '0 1em',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '20px',
            color: palette.text.dark,
          }}
        >
          {title}
        </Typography>
        <Button variant="contained" onClick={onClick}>
          Add
        </Button>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
        <ul
          style={{
            paddingLeft: '0',
            margin: '0.5em 2em',
            listStyleType: 'disc',
            columns: '150px 2',
          }}
        >
          {items?.map((item, index) => (
            <li
              key={index}
              style={{
                color: palette.text.offWhite,
                fontSize: 14,
                lineHeight: '20px',
                fontWeight: 400,
                padding: '0.5em 0',
              }}
            >
              {item?.ICD?.name}
              {item?.ICD?.description? ` (${item.ICD?.description})`:'' }
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ProblemsCard = ({ patientData }) => {
  return (
    <ItemList
      title="Diagnosis"
      items={patientData?.problems}
      patientId={patientData?.id}
    />
  );
};

export default ProblemsCard;
