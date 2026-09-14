import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import IconButton from '@mui/material/IconButton';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import {
  formTypeOption,
  inputLength,
  quantityUnitOptions,
  regDecimal,
  regexCommonText,
  requiredField,
  strengthUnitOptions,
  successMessage,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { GET_MEDICINE_DATA } from 'src/store/types';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import BackIcon from '../../../assets/images/svg/back.svg';

const medicineFormGroup = [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    maxLength: { ...inputLength.name },
    pattern: {
      value: regexCommonText.value,
      message: `Name ${regexCommonText.message}`,
    },
  },
  // {
  //   inputType: 'text',
  //   name: 'genericName',
  //   textLabel: 'Generic Name',
  //   maxLength: { ...inputLength.name },
  //   pattern: {
  //     value: regexCommonText.value,
  //     message: `Generic Name ${regexCommonText.message}`,
  //   },
  // },
  {
    inputType: 'nestedForm',
    name: 'dosage',
    label: 'Dosage details for active ingredients',
    textButton: 'Add New',
    required: requiredField,
    columnsPerRow: 6,
    colSpan: 2,
    gridGap: 2,
    formGroups: [
      {
        inputType: 'text',
        type: 'number',
        name: 'strength',
        textLabel: 'Strength',
        required: requiredField,
        maxLength: { value: 5 },
        pattern: regDecimal,
        colSpan: 0.2,
      },
      {
        ...WiredSelect({
          name: 'strengthUnit',
          label: 'Strength Unit',
          required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'name',
          options: strengthUnitOptions,
        }),
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'volume',
        required: requiredField,
        textLabel: 'Volume',
        maxLength: { value: 5 },
        pattern: regDecimal,
        colSpan: 0.2,
      },
      {
        ...WiredSelect({
          name: 'quantityUnit',
          label: 'Volume Unit',
          required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'name',
          options: quantityUnitOptions,
        }),
      },
      {
        ...WiredSelect({
          name: 'form',
          label: 'Form',
          required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'name',
          options: formTypeOption,
        }),
      },
      {
        inputType: 'text',
        name: 'description',
        textLabel: 'Description',
        maxLength: { ...inputLength.commonTextLength },
        pattern: {
          value: regexCommonText.value,
          message: `Description ${regexCommonText.message}`,
        },
        colSpan: 2,
      },
    ],
  },
];
const Medicines = ({
  form,
  refetchDataList,
  defaultData,
  setIsAddMedicine,
  setDefaultData,
}) => {
  const { handleSubmit, reset } = form;

  const initialData = useMemo(() => {
    const data = cloneDeep(defaultData);
    if (!isEmpty(defaultData)) {
      data.name = defaultData?.name;
      data.genericName = defaultData?.genericName;
      data.dosage = defaultData?.dosage?.map(({ _id, ...rest }) => {
        const result = { ...rest };
        result.volume = result?.volume?.toString();
        return result;
      });
      return data;
    }
    return {};
  }, [defaultData]);

  const id = defaultData?.id;

  const [response, , loading, callMedicineAPI, clearData] = useCRUD({
    id: isEmpty(defaultData)
      ? `${GET_MEDICINE_DATA}-create`
      : `${GET_MEDICINE_DATA}-${id}`,
    url: API_URL.medicine,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(defaultData)) {
        const newData = data;
        callMedicineAPI({ data: newData });
      } else {
        // eslint-disable-next-line  no-param-reassign
        data.dosage = data?.dosage.map(({ _id, ...rest }) => {
          const result = { ...rest };
          Object.keys(rest).forEach((key) => {
            if (!rest[key]) delete result[key];
          });
          return result;
        });

        const updatedFields = getUpdatedFieldsValue(data, initialData);
        if (
          isEqual(
            JSON.stringify(updatedFields?.dosage),
            JSON.stringify(initialData?.dosage)
          )
        ) {
          delete updatedFields?.dosage;
        }
        if (!isEmpty(updatedFields)) {
          callMedicineAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callMedicineAPI, defaultData, id, initialData]
  );

  const onCancel = useCallback(() => {
    reset();
    setDefaultData({});
    setIsAddMedicine(false);
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
      setIsAddMedicine(false);
      clearData();
      refetchDataList();
    }
  }, [response]);

  return (
    <PageContent style={{ overflow: 'auto' }} loading={loading} disableGutters>
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
          Medication Details
        </Typography>
      </Box>

      <Box>
        <CustomForm
          formGroups={medicineFormGroup}
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

export default Medicines;
