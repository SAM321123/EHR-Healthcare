/* eslint-disable no-unused-vars */

import { Route, Routes } from 'react-router-dom';
import AddPatient from './AddPatient';
import PatientSummary from './PatientSummary';
import AllergiesList from './components/Allergies';
import PatientAppointmentList from './components/Appointment';
import DiagnosisList from './components/Diagnosis';
import DocumentsList from './components/Documents';
import EmergencyContact from './components/Emergency';
import FormTabsPatient from './components/Form/PatientFormsTabs';
import Insurance from './components/Insurance';
import VitalsList from './components/Vitals';
import HistoryContainer from './components/history';
import PatientList from './patientList';
import PatientLabRadiology from './components/LabRadiology';
import MedicationFormNew from './components/Medication/medicationFormNew';
import EncountersList from './components/Encounters';
import CreateEncounters from './components/Encounters/createEncounters';
import TreatmentPlanLists from './components/TreatmentPlan';
import LabRadiologyResultList from '../../pages/LabRadiology/labReport';
import LabRequest from '../../pages/LabRadiology/labRequest';
import PatientEMAR from './components/Medication/emar';
import MedicationSchedule from './components/Medication/medicationSchedule';
import Medication from './components/Medication';
import EligibilityCheckHistory from './components/EligibilityCheckHistory';
import HomeworkList from './components/Homework';

const Patient = () => (
  <Routes>
    <Route path="/" element={<PatientList />} />
    <Route path="/add/demographic" element={<AddPatient />} />
    <Route path="detail/:patientId/summary" element={<PatientSummary />} />
    <Route path="detail/:patientId/allergies" element={<AllergiesList />} />
    <Route path="detail/:patientId/documents" element={<DocumentsList />} />
    <Route path="/detail/:patientId/treatment-plan" element={<TreatmentPlanLists />} />

    <Route path="detail/:patientId/diagnosis" element={<DiagnosisList />} />
    <Route path="detail/:patientId/insurance" element={<Insurance />} />
    <Route
      path="detail/:patientId/patient-history"
      element={<HistoryContainer />}
    />
    <Route
      path="detail/:patientId/emergency-contact"
      element={<EmergencyContact />}
    />
    <Route path="detail/:patientId/vitals" element={<VitalsList />} />
    <Route path="detail/:patientId/demographic/edit" element={<AddPatient />} />
    <Route
      path="detail/:patientId/appointments"
      element={<PatientAppointmentList />}
    />
    <Route path="detail/:patientId/medications" element={<Medication />} />
    <Route path="detail/:patientId/medications/create" element={<MedicationFormNew />} />
    <Route path="detail/:patientId/medications/edit/:medicationId" element={<MedicationFormNew />} />
    <Route path="detail/:patientId/medications/emar/:medicationId?" element={<PatientEMAR />} />
    <Route path="detail/:patientId/medications/medicationSchedule/:medicationId?" element={<MedicationSchedule />} />




    <Route path="detail/:patientId/lab-orders" element={<PatientLabRadiology />} /> 
    <Route path="detail/:patientId/lab-orders/lab-report/:labRadiologyId" element={<LabRadiologyResultList />} /> 
    <Route path="detail/:patientId/lab-orders/lab-request/:labRadiologyId" element={<LabRequest />} /> 
    <Route path="detail/:patientId/forms/:subTabName?/*" element={<FormTabsPatient />} />

    <Route path="detail/:patientId/encounters" element={<EncountersList />} />
    <Route path="detail/:patientId/encounters/create" element={<CreateEncounters />} />
    <Route path="detail/:patientId/encounters/edit/:encounterId" element={<CreateEncounters />} />

    <Route path="detail/:patientId/eligibility-check-history" element={<EligibilityCheckHistory />} />
    <Route path="detail/:patientId/homework" element={<HomeworkList />} />

  </Routes>
);

export default Patient;
