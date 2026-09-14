import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';

import { useCallback, useEffect, useMemo } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
    successMessage
} from 'src/lib/constants';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';
import { SAVE_PROCEDURE_CODE_DATA } from 'src/store/types';
import { billingCodesFormGroups } from './formFIelds';


const initailData = { qty: 1, useForBillingCode: false };

const AddBillingCode = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
  const formDefaultValues = useMemo(
    () => (!isEmpty(defaultData) ? defaultData : initailData),
    [defaultData]
  );
  const form = useForm({
    mode: 'onChange',
    defaultValues: formDefaultValues,
  });
  const {
    handleSubmit,
    watch,
    setValue,
    clearErrors,
  } = form;
  const useForBillingCode = watch(
    'useForBillingCode',
    formDefaultValues.useForBillingCode
  );
  const formGroups = useMemo(
    () =>
      useForBillingCode
        ? billingCodesFormGroups
        : billingCodesFormGroups.filter((item) => item.name !== 'cptCode'),
    [useForBillingCode]
  );
  const [response, , loading, callTestingLabSaveAPI, clearData] = useCRUD({
    id: SAVE_PROCEDURE_CODE_DATA,
    url: API_URL.procedureCode,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (useForBillingCode === false) {
      setValue('cptCode', '', { shouldValidate: false });
      clearErrors('cptCode');
    }
  }, [useForBillingCode, setValue, clearErrors]);

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

  const onHandleSubmit = useCallback(
    (data) => {
      const isDefaultDataEmpty = isEmpty(defaultData);
      let payload = {};
      if (isDefaultDataEmpty) {
        payload = data;
      } else {
        const updatedFields = getUpdatedFieldsValues(data, defaultData);
        if (!isEmpty(updatedFields)) {
          payload = updatedFields;
        }
      }

      if (!data?.useForBillingCode) {
        payload = {
          ...payload,
          cptCode: '',
        };
      }

      if (isEmpty(payload)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
        return;
      }

      if (isDefaultDataEmpty) {
        callTestingLabSaveAPI({ data: { ...payload } }, `/`);
      } else {
        callTestingLabSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callTestingLabSaveAPI, defaultData]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={formGroups}
          columnsPerRow={1}
          defaultValue={formDefaultValues}
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

export default AddBillingCode;
