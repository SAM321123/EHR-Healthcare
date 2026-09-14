import { CardContent } from '@mui/material';
import Box from '@mui/material/Box';
import { isEmpty, isEqual } from 'lodash';
import React, { useMemo } from 'react';
import CustomForm from 'src/components/form';
import useReduxState from 'src/hooks/useReduxState';
import {
  hourOptions,
  initialSelectedForms,
  meridianOptions,
  minuteOptions,
  regexCustomText,
  requiredField,
  roleTypes,
} from 'src/lib/constants';
import { getCurrentMeridien } from 'src/lib/utils';
import {
  WiredMasterField,
  WiredSelect,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';
import ViewForm from './viewForm';
import useAuthUser from 'src/hooks/useAuthUser';

const EncounterInfo = ({ patientId, form }) => {
  const [selectedForms] = useReduxState(
    `Patient_Encounter-Selected-Forms`,
    initialSelectedForms
  );
  const [formDefaultData] = useReduxState(
    `Patient_Encounter-Form-Default-Data`
  );

  const [userInfo] = useAuthUser();

  const showBirpField = (data) => {
    if (data?.encounterTypeCode === 'birp') {
      return { hide: false };
    }
    return { hide: true };
  };
  const showDapField = (data) => {
    if (data?.encounterTypeCode === 'dap') {
      return { hide: false };
    }
    return { hide: true };
  };
  
  const encounterForm = useMemo(
    () => [
      {
        ...WiredMasterField({
          code: 'encounter_types_code',
          filter: { limit: 100 },
          name: 'encounterTypeCode',
          label: 'Encounter Types',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.33,
          placeholder: 'Select',
          required: requiredField,
          cache: false,
        }),
      },
      {
        inputType: 'date',
        type: 'text',
        name: 'startDate',
        label: 'Date',
        required: requiredField,
        colSpan: 0.34,
      },
      {
        label: 'Time',
        colSpan: 0.33,
        required: requiredField,
        fields: [
          {
            ...WiredSelect({
              name: 'startHour',
              label: 'Start Time',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: hourOptions,
              labelProps: { style: { height: 18 }, required: false },
              placeholder: '11',
              showRadio: false,
            }),
            colSpan: 0.33,
          },
          {
            ...WiredSelect({
              name: 'startMinute',
              label: 'Min',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: minuteOptions,
              showRadio: false,
              placeholder: '28',
            }),
            colSpan: 0.33,
          },
          {
            ...WiredSelect({
              name: 'startMeridien',
              label: 'Meridien',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: meridianOptions,
              gridProps: { paddingLeft: 500 },
              placeholder: 'AM',
              showRadio: false,
            }),
            colSpan: 0.33,
          },
        ],
      },
      {
        ...WiredStaffField({
          name: 'assignedToId',
          label: 'Assigned To',
          placeholder: 'Select',
          required: requiredField,
        }),
      },
      {
        inputType: 'text',
        name: 'behavior',
        textLabel: 'Behavior',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showBirpField,
        },
      },
      {
        inputType: 'text',
        name: 'intervention',
        textLabel: 'Intervention',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showBirpField,
        },
      },
      {
        inputType: 'text',
        name: 'response',
        textLabel: 'Response',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showBirpField,
        },
      },
      {
        inputType: 'text',
        name: 'birpPlan',
        textLabel: 'Plan',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showBirpField,
        },
      },
      {
        inputType: 'text',
        name: 'data',
        textLabel: 'Data',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showDapField,
        },
      },
      {
        inputType: 'text',
        name: 'assessment',
        textLabel: 'Assessment',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showDapField,
        },
      },
      {
        inputType: 'text',
        name: 'dapPlan',
        textLabel: 'Plan',
        pattern: regexCustomText,
        colSpan: 0.5,
        dependencies: {
          keys: ['encounterTypeCode'],
          calc: showDapField,
        },
      },
      {
        ...WiredMasterField({
          code: 'billing_type',
          filter: { limit: 100 },
          name: 'billingTypeCode',
          label: 'Billing Type',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.33,
          placeholder: 'Select',
          cache: false,
          required: requiredField,
        }),
      },
      {
        label: 'End Time',
        colSpan: 0.33,
        fields: [
          {
            ...WiredSelect({
              name: 'endHour',
              label: 'Start Time',
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: hourOptions,
              labelProps: { style: { height: 18 }, required: false },
              placeholder: '11',
              showRadio: false,
            }),
            colSpan: 0.33,
          },
          {
            ...WiredSelect({
              name: 'endMinute',
              label: 'Min',
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: minuteOptions,
              showRadio: false,
              placeholder: '28',
            }),
            colSpan: 0.33,
          },
          {
            ...WiredSelect({
              name: 'endMeridien',
              label: 'Meridien',
              valueAccessor: 'value',
              labelAccessor: 'label',
              url: null,
              options: meridianOptions,
              gridProps: { paddingLeft: 500 },

              placeholder: 'AM',
              showRadio: false,
            }),
            colSpan: 0.33,
          },
        ],
      },
      {
        inputType: 'text',
        name: 'duration',
        textLabel: 'Duration',
        pattern: regexCustomText,
        colSpan: 0.33,
      },
    ],
    []
  );

  const initialData = useMemo(() => {
    const currentMeridien = getCurrentMeridien();

    return {
      ...(userInfo?.role === roleTypes?.practitioner
        ? { assignedToId: userInfo?.id }
        : {}),
      startHour: currentMeridien.hour,
      startMinute: currentMeridien.minute,
      startMeridien: currentMeridien.meridien,
      startDate: currentMeridien.now,
    };
  }, [userInfo]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={encounterForm}
          columnsPerRow={1}
          defaultValue={
            isEmpty(formDefaultData) ? initialData : formDefaultData
          }
        />
        <div style={{ marginTop: 30 }}>
          {Object.values(selectedForms?.staticForms || {}).map(
            (form, index) => (
              <div key={index}>
                <ViewForm form={form} />
              </div>
            )
          )}
          {Object.values(selectedForms?.dynamicForms || {}).map(
            (form, index) => (
              <div key={index}>
                <ViewForm form={form} />
              </div>
            )
          )}
        </div>
      </CardContent>
    </Box>
  );
};

export default EncounterInfo
