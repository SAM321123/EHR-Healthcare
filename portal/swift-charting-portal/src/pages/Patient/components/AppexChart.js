const { default: ReactApexChart } = require('react-apexcharts');

const AppexChart = ({ series, options, ...restProps }) => (
  <ReactApexChart
    type="area"
    tooltip={false}
    zoom={false}
    series={series}
    height="100%"
    options={options}
    categories={options?.xaxis?.categories}
    {...restProps}
  />
);

export default AppexChart;
