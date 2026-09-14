/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import IconButton from '@mui/material/IconButton';

import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import {
  durationUnitOptions,
  inputLength,
  noHtmlTagPattern,
  patientPrescriptionFrequencyOptions,
  regDecimal,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { GET_MEDICINE_TEMPLATE } from 'src/store/types';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import {
  WiredMedicineAutoComplete,
  WiredSelect,
} from 'src/wiredComponent/Form/FormFields';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import BackIcon from '../../../assets/images/svg/back.svg';

const MedicineTemplateForm = ({
  form,
  refetchDataList,
  defaultData,
  setIsAddMedicineTemplate,
  setDefaultData,
}) => {
  const { handleSubmit, reset } = form;

  const dosageCalc = useCallback(() => {
    const data = form.getValues();
    if (data?.medicine?.dosage?.length) {
      const medicineData = data?.medicine?.dosage;

      if (medicineData) {
        const optionData = medicineData?.map((item) => ({
          label: `${item?.strength} ${item?.strengthUnit} in ${item?.volume} ${item?.quantityUnit} ${item?.form}`,
          value: item?._id,
        }));
        return { reFetch: true, options: optionData };
      }
    }
    return { reFetch: false };
  }, [form]);

  const amountUnitCalc = useCallback(
    (data, index) => {
      if (data?.medicine) {
        let options = [];
        const medicineData = data.medicine;
        const dosageData = data.items[index]?.dosage;

        if (medicineData) {
          const optionData = medicineData?.dosage?.find(
            (item) => item?._id === dosageData
          );
          if (optionData?.strengthUnit === 'mg/ml') {
            options = [
              { name: 'units', value: 'units' },
              { name: 'mg', value: 'mg' },
              { name: 'ml', value: 'ml' },
            ];
          } else {
            options = [
              {
                name: optionData?.strengthUnit,
                value: optionData?.strengthUnit,
              },
            ];
          }
          if (options.length) {
            form.setValue(`items.${index}.unit`, options[0]?.value);
            form.clearErrors(`items.${index}.unit`);
          }

          return { reFetch: true, options };
        }
      }
      return { reFetch: false };
    },
    [form]
  );

  const medicineTemplateFormGroup = useMemo(
    () => [
      {
        ...WiredMedicineAutoComplete({
          name: 'medicine',
          label: 'Medication',
          labelAccessor: 'name',
          required: requiredField,
          params: { isActive: true },
        }),
      },
      {
        inputType: 'nestedForm',
        name: 'items',
        label: '',
        textButton: 'Add New',
        required: requiredField,
        columnsPerRow: 6,
        colSpan: 2,
        gridGap: 2,
        formGroups: [
          {
            inputType: 'text',
            name: 'label',
            textLabel: 'Label',
            required: requiredField,
            maxLength: { ...inputLength.firstName },
            pattern: noHtmlTagPattern,
          },
          {
            inputType: 'select',
            name: 'dosage',
            label: 'Dosage',
            required: requiredField,
            labelAccessor: 'label',
            valueAccessor: 'value',
            dependencies: {
              keys: ['label'],
              calc: dosageCalc,
              listenAllChanges: true,
            },
          },
          {
            label: 'Amount/Units',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'amount',
                required: requiredField,
                textLabel: 'Amount',
                maxLength: { value: 5 },
                pattern: regDecimal,
                colSpan: 0.2,
                sx: { width: '70px', marginRight: '4px' },
              },
              {
                inputType: 'select',
                name: 'unit',
                label: 'Unit',
                required: requiredField,
                valueAccessor: 'value',
                labelAccessor: 'name',
                dependencies: {
                  keys: ['dosage'],
                  calc: amountUnitCalc,
                  listenAllChanges: true,
                },
                colSpan: 0.3,
              },
            ],
          },
          {
            ...WiredSelect({
              name: 'frequency',
              label: 'Frequency',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'name',
              options: patientPrescriptionFrequencyOptions,
              colSpan: 0.3,
            }),
          },
          {
            label: 'Duration',
            type: 'group',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'duration',
                required: requiredField,
                textLabel: 'Duration',
                sx: { width: '70px', marginRight: '4px' },
                maxLength: { value: 4 },
              },
              {
                ...WiredSelect({
                  name: 'durationUnit',
                  label: 'Duration Unit',
                  required: requiredField,
                  valueAccessor: 'value',
                  labelAccessor: 'name',
                  options: durationUnitOptions,
                }),
              },
            ],
          },
        ],
      },
    ],
    [amountUnitCalc, dosageCalc]
  );

  const initialData = useMemo(() => {
    const data = cloneDeep(defaultData);
    if (!isEmpty(data)) {
      return {
        medicine: data?.medicine,
        items: data?.items?.map((item) => {
          if (item?.dosage) {
            // eslint-disable-next-line no-param-reassign
            item.dosage = item?.dosage?._id;
          }
          return item;
        }),
      };
    }
    return {};
  }, [defaultData]);

  const id = defaultData?.id;

  const [response, , loading, callMedicineTemplateAPI, clearData] = useCRUD({
    id: `${GET_MEDICINE_TEMPLATE}-CREATE_UPDATE`,
    url: API_URL.patientPrescriptionTemplate,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(defaultData)) {
        const newData = data;
        const dosageInItems = {};
        newData?.medicine?.dosage?.forEach((ele) => {
          dosageInItems[ele?._id] = ele;
        });

        const newItems = newData?.items?.map((ele) => ({
          ...ele,
          dosage: dosageInItems[ele.dosage],
        }));

        newData.medicine = newData?.medicine?.id;
        newData.items = newItems;

        callMedicineTemplateAPI({ data: newData });
      } else {
        const newData = data;
        const dosageInItems = {};
        newData?.medicine?.dosage?.forEach((ele) => {
          dosageInItems[ele?._id] = ele;
        });

        const newItems = newData?.items?.map((ele) => ({
          ...ele,
          dosage: dosageInItems[ele.dosage],
        }));

        data.medicine = data?.medicine?.id;
        const updatedFields = getUpdatedFieldsValue(data, initialData);
        updatedFields.items = newItems;

        if (isEqual(data?.medicine, updatedFields?.medicine))
          delete updatedFields?.medicine;

        if (isEqual(updatedFields?.items, defaultData?.items))
          delete updatedFields?.items;

        if (!isEmpty(updatedFields)) {
          callMedicineTemplateAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callMedicineTemplateAPI, defaultData, initialData, id]
  );

  const onCancel = useCallback(() => {
    reset();
    setDefaultData({});
    setIsAddMedicineTemplate(false);
  }, []);

  useEffect(() => {
    if (response) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      reset();
      setDefaultData({});
      setIsAddMedicineTemplate(false);
      clearData();
      refetchDataList();
    }
  }, [response]);

  return (
    <PageContent style={{ overflow: 'auto' }} loading={loading}>
      <Box sx={{ display: 'flex', mt: 1, mb: 2, alignItems: 'center' }}>
        <IconButton
          variant="secondary"
          sx={{
            boxShadow: 'none',
            padding: 0,
            minWidth: 'unset',
            backgroundColor: 'transparent',
            borderRadius: '50%',
          }}
          onClick={onCancel}
        >
          <img
            src={BackIcon}
            alt="login"
            style={{
              cursor: 'pointer',
              padding: '6px',
              width: 30,
              height: 30,
            }}
          />
        </IconButton>
        <Typography sx={{ my: 2, fontWeight: '400' }} variant="h6">
          Medication Template Details
        </Typography>
      </Box>

      <Box>
        <CustomForm
          formGroups={medicineTemplateFormGroup}
          columnsPerRow={2}
          form={form}
          gridGap={2}
          defaultValue={isEmpty(defaultData) ? {} : initialData}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <CustomButton variant="secondary" onClick={onCancel} label="Cancel" />
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label="Save"
          />
        </Box>
      </Box>
    </PageContent>
  );
};

export default MedicineTemplateForm;
