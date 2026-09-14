/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import cloneDeep from 'lodash/cloneDeep';

import CustomForm from 'src/components/form';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { GET_PHARMACY_ORDER_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import {
  getShipAndPayeeForm,
  getUpdatedFieldsValue,
  showSnackbar,
} from 'src/lib/utils';
import {
  inputLength,
  onlyNumber,
  regexCommonText,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import { WiredMedicineAutoComplete } from 'src/wiredComponent/Form/FormFields';
import PageContent from 'src/components/PageContent';
import PageHeader from 'src/components/PageHeader';

const PatientOrderForm = ({
  modalCloseAction,
  refetchData,
  defaultData,
  onPressBackIcon,
  selectedPharmacyOrder,
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const id = selectedPharmacyOrder?.id;

  const calc = useCallback((data, index) => {
    if (data?.items.length) {
      const medicineData = data.items[index]?.medicine;

      if (medicineData) {
        const optionData = medicineData?.dosage?.map((item) => ({
          label: `${item?.strength} ${item?.strengthUnit} in ${item?.volume} ${item?.quantityUnit} ${item?.form}`,
          value: item?._id,
        }));
        return { reFetch: true, options: optionData };
      }
    }
    return { reFetch: false };
  }, []);

  const [pharmacyOrderData, , , callOrderApi] = useCRUD({
    id: `${GET_PHARMACY_ORDER_DATA}-EDIT`,
    url: `${API_URL.pharmacyOrder}/${id}`,
    type: REQUEST_METHOD.get,
  });

  const initialData = useMemo(() => {
    const data = cloneDeep(pharmacyOrderData);
    if (!isEmpty(data)) {
      data.items = pharmacyOrderData?.items?.map?.((item) => ({
        ...item,
        dosage: item?.dosage?._id,
      }));
      data.patient = pharmacyOrderData?.patient?.id;

      return data;
    }
    return {};
  }, [pharmacyOrderData]);

  const [response, , loading, callApi, clearData] = useCRUD({
    id: GET_PHARMACY_ORDER_DATA,
    url: API_URL.pharmacyOrder,
    type: isEmpty(selectedPharmacyOrder)
      ? REQUEST_METHOD.create
      : REQUEST_METHOD.update,
  });

  const handleValidateSelection = useCallback(
    (selectedValue) => {
      const { items = [] } = form.getValues();
      const isValid = items.findIndex((item) => item.dosage === selectedValue);
      if (isValid <= -1) {
        return true;
      }
      showSnackbar({
        message: 'Medication already selected for this Order',
        severity: 'error',
      });
      return false;
    },
    [form]
  );

  const patientOrderFormGroups = useMemo(
    () => [
      {
        inputType: 'radio',
        name: 'payee',
        textLabel: 'Pay By',
        required: requiredField,
        options: getShipAndPayeeForm(),
        colSpan: 0.5,
      },
      {
        inputType: 'radio',
        name: 'shipTo',
        textLabel: 'Ship To',
        required: requiredField,
        options: getShipAndPayeeForm(),
        colSpan: 0.5,
      },
      {
        inputType: 'nestedForm',
        name: 'items',
        label: 'Medication Details',
        textButton: 'Add New',
        required: requiredField,
        columnsPerRow: 4,
        colSpan: 2,
        formGroups: [
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
            inputType: 'select',
            name: 'dosage',
            label: 'Dosage',
            labelAccessor: 'label',
            valueAccessor: 'value',
            required: requiredField,
            dependencies: {
              keys: ['medicine'],
              calc,
            },
            validateSelection: handleValidateSelection,
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'quantity',
            textLabel: 'Quantity',
            required: requiredField,
            maxLength: { value: 3 },
            pattern: {
              value: onlyNumber.value,
              message: `Quantity ${onlyNumber.message}`,
            },
            colSpan: 0.1,
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'refill',
            textLabel: 'Refill',
            maxLength: { value: 3 },
            pattern: {
              value: onlyNumber.value,
              message: `Quantity ${onlyNumber.message}`,
            },
            colSpan: 0.1,
          },
          {
            inputType: 'text',
            name: 'direction',
            textLabel: 'Direction',
            pattern: {
              value: regexCommonText.value,
              message: `Direction ${regexCommonText.message}`,
            },
            maxLength: { ...inputLength.commonTextLength },
            colSpan: 2,
          },
        ],
      },
      {
        inputType: 'text',
        name: 'note',
        textLabel: 'Additional Note',
        multiline: true,
        minRows: 3,
        colSpan: 2,
        maxLength: { ...inputLength.commonTextLength },
      },
    ],
    [calc]
  );

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(selectedPharmacyOrder)) {
        const { items, patient, note, payee, shipTo } = data || {};
        const payload = {
          patient: patient?.id,
          note,
          payee,
          shipTo,
        };
        if (!isEmpty(defaultData)) {
          payload.patientOrder = defaultData?.id;
        }
        if (items?.length) {
          const item = items?.map?.(
            ({ quantity, direction, medicine, dosage, refill }) => {
              const newItem = {
                quantity,
                direction,
                refill,
                medicine: medicine?.id,
                dosage: medicine?.dosage?.find((med) => med?._id === dosage),
              };
              if (isEmpty(newItem?.refill)) {
                delete newItem?.refill;
              }
              return newItem;
            }
          );
          callApi({ data: { ...payload, items: item } });
        }
      } else {
        delete data?.faxContact;
        delete data?.faxHistory;
        delete data?.patientPrescription;
        delete data?.practice;
        delete data?.__updatedBy;

        const updatedFields = getUpdatedFieldsValue(data, initialData);

        if (updatedFields?.__updatedBy) delete updatedFields?.__updatedBy;
        if (isEqual(updatedFields?.items, initialData?.items))
          delete updatedFields?.items;
        else {
          const { items } = updatedFields || {};
          if (items?.length) {
            const item = items?.map?.(
              ({ quantity, direction, medicine, dosage, refill }) => {
                const newItem = {
                  quantity,
                  direction,
                  refill,
                  medicine: medicine?.id,
                  dosage: medicine?.dosage?.find((med) => med?._id === dosage),
                };
                if (isEmpty(newItem?.refill)) {
                  delete newItem?.refill;
                }
                return newItem;
              }
            );
            updatedFields.items = item;
          }
        }

        if (!isEmpty(updatedFields)) {
          callApi({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callApi, defaultData, initialData]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.update
          : successMessage.create,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [clearData, modalCloseAction, refetchData, response]);

  useEffect(() => {
    if (id) {
      callOrderApi();
    }
  }, [id]);

  return (
    <PageContent style={{ overflowY: 'auto' }}>
      <PageHeader
        showBackIcon
        title="Patient Order Detail"
        onPressBackIcon={
          isFunction(onPressBackIcon) ? onPressBackIcon : modalCloseAction
        }
      />
      <CardContent>
        <CustomForm
          form={form}
          formGroups={patientOrderFormGroups}
          columnsPerRow={2}
          gridGap={1}
          defaultValue={isEmpty(defaultData) ? initialData : defaultData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'end',
        }}
      >
        <CustomButton
          variant="secondary"
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </PageContent>
  );
};

export default PatientOrderForm;
