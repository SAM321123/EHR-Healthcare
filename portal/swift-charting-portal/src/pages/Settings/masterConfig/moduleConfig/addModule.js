import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';

import { useCallback, useEffect } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
    successMessage
} from 'src/lib/constants';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';
import { SAVE_ROLE_DATA } from 'src/store/types';
import { moduleFormGroups } from './formFields';

const AddModule = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
  const [response, , loading, callModuleSaveAPI, clearData] = useCRUD({
    id: SAVE_ROLE_DATA,
    url: API_URL.module,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

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
      if (isEmpty(payload)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
        return;
      }

      if (isDefaultDataEmpty) {
        callModuleSaveAPI({ data: { ...payload } });
      } else {
        callModuleSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callModuleSaveAPI, defaultData]
  );

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={moduleFormGroups}
          columnsPerRow={1}
          defaultValue={defaultData}
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

export default AddModule;
