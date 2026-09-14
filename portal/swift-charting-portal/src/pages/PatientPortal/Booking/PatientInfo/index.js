import React, { useCallback, useState } from 'react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';

import LoadingButton from 'src/components/CustomButton/loadingButton';
import Box from 'src/components/Box';
import Container from 'src/components/Container';
import CustomButton from 'src/components/CustomButton';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';
import CustomForm from 'src/components/form';
import { dateFormatterDayjs, showSnackbar, verticalScale } from 'src/lib/utils';
import {
  dateFormats,
  inputLength,
  minDOB,
  regEmail,
  regFirstname,
  requiredField,
} from 'src/lib/constants';
import CommonBackground from '../CommonBackground';
import BackIcon from '../../../../assets/images/svg/back.svg';
import LocationIcon from '../../../../assets/images/svg/location.svg';
import ConfirmBooking from '../ConfirmBooking.js';
import AcceptBooking from '../AcceptBooking';

const formGroups = [
  {
    inputType: 'text',
    name: 'firstName',
    textLabel: 'First Name',
    required: requiredField,
    maxLength: { ...inputLength.firstName },
    colSpan: 0.255,
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
  },
  {
    inputType: 'text',
    name: 'lastName',
    textLabel: 'Last Name',
    required: requiredField,
    maxLength: { ...inputLength.firstName },
    colSpan: 0.255,
    pattern: {
      value: regFirstname.value,
      message: `Firstname ${regFirstname?.message}`,
    },
  },
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Enter Email Address ',
    required: requiredField,
    pattern: regEmail,
    colSpan: 0.51,
  },
  {
    inputType: 'date',
    name: 'dob',
    textLabel: 'DOB',
    inputStyle: { width: '100%' },
    label: 'DOB',
    disableFuture: true,
    minDate: minDOB,
    format: dateFormats.YYYYMMDD,
    disableOpenPicker: false,
    required: requiredField,
    colSpan: 0.51,
  },
  {
    inputType: 'phoneInput',
    name: 'contact',
    textLabel: 'Enter Contact Number',
    required: requiredField,
    gridProps: { md: 12 },
    colSpan: 0.51,
  },
  {
    inputType: 'textArea',
    placeHolder: 'Note',
    name: 'note',
    colSpan: 0.51,
    minRows: 3,
    multiline: true,
  },
];

const PatientInfo = ({
  getURL,
  setStep,
  setBookingData,
  bookingData,
  form,
}) => {
  const { handleSubmit, reset } = form;
  const [openFirst, setOpenFirst] = useState(false);
  const [openSecond, setOpenSecond] = useState(false);

  const onBack = useCallback(() => {
    setStep((curr) => curr - 1);
  }, []);

  const onHandleProceed = useCallback(
    (data) => {
      const { dob } = data;
      const today = dayjs().format(dateFormats.YYYYMMDD);
      const hundredYearsDate = dayjs()
        .subtract(125, 'year')
        .format(dateFormats.YYYYMMDD);
      const day = dayjs(dob).format(dateFormats.YYYYMMDD);
      if (day > today || day < hundredYearsDate) {
        showSnackbar({
          message: 'Please enter valid DOB',
          severity: 'error',
        });
        return;
      }
      const patientData = {
        ...data,
        dob: dateFormatterDayjs(data?.dob, dateFormats.YYYYMMDD),
      };
      delete patientData?.note;
      setBookingData((curr) => ({
        ...curr,
        payload: {
          ...curr.payload,
          patient: patientData,
          note: data?.note,
        },
      }));
      setOpenFirst(true);
    },
    [setBookingData, setOpenFirst]
  );

  return (
    <CommonBackground getURL={getURL}>
      <Container
        style={{
          backgroundColor: palette.background.paper,
          padding: verticalScale(45),
        }}
      >
        <Box sx={{ display: 'flex', mb: '15px', alignItems: 'center' }}>
          <IconButton
            sx={{
              boxShadow: 'none',
              padding: 0,
              minWidth: 'unset',
              backgroundColor: 'transparent',
              borderRadius: '50%',
              width: '26px',
              height: '25px',
            }}
            onClick={onBack}
          >
            <img
              src={BackIcon}
              alt="login"
              style={{
                cursor: 'pointer',
                padding: '6px',
              }}
            />
          </IconButton>
          <Typography sx={{ ml: 1 }}>Go Back</Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', mt: '12px' }}>
          <img src={LocationIcon} alt="" style={{ cursor: 'pointer' }} />
          <Typography sx={{ ml: 2, fontSize: '20px', fontWeight: '500' }}>
            Enter Your Information
          </Typography>
        </Box>
        <Box sx={{ mt: '24px', mb: '24px' }}>
          <CustomForm formGroups={formGroups} form={form} />
        </Box>
        <Box>
          <CustomButton
            variant="secondary"
            sx={{
              mr: '24px',
            }}
            label="Cancel"
            onClick={onBack}
          />
          <LoadingButton
            label="Proceed"
            onClick={handleSubmit(onHandleProceed)}
          />
        </Box>
        {openFirst ? (
          <ConfirmBooking
            openFirst={openFirst}
            openSecond={openSecond}
            setOpenFirst={setOpenFirst}
            setOpenSecond={setOpenSecond}
            bookingData={bookingData}
          />
        ) : null}

        {openSecond ? (
          <AcceptBooking
            openSecond={openSecond}
            setOpenSecond={setOpenSecond}
            setStep={setStep}
            setBookingData={setBookingData}
            bookingData={bookingData}
            reset={reset}
          />
        ) : null}
      </Container>
    </CommonBackground>
  );
};

export default PatientInfo;
