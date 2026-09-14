import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";
import { Box } from "@mui/material";

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const RevenueReport = () => {
  // Data for the pie chart
  const data = {
    labels: ["Claims", "Reimbursement", "Insurance"], // Labels for the pie segments
    datasets: [
      {
        label: "Revenue Distribution", // Dataset label
        data: [12, 19, 3], // Values for each segment
        backgroundColor: ["#FF6384", "#36A2EB", "#FFEB3B"], // Segment colors
        hoverBackgroundColor: ["#FF4F72", "#2A8FE2", "#FFE433"], // Hover colors
      },
    ],
  };

  // Chart configuration options
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true, // Enable tooltips
      },
      legend: {
        position: "top", // Position of the legend
        labels: {
          boxWidth: 20,
          font: {
            size: 14, // Font size for legend labels
          },
        },
      },
    },
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
        height: "500px",
        width: "100%", // Full width
        maxWidth: "1391px", // Limit maximum width for better responsiveness
        margin: "0 auto", // Center the chart container
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Revenue Distribution Report</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        {["Month", "Year", "Provider"].map((label, idx) => (
          <select
            key={idx}
            style={{
              padding: "8px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "150px",
              textAlign: "center",
            }}
          >
            <option>{label}</option>
            <option>Option 2</option>
          </select>
        ))}
      </div>

      <div
        style={{
          height: "350px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "350px" }}>
          <Pie
            data={data}
            options={{
              ...options,
              maintainAspectRatio: true, 
              responsive: true,
            }}
          />
        </div>
      </div>
    </Box>
  </div>
  )
};

export default RevenueReport;


