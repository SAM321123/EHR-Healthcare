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
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import useQuery from "src/hooks/useQuery";
import { getFullName } from "src/lib/utils";
import { GET_PRACTITIONERS } from "src/store/types";
import useCRUD from "src/hooks/useCRUD";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LabReport = () => {
  const currentYear = new Date().getFullYear();
  // State for filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
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

  const [practitioners, ,practitionerLoading , getPractitioners, clear] = useCRUD({
    id: GET_PRACTITIONERS,
    url: API_URL.staff,
    type: REQUEST_METHOD.get,
  });
    
  useEffect(() => {
    getPractitioners();
  }, []);

  
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
    listId: `patient-lab-report`,
    url: `${API_URL.analyticsAndReporting}/get-lab-report`,
    type: REQUEST_METHOD.get,
    queryParams: {
      fromDate,
      toDate,
      practitionerId: practitioner,
    },
    subscribeSocket: true,
  });

  const {labReport, totalLabReport} = response || {};
  
  // Fetch data when `fromDate` or `toDate` changes
  useEffect(() => {
    handleOnFetchDataList({
      fromDate,
      toDate,
      practitionerId:practitioner,
    });
  }, [fromDate, toDate, practitioner]);


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

  const requestCount = labReport?.map((item) => (parseInt(item?.requestCount, 10)/ totalLabReport * 100).toFixed(2));
  const resultCount = labReport?.map((item) => (parseInt(item?.resultCount, 10)/ totalLabReport * 100).toFixed(2));
  const labels = labReport?.map((item) => item?.laboratoryTests?.name);

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
    setPractitioner(value);
  };

  const data = {
    labels, // X-axis labels
    datasets: [
      {
        label: "Lab Request",
        data: requestCount, // Data for the first group
        backgroundColor: "#00796b", // Color for this dataset
      },
      {
        label: "Lab Result",
        data: resultCount, // Data for the second group
        backgroundColor: "#ffa726", // Color for this dataset
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio to allow custom dimensions
    plugins: {
      legend: {
        position: "top", // Position of the legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false, // Set to false for grouped bars
      },
      y: {
        beginAtZero: true, // Ensure Y-axis starts at zero
      },
    },
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ width: "100%", padding: "10px" }}>
          <h2 style={{ textAlign: "center", marginBottom: '20px' }}>Diagnostic Test Orders and Results</h2>
          <div style={{ width: "100%", minHeight: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "20px" }}>
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
              <select
                onChange={handlePractitionerChange}
                style={{
                  flex: 1,
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="option1">All Practitioners</option>
                {practitioners?.results?.map((practitioner, idx) => (
                  <option key={idx} value={idx}>{getFullName(practitioner)}</option>
                ))}
              </select>
            </div>
            <div
              style={{
                width: "100%",
                height: "100%",
                minHeight: "400px",
              }}
            >
              <Bar data={data} options={options} />
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export default LabReport;
