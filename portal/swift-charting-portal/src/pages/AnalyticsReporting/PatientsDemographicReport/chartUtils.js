import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';

let isDrawCustomElements = false;

export const generateRandomColors = (count) => {
  const colors = new Set(); // Using a Set to ensure uniqueness
  const MIN_DISTANCE = 100; // Minimum color distance to avoid visually similar colors

  const isWhiteShade = (r, g, b) => r > 240 && g > 240 && b > 240;

  // Function to calculate Euclidean distance in RGB space
  const getColorDistance = (color1, color2) => {
    const rDiff = color1[0] - color2[0];
    const gDiff = color1[1] - color2[1];
    const bDiff = color1[2] - color2[2];
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  };

  // Function to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  while (colors.size < count) {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Skip white-ish colors
    if (isWhiteShade(r, g, b)) continue;

    const newColor = [r, g, b];
    let isSimilar = false;

    // Check the new color against existing colors in the set
    for (let existingColor of colors) {
      const existingColorRGB = [
        parseInt(existingColor.slice(1, 3), 16),
        parseInt(existingColor.slice(3, 5), 16),
        parseInt(existingColor.slice(5, 7), 16),
      ];

      if (getColorDistance(newColor, existingColorRGB) < MIN_DISTANCE) {
        isSimilar = true;
        break;
      }
    }

    if (isSimilar) continue;
    colors.add(rgbToHex(r, g, b));
  }

  return Array.from(colors);
};

const drawCustomElements = (chart) => {
  const { ctx } = chart;
  const { data } = chart.getDatasetMeta(0);

  for (let i = data.length - 1; i >= 0; --i) {
    const arc = data[i];
    if (arc['$context'].parsed > 0) {
      const round = arc.round;
      const props = arc.getProps([
        'startAngle',
        'endAngle',
        'innerRadius',
        'outerRadius',
        'circumference',
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

export const plugins = [
  {
    id: 'arcCaps',
    afterUpdate: function (chart) {
      const { data, controller } = chart.getDatasetMeta(0);
      const { outerRadius, innerRadius } = controller;

      for (let i = data.length - 1; i >= 0; --i) {
        const arc = data[i];

        if (arc['$context'].parsed > 0) {
          const radiusLength = outerRadius - innerRadius;

          arc.round = {
            x: (chart.chartArea.left + chart.chartArea.right) / 2,
            y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
            radius: innerRadius + radiusLength / 2,
            arcColor: arc.options.backgroundColor,
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
    beforeTooltipDraw: function (chart) {
      isDrawCustomElements = true;
      drawCustomElements(chart);
    },
  },
  {
    id: 'centerTitle',
    afterDraw: (chart) => {
      const {
        ctx,
        chartArea: { top, bottom, left, right },
        config,
      } = chart;
      const titleText = config.options.plugins.title.text;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Poppins';
      ctx.fillStyle = '#000';
      ctx.fontWeight = '600';

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      ctx.fillText(titleText, centerX, centerY);
      ctx.restore();
    },
  },
];

export const Legend = ({ labels, colors, data, pieChart = false, name }) => {
  let totalCount = null;
  if (pieChart) {
    totalCount = data?.reduce((acc, val) => acc + val, 0); // Sum of all values
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <Typography
          color={palette.text.dark}
          style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600 }}
        >
          {name}
        </Typography>
      </div>
      <div
        id="chart-legend"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          height: '125px',
          overflowY: 'auto',
        }}
      >
        {labels?.map((label, index) => (
          <div
            style={{ display: 'flex', justifyContent: 'space-between' }}
            key={index}
          >
            <div
              key={index}
              className="legend-item"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <div style={{ padding: 5 }}>
                <div
                  className="legend-color"
                  style={{
                    backgroundColor: colors[index],
                    width: 6,
                    height: 6,
                    borderRadius: 50,
                  }}
                ></div>
              </div>
              <Typography
                color={palette.text.dark}
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
                className="legend-label"
              >
                {label}
              </Typography>
            </div>
            <div>
              <Typography
                color={palette.text.offWhite}
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 400,
                }}
              >
                {`${data[index]} ${
                  pieChart && totalCount > 0
                    ? `(${
                        Number.isInteger((data[index] / totalCount) * 100)
                          ? (data[index] / totalCount) * 100
                          : ((data[index] / totalCount) * 100).toFixed(2)
                      }%)`
                    : pieChart
                    ? '(0%)'
                    : ''
                }`}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
