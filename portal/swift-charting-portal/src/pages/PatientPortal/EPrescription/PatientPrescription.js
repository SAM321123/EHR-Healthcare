import React, { useEffect } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';

import useCRUD from 'src/hooks/useCRUD';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageHeader from 'src/components/PageHeader';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { List, ListItem, ListItemText } from '@mui/material';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import Chip from 'src/components/Chip';
import { medicineDuration, medicineFrequency } from 'src/lib/utils';

const getMedicineDetails = (item) => {
  if (!item) return 'No Record Found';
  const {
    medicine,
    unit,
    amount,
    frequency,
    duration,
    durationUnit: durationValue,
    note,
    medicineStatus,
    label,
  } = item || {};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {label ? (
          <Typography
            sx={{
              ml: 1,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: palette.grey[800],
            }}
          >
            {label} :
          </Typography>
        ) : null}

        <Typography
          sx={{ ml: 1, fontSize: '0.8rem', color: palette.grey[800] }}
        >
          {medicine?.name} {amount} {unit} {medicineFrequency(frequency)} for{' '}
          {medicineDuration(duration, durationValue)}
        </Typography>
        {medicineStatus ? <Chip label={medicineStatus} size="small" /> : null}
      </div>
      <Typography
        sx={{
          ml: 2,
          fontSize: '0.8rem',
          color: palette.grey[600],
        }}
      >
        {note}
      </Typography>
    </div>
  );
};

const PatientPrescription = ({ onPressBackIcon, prescriptionId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const patientPrescriptionId = params?.prescriptionId || prescriptionId;

  const [apiResponse, , , callAPI] = useCRUD({
    id: `patient-prescription-${prescriptionId}`,
    type: REQUEST_METHOD.get,
    url: `${API_URL.patientPrescription}/${patientPrescriptionId}`,
  });

  useEffect(() => {
    if (!isEmpty(patientPrescriptionId)) callAPI();
  }, [patientPrescriptionId]);

  return (
    <>
      {!prescriptionId && (
        <PageHeader
          showBackIcon
          title="Med Instruction Detail"
          onPressBackIcon={
            isFunction(onPressBackIcon)
              ? onPressBackIcon
              : () => navigate(generatePath(UI_ROUTES.prescription))
          }
        />
      )}
      <List sx={{ p: 0 }} component="nav" aria-label="main mailbox folders">
        {apiResponse?.lastApprovedItem?.map((item, index) => (
          <ListItem sx={{ p: 0 }} key={index}>
            <ListItemText primary={getMedicineDetails(item)} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default PatientPrescription;
