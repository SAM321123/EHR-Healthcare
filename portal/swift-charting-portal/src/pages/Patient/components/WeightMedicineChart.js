import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
// import { useNavigate } from 'react-router-dom';
import Container from 'src/components/Container';
import Box from 'src/components/Box';
import { get, isEmpty } from 'src/lib/lodash';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import usePatientDetail from 'src/hooks/usePatientDetail';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import { dateFormats, patientActivityTypes } from 'src/lib/constants';
import LineChart from './LineChart';
import { getSeriesName } from './DetailChartView';

const logsType = 'weight,medicine';

const options = {
  xaxis: {
    categories: [1, 2, 3, 4, 5, 6, 7],
    title: {
      text: 'Weeks',
    },
  },
};

const parseReponse = (res, type, index) => {
  const key =
    type === patientActivityTypes.WEIGHT
      ? 'lastRecord.valueNumber'
      : 'totalValue';
  const data = [];
  let response = [...res];
  response = [...(res || [])].reverse();
  response?.forEach((ele) => {
    const value = get(ele, key);
    data.push(value);
  });
  options.xaxis.categories = Array.from(
    {
      length:
        options?.xaxis?.categories?.length > data?.length
          ? options?.xaxis?.categories?.length
          : data?.length,
    },
    (_, i) => i + 1
  );
  const { label, min, max, itemColor } = getSeriesName(type);
  return {
    yAxisID: index ? 'y1' : 'y',
    spanGaps: true,
    lineTension: 0,
    borderColor: itemColor,
    color: itemColor,
    label,
    data,
    grid: {
      display: true,
    },
    min,
    max,
    pointRadius: 3,
    pointFillColor: itemColor,
    pointStyle: 'rectRounded',
    pointBackgroundColor: itemColor,
  };
};

const getSeries = (res) => {
  const logsArray = logsType?.split(',');
  const series = [];
  logsArray?.forEach((type, index) => {
    const data = res?.[type] || [];
    series.push(parseReponse(data, type, index));
  });

  return series;
};

const WeightMedicineChart = ({ patientId }) => {
  // const navigate = useNavigate();
  const [seriesData, setSeriesData] = useState([]);

  const [patientData, , getDetails] = usePatientDetail({
    patientId,
  });
  useEffect(() => {
    if (!patientData) getDetails();
  }, [patientData]);

  const [listResponse, , loading, getData] = useCRUD({
    id: 'GET_WEIHT_MEDICINE_WEEKLY',
    url: API_URL.patientActivityHistory,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    const endDate = dayjs().format(dateFormats.YYYYMMDD);
    const startDate = dayjs().subtract(1, 'year').format(dateFormats.YYYYMMDD);
    getData({
      patient: patientId,
      type: logsType,
      startDate,
      endDate,
      dateType: 'week',
    });
  }, []);

  useEffect(() => {
    if (!isEmpty(listResponse)) {
      setSeriesData(getSeries(listResponse));
    }
  }, [listResponse]);

  // const handleBackIconClick = useCallback(() => {
  //   navigate(-1);
  // }, [navigate]);

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
      loading={loading}
    >
      <Box sx={{ display: 'flex', mt: 1, mb: 2, alignItems: 'center' }}>
        {/* <IconButton
          variant="secondary"
          sx={{
            boxShadow: 'none',
            padding: 0,
            minWidth: 'unset',
            backgroundColor: 'transparent',
            borderRadius: '50%',
          }}
          onClick={handleBackIconClick}
        >
          <img
            src={BackIcon}
            alt="login"
            style={{
              cursor: 'pointer',
              padding: '6px',
              width: 30,
              height: 30,
            }}
          />
        </IconButton> */}
        <Box>
          <Typography sx={{ ml: 1, fontSize: '0.8rem' }} variant="h7">
            {patientData?.name}
          </Typography>
          <Typography
            sx={{ ml: 1, fontSize: '08px', color: palette.primary.main }}
            variant="body2"
          >
            {dayjs(patientData?.dob).format(dateFormats.MMDDYYYY)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: '90%', width: '100%' }}>
        <LineChart series={seriesData} options={options} />
      </Box>
    </Container>
  );
};

export default WeightMedicineChart;
