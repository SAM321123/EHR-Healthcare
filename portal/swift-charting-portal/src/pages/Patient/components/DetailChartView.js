import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Container from 'src/components/Container';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { dateFormats, patientActivityTypes } from 'src/lib/constants';
import dayjs from 'dayjs';
import { get } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import usePatientDetail from 'src/hooks/usePatientDetail';
import LineChart from './LineChart';
import ChartHeader from './ChartHeader';

export const getSeriesName = (logsType) => {
  switch (logsType) {
    case patientActivityTypes?.BLOOD_PRESSURE:
      return {
        label: 'Blood Pressure',
        borderColor: "#4CD28D",
        itemColor:palette.text.dark,
         min: 0,
        max: 20,
      };
    case patientActivityTypes?.HEART_RATE:
      return {
        label: 'Heart Rate',
        borderColor: "#CA6B6E",
        itemColor:palette.text.dark,
        min: 20,
        max: 600,
      };
      case patientActivityTypes?.BMI:
      return {
        label: 'BMI',
        borderColor: "#478F96",
        itemColor:palette.text.dark,
        min: 20,
        max: 600,
      };
      case patientActivityTypes?.HEIGHT:
        return {
          label: 'HEIGHT',
          borderColor: "#F3A53F",
        itemColor:palette.text.dark,
          min: 20,
          max: 600,
        };
        case patientActivityTypes?.WEIGHT:
          return {
            label: 'WEIGHT',
            borderColor: "#478F96",
        itemColor:palette.text.dark,
            min: 20,
            max: 600,
          };
    default:
      return {
        label: 'Default Y Axis Label',
        itemColor: palette.background.dark,
        backgroundColor: '',
        min: 0,
        max: 20,
      };
  }
};

const viewMap = {
  month: 'month',
  week: 'week',
  year: 'year',
  custom: 'custom',
};

let selectedDate = {};
const DetailChartView = ({
  patientId,
  logsType,
  series,
  options,
  ...restProps
}) => {
  const [graphOptions, setGraphOptions] = useState({ ...options, series });

  const [patientData, , getDetails] = usePatientDetail({
    patientId,
  });
  useEffect(() => {
    if (!patientData) getDetails();
  }, [patientData]);
  const [listResponse, , loading, getData, clearData] = useCRUD({
    id: 'GET_LIST_ALL',
    url: API_URL.patientActivityHistory,
    type: REQUEST_METHOD.get,
  });

  const fetchRecord = (date, type) => {
    selectedDate = date;
    selectedDate.dateType = type;
    getData({
      patient: patientId,
      type: logsType,
      ...date,
      dateType: type === viewMap.year ? 'month' : 'day',
    });
  };

  const parseReponse = (response) => {
    const key = [
      patientActivityTypes.WATER_INTAKE,
      patientActivityTypes.EXERCISE,
    ].includes(logsType)
      ? 'totalValue'
      : 'lastRecord.valueNumber';

    const data = [];
    const xAxisLabels = [];
    let viewTitle;
    if (selectedDate.dateType !== viewMap.year) {
      const date1 = new Date(selectedDate?.startDate);
      const date2 = new Date(selectedDate?.endDate);

      if (selectedDate.dateType === viewMap.custom) {
        viewTitle = `${dayjs(selectedDate?.startDate).format(
          'MMM DD'
        )} - ${dayjs(selectedDate?.endDate).format('MMM DD, YYYY')}`;
      } else {
        const differenceInTime = date2.getTime() - date1.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);

        if (differenceInDays > 7)
          viewTitle = dayjs(selectedDate?.startDate).format('MMMM-YYYY');
        else
          viewTitle = `${dayjs(selectedDate?.startDate).format(
            'MMM DD'
          )} - ${dayjs(selectedDate?.endDate).format('MMM DD, YYYY')}`;
      }

      for (
        let d = new Date(selectedDate?.startDate);
        d <= new Date(selectedDate?.endDate);
        d.setDate(d.getDate() + 1)
      ) {
        const dd = d;
        let isEqual = false;
        response?.forEach((obj) => {
          if (
            dayjs(dayjs(dd).format(dateFormats.YYYYMMDD)).isSame(
              dayjs(obj?.lastRecord?.formattedDate)
            )
          ) {
            isEqual = true;
            let value = get(obj, key);

            if (patientActivityTypes.WATER_INTAKE === logsType) {
              value = `${value / 1000}`;
            } else if (patientActivityTypes.WEIGHT === logsType) {
              if (get(obj, 'lastRecord.unit') === 'kg')
                value = Math.round(value * 2.20462);
            }
            data.push(value);
            return false;
          }
          return true;
        });
        xAxisLabels.push(
          dayjs(dayjs(dd).format(dateFormats.YYYYMMDD)).format('DD')
        );
        if (!isEqual) {
          data.push(null);
        }
      }
    } else {
      const selYear = dayjs(selectedDate?.startDate).format('YYYY');
      viewTitle = selYear;
      for (let month = 1; month <= 12; month += 1) {
        const m = month;
        let isEqual = false;
        response?.forEach((obj) => {
          if (
            `${obj?.lastRecord?.year}${obj?.lastRecord?.month}` ===
            `${selYear}${m}`
          ) {
            isEqual = true;
            let value = get(obj, key);
            if (patientActivityTypes.WATER_INTAKE === logsType) {
              value = `${value / 1000}`;
            }
            data.push(value);
            return false;
          }
          return true;
        });

        xAxisLabels.push(dayjs(`${selYear}-${m}`).format('MM/YY'));
        if (!isEqual) {
          data.push(null);
        }
      }
    }

    const { label, min, max, itemColor } = getSeriesName(logsType);
    const updatedSeries = [
      {
        color: itemColor,
        label,
        spanGaps: true,
        lineTension: 0,
        borderColor: itemColor,
        min,
        max,
        data,
      },
    ];

    setGraphOptions({
      ...graphOptions,
      xaxis: { categories: [...xAxisLabels], title: { text: viewTitle } },
      series: [...updatedSeries],
    });
  };

  useEffect(() => {
    if (listResponse) {
      parseReponse(listResponse?.[logsType]);
    }

    return () => {
      clearData(true);
    };
  }, [listResponse]);

  return (
    <Container component="main" loading={loading}>
      <Box sx={{ height: '88%', width: '100%' }}>
        <ChartHeader patientData={patientData} fetchRecord={fetchRecord} />
        <LineChart
          series={graphOptions?.series}
          options={graphOptions}
          {...restProps}
        />
      </Box>
    </Container>
  );
};

export default DetailChartView;
