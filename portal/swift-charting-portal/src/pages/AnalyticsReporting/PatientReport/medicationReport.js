import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import Typography from 'src/components/Typography';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import { Container, Box, Grid } from '@mui/material';
import { GET_PRACTITIONERS } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { getFullName } from 'src/lib/utils';
import MedicationAdministeredOnTimeReport from './medicationAdministeredOnTimeReport';
import MedicationChangesList from './MedicationChangesList';
import StaffPerformaceReport from '../StaffPerformanceReports';
import palette from 'src/theme/palette';
import FrequencyOfDoseAdjustmentReport from './frequencyOfDoseAdjustmentReport';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MedicationReport = () => {
  const currentYear = new Date().getFullYear();
  // State for filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null means no specific month selected
  const [practitioner, setPractitioner] = useState(null);

  // Compute `fromDate` and `toDate` based on selections
  const fromDate = selectedMonth
    ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
    : `${selectedYear}-01-01`;
  const toDate = selectedMonth
    ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${new Date(
        selectedYear,
        selectedMonth + 1,
        0
      ).getDate()}`
    : `${selectedYear}-12-31`;

  // const [
  //   response,
  //   loading,
  //   page,
  //   rowsPerPage,
  //   handlePageChange,
  //   filters,
  //   handleFilters,
  //   sort,
  //   handleSort,
  //   handleOnFetchDataList,
  // ] = useQuery({
  //   listId: `patient-medication-report`,
  //   url: `${API_URL.analyticsAndReporting}/get-medication-report`,
  //   type: REQUEST_METHOD.get,
  //   queryParams: {
  //     fromDate,
  //     toDate,
  //     practitionerId: practitioner,
  //   },
  //   subscribeSocket: true,
  // });

  const [practitioners, , practitionerLoading, getPractitioners, clear] =
    useCRUD({
      id: GET_PRACTITIONERS,
      url: API_URL.staff,
      type: REQUEST_METHOD.get,
    });

  useEffect(() => {
    getPractitioners({ role: 'practitioner' });
  }, []);

  // const { result, totalMedication } = response || {};

  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => 2000 + i
  ); // Years from 2000 to current
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setSelectedMonth(null);
  };

  const handleMonthChange = (e) => {
    const value = e.target.value === '' ? null : Number(e.target.value);
    setSelectedMonth(value);
  };

  // const handlePractitionerChange = (e) => {
  //   const value = e.target.value === "" ? null : Number(e.target.value);
  //   setPractitioner(value)
  // };

  // Fetch data when `fromDate` or `toDate` changes
  // useEffect(() => {
  //   handleOnFetchDataList({
  //     fromDate,
  //     toDate,
  //     practitionerId: practitioner,
  //   });
  // }, [fromDate, toDate, practitioner]);

  // const totalDiagnosis = result?.medicationUtilizationReport?.map(
  //   (item) => item?.icd?.name
  // );

  // const labels = result?.map((item) => item?.genericDrug);

  // Helper function to generate random colors
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Extract unique diagnosis codes
  // const uniqueDiagnosis = [
  //   ...new Set(result?.flatMap((item) => Object.keys(item.diagnosis))),
  // ];

  // Create datasets dynamically
  // const datasets = uniqueDiagnosis?.map((diagnosisCode) => {
  //   return {
  //     label: diagnosisCode,
  //     data: result?.map(
  //       (item) => (item.diagnosis[diagnosisCode] / totalMedication) * 100 || 0 // Use 0 if the diagnosis is not present
  //     ),
  //     backgroundColor: getRandomColor(), //  generate colors
  //   };
  // });

  // Data for the stacked horizontal bar chart
  // const data = {
  //   labels, // Y-axis labels
  //   datasets,
  // };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio to allow custom dimensions
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      legend: {
        position: 'top', // Legend position
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}%`; // Tooltip format
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true, // Enable stacking on X-axis
        beginAtZero: true, // Start X-axis at 0
        ticks: {
          callback: (value) => `${value}%`, // Add percentage sign to X-axis labels
        },
      },
      y: {
        stacked: true, // Enable stacking on Y-axis
      },
    },
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          height: 'auto',
          width: '100%',
          maxWidth: '1391px',
          margin: '0 auto',
        }}
      >
        {/* <h2 style={{ textAlign: "center", marginBottom: '20px' }}>Medication Utilization Report</h2> */}
        {/* <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            justifyContent: "center",
          }}
        >
          <select
            onChange={handleMonthChange}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            <option value="">All Months</option>
            {months?.map((month, idx) => (
              <option key={idx} value={idx}>
                {month}
              </option>
            ))}
          </select>
          <select
            onChange={handleYearChange}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            defaultValue={currentYear}
          >
            {years?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {/* <select
            onChange={handleYearChange}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            defaultValue={currentYear}
          >
            <option value="">All Practitioner</option>
          {practitioners?.results?.map((practitioner, idx) => (
            <option key={idx} value={idx}>{getFullName(practitioner)}</option>
          ))}
          </select> */}
        {/* </div>  */}

        {/* <div
          style={{
            width: "100%",
            height: "400px", // Set a dynamic height for the chart container
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // Align the chart properly
          }}
        >
          <Bar
            data={data}
            options={{
              ...options,
              responsive: true,  
              maintainAspectRatio: false, 
            }}
          />
        </div> */}
        <div >
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <MedicationAdministeredOnTimeReport
              practitioners={practitioners?.results}
            />
          </Box>
        </div>
        <div  style={{ marginTop: '40px' }}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
             <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
              Medication Changes or Overrides
              </Typography>
            <MedicationChangesList />
          </Box>
        </div>
        {/* <div style={{ marginTop: '40px' }}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
               <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
              Staff Performance and Efficiency Reports{' '}
              </Typography>
            <StaffPerformaceReport />
          </Box>
        </div> */}
          <div style={{ marginTop: '40px' }}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
               <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
          Frequency of Dose Adjustments
              </Typography>
            <FrequencyOfDoseAdjustmentReport />
          </Box>
        </div>
      </Box>
    </div>
  );
};

export default MedicationReport;
