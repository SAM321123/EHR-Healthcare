/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { InputAdornment } from '@mui/material';
import { useForm } from 'react-hook-form';

import Box from 'src/components/Box';
import {
  requiredField,
  successMessage,
  inputLength,
  alphanumericPattern,
} from 'src/lib/constants';
import CustomForm from 'src/components/form';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { ADD_PRODUCTS } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import Currency from 'src/components/Currency';
import { WiredServiceField } from 'src/wiredComponent/Form/FormFields';

const productFormGroup = (form) => [
  {
    inputType: 'text',
    name: 'name',
    textLabel: 'Name',
    required: requiredField,
    colSpan: 2,
    maxLength: { ...inputLength.name },
  },
  {
    inputType: 'text',
    name: 'sku',
    textLabel: 'SKU',
    required: requiredField,
    pattern: alphanumericPattern,
  },
  {
    inputType: 'text',
    type: 'number',
    name: 'price',
    textLabel: 'Price',
    required: requiredField,
    maxLength: { value: 5 },
    isShrink: true,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <Currency />
        </InputAdornment>
      ),
    },
  },
  {
    inputType: 'text',
    name: 'description',
    minRows: 3,
    textLabel: 'Description',
    multiline: true,
    colSpan: 2,
    placeholder: 'Type Short Description here',
    maxLength: { ...inputLength.commonTextLength },
  },
  {
    inputType: 'checkBox',
    name: 'isConsultationRequired',
    label: 'Require Consultation',
    colSpan: 2,
  },
  ...(form.getValues('isConsultationRequired')
    ? [
        {
          ...WiredServiceField({
            label: 'Service',
            fetchInitial: true,
            filter: { isActive: true },
            required: requiredField,
            options: [],
          }),
        },
        {
          inputType: 'text',
          type: 'number',
          name: 'consultationExpiry',
          textLabel: 'Consultation expire in (days)',
          required: { value: true, message: 'Expiry day is required' },
          maxLength: { value: 3 },
        },
      ]
    : []),
];

const ProductForm = ({
  modalCloseAction,
  handleOnFetchDataList,
  singleProductResponse,
}) => {
  const form = useForm();
  const { handleSubmit, watch } = form;
  watch(['isConsultationRequired']);

  const {
    consultationExpiry,
    description,
    isConsultationRequired = false,
    name,
    price,
    service,
    sku,
    id,
  } = singleProductResponse || {};

  const defaultData = useMemo(
    () =>
      singleProductResponse && {
        consultationExpiry,
        description,
        isConsultationRequired,
        name,
        price,
        service: service?.id,
        sku,
      },
    [
      consultationExpiry,
      description,
      isConsultationRequired,
      name,
      price,
      service,
      singleProductResponse,
      sku,
    ]
  );

  const [productsData, error, loading, callProductsAPI, clearData] = useCRUD({
    id: ADD_PRODUCTS,
    url: !id ? API_URL.product : `${API_URL.product}/${id}`,
    type: !id ? REQUEST_METHOD.CREATE : REQUEST_METHOD.update,
  });

  const onHandleSubmit = useCallback(
    (data) => {
      const isConsultation = data?.isConsultationRequired
        ? data?.isConsultationRequired
        : false;
      const consultationExpiryDay = data?.isConsultationRequired
        ? Number(data?.consultationExpiry)
        : data?.consultationExpiry;
      const payload = {
        ...data,
        isConsultationRequired: isConsultation,
        consultationExpiry: consultationExpiryDay,
      };
      if (id) {
        const updatedFields = getUpdatedFieldsValue(payload, defaultData);
        if (isEmpty(updatedFields)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        }
        callProductsAPI(updatedFields);
        return;
      }
      callProductsAPI({ data: payload });
    },
    [callProductsAPI, defaultData, id]
  );

  useEffect(() => {
    if (!error && !isEmpty(productsData)) {
      showSnackbar({
        message: !id ? successMessage.create : successMessage.update,
        severity: 'success',
      });
      modalCloseAction();
      clearData(true);
      handleOnFetchDataList();
    }
  }, [error, productsData]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          formGroups={productFormGroup(form)}
          form={form}
          columnsPerRow={2}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'center',
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
          label="Submit"
        />
      </CardActions>
    </Box>
  );
};

export default ProductForm;
