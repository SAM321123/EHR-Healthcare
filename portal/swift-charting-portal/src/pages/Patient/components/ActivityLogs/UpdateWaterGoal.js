/* eslint-disable react/style-prop-object */

import styled from '@emotion/styled';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useCallback, useEffect, useState } from 'react';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { Iconify } from 'src/components/iconify';
import { UPDATE_PROFILE } from 'src/store/types';

const max = 15;
const min = 0;

const marks = Array.from({ length: max }, (_, i) => ({ value: i + 1 }));

const ProgressBar = styled(Slider)({
  color: palette.primary.main,
  height: 6,
  width: 100,
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
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: palette.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});

const UpdateWaterGoal = ({ userData }) => {
  const [updateGoalProgress, setGoalProgress] = useState(
    (Number(userData?.waterIntakeGoal) || 0) / 1000
  );

  const [updateResponse, , , updateWater] = useCRUD({
    id: UPDATE_PROFILE,
    url: API_URL.patient,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (updateResponse) {
      // eslint-disable-next-line no-param-reassign
      userData.waterIntakeGoal = updateGoalProgress * 1000;
    }
  }, [updateResponse]);
  const updateOnServer = useCallback((value) => {
    const payload = {
      waterIntakeGoal: value * 1000,
    };
    updateWater({ ...payload }, `/${userData?.id}`);
  }, []);

  const updateGoalTarget = (type) => {
    if (type && updateGoalProgress < max) {
      updateOnServer(updateGoalProgress + 1);
      setGoalProgress(updateGoalProgress + 1);
    } else if (!type && updateGoalProgress > min) {
      updateOnServer(updateGoalProgress - 1);
      setGoalProgress(updateGoalProgress - 1);
    }
  };
  return (
    <Box
      sx={{
        marginTop: 2,
        padding: 1,
        border: `1px solid ${palette.grey[300]}`,
        transition: 'all 1s ease',
      }}
    >
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
          Goal:
        </Typography>
        <Typography sx={{ ml: '5px' }}>{updateGoalProgress}L</Typography>
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
        <Box
          sx={{
            display: 'flex',
            width: 15,
            height: 15,
            borderRadius: 8,
            backgroundColor: palette.primary.main,
            color: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => updateGoalTarget(false)}
        >
          <Iconify
            align="center"
            sx={{ height: 12, width: 12 }}
            icon="eva:minus-fill"
          />
        </Box>
        <ProgressBar
          defaultValue={updateGoalProgress}
          step={1}
          sx={{ mx: 2 }}
          value={updateGoalProgress}
          marks={marks}
          min={min}
          max={max}
        />
        <Box
          sx={{
            display: 'flex',
            width: 15,
            height: 15,
            borderRadius: 8,
            backgroundColor: palette.primary.main,
            color: palette.common.white,
            fontSize: '20px',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => updateGoalTarget(true)}
        >
          <Iconify
            align="center"
            sx={{ height: 12, width: 12 }}
            icon="eva:plus-fill"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateWaterGoal;
