import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { requiredField } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import CardContent from '@mui/material/CardContent';

import { WiredMasterAutoComplete } from 'src/wiredComponent/Form/FormFields';
import { useForm, useWatch } from 'react-hook-form';
import WiredAutoComplete from 'src/wiredComponent/Form/Autocomplete';
import CustomForm from 'src/components/form';
import { successMessage } from 'src/lib/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { Box, CardActions } from '@mui/material';

const patientSegmentOptions = [
  { label: 'All Patients', value: 'all' },
  { label: 'Active In Last 3 Months', value: 'active_last_3_months' },
  { label: 'New Patients', value: 'new_patients' },
];

const PatientAutoCompleteField = ({ form }) => {
  const patientListType =
    useWatch({ control: form.control, name: 'patientListType' }) || 'all';
  const sendTo = useWatch({ control: form.control, name: 'sendTo' });

  if (sendTo !== 'manually') {
    return null;
  }

  return (
    <WiredAutoComplete
      key={`patients-${patientListType}`}
      register={form.register('patients')}
      control={form.control}
      setValue={form.setValue}
      name="patients"
      label="Patients *"
      labelAccessor={['firstName', 'middleName', 'lastName']}
      valueAccessor="id"
      placeholder="Select Patient"
      cache={false}
      fetchInitial
      url={API_URL.patient}
      multiple
      required={requiredField}
      params={
        patientListType !== 'all'
          ? { patientSegment: patientListType, limit: 10 }
          : { limit: 10 }
      }
    />
  );
};

export default function ComposedMailForm({ modalCloseAction, refetchData }) {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      patientListType: 'all',
    },
  });
  const { handleSubmit, setError, control, setValue } = form;
  const sendTo = useWatch({ control, name: 'sendTo' });
  const patientListType = useWatch({ control, name: 'patientListType' });
  const previousFilterRef = useRef({});

  const [apiResponse, , loading, apiHandler, clearData] = useCRUD({
    id: 'EmailCampaignTemplateForm',
    url: API_URL.composeMail,
    type: REQUEST_METHOD.post,
  });

  const patientListTypeDependency = useCallback((data) => {
    if (data.sendTo !== 'manually') {
      return { hide: true };
    }

    return { hide: false };
  }, []);

  const emailTemplateFormGroups = useMemo(
    () => [
      {
        inputType: 'radio',
        name: 'sendTo',
        textLabel: 'Send To',
        options: [
          { label: 'All Patient', value: 'all' },
          { label: 'Select Manually', value: 'manually' },
        ],
        gridProps: { md: 4 },
        required: requiredField,
        colSpan: 2,
      },
      {
        ...WiredMasterAutoComplete({
          filter: { limit: 10 },
          name: 'templateName',
          label: 'Template',
          labelAccessor: ['name'],
          valueAccessor: 'id',
          colSpan: 1,
          required: requiredField,
          placeholder: 'Select Template',
          cache: false,
          fetchInitial: true,
          url: API_URL.emailCampaignTemplate,
          multiple: false,
        }),
      },
      {
        inputType: 'select',
        name: 'patientListType',
        label: 'Patient List',
        valueAccessor: 'value',
        labelAccessor: 'label',
        options: patientSegmentOptions,
        placeholder: 'Select Patient List',
        colSpan: 1,
        dependencies: {
          keys: ['sendTo'],
          calc: patientListTypeDependency,
        },
      },
      {
        component: ({ form: formProps }) => (
          <PatientAutoCompleteField form={formProps} />
        ),
        colSpan: 2,
      },
    ],
    [patientListTypeDependency]
  );

  useEffect(() => {
    const previousFilter = previousFilterRef.current;

    if (
      previousFilter.sendTo !== undefined &&
      (previousFilter.sendTo !== sendTo ||
        previousFilter.patientListType !== patientListType)
    ) {
      setValue('patients', [], { shouldValidate: true });
    }

    previousFilterRef.current = { sendTo, patientListType };
  }, [patientListType, sendTo, setValue]);

  useEffect(() => {
    if (!isEmpty(apiResponse)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [apiResponse, clearData, modalCloseAction, refetchData]);

  const onHandleSubmit = useCallback(
    (data) => {
      const { templateName, ...rest } = data;

      let payload = {
        ...rest,
        templateName: templateName?.name,
      };

      if (payload.sendTo === 'manually' && isEmpty(payload.patients)) {
        setError('patients', true);
        return;
      }
      if (payload.sendTo === 'all') {
        delete payload.patients;
      }
      delete payload.patientListType;
      payload.patients = payload?.patients?.map((item) => ({
        patientId: item?.id,
        firstName: item?.user?.firstName,
        middleName: item?.user?.middleName,
        lastName: item?.user?.lastName,
      }));
      apiHandler({ data: payload });
    },
    [apiHandler, setError]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={emailTemplateFormGroups}
          columnsPerRow={2}
          form={form}
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
          label="Send"
        />
      </CardActions>
    </Box>
  );
}
