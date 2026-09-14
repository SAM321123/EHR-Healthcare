/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useMemo } from 'react';
import { isEmpty } from 'src/lib/lodash';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import {
  Exercises,
  IntensityLevel,
  dateFormats,
  onlyNumber,
  patientActivityTypes,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import PageContent from 'src/components/PageContent';
import { convertWithTimezone, showSnackbar } from 'src/lib/utils';
import Typography from 'src/components/Typography';
import HistoryTable from './HistoryTable';

const ExerciseLogs = ({ patientData }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue } = form;

  const [exerciseLogs, , , getExerciseLogs] = useCRUD({
    id: 'GET_EXERCISE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.get,
  });

  const [response, , loading, updateLogs, clearUpdate] = useCRUD({
    id: 'UPDATE_EXERCISE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.post,
  });

  const [deleteResponse, , , deleteLog, clearDelete] = useCRUD({
    id: 'DELETE_EXERCISE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.delete,
  });

  const deleteLogEntery = (id) => {
    deleteLog({}, `/${id}`);
  };

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      setValue('exercise', '');
      setValue('duration', '');
      setValue('intensity', '');
      clearUpdate();
    }
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearDelete();
    }

    getExerciseLogs({
      patient: patientData?.id,
      type: patientActivityTypes?.EXERCISE,
      limit: 40,
    });
  }, [deleteResponse, response]);

  const formGroup = useMemo(
    () => [
      {
        ...WiredSelect({
          inputType: 'wiredSelect',
          name: 'exercise',
          label: 'Exercise',
          required: requiredField,
          valueAccessor: 'id',
          labelAccessor: 'exercise',
          options: Exercises,
        }),
        colSpan: 1,
      },
      {
        inputType: 'text',
        type: 'number',
        pattern: onlyNumber,
        name: 'duration',
        required: requiredField,
        textLabel: 'Duration(Min)',
        maxLength: { value: 3 },
        colSpan: 0.5,
      },
      {
        ...WiredSelect({
          name: 'intensity',
          label: 'Intensity',
          required: requiredField,
          valueAccessor: 'id',
          labelAccessor: 'intensityLevel',
          url: null,
          options: IntensityLevel,
        }),
        colSpan: 0.5,
      },
    ],
    [response]
  );

  const calculateCaloriesBurned = (met, duration, fitnessLevel) => {
    const { gender, weight, dob } = patientData;
    const weightKG = Number(weight) * 0.45359237;
    const date1 = dayjs(dob);
    const age = dayjs().diff(date1, 'year');
    let caloriesBurned = 0;
    if (gender === 'male')
      caloriesBurned = 88.362 + 13.397 * weightKG + 4.799 * age - 5.677 * age;
    else if (gender === 'female')
      caloriesBurned = 447.593 + 9.247 * weightKG + 3.098 * age - 4.33 * age;
    caloriesBurned = (caloriesBurned / 1440 + met * duration) * fitnessLevel;

    return parseInt(caloriesBurned, 10);
  };

  const onSubmit = useCallback(
    (data) => {
      const date = convertWithTimezone(dayjs(), {
        format: dateFormats.YYYYMMMDDDTHHmmssZ,
      });

      const exercise = Exercises[data.exercise - 1] || null;
      const intensity = IntensityLevel[data.intensity - 1] || null;
      const cal = calculateCaloriesBurned(
        exercise?.met,
        data?.duration,
        intensity?.METValue
      );

      const metaData = {
        exercise: exercise.exercise,
        intensity: intensity.intensityLevel,
        duration: data?.duration,
      };

      const payload = {
        type: patientActivityTypes.EXERCISE,
        patient: patientData?.id,
        value: String(cal),
        unit: 'Calories',
        metaData,
        date,
      };

      updateLogs({ data: payload });
    },
    [exerciseLogs]
  );

  return (
    <PageContent loading={loading}>
      <Box sx={{ display: 'flex' }}>
        <CustomForm
          formGroups={formGroup}
          columnsPerRow={1}
          form={form}
          gridGap={2}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onSubmit)}
          label="Save"
        />
      </Box>
      {exerciseLogs?.results?.length > 0 && (
        <>
          <Typography sx={{ fontSize: '14px', fontWeight: '400', mt: 2 }}>
            History
          </Typography>
          <HistoryTable
            logType={patientActivityTypes.EXERCISE}
            data={exerciseLogs?.results}
            deleteEntery={deleteLogEntery}
            patient={patientData}
            showDelete
          />
        </>
      )}
    </PageContent>
  );
};

export default ExerciseLogs;
