import React, { useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import './style.css';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;

const options = {
  plugins: {
      datalabels: {
        display: false
      },
      title: {
          display: false,
          text: `Total Patient ${previousYear} - ${currentYear}`,
    },
    legend: {
        display: false,
    },
},
scales: {
    x: {
        beginAtZero: false,
        
        grid: {
        display: false, // Hide the x-axis lines
        zeroLineColor:'red'
      },
      border: {
          display: false
        }
    },
    y: {
      grid: {
        display: true, // Show the y-axis lines
    },
    ticks: {
        stepSize: 100, // Increase the gap between y-axis ticks to 100
    },
},
},
};

const Legend = ({ datasets }) => {
    return (
    <div
    style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    }}
    >
      <div>
        <Typography color={palette.text.dark} style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{`Total Patient ${previousYear} - ${currentYear}`}</Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {datasets.map((item) => {
          return (
            <div
            className="hover"
            
            style={{ display: 'flex',gap:20,justifyContent:'space-between' }} >
              <div style={{ display: 'flex', alignItems: 'center'}}>
                <div style={{padding:5}}>
                  <div
                    style={{
                        backgroundColor: item.backgroundColor,
                        width: 6,
                        height: 6,
                        borderRadius: 50,
                    }}
                    />
                </div>
                <Typography
                  color={palette.text.dark}
                  style={{ fontSize: 14, lineHeight: '20px', fontWeight: 400 }}
                >
                  {item.label}
                </Typography>
              </div>
              <div>
                <Typography
                  color={palette.text.offWhite}
                  style={{ fontSize: 14, lineHeight: '20px', fontWeight: 400 }}
                  >
                  {item?.data?.reduce((acc, _item) => {
                      return acc + _item;
                    }, 0)}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PatientChart = () => {
    const [patientData, error, loading, getPatientReport] = useCRUD({
        id: `patient-old-new-patient-report`,
        url: `${API_URL.analyticsAndReporting}/get-old-new-patient-report`,
        type: REQUEST_METHOD.get,
    });
    
    useEffect(() => {
        getPatientReport();
    }, []);
    
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'New Patient',
          data: patientData?.newPatient,
          backgroundColor: '#337AB7', // Light blue
        },
        {
          label: 'Old Patient',
          data: patientData?.oldPatient,
          backgroundColor: '#4CD28D', // Light green
        },
      ],
    };
    const totalNewPatients = patientData?.newPatient?.reduce((acc, val) => acc + val, 0) || 0;
    const totalOldPatients = patientData?.oldPatient?.reduce((acc, val) => acc + val, 0) || 0;
    const totalPatients = totalNewPatients + totalOldPatients;
    
    return (
      <>
        {totalPatients > 0 ? (
          <>
            <Legend datasets={data.datasets} />
            <Chart type="bar" data={data} options={options} height={258} width={377} />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', fontWeight: 'bold' }}>
            No Patient
          </div>
        )}
      </>
    );
    
};

export default PatientChart;
