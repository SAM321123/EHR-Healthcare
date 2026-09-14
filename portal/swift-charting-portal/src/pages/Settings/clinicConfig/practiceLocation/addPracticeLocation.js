import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
  defaultScheduleData,
  regexCustomText,
  requiredField,
  successMessage,
  emailValidatorPattern,
} from 'src/lib/constants';
import {
  dateFormatterDayjs,
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';
import { SAVE_PRACTICE_LOCATION } from 'src/store/types';
import ScheduleTable from 'src/pages/Staff/scheduleTable';
import { cloneDeep, isEqual } from 'lodash';

const AddPracticeLocation = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const getInitialValue = useCallback(() => {
    if (defaultData && defaultData?.schedule?.length) {
      return cloneDeep(defaultData?.schedule);
    }

    return cloneDeep(defaultScheduleData);
  }, [defaultData]);

  const schedule = useRef(getInitialValue());
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const [response, , loading, callPracticeLocationSaveAPI, clearData] = useCRUD(
    {
      id: SAVE_PRACTICE_LOCATION,
      url: API_URL.practiceLocation,
      type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
    }
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData(true);
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response, defaultData, clearData, modalCloseAction]);

  const formFields = [
    {
      inputType: 'text',
      type: 'text',
      name: 'name',
      required: requiredField,
      textLabel: 'Name',
      pattern: regexCustomText,
    },
    {
      inputType: 'phoneInput',
      type: 'number',
      name: 'faxNo',
      textLabel: 'Fax Contact',
      gridProps: { md: 12 },
      colSpan: 0.5,
    },
    {
      inputType: 'phoneInput',
      type: 'number',
      name: 'phoneNo',
      textLabel: 'Mobile Contact',
      gridProps: { md: 12 },
      colSpan: 0.5,
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'contactPersonName',
      textLabel: 'Contact Person Name',
      colSpan:0.5,
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'contactPersonEmail',
      textLabel: 'Contact Person Email',
      pattern: emailValidatorPattern,
      colSpan:0.5,
    },
    {
      inputType: 'phoneInput',
      type: 'number',
      name: 'contactPersonNo',
      textLabel: 'Contact Person Number',
      gridProps: { md: 12 },
      colSpan:0.5,
    },
    {
        inputType: 'mapAutoComplete',
        name: 'address',
        label: 'Address',
        required: requiredField,
        itemProps:{
          address:{colSpan:1},
          countryCode:{colSpan:0.25},
          stateCode:{colSpan:0.25},
          city:{colSpan:0.25},
          postalCode:{colSpan:0.25},
    
        }
    },
  ];

  const handleStartTime = useCallback(
    (index) => (newValue) => {
      const endTime = schedule.current[index].endHrs;
      const startTime = dateFormatterDayjs(newValue, 'HH:mm');
      if (!startTime || !endTime) {
        setError(true);
      } else if (startTime > endTime) {
        setError(true);
      } else {
        setError(false);
      }
      schedule.current[index].startHrs = startTime;
    },
    [schedule]
  );

  const handleEndTime = useCallback(
    (index) => (newValue) => {
      schedule.current[index].endHrs = dateFormatterDayjs(newValue, 'HH:mm');
    },
    [schedule]
  );

  const handleCheckboxChange = useCallback(
    (index) => (event) => {
      setChecked((value) => !value);
      schedule.current[index].isClosed = event.target.checked;
    },
    [schedule]
  );

  const onHandleSubmit = useCallback(
    (data) => {
      const isDefaultDataEmpty = isEmpty(defaultData);
      let payload = {};
      if (isDefaultDataEmpty) {
        payload = { ...data, schedule: schedule.current };
      } else {
        const updatedFields = getUpdatedFieldsValues(data, defaultData);
        if (!isEmpty(updatedFields)) {
          payload = updatedFields;
        }
        if (!isEqual(defaultData.schedule, schedule.current))
          payload.schedule = schedule.current;
      }
      if (isEmpty(payload)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
        return;
      }

      if (isDefaultDataEmpty) {
        callPracticeLocationSaveAPI({ data: { ...payload } }, `/`);
      } else {
        callPracticeLocationSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callPracticeLocationSaveAPI, defaultData]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={formFields}
          columnsPerRow={1}
          defaultValue={defaultData}
        />
        <ScheduleTable
          handleStartTime={handleStartTime}
          handleEndTime={handleEndTime}
          handleCheckboxChange={handleCheckboxChange}
          schedule={schedule.current}
          error={error}
          setError={setError}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          variant="outlinedSecondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </Box>
  );
};

export default AddPracticeLocation;
