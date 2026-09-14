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
import useQuery from "src/hooks/useQuery";
import { API_URL, REQUEST_METHOD } from "src/api/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DiagnosisReport = () => {
  const currentYear = new Date().getFullYear();

  // State for filters
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
    listId: `patient-diagnosis-report`,
    url: `${API_URL.analyticsAndReporting}/get-diagnosis-report`,
    type: REQUEST_METHOD.get,
    queryParams: {
      fromDate,
      toDate,
    },
    subscribeSocket: true,
  });
  
  // Chart options
  const options = {
    responsive: true,
    indexAxis: "y", // Horizontal bar chart
    plugins: {
      legend: {
        position: "top", // Legend position
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

  // return (
    //   <div style={{ width: "600px", margin: "auto" }}>
  //     <h2>Diagnosis Code Analysis</h2>
  //     <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
  //       {/* Select 1 */}
  //       <select
  //         style={{
    //           flex: 1,
    //           padding: "5px",
    //           border: "1px solid #ccc",
    //           borderRadius: "4px",
    //         }}
    //       >
    //         <option value="option1">Month</option>
  //         <option value="option2">Option 2</option>
  //       </select>
  //       {/* Select 2 */}
  //       <select
  //         style={{
    //           flex: 1,
  //           padding: "5px",
  //           border: "1px solid #ccc",
  //           borderRadius: "4px",
  //         }}
  //       >
  //         <option value="option1">Year</option>
  //         <option value="option2">Option 2</option>
  //       </select>
  //       {/* Select 3 */}
  //       <select
  //         style={{
    //           flex: 1,
  //           padding: "5px",
  //           border: "1px solid #ccc",
  //           borderRadius: "4px",
  //         }}
  //       >
  //       <option value="option1">Provider</option>
  //       <option value="option2">Option 2</option>
  //       </select>
  //     </div>
  //     <Bar data={data} options={options} />
  //   </div>
  // );
  
  
  
  // return (
  //   <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
  //     <h2 style={{ textAlign: "center", color: "#333", marginBottom: '20px' }}>Diagnosis Code Analysis</h2>
  //     <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  //       {["Month", "Year"].map((label, idx) => (
    //         <select
  //           key={idx}
  //           style={{
  //             flex: 1,
  //             padding: "8px",
  //             // border: "1px solid #ccc",
  //             // borderRadius: "4px",
  //             fontSize: "14px",
  //           }}
  //         >
  //           <option>{label}</option>
  //           <option>Option 2</option>
  //         </select>
  //       ))}
  //     </div>
  //     <Bar data={data} options={options} />
  //   </div>
  // );
  
  
  
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
  
  const { diagnosisReport , totalDiagnosis} = response || {};
  
  // Extract data from the response
  const labels = diagnosisReport?.map((item) => item?.ICD?.name); // Diagnosis codes (e.g., G43.9, A93.8)
  const counts = diagnosisReport?.map((item) => (parseInt(item?.count, 10)/ totalDiagnosis * 100).toFixed(2)); // Counts of each diagnosis code

  const data = {
    labels, // Y-axis labels
    datasets: [
      {
        label: "Patient Suffering",
        data: counts, // Percentages for Diabetes
        backgroundColor: "#00796b", // Color for this dataset
      },
    ],
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
    <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        Diagnosis Code Analysis
      </h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
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
          {months.map((month, idx) => (
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
      </div>
      <Bar data={data} options={options} />
    </div>
  );

};

export default DiagnosisReport;