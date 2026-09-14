import {
    ArcElement as ChartJSArcElement,
    Chart as ChartJS,
    Tooltip
  } from "chart.js";
import { useEffect } from "react";
  import { Doughnut } from "react-chartjs-2";
import { API_URL, REQUEST_METHOD } from "src/api/constants";
  import Typography from "src/components/Typography";
import useCRUD from "src/hooks/useCRUD";
import { generateRandomColors, Legend, plugins } from "./chartUtils";
  
  ChartJS.register(ChartJSArcElement, Tooltip);
  

  
  const ChartDemo = () => {
    
    const [ageCountData, error, loading, getDetail] = useCRUD({
      id: `patient-age-count`,
      url: `${API_URL.analyticsAndReporting}/get-age-count`,
      type: REQUEST_METHOD.get,
    });

    useEffect(()=>{
      getDetail()
    },[])

    const chartLabels = ageCountData?.map((item) => {
      let label = item.ageGroup    
      return label
      
    });
    const chartValues = ageCountData?.map((item) => parseInt(item.count, 10));
  
    const colors = generateRandomColors(ageCountData?.length || 0);

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
        {!loading && ageCountData ? (
          <>
            <Legend
              labels={data.labels}
              data={data?.datasets?.[0]?.data}
              colors={colors}
              name='Age'
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
                      text: "Age",
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
  
  export default ChartDemo;
  