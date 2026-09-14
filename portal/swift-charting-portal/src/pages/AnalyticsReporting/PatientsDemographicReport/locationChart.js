import {
  ArcElement as ChartJSArcElement,
  Chart as ChartJS,
  Tooltip,
} from "chart.js";
import { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { API_URL, REQUEST_METHOD } from "src/api/constants";
import Typography from "src/components/Typography";
import useCRUD from "src/hooks/useCRUD";
import { generateRandomColors, Legend, plugins } from "./chartUtils";
import { State } from "country-state-city";

ChartJS.register(ChartJSArcElement, Tooltip);

const LocationChart = () => {
  const [locationData, error, loading, getDetail] = useCRUD({
    id: `patient-location-count`,
    url: `${API_URL.analyticsAndReporting}/get-location-count`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getDetail();
  }, []);

  const chartLabels = locationData?.map((item) => {
    const states = State.getStatesOfCountry(item?.country)
    const stateName = states.find(state => state?.isoCode === item?.state )
    return stateName?.name
    
  });
  
  const chartValues = locationData?.map((item) => parseInt(item.count, 10));
  
  const colors = generateRandomColors(locationData?.length || 0);
  
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
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {!loading && locationData ? (
        <>
          <Legend
            labels={data?.labels}
            data={data?.datasets?.[0]?.data}
            colors={colors}
            name='Location'
          />
          <div
            style={{
              background: "white",
              display: "flex",
              alignItems: "center",
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
                    enabled: true,
                  },
                  title: {
                    display: false,
                    text: "Location",
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

export default LocationChart;
