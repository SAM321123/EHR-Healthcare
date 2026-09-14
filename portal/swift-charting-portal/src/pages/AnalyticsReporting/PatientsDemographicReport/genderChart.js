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

ChartJS.register(ChartJSArcElement, Tooltip);

const GenderChart = () => {

  const [genderData, error, loading, getDetail] = useCRUD({
    id: `patient-gender-count`,
    url: `${API_URL.analyticsAndReporting}/get-gender-count`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getDetail();
  }, []);

  const filteredGenderData = genderData?.filter((item) => item?.sexAtBirthCode) || [];

  const chartLabels = filteredGenderData.map((item) => {
    let label = item.sexAtBirthCode
      .replace(/^gender_at_birth_/g, "")  
      .replace(/_gender_at_birth$/g, "")  
      .replace(/_/g, " ");  
  
    // Capitalize the first word, and lowercase the rest
    const words = label.split(" ");
    return words
      .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()))
      .join(" ");
  });
  
  
  
  const chartValues = filteredGenderData.map((item) => parseInt(item.count, 10));

  const colors = generateRandomColors(filteredGenderData.length || 0);

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
      {!loading && genderData ? (
        <>
          <Legend
            labels={data.labels}
            data={data?.datasets?.[0]?.data}
            colors={colors}
            name='Gender'
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
                  tooltip: { enabled: true },
                  title: {
                    display: false,
                    text: "Gender",
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

export default GenderChart;
