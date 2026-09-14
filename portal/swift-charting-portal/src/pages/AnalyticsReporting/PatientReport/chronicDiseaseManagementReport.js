// import React from "react";
// import { Bar } from "react-chartjs-2";
// import {
// Chart as ChartJS,
// BarElement,
// CategoryScale,
// LinearScale,
// Tooltip,
// Legend,
// } from "chart.js";
// import { Container, Box } from "@mui/material";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// const ChronicDieaseManagementReport = () => {
//   // Data for the stacked horizontal bar chart
//   const data = {
//     labels: ["Diabitiess", "Hypertension", "Asthma"], // Y-axis labels
//     datasets: [
//       {
//         label: "Patient Suffering",
//         data: [30, 40, 50, 60, 10], // Percentages for Diabetes
//         backgroundColor: "#00796b", // Color for this dataset
//       },
//     ],
//   };

//   // Chart options
//   const options = {
//     responsive: true,
//     indexAxis: "x", // Horizontal bar chart
//     plugins: {
//       legend: {
//         position: "top", // Legend position
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             return `${context.dataset.label}: ${context.raw}%`; // Tooltip format
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         stacked: true, // Enable stacking on X-axis
//         beginAtZero: true, // Start X-axis at 0
//         ticks: {
//           callback: (value) => `${value}%`, // Add percentage sign to X-axis labels
//         },
//       },
//       x: {
//         stacked: true, // Enable stacking on Y-axis
//       },
//     },
//   };

//   return (
//     // <Container maxWidth="xl" sx={{ mt: 4}} style={{ paddingBottom: '0px'}}>
//     <div style={{ marginTop: '40px',  textAlign: "center"}}> 
//       <Box
//         sx={{
//           border: "1px solid #ccc",
//           borderRadius: "8px",
//           padding: "16px",
//           backgroundColor: "#f9f9f9",
//           boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//         }}
//       >

//         <div>
//           <h2 style={{ marginBottom: '20px' }}>Chronic Dieases Management Report</h2>
//           <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
//             {/* Select 1 */}
//             <select
//               style={{
//                 flex: 1,
//                 padding: "5px",
//                 border: "1px solid #ccc",
//                 borderRadius: "4px",
//               }}
//             >
//               <option value="option1">Month</option>
//               <option value="option2">Option 2</option>
//             </select>
//             {/* Select 2 */}
//             <select
//               style={{
//                 flex: 1,
//                 padding: "5px",
//                 border: "1px solid #ccc",
//                 borderRadius: "4px",
//               }}
//             >
//               <option value="option1">Year</option>
//               <option value="option2">Option 2</option>
//             </select>
//             {/* Select 3 */}
//             <select
//               style={{
//                 flex: 1,
//                 padding: "5px",
//                 border: "1px solid #ccc",
//                 borderRadius: "4px",
//               }}
//             >
//             <option value="option1">Provider</option>
//             <option value="option2">Option 2</option>
//             </select>
//           </div>
//           <Bar data={data} options={options} />
//         </div>
//       </Box>
//       {/* </Container> */}
//     </div>
//   );
// };

// export default ChronicDieaseManagementReport;

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Box } from "@mui/material";
import useQuery from "src/hooks/useQuery";
import { API_URL, REQUEST_METHOD } from "src/api/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ChronicDiseaseManagementReport = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null means no specific month selected
  
  // Compute `fromDate` and `toDate` based on selections
  const fromDate = selectedMonth
    ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`
    : `${selectedYear}-01-01`;
  const toDate = selectedMonth
    ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${new Date(
        selectedYear,
        selectedMonth + 1,
        0
      ).getDate()}`
    : `${selectedYear}-12-31`;

  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({    
    listId: `get-chronic-disease-list-report`,
    url: `${API_URL.analyticsAndReporting}/get-chronic-disease-list-report`,
    type: REQUEST_METHOD.get,
    queryParams: {
      fromDate,
      toDate,
    },
    subscribeSocket: true,
  });

  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i); // Years from 2000 to current
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch data when `fromDate` or `toDate` changes
  useEffect(() => {
    handleOnFetchDataList({
      fromDate,
      toDate,
    });
  }, [fromDate, toDate]);

  const { chronicDiseaseList , totalChronicDisease} = response || {};
  const labels = chronicDiseaseList?.map((item) => item?.problem?.name);
  const counts = chronicDiseaseList?.map((item) => (parseInt(item?.count, 10)/ totalChronicDisease * 100).toFixed(2)); 
  // Data for the stacked horizontal bar chart
  const data = {
    labels, // Y-axis labels
    datasets: [
      {
        label: "Patients Suffering",
        data: counts, // Percentages for each category
        backgroundColor: "#00796b", // Bar color
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fit within the container
    indexAxis: "x", // Horizontal bar chart
    plugins: {
      legend: {
        position: "top", // Legend position
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}%`, // Tooltip format
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start Y-axis at 0
        ticks: {
          callback: (value) => `${value}%`, // Add percentage sign to Y-axis labels
        },
      },
      x: {
        beginAtZero: true, // Start X-axis at 0
      },
    },
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setSelectedMonth(null); // Reset month when year changes
  };

  const handleMonthChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setSelectedMonth(value);
  };

  return (
    <div style={{ marginTop: "40px", textAlign: "center" }}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          height: "500px", // Fixed height for the chart container
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Chronic Diseases Management Report</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {/* Month Selector */}
          <select
            onChange={handleMonthChange}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">All Months</option>
            {months.map((month, idx) => (
              <option key={idx} value={idx}>
                {month}
              </option>
            ))}
          </select>
          {/* Year Selector */}
          <select
            onChange={handleYearChange}
            style={{
              flex: 1,
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            defaultValue={currentYear}
          >
            {years?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            height: "400px", // Set a fixed height for the chart area
          }}
        >
          <Bar data={data} options={options} />
        </div>
      </Box>
    </div>
  );
};

export default ChronicDiseaseManagementReport;
