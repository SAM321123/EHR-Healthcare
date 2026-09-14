import {
  ArcElement as ChartJSArcElement,
  Chart as ChartJS,
  Tooltip,
} from 'chart.js';
import { useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import { generateRandomColors, Legend, plugins } from './chartUtils';

ChartJS.register(ChartJSArcElement, Tooltip);

const EtnicityChart = () => {
  const [ethnicityData, error, loading, getDetail] = useCRUD({
    id: `patient-ethnicity-count`,
    url: `${API_URL.analyticsAndReporting}/get-ethnicity-count`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getDetail();
  }, []);

  const chartLabels = ethnicityData?.map((item) => {
    let label = item.raceCode;

    if (label.includes('race_code')) {
      // If `race_code` is present, process as before
      label = label
        .replace(/^race_code_/, '') // Remove prefix
        .replace(/_race_code$/, '') // Remove suffix
        .replace(/_/g, ' '); // Replace underscores with spaces

      // Capitalize the first word, and lowercase the rest
      return label
        .split(' ')
        .map((word, index) =>
          index === 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(' ');
    } else {
      // If `race_code` is not present, just replace underscores and capitalize words
      return label
        .replace(/_/g, ' ') // Replace underscores with spaces
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ) // Capitalize each word
        .join(' ');
    }
  });
  const chartValues = ethnicityData?.map((item) => parseInt(item.count, 10));

  const colors = generateRandomColors(ethnicityData?.length || 0);

  const data = {
    labels: chartLabels || [],
    datasets: [
      {
        data: chartValues || [],
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!loading && ethnicityData ? (
        <>
          <Legend
            labels={data.labels}
            data={data?.datasets?.[0]?.data}
            colors={colors}
            name="Ethnicity"
          />
          <div
            style={{
              background: 'white',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Doughnut
                width={129}
                height={129}
                data={data}
                plugins={plugins}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  cutout: "75%",
                  plugins: {
                    datalabels: {
                      display: false
                    },
                    tooltip: {
                       enabled: true 
                      },
                    title: {
                      display: false,
                      text: "Ethnicity",
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
          </div>
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </div>
  );
};

export default EtnicityChart;
