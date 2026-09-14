import {
  ArcElement as ChartJSArcElement,
  Chart as ChartJS,
  Tooltip
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Typography from "src/components/Typography";
import palette from "src/theme/palette";

ChartJS.register(ChartJSArcElement, Tooltip);

const colors = ["#4CD28D", "#337AB7", "#1CB5BD", "#999999","#B7334B"];
const labels=['Anxiety','Mental Disorders','Anxiety','Mental Disorders','Anxiety']
const data = {
  labels: labels,
  datasets: [
    {
      data: [45, 15, 22, 14,25],
      backgroundColor: colors,
      borderWidth: 1,
      // borderColor: "#000"
    }
  ]
};

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
      <Typography color={palette.text.dark} style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>Diagnosis</Typography>

      </div>
    <div id="chart-legend" style={{display:'flex',flexDirection:'column',gap:6}}>
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

const ChartDemo = () => {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
    <Legend labels={data.labels} data={data?.datasets?.[0]?.data} colors={colors} />
      <div style={{ background: "white",display:'flex',alignItems:'center' }}>
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
              // legend: { display: false }
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
    </div>
  );
};

export default ChartDemo;
