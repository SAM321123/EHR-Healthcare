// const PatientSatisfactionSurveyReport = () => {
//     return (
//         <div>
//             PatientSatisfactionSurveyReport
//         </div>
//     )
// }

// export default PatientSatisfactionSurveyReport;

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import { getFullName } from 'src/lib/utils';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const PatientSatisfactionSurveyReport = ({practitioners}) => {

  const currentYear = new Date().getFullYear();
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

  const data = {
    labels: ['Staff', 'Hygiene', 'Price', 'Service'], // Labels for the pie segments
    datasets: [
      {
        label: 'My Pie Chart', // Label for the dataset
        data: [12, 19, 3, 5], // Values for each segment
        backgroundColor: ['#FF6384', '#36A2EB', '#FFEB3B', '#4CAF50'], // Segment colors
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFEB3B', '#4CAF50'], // Hover colors
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true, // Display tooltips
      },
      legend: {
        position: 'top', // Position of the legend
      },
    },
  };

  // const handleYearChange = (e) => {
  //   setSelectedYear(Number(e.target.value));
  //   setSelectedMonth(null); // Reset month when year changes
  // };

  const handleMonthChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    // setSelectedMonth(value);
  };

  const handlePractitionerChange = (e) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    // setPractitioner(value)
  };

  return (
    <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: '20px' }}>Patient Satisfaction Survey</h2>
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
          // onChange={handleYearChange}
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
      <Pie data={data} options={options} />
    </div>
  );
};

export default PatientSatisfactionSurveyReport;
