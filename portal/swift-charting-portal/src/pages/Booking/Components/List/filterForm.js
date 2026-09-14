import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import ActionButton from 'src/components/ActionButton';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import {
  WiredMasterField,
  WiredPatientAutoComplete,
  WiredStaffField
} from 'src/wiredComponent/Form/FormFields';

import { API_URL } from 'src/api/constants';
import { dateFormats,roleTypes } from 'src/lib/constants';
import { dateFormatterDayjs } from 'src/lib/utils';

import './filterForm.scss';

const FilterActionButton = ({ form, filtersData, onFiltersChange }) => {
  const handleApplyFilter = useCallback(() => {
    const formValues = form.getValues();
    const parsedData = pickBy(formValues, identity);
    if (!isEmpty(parsedData)) {
      const newFilters = {
        ...parsedData,
        patientId: parsedData?.patientId?.id,
        startDate:
          parsedData?.startDate &&
          dateFormatterDayjs(parsedData?.startDate, dateFormats.YYYYMMDD),
        endDate:
          parsedData?.endDate &&
          dateFormatterDayjs(parsedData?.endDate, dateFormats.YYYYMMDD),
        listView: true,
      };
      onFiltersChange(newFilters, filtersData);
    }
  }, [filtersData, form, onFiltersChange]);

  const handleResetFilter = useCallback(() => {
    form.reset();
    form.setValue('startDate', null, { shouldValidate: true });
    form.setValue('endDate', null, { shouldValidate: true });
    onFiltersChange(
      {
        listView: true,
      },
      filtersData
    );
  }, [form, onFiltersChange, filtersData]);

  return (
    <div className="filter-buttons-wrapper" style={{marginTop:'24px'}}>
      <ActionButton className="apply-action-button" onClick={handleApplyFilter}>
        <Typography>Apply</Typography>
      </ActionButton>
      <ActionButton className="reset-action-button" onClick={handleResetFilter}>
        <Typography>Reset</Typography>
      </ActionButton>
    </div>
  );
};

const FilterForm = ({ filtersData, onFiltersChange }) => {
  const form = useForm({ mode: 'onChange' });

  useEffect(
    () => () => {
      onFiltersChange({
        listView: true,
      });
    },
    []
  );

  const formGroups = useMemo(
    () => [
      {
        ...WiredStaffField({
          name: 'practitionerId',
          label: 'Practitioner Name',
          placeholder: 'Select',
        }),
      },
      {
        ...WiredPatientAutoComplete({
          name: 'patientId',
          label: 'Patient Name',
          url: API_URL.getPatients,
          params: { isActive: true },
          placeholder:'Search by patient name'
        }),
      },
      {
        inputType: 'date',
        name: 'startDate',
        label: 'From Date',
        dependencies: {
          keys: ['endDate'],
          calc: (data) => {
            const { endDate } = data;
            if (endDate) {
              return {
                reFetch: true,
                shouldDisableDate: (date) => date > endDate,
              };
            }
            return { reFetch: false };
          },
        },
      },
      {
        inputType: 'date',
        name: 'endDate',
        label: 'To Date',
        dependencies: {
          keys: ['startDate'],
          calc: (data) => {
            const { startDate } = data;
            if (startDate) {
              return {
                reFetch: true,
                shouldDisableDate: (date) => date < startDate,
              };
            }
            return { reFetch: false };
          },
        },
      },
      {
        ...WiredMasterField({
          code: 'appointment_status',
          filter: { limit: 20 },
          name: 'statusCode',
          label: 'Status',
          labelAccessor: 'name',
          valueAccessor: 'code',
          placeholder: 'Select',
          cache: false,
        }),
      },
      // {
      //   ...WiredServiceField({
      //     name: 'service',
      //     label: 'Service',
      //     params: { limit: 300, isActive: true },
      //   }),
      // },
      {
        // eslint-disable-next-line react/no-unstable-nested-components
        component: () => (
          <FilterActionButton
            form={form}
            filtersData={filtersData}
            onFiltersChange={onFiltersChange}
          />
        ),
      },
    ],
    [filtersData, form, onFiltersChange]
  );

  return (
    <Box>
      <CustomForm form={form} formGroups={formGroups} columnsPerRow={4} />
    </Box>
  );
};

export default FilterForm;
