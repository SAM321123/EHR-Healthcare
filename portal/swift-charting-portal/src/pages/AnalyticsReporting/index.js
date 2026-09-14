// import React from 'react';
// import PatientDemographicReport from './PatientsDemographicReport';
// import PatientReports from './PatientReport';
// import { Container, Grid } from '@mui/material';
// import MedicationReport from './PatientReport/medicationReport';
// import DiagnosisReport from './PatientReport/diagnosisReport';
// import AppointmentReport from './PatientReport/appointmentReport';
// import RevenueReport from './PatientReport/revenueReport';
// import PatientSatisfactionSurveyReport from './PatientReport/patientSatisfactionSurveyReport';
// import ChronicDiseaseManagementReport from './PatientReport/chronicDiseaseManagementReport';
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
// import LabReport from './PatientReport/labReport';

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const AnalyticsReporting = () => {

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4 }}>
//       {/* First Row */}
//       <Grid container spacing={4}>
//         <Grid item xs={12} sm={6} md={4}>
//           <div>
//             <PatientReports />
//           </div>
//         </Grid>
//         <Grid item xs={12} sm={18} md={8}>
//           <div>
//             <PatientDemographicReport />
//           </div>
//         </Grid>
//       </Grid>

//       {/* Second Row */}
//       <Grid container spacing={4} sx={{ mt: 4 }}>
//         <Grid item xs={12}>
//         <div style={{backgroundColor: "", height: '300px'}}>
//             <MedicationReport />
//           </div>
//         </Grid>
//       </Grid>

//       {/* Third Row */}
//       <Grid container spacing={4} sx={{ mt: 4 }}>
//         <Grid item xs={12} sm={12} md={6}>
//           <div>
//             <DiagnosisReport />
//           </div>
//         </Grid>
//         <Grid item xs={12} sm={12} md={6}>
//           <div>
//             <AppointmentReport />
//           </div>
//         </Grid>
//       </Grid>

//       {/* Fourth Row - For Reports with Spacing */}
//       <Grid container spacing={4} sx={{ mt: 4 }}>
//         <Grid item xs={12} sm={4}>
//           <div style={{backgroundColor: "", height: '400px', padding: '50px'}}>
//             <RevenueReport />
//           </div>
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <div style={{backgroundColor: "", height: '400px',padding: '50px'}}>
//             <PatientSatisfactionSurveyReport />
//           </div>
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <div style={{backgroundColor: "", height: '400px', padding: '50px'}}>
//             <ChronicDiseaseManagementReport />
//           </div>
//         </Grid>
//       </Grid>

//       {/* Second Row */}
//       <Grid container spacing={4} sx={{ mt: 12 }}>
//         <Grid item xs={12}>
//         <div style={{backgroundColor: "", height: '300px'}}>
//           <LabReport />
//         </div>
//         </Grid>
//       </Grid>

//     </Container>
//   );
// };

// export default AnalyticsReporting;


import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import palette from 'src/theme/palette';
import { tabsStyling } from 'src/lib/constants';
import Tabs from 'src/components/Tabs';
import { UI_ROUTES } from 'src/lib/routeConstants';
// import PatientDemographicReport from './PatientsDemographicReport';
// import PatientReports from './PatientReport';
// import { Container, Grid } from '@mui/material';
import MedicationReport from './PatientReport/medicationReport';
// import DiagnosisReport from './PatientReport/diagnosisReport';
import PatientReportInfo from './PatientReport/patientReportInfo';
// import AppointmentReport from './PatientReport/appointmentReport';
import LabReport from './PatientReport/labReport';
import ChronicDieaseManagementReport from './PatientReport/chronicDiseaseManagementReport';
import RevenueReport from './PatientReport/revenueReport';
import AppointmentListReport from './PatientReport/appointmentListReport';
import MedicalBillingReport from './MedicalBillingReport';



const useStyles = makeStyles({
  root: {
    ...tabsStyling.root,
    backgroundColor: palette.background.offWhite,
  },
  selected: {
    ...tabsStyling.selected,
    backgroundColor: palette.grey[0],
    borderRadius: '8px 8px 0 0',
    boxShadow: `0px 5px 9px 0px ${palette.grey[400]}`,
  },
});

const tabIndicatorProps = {
  display: 'none',
};

const data = [
  {
    label: 'Patient Report',
    component: PatientReportInfo,
    componentProps: {
      type: 'global',
    },
  },
  {
    label: 'Medication Report',
    component: MedicationReport,
    componentProps: {
      type: 'labTest',
    },
  },
  {
    label: 'Appointment Report',
    component: AppointmentListReport,
    componentProps: {
      type: 'testingLab',
    },
  },
  {
    label: 'Lab Report',
    component: LabReport,
    componentProps: {
      type: 'billingCode',
    },
  },
  {
    label: 'Medical Billing Report',
    component: MedicalBillingReport,
  },

  // {
  //   label: 'Chronic Disease Management',
  //   component: ChronicDieaseManagementReport,
  //   componentProps: {
  //     type: 'chronic',
  //   },
  // },
  // {
  //   label: 'Revenue Cycle Management',
  //   component: RevenueReport,
  //   componentProps: {
  //     type: 'roles',
  //   },
  // },
];

const AnalyticsReporting= () => {
  const tabClasses = useStyles();

  return (
    <Tabs
      data={data}
      tabClasses={tabClasses}
      tabIndicatorProps={tabIndicatorProps}
      tabPanelStyle={{ padding: 0, paddingTop: '2px' }}
      path={UI_ROUTES.systemSettingsTab}
    />
  );
};

export default AnalyticsReporting;
