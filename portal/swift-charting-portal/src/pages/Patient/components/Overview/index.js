import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Chip, Grid, IconButton } from '@mui/material';

import {
  calculateBMI,
  calculateIdealWeight,
  cmToFeetInches,
  feetInchesToCM,
  getUpdatedFieldsValue,
  showSnackbar,
  updateFormFields,
} from 'src/lib/utils';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { dateFormats, successMessage } from 'src/lib/constants';
import { PATIENT_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import palette from 'src/theme/palette';
import { get } from 'src/lib/lodash';
import CustomButton from 'src/components/CustomButton';
import floor from 'lodash/floor';
import ceil from 'lodash/ceil';
import ShowPatientActivityLog from '../Home/TopCard';
import editPatientOverviewFormGroups from '../editPatientOverview';
import { formatTimezoneLabel } from 'src/lib/timezoneHelpers';

const PatientOverview = () => {
  const params = useParams();
  const patientId = params?.id;
  const [editView, setEditView] = useState(false);
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  let chipLabel = 'N/A';
  const [patientData, loading, getPatient] = usePatientDetail({
    patientId,
  });

  const formDefaultValues = useMemo(() => {
    if (patientData) {
      const heightInCm = patientData?.height || '';
      const { feet, inches } = cmToFeetInches(heightInCm);
      const inchToDisplay = ceil(inches);
      return {
        firstName: patientData?.firstName,
        lastName: patientData?.lastName,
        email: patientData?.email,
        contact: patientData?.contact,
        dob: dayjs(patientData?.dob),
        gender: patientData?.gender || 'male',
        address: patientData?.address,
        timezone: patientData?.timezone,
        height: feet.toString(),
        inches: inchToDisplay.toString(),
      };
    }
    return {};
  }, [patientData]);

  const [
    updateResponse,
    ,
    updatePatientLoading,
    updatePatient,
    clearUpdateResponse,
  ] = useCRUD({
    id: PATIENT_DATA,
    url: `${API_URL.patient}/${patientId}`,
    type: REQUEST_METHOD.update,
  });

  useEffect(
    () => () => {
      clearUpdateResponse();
    },
    []
  );
  const toggleEditView = () => {
    setEditView((value) => !value);
  };
  useEffect(() => {
    if (updateResponse) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      getPatient();
      toggleEditView();
    }
  }, [updateResponse]);

  const handleUpdatePatient = useCallback(
    (data) => {
      const parsedData = {
        ...data,
        dob: dayjs(data.dob).format(),
      };
      const heightInFeet = parsedData?.height;
      const heightInInches = parsedData?.inches;
      const heightInCm = floor(
        feetInchesToCM(heightInFeet, heightInInches)
      ).toString();
      delete parsedData.height;
      delete parsedData.inches;

      parsedData.height = heightInCm;

      const updatedFields = getUpdatedFieldsValue(parsedData, patientData);

      if (isEmpty(getUpdatedFieldsValue(data?.address, patientData?.address)))
        delete updatedFields?.address;

      if (isEmpty(updatedFields)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
      } else updatePatient({ ...updatedFields });
    },
    [patientData, updatePatient]
  );

  const DetailsLabel = useCallback(
    ({ label }) => (
      <Typography
        sx={{ fontSize: '0.9rem', color: palette.grey[700], fontWeight: 600 }}
      >
        {label}:
      </Typography>
    ),
    []
  );
  const DetailsValue = useCallback(
    ({ value }) => (
      <Typography
        sx={{ fontSize: '0.9rem', ml: '5px', color: palette.grey[700] }}
      >
        {value}
      </Typography>
    ),
    []
  );

  const GridItem = useCallback(
    ({ label, value }) => {
      let displayValue;
      
      if (value === 'dob') {
        displayValue = dayjs(get(patientData, value)).format(dateFormats.MMDDYYYY);
      } else if (value === 'timezone') {
        const timezoneValue = get(patientData, value);
        displayValue = timezoneValue ? formatTimezoneLabel(timezoneValue) : '';
      } else {
        displayValue = get(patientData, value);
      }
      
      return (
        <div
          style={{
            display: 'flex',
            alignContent: 'center',
            marginTop: 5,
          }}
        >
          <DetailsLabel label={label} />
          <DetailsValue value={displayValue} />
        </div>
      );
    },
    [patientData]
  );
  if (patientData?.gender && patientData?.height) {
    patientData.idealWeight = calculateIdealWeight(
      patientData.height,
      patientData.gender
    );
  }
  if (patientData?.height && patientData?.weight) {
    const resultingBMI = calculateBMI(patientData.height, patientData.weight);
    patientData.bmi = resultingBMI.bmi;
    chipLabel = resultingBMI.category;
  }
  return (
    <PageContent
      style={{ paddingTop: '24px', overflow: 'auto' }}
      loading={loading}
    >
      <Box sx={{ margin: '0px 0px 16px 0px' }}>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 500,
          }}
          variant="span"
        >
          Basic Information
        </Typography>
      </Box>
      {patientData && !editView ? (
        <div
          style={{
            backgroundColor: palette.background.accentBlue,
            borderRadius: 5,
            display: 'flex',
            padding: 10,
            marginBottom: 20,
          }}
        >
          <Grid container>
            <Grid patientData lg={6} style={{ flex: 1 }}>
              <GridItem label="Name" value="name" />
              <GridItem label="Phone" value="contact" />
              <GridItem label="Email" value="email" />
              <GridItem label="Height(cm)" value="height" />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GridItem label="BMI" value="bmi" />
                <Chip
                  label={chipLabel}
                  style={{
                    backgroundColor: palette.bmiCategory[chipLabel],
                    color: 'white',
                    marginLeft: '5px',
                    height: '20px',
                  }}
                />
              </div>
            </Grid>
            <Grid patientData lg={6} style={{ flex: 1 }}>
              <GridItem label="DOB" value="dob" />
              <GridItem label="Address" value="address.description" />
              <GridItem label="Timezone" value="timezone" />
              <GridItem label="Ideal Weight" value="idealWeight" />
            </Grid>
          </Grid>
          <IconButton
            onClick={toggleEditView}
            sx={{ height: '2rem', width: '2rem' }}
          >
            <img
              alt="alt"
              src="/assets/icons/update.svg"
              style={{
                position: 'absolute',
                right: 5,
                top: 5,
              }}
            />
          </IconButton>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <CustomForm
            formGroups={updateFormFields(
              editPatientOverviewFormGroups(),
              ['email'],
              'disabled',
              true
            )}
            columnsPerRow={2}
            form={form}
            defaultValue={formDefaultValues}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '10px',
            }}
          >
            <CustomButton
              variant="secondary"
              label="Cancel"
              sx={{ mr: 2 }}
              onClick={toggleEditView}
            />
            <LoadingButton
              loading={updatePatientLoading}
              onClick={handleSubmit(handleUpdatePatient)}
              label="Save"
            />
          </Box>
        </div>
      )}
      {patientData && <ShowPatientActivityLog patientId={patientId} />}
    </PageContent>
  );
};

export default PatientOverview;
