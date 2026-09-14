import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_LAB_TEST_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { regexCustomText, requiredField, successMessage } from 'src/lib/constants';
import {
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';

const AddLabTest = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
 
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;
  const [labTestFormGroups, setLabTestFormGroups] = useState();
  const [response, , loading, callLabTestSaveAPI, clearData] = useCRUD({
    id: SAVE_LAB_TEST_DATA,
    url: API_URL.laboratoryTest,
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
      const isDefaultDataEmpty=isEmpty(defaultData)
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
        callLabTestSaveAPI({ data: { ...payload } }, `/`);
      } else {
        callLabTestSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callLabTestSaveAPI, defaultData]
  );

  useEffect(() => {
    const newLabTestFormGroups = [
      {
        inputType: 'text',
        type: 'text',
        name: 'name',
        required: requiredField,
        textLabel: 'Name',
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'cptCode',
        textLabel: 'Cpt Code',
        required: requiredField,
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'loincCode',
        textLabel: 'Loinc Code',
        required: requiredField,
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        inputType: 'textArea',
        type: 'text',
        name: 'description',
        textLabel: 'Description',
        pattern: regexCustomText,
      },
    ];
    setLabTestFormGroups(newLabTestFormGroups);
  }, []);
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={labTestFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? {} : defaultData}
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
 
export default AddLabTest;
 