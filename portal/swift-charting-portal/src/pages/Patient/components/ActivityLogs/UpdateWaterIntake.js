/* eslint-disable react/style-prop-object */

import { useCallback, useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import Container from 'src/components/Container';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Card, Chip } from '@mui/material';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { Iconify } from 'src/components/iconify';
import {
  dateFormats,
  patientActivityTypeIcons,
  patientActivityTypes,
} from 'src/lib/constants';
import { convertWithTimezone } from 'src/lib/utils';

import HistoryTable from './HistoryTable';
import UpdateWaterGoal from './UpdateWaterGoal';

const min = 0;

const ProgressBar = styled(Slider)({
  color: palette.primary.main,
  height: 12,
  width: 160,
  cursor: 'auto',
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 0,
    width: 0,
    backgroundColor: palette.primary.main,
    borderRadius: '10px',
    border: '1px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
});

const defaultQuantity = 300;
const endDate = dayjs().format(dateFormats.YYYYMMDD);
const startDate = dayjs().subtract(7, 'day').format(dateFormats.YYYYMMDD);
const UpdateWaterIntake = ({ getWaterIntakeHistory, patientData }) => {
  const [progressValue, setProgressValue] = useState(0);
  const [showUpdateGoal, setShowUpdateGoal] = useState(false);
  const userGoalMax = (Number(patientData?.waterIntakeGoal) || 0) / 300;
  const [updateResponse, , , updateWaterIntake, clearUpdate] = useCRUD({
    id: 'UPDATE_WATER_INTAKE',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.post,
  });
  const [deleteResponse, , , deleteWaterIntake, clearDelete] = useCRUD({
    id: 'DELETE_WATER_INTAKE',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.delete,
  });
  const [waterIntakeListResponse, , , getWaterIntakeList] = useCRUD({
    id: 'GET_WATER_INTAKE_LIST_TODAY',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.get,
  });
  useEffect(() => {
    getWaterIntakeList({
      patient: patientData?.id,
      type: patientActivityTypes?.WATER_INTAKE,
      limit: 40,
    });
  }, []);
  useEffect(() => {
    if (waterIntakeListResponse)
      setProgressValue(waterIntakeListResponse?.results?.length);
  }, [waterIntakeListResponse]);

  useEffect(() => {
    if (updateResponse || deleteResponse) {
      getWaterIntakeList({
        patient: patientData?.id,
        type: patientActivityTypes?.WATER_INTAKE,
        limit: 40,
      });
      getWaterIntakeHistory({
        patient: patientData?.id,
        type: patientActivityTypes?.WATER_INTAKE,
        startDate,
        endDate,
        dateType: 'day',
      });
      clearUpdate();
      clearDelete(true);
    }
  }, [updateResponse, deleteResponse]);

  const deleteWaterIntakeEntery = (id) => {
    deleteWaterIntake({}, `/${id}`);
  };
  const updateProgress = useCallback(
    (type) => {
      if (type) {
        const date = convertWithTimezone(dayjs(), {
          format: dateFormats.YYYYMMMDDDTHHmmssZ,
        });
        const payload = {
          type: patientActivityTypes.WATER_INTAKE,
          patient: patientData?.id,
          value: String(defaultQuantity),
          unit: 'ml',
          date,
        };
        updateWaterIntake({ data: payload });
        setProgressValue(progressValue + 1);
      } else if (!type && progressValue > min) {
        deleteWaterIntakeEntery(
          `/${waterIntakeListResponse?.results?.[0]?.id}`
        );
        setProgressValue(progressValue - 1);
      }
    },
    [progressValue, waterIntakeListResponse]
  );

  const toggleUpdateGoalView = () => {
    setShowUpdateGoal(!showUpdateGoal);
  };

  const debounceUpdate = useMemo(
    () =>
      debounce((type) => {
        updateProgress(type);
      }, 1000),
    [progressValue, waterIntakeListResponse]
  );

  const handleOnClick = useCallback(
    (type) => {
      debounceUpdate(type);
    },
    [progressValue, waterIntakeListResponse]
  );

  const getIntakeValue = useCallback(() => {
    if (!progressValue) return '0 ml';
    let value = Number(progressValue) * defaultQuantity;
    if (value > 1000) {
      value /= 1000;

      return `${value} L`;
    }
    return `${value} ml`;
  }, [progressValue]);

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        minWidth: 350,
        flexDirection: 'column',
      }}
    >
      <Box sx={{ marginTop: 2, padding: 1 }}>
        <Card
          sx={{
            backgroundColor: palette.background.paper,
            borderRadius: 2,
            width: '100%',
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              height="20rem"
              width="20rem"
              style={{}}
              alt="water"
              src={patientActivityTypeIcons.waterIntake}
            />
            <Typography
              sx={{
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '19.6px',
                color: palette.common.black,
                ml: '16px',
              }}
            >
              Help Energize
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '10px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '19.6px',
              color: palette.common.black,
              backgroundColor: 'rgb(135, 134, 132, 0.15)',
              borderRadius: 1,
              mt: 1,
              px: 1,
            }}
          >
            Adequate intake of water prevents blood to <br /> become thicker and
            maintains blood pressure.
          </Typography>
        </Card>
        <Box
          align="center"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            mt: 3,
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                width: 20,
                height: 28,
                borderRadius: '10% 10% 40% 40%',
                backgroundColor: palette.primary.main,
                color: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleOnClick(false)}
            >
              <Iconify
                align="center"
                sx={{ height: 15, width: 15 }}
                icon="eva:minus-fill"
              />
            </Box>
            <Typography
              sx={{
                fontSize: '8px',
                fontWeight: 400,
                color: palette.grey[800],
              }}
            >
              {defaultQuantity}ml
            </Typography>
          </Box>
          <ProgressBar
            defaultValue={progressValue}
            step={1}
            sx={{ mx: 2 }}
            value={progressValue || 0}
            // marks={marks}
            min={min}
            max={userGoalMax}
          />
          <Box>
            <Box
              sx={{
                display: 'flex',
                width: 20,
                height: 28,
                borderRadius: '10% 10% 40% 40%',
                backgroundColor: palette.primary.main,
                color: '#fff',
                fontSize: '20px',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleOnClick(true)}
            >
              <Iconify
                align="center"
                sx={{ height: 15, width: 15 }}
                icon="eva:plus-fill"
              />
            </Box>
            <Typography
              sx={{
                fontSize: '8px',
                fontWeight: 400,
                color: palette.grey[800],
              }}
            >
              {defaultQuantity}ml
            </Typography>
          </Box>
        </Box>

        <Box
          align="center"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            mt: 0,
          }}
        >
          <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
            Intake:
          </Typography>
          <Typography sx={{ ml: '5px' }}>{getIntakeValue()}</Typography>
          <div
            style={{
              height: 20,
              width: 1,
              backgroundColor: '#d0d0d0',
              marginLeft: 10,
              marginRight: 10,
            }}
          />
          <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
            Goal:
          </Typography>
          <Typography sx={{ ml: '5px' }}>
            {(Number(patientData?.waterIntakeGoal) || 0) / 1000}L
          </Typography>
        </Box>

        <Box align="center" sx={{ mt: 0.5 }}>
          <Chip
            sx={{ fontSize: '10px' }}
            size="small"
            avatar={
              <img
                style={{ width: 12, height: 12 }}
                alt="up-down"
                src="/assets/icons/update.svg"
              />
            }
            label="Update Goal"
            variant="outlined"
            onClick={toggleUpdateGoalView}
          />
          {showUpdateGoal && <UpdateWaterGoal userData={patientData} />}
        </Box>

        {waterIntakeListResponse?.results?.length > 0 && (
          <>
            <Typography sx={{ fontSize: '14px', fontWeight: '400', mt: 2 }}>
              History
            </Typography>
            <HistoryTable
              logType={patientActivityTypes.WATER_INTAKE}
              data={waterIntakeListResponse?.results}
              deleteEntery={deleteWaterIntakeEntery}
              patient = {patientData}
              showDelete
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default UpdateWaterIntake;
