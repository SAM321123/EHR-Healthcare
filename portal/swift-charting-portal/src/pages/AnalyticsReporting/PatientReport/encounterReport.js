// import React, { useState } from "react";
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
// import useQuery from 'src/hooks/useQuery';
// import { API_URL, REQUEST_METHOD } from 'src/api/constants';


// // Register required Chart.js components
// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// const ProgressBarChart = () => {
  
//   const [filter, setFilter] = useState("all");

//   const [
//     response,
//     loading,
//     page,
//     rowsPerPage,
//     handlePageChange,
//     filters,
//     handleFilters,
//     sort,
//     handleSort,
//     handleOnFetchDataList,
//   ] = useQuery({
//     listId: `patient-encounter-report`,
//     url: `${API_URL.analyticsAndReporting}/get-encounter-report`,
//     type: REQUEST_METHOD.get,
//     subscribeSocket: true,
//   });
  
//   console.log('response----------------------------->', response)
//   // Data for the chart
//   const percentage = response?.totalCount;
//   const data = {
//     labels: ["Encounter Progress"], // Label for the bar
//     datasets: [
//       {
//         label: "Progress",
//         data: [percentage], // The percentage value
//         backgroundColor: "#00796b", // Bar color
//         borderRadius: 10,
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Options for the chart
//   const options = {
//     indexAxis: "y", // Horizontal bar
//     scales: {
//       x: {
//         max: 100, // Max value for the progress (100%)
//         beginAtZero: true,
//         ticks: {
//           callback: function (value) {
//             return value + "%"; // Add % symbol to x-axis values
//           },
//         },
//       },
//       y: {
//         ticks: {
//           display: false, // Hide y-axis labels
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: false, // Hide the legend
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             return `${context.raw}%`; // Show percentage in tooltip
//           },
//         },
//       },
//     },
//   };
  
//   return (
//     <div style={{ width: "300px", fontFamily: "Arial, sans-serif" }}>
//       <h3 style={{ marginBottom: "10px" }}>Patient Encounter</h3>
      

//       <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00796b" }}>{percentage}%</div>
//       <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>Total no. of encounter</div>
//       <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
//         {/* Select 1 */}
//         <select
//           style={{
//             flex: 1,
//             padding: "5px",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//           }}
//         >
//           <option value="option1">Month</option>
//           <option value="option2">Option 2</option>
//         </select>
//         {/* Select 2 */}
//         <select
//           style={{
//             flex: 1,
//             padding: "5px",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//           }}
//         >
//           <option value="option1">Year</option>
//           <option value="option2">Option 2</option>
//         </select>
//         {/* Select 3 */}
//         <select
//           style={{
//             flex: 1,
//             padding: "5px",
//             border: "1px solid #ccc",
//             borderRadius: "4px",
//           }}
//         >
//         <option value="option1">Provider</option>
//         <option value="option2">Option 2</option>
//         </select>
//       </div>
//       <Bar data={data} options={options} />
//     </div>
//   );
// };

// export default ProgressBarChart;

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import useQuery from 'src/hooks/useQuery';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getFullName } from "src/lib/utils";

// Register required Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EncounterReport = ({practitioners}) => {
  const currentYear = new Date().getFullYear();

  // State for filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null); // null means no specific month selected
  const [practitioner, setPractitioner] = useState(null);

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
    listId: `patient-encounter-report`,
    url: `${API_URL.analyticsAndReporting}/get-encounter-report`,
    type: REQUEST_METHOD.get,
    queryParams: {
      fromDate,
      toDate,
      practitionerId: practitioner,
    },
    subscribeSocket: true,
  });

  const {encounters,totalCount} = response || {};
  const percentage = ((encounters / totalCount) * 100).toFixed(2);

  // Data for the chart
  const data = {
    labels: ["Encounter Progress"],
    datasets: [
      {
        label: "Progress",
        data: [percentage],
        backgroundColor: "#00796b",
        borderRadius: 10,
        borderWidth: 1,
      },
    ],
  };

  // Options for the chart
  const options = {
    indexAxis: "y",
    scales: {
      x: {
        max: 100,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
      y: {
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw}%`;
          },
        },
      },
    },
  };

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

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setSelectedMonth(null); // Reset month when year changes
  };

  const handleMonthChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setSelectedMonth(value);
  };

  const handlePractitionerChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setPractitioner(value)
  };
  // Fetch data when `fromDate` or `toDate` changes
    useEffect(() => {
      handleOnFetchDataList({
        fromDate,
        toDate,
        practitionerId:practitioner,
      });
    }, [fromDate, toDate, practitioner]);

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "Arial, sans-serif",
        // border: "1px solid #ddd",
        // borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ marginBottom: "10px", textAlign: "center", color: "#333" }}>
        Patient Encounter
      </h3>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#00796b",
          textAlign: "center",
        }}
      >
        {percentage}%
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#666",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        of total encounter
      </div>
      {/* Filter Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Select 1 */}
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
        {/* Select 2 */}
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
        {/* Select 3 */}
        <select
          onChange={handlePractitionerChange}
          style={{
            flex: "1 1 30%",
            minWidth: "90px",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
          }}
          // style={{
          //   flex: 1,
          //   padding: "8px",
          //   border: "1px solid #ccc",
          //   borderRadius: "4px",
          //   fontSize: "14px",
          // }}
        >
          <option value="">All Practitioner</option>
          {practitioners?.map((practitioner, idx) => (
            <option key={idx} value={idx}>{getFullName(practitioner)}</option>
          ))}
        </select>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default EncounterReport;
