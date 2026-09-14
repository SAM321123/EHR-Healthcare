import React from 'react';
import { Chart } from 'react-chartjs-2';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import './style.css';

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'New Patient',
      data: [200, 500, 700],
      backgroundColor: '#337AB7', // Light blue
    },
    {
      label: 'Old Patient',
      data: [100, 300, 900],
      backgroundColor: '#4CD28D', // Light green
    },
  ],
};

const options = {
  plugins: {
    datalabels: {
        display: false
      },
    title: {
      display: false,
      text: 'Total Patient 2022 - 23',
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
        <Typography color={palette.text.dark} style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>Total Patient  2022 - 23</Typography>
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
                  {item.data.reduce((acc, _item) => {
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

const BarChart = () => {
  return (
    <>
      <Legend datasets={data.datasets} />

      <Chart
        type="bar"
        data={data}
        options={options}
        height={258}
        width={377}
      />
    </>
  );
};

export default BarChart;
