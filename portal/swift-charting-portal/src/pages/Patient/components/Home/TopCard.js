import { Box, CardContent, Grid, Stack } from '@mui/material';
import { isEmpty } from 'lodash';
import { useCallback, useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import {
  patientActivityTypes
} from 'src/lib/constants';
import { get } from 'src/lib/lodash';
import { VITALS_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import { getSeriesName } from '../DetailChartView';
import LineChart from '../LineChart';

const topCards = [
  {
    label: 'Blood Pressure',
    type: patientActivityTypes.BLOOD_PRESSURE,
    severity: 'Normal',
    lastValue: '',
    units: 'mm/Hg',
    itemColor: palette.background.dark,
    chipBackground: "#C4FFE0",
    dataKey: 'totalPaid',
    mapData: [], 
    mapData2: [],
    buttonLabel: '',
    rederValues: ({ data }) => {
      if (!isEmpty(data)) {
        return `${data[0].bloodPressure}`
      }
    },
  },
  {
    label: 'Pulse',
    type: patientActivityTypes.PULSE,
    severity: 'Normal',
    lastValue: '',
    units: 'bmp',
    itemColor: palette.primary.dark,
    chipBackground: '#F8DEBD',
    dataKey: 'totalPaid',
    mapData: [],
    buttonLabel: '',
    rederValues: ({ data }) => {
      if (!isEmpty(data)) {
        return `${data[0].pulse}`
      }
    },
  },
  {
    label: 'BMI',
    type: patientActivityTypes.BMI,
    severity: 'Normal',
    lastValue: '',
    units: '',
    itemColor: palette.background.dark,
    chipBackground: '#E2DFFA',
    mapData: [],
    buttonLabel: 'Update',
    rederValues: ({ data }) => {
      if (!isEmpty(data)) {
        return `${data[0].bmi}`
      }
    },
  },
  {
    label: 'Height',
    type: patientActivityTypes.HEIGHT,
    severity: 'in Feet',
    lastValue: '',
    units: '',
    itemColor: palette.primary.dark,
    chipBackground: '#F8DEBD',
    mapData: [],
    buttonLabel: 'Update',
    rederValues: ({ data }) => {
      if (!isEmpty(data)) {
        const totalHeightinFeet = (parseFloat(data[0].ft) + (parseFloat(data[0].in) / 12)).toFixed(2);
        return `${totalHeightinFeet}`
      }
    },
  },
  {
    label: 'Weight',
    type: patientActivityTypes.WEIGHT,
    severity: 'in Kilograms',
    lastValue: '',
    units: '',
    itemColor: palette.primary.dark,
    chipBackground: '#D0FBFF',
    mapData: [],
    buttonLabel: 'Update',
    rederValues: ({ data }) => {
      if (!isEmpty(data)) {
        const totalWeight = parseFloat(data[0].lsb || 0) + parseFloat(data[0].oz || 0) / 16;
        const weightinKg = Math.round(totalWeight * 0.453592);
        return `${weightinKg}`
      }
    },
  },
];

const options = {
  xaxis: {
    categories: [],
    title: {
      text: '',
    },
  },
};

const ShowPatientActivityLog = ({ patientId }) => {
  const [patientData, , getDetail] = usePatientDetail({ patientId });

  const [weightListResponse, , , getWeightList, clearWeight] = useCRUD({
    id: `${VITALS_LIST}-${patientId}`,
    url: API_URL.vitals,
    type: REQUEST_METHOD.get,
  });


  useEffect(
    () => () => {
      clearWeight(true);
    },
    []
  );

  useEffect(() => {
    if (patientData) {
      getWeightList({
        patientId: patientData?.id,
        limit: 7,
      });
    }
  }, [patientData]);

  const getUpdatedValue = useCallback(
    (item, index) => {
      const getArrayFromResponse = (res, type = '', key = 'value') =>
        res?.map((obj) => {
          let value = get(obj, key);
          if (type === patientActivityTypes?.WEIGHT) {
            const weight = parseFloat(obj.lsb || 0) + parseFloat(obj.oz || 0) / 16;
            value = Math.round(weight * 0.453592);
          }

          if (type === patientActivityTypes?.HEIGHT) {
            const height = (parseFloat(obj.ft || 0) * 12) + parseFloat(obj.in || 0);
            value = Math.round(height * 0.0254);
          }

          if (type === patientActivityTypes?.BMI) {
            let weight = parseFloat(obj.lsb || 0) + parseFloat(obj.oz || 0) / 16;
            weight = Math.round(weight * 0.453592);
            let height = (parseFloat(obj.ft || 0) * 12) + parseFloat(obj.in || 0);
            height = Math.round(height * 0.0254);
            value = parseFloat(weight) / (parseFloat(height) ** 2);
          }
          return value;
        });

      let updatedValue = {};
      switch (item?.type) {
        case patientActivityTypes?.BLOOD_PRESSURE:
          updatedValue = { ...topCards[index], labelValues: item.rederValues({ data: weightListResponse?.results || [] }) };
          updatedValue.mapData = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.BLOOD_PRESSURE, 'bloodPressure');
          updatedValue.mapData2 = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.DIASTOLIC, 'diastolic');
          break;
        case patientActivityTypes?.PULSE:
          updatedValue = { ...topCards[index], labelValues: item.rederValues({ data: weightListResponse?.results || [] }) };
          updatedValue.mapData = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.PULSE, 'pulse');
          break;
        case patientActivityTypes?.BMI:
          updatedValue = { ...topCards[index], labelValues: item.rederValues({ data: weightListResponse?.results || [] }) };
          updatedValue.mapData = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.BMI, 'bmi');
          break;
        case patientActivityTypes?.HEIGHT:
          updatedValue = { ...topCards[index], labelValues: item.rederValues({ data: weightListResponse?.results || [] }) };
          updatedValue.mapData = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.HEIGHT, 'ft');
          break;
        case patientActivityTypes?.WEIGHT:
          updatedValue = { ...topCards[index], labelValues: item.rederValues({ data: weightListResponse?.results || [] }) };
          updatedValue.mapData = getArrayFromResponse([...weightListResponse?.results || []], patientActivityTypes?.WEIGHT, 'lsb');
          break;
        default:
          updatedValue = { ...topCards[4] };
      }
      return updatedValue;
    },
    [weightListResponse, patientData]
  );

  const linechartItem = useCallback ( (itemType,itemData,chipBackground) =>{
    const { borderColor,itemColor } = getSeriesName(itemType);
    const series =
      {
        display: false,
        spanGaps: true,
        lineTension: 0.4,
        borderColor: borderColor,
        color: itemColor,
        fill: true,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
      
         // This case happens on initial chart load
         if (!chartArea) return;
         return getGradient(ctx, chartArea,chipBackground);
        },
        data: itemData,
        pointRadius: 0,
        pointFillColor: itemColor,
        pointStyle: 'rectRounded',
        pointBackgroundColor: itemColor,
        borderWidth: 1,
      };
      return series;
  })

  const renderChart = useCallback(
    (item) => {
      const getXLabels = (series) => Array.from({ length: series?.length }, (_, i) => i + 1);
      console.log('itemData',item);
      let series = [];
      const seriesdata = linechartItem(item?.type,item?.mapData,item.chipBackground)
      series.push(seriesdata);
      if(item.mapData2){
      const lineChartseriesdata2 = linechartItem(item?.type,item?.mapData2,item.chipBackground)
      series.push(lineChartseriesdata2);
      }
    
      return (
        <LineChart
          zoom={false}
          datalabels={false}
          xLabel={false}
          legend={false}
          series= {series}
          options={{
            ...options,
            xaxis: {
              categories: getXLabels(item?.mapData),
            },
          }}
        />
      );
    },
    [weightListResponse]
  );

  function hexToRgba(hex, alpha) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  function getGradient(ctx, chartArea, mainColor) {
    let gradient = ctx.createLinearGradient(
      0,
      chartArea.bottom,
      0,
      chartArea.top
    );
  
    // Define the gradient stops using the main color
    gradient.addColorStop(0, hexToRgba(mainColor, 0));   // Solid color at the top
    gradient.addColorStop(1, hexToRgba(mainColor, 1));   // Transparent color at the bottom
  
    return gradient;
  }

  const GridItem = useCallback(
    ({ data }) => (
      <Grid container spacing={{ xs: 1, lg: 2, md: 2, sm: 1 }}>
        {data?.map((item, index) => {
          const updatedValue = getUpdatedValue(item, index);
          const { itemColor } = getSeriesName(item?.type);
          if (item?.type === patientActivityTypes.MEAL) return null;
          return (
            <Grid
              key={updatedValue?.label}
              item
              xs={6}
              lg={2.4}
              md={3}
              sm={4}
            >
              <Box
                sx={{
                  padding: '12px 12px',
                  flexShrink: 0,
                  borderRadius: '16px',
                  border:`1px solid ${palette.border.main}`
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: '14px',
                      fontWeight: 600,
                      lineHeight: '20px',
                     color:palette.text.dark
                    }}
                  >
                    {item?.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: '4px',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      color: palette.text.offGray,
                    }}
                  >
                    {updatedValue?.severity}
                  </Typography>
                  <div style={{display:"flex",flexDirection:"row",gap:"10px",marginTop:4,alignItems:'center'}}>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      color: itemColor,
                    }}
                  >
                    {updatedValue?.labelValues}  </Typography>
                    <Typography sx={{color:palette.text.offGray,
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      
                    }}>{item?.units}</Typography></div>
                
                </Box>

                <Box sx={{ ml: 0, pb: 0 ,mt:1.625}} dir="ltr">
                  {renderChart(updatedValue)}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    ),
    [weightListResponse, patientData]
  );

  if (isEmpty(weightListResponse?.results) ||weightListResponse?.results?.length<2 ) {
    return null;
  }
  
  return (
    <>
      <Stack spacing={0}>
        <Grid container>
          <Grid xs={12} sm={12} md={12} lg={12}>
            <CardContent sx={{ p: 0 }}>
              <GridItem data={topCards} />
            </CardContent>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default ShowPatientActivityLog;
