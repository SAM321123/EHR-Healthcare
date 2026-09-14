/* eslint-disable react/style-prop-object */

import styled from '@emotion/styled';
import dayjs from 'dayjs';
import Container from 'src/components/Container';
import { Slider, Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import isFunction from 'lodash/isFunction';
import CustomButton from 'src/components/CustomButton';
import palette from 'src/theme/palette';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Typography from 'src/components/Typography';
import {
  dateFormats,
  patientActivityTypes,
  successMessage,
  timeFormats,
} from 'src/lib/constants';
import { isEmpty } from 'src/lib/lodash';
import {
  convertWithTimezone,
  dateFormatterDayjs,
  getNewDate,
  showSnackbar,
} from 'src/lib/utils';
import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import HistoryTable from './HistoryTable';

const WeightSlider = styled(Slider)({
  color: palette.primary.main,
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 25,
    width: 6,
    backgroundColor: '#fff',
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
const maxValue = 600;
const selectedUnit = 'lbs';
export const formGroup = [
  {
    inputType: 'date',
    name: 'date',
    textLabel: 'Date',
    inputStyle: { width: '100%' },
    label: 'Date',
    // required: requiredField,
    disableFuture: true,
    minDate: dayjs().subtract(3, 'month'),
  },
];
const defaultValue = { date: getNewDate()};

const UpdateWeight = ({
  modalCloseAction,
  patientData,
  getDetail,
  callPatientPrescription,
  getWeightList,
}) => {
 const [weightValue, setWeightValue] = useState(
  patientData?.patient?.weight || patientData?.weight || 20
);

  const [updateResponse, , , updateWeight, clearUpdate] = useCRUD({
    id: 'UPDATE_WEIGHT',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.post,
  });

  const [deleteResponse, , , deleteLog, clearDelete] = useCRUD({
    id: 'DELETE_WEIGHT_LOG',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.delete,
  });

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const listResponse =
    useSelector((state) =>
      state?.crud?.get('GET_WEIGHT_LIST')?.get('read')?.get('data')
    ) || [];

  useEffect(() => {
    if (!isEmpty(updateResponse)) {
      showSnackbar({ message: successMessage.update, severity: 'success' });
      clearUpdate();
      if (isFunction(getWeightList))
        getWeightList({
          patient: patientData?.id,
          type: patientActivityTypes?.WEIGHT,
          limit: 7,
        });
      if (patientData && isFunction(getDetail)) getDetail();
      if (patientData?.patient) {
        callPatientPrescription();
        getDetail();
      }
      if (isFunction(modalCloseAction)) modalCloseAction();
    }
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearDelete();
      if (isFunction(getWeightList))
        getWeightList({
          patient: patientData?.id,
          type: patientActivityTypes?.WEIGHT,
          limit: 7,
        });
      if (patientData && isFunction(getDetail)) getDetail();
      if (patientData?.patient) {
        callPatientPrescription();
        getDetail();
      }
    }
  }, [updateResponse, deleteResponse]);

  const deleteWeightLog = (id) => {
    setWeightValue(20)
    deleteLog({}, `/${id}`);
  };
  const handleWeightChange = (e) => {
    setWeightValue(e.target.value);

  };
  const handleSave = useCallback(
    (data) => {
      let date = convertWithTimezone(dayjs(), {
        format: dateFormats.YYYYMMMDDDTHHmmssZ,
      });
      if (data?.date) {
        date = `${dateFormatterDayjs(
          data?.date,
          dateFormats.YYYYMMDD
        )} ${dayjs().format(timeFormats.HHmm)}`;
        date = convertWithTimezone(dayjs(date), {
          format: dateFormats.YYYYMMMDDDTHHmmssZ,
        });
      }

      const payload = {
        type: patientActivityTypes.WEIGHT,
        patient: patientData?.patient?.id || patientData?.id,
        value: String(weightValue),
        unit: selectedUnit,
        date,
      };
      updateWeight({ data: payload });
    },
    [selectedUnit, weightValue]
  );

  // const onUnitChange = (e) => {
  //   setSelectedUnit(e.target.value);
  //   if (e.target.value === 'lbs') setMaxValue(600);
  //   else setMaxValue(300);
  // };

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        minWidth: 350,
        flexDirection: 'column',
        padding: '0px 10px',
      }}
    >
      <Box sx={{ marginTop: 5, padding: 1 }}>
        <Typography
          sx={{ fontSize: '18px', fontWeight: 500, mb: 6 }}
          align="center"
        >
          What is your current weight(lbs)?
        </Typography>
        {/* <Box
          align="center"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 6,
            mt: 2,
          }}
        >
          <FormControl>
            <RadioGroup value={selectedUnit} row onChange={onUnitChange}>
              <FormControlLabel
                key="options"
                value="kg"
                style={{
                  borderRadius: '8px',
                  paddingRight: '15px',
                }}
                sx={{
                  '& .MuiTypography-root': {
                    paddingBottom: '0',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '19.6px',
                  },
                }}
                control={<Radio />}
                label="kg"
              />
              <FormControlLabel
                key="options"
                value="lbs"
                style={{
                  borderRadius: '8px',
                  paddingRight: '15px',
                }}
                sx={{
                  '& .MuiTypography-root': {
                    paddingBottom: '0',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '19.6px',
                  },
                }}
                control={<Radio />}
                label="lbs"
              />
            </RadioGroup>
          </FormControl>
        </Box> */}

        <WeightSlider
          defaultValue={weightValue}
          valueLabelDisplay="on"
          min={20}
          value={weightValue}
          max={maxValue}
          onChange={handleWeightChange}
          sx={{ mb: 2 }}
        />

        <CustomForm formGroups={formGroup} form={form} columnsPerRow={1} defaultValue={defaultValue} />

        <Box align="center" sx={{ mt: 4 }}>
          <CustomButton label="Save" onClick={handleSubmit(handleSave)} />
        </Box>

        {listResponse?.results?.length > 0 && (
          <>
            <Typography sx={{ fontSize: '14px', fontWeight: '400', mt: 2 }}>
              History
            </Typography>
            <HistoryTable
              logType={patientActivityTypes.WEIGHT}
              data={listResponse?.results}
              deleteEntery={deleteWeightLog}
              patient={patientData}
              showDelete
            />
          </>
        )}
      </Box>
    </Container>
  );
};

export default UpdateWeight;
