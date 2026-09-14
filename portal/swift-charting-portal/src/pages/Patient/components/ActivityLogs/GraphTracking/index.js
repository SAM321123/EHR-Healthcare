import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Box from 'src/components/Box';
import palette from 'src/theme/palette';
import { patientActivityTypes } from 'src/lib/constants';
import DetailChartView from '../../DetailChartView';
import WeightMedicineChart from '../../WeightMedicineChart';

const options = {
  chart: {
    zoom: {
      enabled: true,
      type: 'x',
      resetIcon: {
        offsetX: -10,
        offsetY: 0,
      },
    },
    toolbar: {
      show: true,
      tools: {
        download: false,
        pan: false,
      },
      customIcons: [],
    },
    offsetX: 0,
    offsetY: 0,
    parentHeightOffset: 0,
    stacked: false,
  },
  grid: {
    show: true,
  },
  dataLabels: {
    enabled: true,
  },
  stroke: {
    width: 2,
    curve: 'smooth',
    color: palette.primary.main,
  },
  markers: {
    size: 5,
  },
  tooltip: {
    enabled: true,
  },
  yaxis: {
    title: {
      text: 'Liter',
    },
    labels: {
      show: true,
    },
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true,
    },
    tooltip: {
      enabled: true,
    },
  },
  xaxis: {
    type: 'category',
    tickPlacement: 'on',
    hideOverlappingLabels: true,
    title: {
      text: 'Date',
    },
    labels: {
      show: true,
      hideOverlappingLabels: true,
      rotateAlways: false,
    },
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true,
    },
    tooltip: {
      enabled: true,
    },
  },
};

const GraphTracking = ({ type, patientId }) => {
  const { state } = useLocation();
  const renderChart = useCallback(
    () => (
      <DetailChartView
        logsType={type || state?.type}
        patientId={patientId || state?.patientId}
        showFilter
        type="line"
        options={options}
        series={[
          {
            colors: [palette.primary.main],
            fill: [palette.primary.main],
            name: 'Series',
            data: [],
          },
        ]}
      />
    ),
    []
  );

  return (
    <Box
      sx={{
        height: '85vh',
        width: '100%',
        px: '24px',
      }}
    >
      {type === patientActivityTypes.MEDICINE ? (
        <WeightMedicineChart patientId={patientId} />
      ) : (
        renderChart()
      )}
    </Box>
  );
};

export default GraphTracking;
