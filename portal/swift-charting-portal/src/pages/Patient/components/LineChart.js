import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Box } from '@mui/material';

Chart.register(ChartDataLabels);
Chart.register(zoomPlugin);

const getYAaxisLabel = (series, yAxisLabelDisplay = true) => {
  const defaultValue = {
    type: 'linear',
    display: true, // show Yaxis label
    position: 'left',
    stacked: true,
    title: {
      display: yAxisLabelDisplay,
      text: series[0]?.label,
      color: series[0]?.color,
      font: {
        family: 'Poppins',
        size: 18,
        style: 'normal',
        lineHeight: 1.2,
      },
    },
  };
  const newSeries = {};

  series?.forEach((obj, index) => {
    if (index === 0) {
      newSeries.y = {
        ...defaultValue,
        ...obj,
        title: {
          ...defaultValue?.title,
          text: series[index]?.label,
          color: series[index]?.color,
        },
      };
    } else {
      newSeries[`y${index}`] = {
        ...defaultValue,
        ...obj,
        position: 'right',
        title: {
          ...defaultValue?.title,
          text: series[index]?.label,
          color: series[index]?.color,
        },
      };
    }
  });
  return newSeries;
};

const LineChart = ({
  series,
  options,
  zoom = true,
  datalabels = true,
  xLabel = true,
  legend = true,
  yAxisLabelDisplay = true, 
  legendPosition = 'bottom',
  
}) => {
  const data = {
    labels: options?.xaxis?.categories,
    datasets: [...series],
  };
  const zoomOptions = {
    limits: {
      x: { min: -200, max: 300, minRange: 10 },
      y: { min: -200, max: 300, minRange: 10 },
    },
    pan: {
      enabled: true,
      mode: 'x',
    },
    zoom: {
      wheel: {
        enabled: true,
        mode: 'x',
      },
      pinch: {
        enabled: true,
        mode: 'x',
      },
      mode: 'x',
    },
  };
  const config = {
    type: 'line',
    data,
    fill: true,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      stacked: false,
      scales: {
        ...getYAaxisLabel(series, yAxisLabelDisplay),
        x: {
          display: xLabel,
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        zoom: zoom ? zoomOptions : false,
        title: {
          display: xLabel,
          position: 'bottom',
          text: options?.xaxis?.title?.text,
        },
        filler: {
          propagate: true,
        },
        datalabels: {
          display: datalabels,
          color: 'black',
          align: 'top',
          labels: {
            title: {
              font: {
                weight: 'bold',
                size: '12px',
              },
              
            },
            // value: {
            //   color: 'black',
            //   fontWeight: 'bold',
            //   fontSize: '30px',
            // },
          },
        },
        legend: {
          display: legend,
          position: legendPosition,
          labels: {
           color: 'black',
            usePointStyle: true,
          },
        },
      },
    },
  };

  return (
    <Box sx={{ height: '70.5px', maxWidth: '130px' }}>
      <Line {...config} />
    </Box>
  );
};

export default LineChart;
