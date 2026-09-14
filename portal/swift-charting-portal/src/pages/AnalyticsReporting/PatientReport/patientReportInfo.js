// import React from 'react';
// import PatientDemographicReport from '../PatientsDemographicReport';
// import PatientReports from '../PatientReport';
// import { Container, Grid } from '@mui/material';
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
// import PatientSatisfactionSurveyReport from './patientSatisfactionSurveyReport';
// import DiagnosisReport from './diagnosisReport';

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const PatientReportInfo = () => {

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
//       <Grid container spacing={4}>
//         <Grid item xs={12} sm={6} md={4}>
//           <div>
//             <PatientSatisfactionSurveyReport />
//           </div>
//         </Grid>
//         <Grid item xs={12} sm={18} md={8}>
//           <div>
//             <DiagnosisReport />
//           </div>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default PatientReportInfo;

import React, { useEffect } from 'react';
import PatientDemographicReport from '../PatientsDemographicReport';
import { Grid, Box } from '@mui/material';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import PatientSatisfactionSurveyReport from './patientSatisfactionSurveyReport';
import DiagnosisReport from './diagnosisReport';
import EncounterReport from './encounterReport';
import { GET_PRACTITIONERS } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PatientReportInfo = () => {
  const [practitioners, ,practitionerLoading , getPractitioners, clear] = useCRUD({
    id: GET_PRACTITIONERS,
    url: API_URL.staff,
    type: REQUEST_METHOD.get,
  });
  
  useEffect(() => {
    getPractitioners();
  }, []);


  return (
    <div style={{ marginTop: '40px'}} >
      {/* First Row */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={12}>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PatientDemographicReport />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* <Grid item xs={12} sm={6} md={4}>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                height: "100%", // Ensures full height
                display: "flex", // Align content properly
                flexDirection: "column", // For consistent layout
                justifyContent: "space-between", // Align inner content
              }}
            >
              <PatientSatisfactionSurveyReport practitioners={practitioners?.results} />
            </Box>
        </Grid> */}
        <Grid item xs={12} sm={6} md={6}>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <EncounterReport practitioners={practitioners?.results} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                height: "100%", // Ensures full height
                display: "flex", // Align content properly
                flexDirection: "column", // For consistent layout
                justifyContent: "space-between", // Align inner content
              }}
          >
            <DiagnosisReport /> 
          </Box>
        </Grid>
      </Grid>

      {/* Second Row
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PatientSatisfactionSurveyReport />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <DiagnosisReport />
          </Box>
        </Grid>
      </Grid> */}
    </div>
  );
};

export default PatientReportInfo;
