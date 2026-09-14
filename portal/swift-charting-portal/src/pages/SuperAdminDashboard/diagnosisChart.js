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
import palette from "src/theme/palette";

ChartJS.register(ChartJSArcElement, Tooltip);

const colors = ["#4CD28D", "#337AB7", "#1CB5BD", "#999999","#B7334B"];
// const labels=['Anxiety','Mental Disorders','Anxiety','Mental Disorders','Anxiety']

const currentYear = new Date().getFullYear();

let isDrawCustomElements = false;
const drawCustomElements = (chart) => {
  const { ctx } = chart;

  const { data } = chart.getDatasetMeta(0);

  for (let i = data.length - 1; i >= 0; --i) {
    const arc = data[i];
    if (arc["$context"].parsed > 0) {
      const round = arc.round;
      const props = arc.getProps([
          "startAngle",
        "endAngle",
        "innerRadius",
        "outerRadius",
        "circumference"
      ]);

      const endAngle = Math.PI / 2 - props.endAngle;

      ctx.save();
      ctx.translate(round.x, round.y);
      ctx.fillStyle = arc.options.backgroundColor;
      ctx.beginPath();
      ctx.arc(
          round.radius * Math.sin(endAngle),
        round.radius * Math.cos(endAngle),
        (props.outerRadius - props.innerRadius) / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
      ctx.restore();
    }
  }
};

const plugins = [
  {
      id: "arcCaps",
    afterUpdate: function (chart) {
      const { data, controller } = chart.getDatasetMeta(0);
      const { outerRadius, innerRadius } = controller;

      for (let i = data.length - 1; i >= 0; --i) {
        const arc = data[i];

        if (arc["$context"].parsed > 0) {
          const radiusLength = outerRadius - innerRadius;

          arc.round = {
              x: (chart.chartArea.left + chart.chartArea.right) / 2,
              y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
              radius: innerRadius + radiusLength / 2,
            arcColor: arc.options.backgroundColor
          };
        }
      }
    },

    afterDraw: function (chart) {
      if (isDrawCustomElements) {
        isDrawCustomElements = false;
        return;
      }
      drawCustomElements(chart);
    },
    beforeTooltipDraw: function (chart, args, options) {
        isDrawCustomElements = true;
      drawCustomElements(chart);
    }
  },
  {
    id: 'centerTitle',
    afterDraw: (chart) => {
      const { ctx, chartArea: { top, bottom, left, right }, config } = chart;
      const titleText = config.options.plugins.title.text;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px Poppins'; // You can change the font size and style
        ctx.fillStyle = '#000'; // You can change the text color
        ctx.fontWeight='600';

        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        
        ctx.fillText(titleText, centerX, centerY);
        ctx.restore();
    }
}
];

const Legend = ({ labels, colors,data }) => {
    return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div>
      <Typography color={palette.text.dark} style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>{`Diagnosis ${currentYear}`}</Typography>

      </div>
    <div id="chart-legend" style={{display:'flex',flexDirection:'column',gap:6, height: '125px', overflowY: 'auto' }}>
      {labels.map((label, index) => (
        <div style={{display:'flex',justifyContent:'space-between'}}>
        <div key={index} className="legend-item" style={{display:'flex',alignItems:'center'}} >
          
          <div style={{padding:5}}><div className="legend-color" style={{ backgroundColor: colors[index],width:6,height:6,borderRadius:50 }}></div></div>
          <Typography color={palette.text.dark} style={{fontSize:14,lineHeight:'20px',fontWeight:400}} className="legend-label">{label}</Typography>
        </div>
        <div>
          <Typography color={palette.text.offWhite} style={{fontSize:14,lineHeight:'20px',fontWeight:400}}>{`${data[index]}%`}</Typography>
        </div>
        </div>
      ))}
    </div>
    </div>
  );
};

const DiagnosisChart = () => {
    const [diagnosisData, error, loading, getDiagnosis] = useCRUD({
      id: `patient-diagnosis-count`,
      url: `${API_URL.analyticsAndReporting}/get-diagnosis-problem-report`,
      type: REQUEST_METHOD.get,
    });

    useEffect(() => {
      getDiagnosis();
    }, []);

    const chartLabels = diagnosisData?.map((item) => {
      return item?.problem?.name;
    });
    const chartValues = diagnosisData?.map((item) => parseInt(item.count, 10));

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
        {data?.datasets?.[0]?.data?.length > 0 ? (
          <>
            <Legend labels={data.labels} data={data?.datasets?.[0]?.data} colors={colors} />
            <div style={{ background: "white", display: 'flex', alignItems: 'center' }}>
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
                    tooltip: { enabled: false },
                    title: {
                      display: false,
                      text: 'Diagnosis'
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
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '16px', fontWeight: 'bold' }}>
            No Diagnosis
          </div>
        )}
      </div>
    );
    
};

export default DiagnosisChart;
