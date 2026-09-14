import React from 'react';
import Container from 'src/components/Container';
import { Grid, Card, Divider } from '@mui/material';
import { PatientInfoCard } from './components/PatientInfoCard';
import { MedicationCard } from './components/MedicationCard';
import { CheckEligibility } from './components/CheckEligibility';
import AllergiesCard from './components/AllergiesCard';
import ProblemsCard from './components/ProblemsCard';
import MedicalBillsTable from './components/MedicalBill';
import LabsTable from './components/LabsTable';
import LabStudiesCard from './components/LabsStudies';
import ActiveEncounterCard from './components/OpenActiveEncounter';
import { AppointmentsSection } from './components/AppointmentsSection';
import { HistorySection } from './components/HistorySection';
import { MedicalHistory } from './components/MedicalHistory';
import { Recommendations } from './components/Recommendations';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import useAuthUser from 'src/hooks/useAuthUser';
import { getUserRole } from 'src/lib/utils';
import { roleTypes } from 'src/lib/constants';

const PatientSummary = () => {
  let { patientId } = useParams();
  patientId = decrypt(patientId);

  const [user, , , , , validateToken, userData] = useAuthUser();
  const permissions = userData?.permission;
  let { 
    appointment, 
    medical_history,
    insurance,
    patient,
    diagnosis,
    allergies,
    patientmedication,
    labRadiology,
  } = permissions || {}

  const userRole = getUserRole()
  
  if(userRole === roleTypes.superAdmin || userRole === roleTypes.clinicAdmin){
    appointment = true 
    medical_history = true
    insurance=true
    patient=true
    diagnosis=true
    allergies=true
    patientmedication=true
    labRadiology=true
  }
  
  const [patientData, loading] = usePatientDetail({ patientId,forceRefetch:true });
  return (
    <Container loading={loading}>
      <Grid container>
        <Grid item xs={12} md={9}>
          <PatientInfoCard patientData={patientData} />
          {(patient && patientData?.insurance?.length) ? <CheckEligibility patientId={patientId} /> : ''}
          {patientmedication && <MedicationCard patientData={patientData} />}
          <Grid container style={{ padding: '3px 0px' }}>
            <Grid item xs={12} md={6}>
              <Card
                style={{
                  border: '1px solid #E8E8E8',
                  margin: '1em 2em',
                  padding: '1em 0.5em',
                }}
              >
                <div>
                  {diagnosis && <ProblemsCard patientData={patientData} />}
                  <Divider style={{ margin: '16px 0' }} />
                  {allergies && <AllergiesCard patientData={patientData} />}
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {labRadiology && <LabStudiesCard labsRadiologies={patientData?.labsRadiologies} />}
                <ActiveEncounterCard patientData={patientData}  />
              </div>
            </Grid>
          </Grid>
          {labRadiology && <LabsTable labsRadiologies={patientData?.labsRadiologies} />}
          <MedicalBillsTable medicalBillingData={patientData?.encounters} />
        </Grid>
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            borderLeft: { md: 'solid 1px #0000001A' },
            margin: { xs: '0 2em', md: '1em 0' },
            padding: { xs: '0 0.5em', md: '0 1em' },
          }}
        >
          {appointment &&<AppointmentsSection patientData={patientData} />}
          <Divider style={{ margin: '16px 0' }} />
          <HistorySection patientData={patientData} />
          <Divider style={{ margin: '16px 0' }} />
          <MedicalHistory patientData={patientData} />
          <Divider style={{ margin: '16px 0' }} />
          <Recommendations />
        </Grid>
      </Grid>
    </Container>
  );
};
export default PatientSummary;
