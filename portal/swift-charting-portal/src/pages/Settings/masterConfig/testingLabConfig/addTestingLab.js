import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_TESTING_LAB_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { regexCustomText, requiredField, successMessage } from 'src/lib/constants';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';
import { WiredMasterField } from 'src/wiredComponent/Form/FormFields';

const AddTestingLab = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
 
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;
  const [testingLabFormGroups, setTestingLabFormGroups] = useState();
  const [response, , loading, callTestingLabSaveAPI, clearData] = useCRUD({
    id: SAVE_TESTING_LAB_DATA,
    url: API_URL.testingLab,
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
        callTestingLabSaveAPI({ data: { ...payload } }, `/`);
      } else {
        callTestingLabSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callTestingLabSaveAPI, defaultData]
  );

  useEffect(() => {
    const newTestingLabFormGroups = [
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
        name: 'labId',
        textLabel: 'Lab Id',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'ftpUser',
        textLabel: 'FTP User',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'ftpPath',
        textLabel: 'FTP Path',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        ...WiredMasterField({
          code: 'hl7_versions',
          filter: { limit: 20 },
          name: 'hl7VersionCode',
          label: 'HL7 Version',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.5,
          required: requiredField,
          placeholder: 'Select',
          cache: false,
        }),
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'ftpHost',
        textLabel: 'FTP Host',
        pattern: regexCustomText,
      },
      {
        inputType: 'text',
        type: 'password',
        name: 'ftpPassword',
        textLabel: 'FTP Password',
        required: requiredField,
        gridProps: { md: 12 },
        pattern: {}
      },
    ];
    setTestingLabFormGroups(newTestingLabFormGroups);
  }, []);
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={testingLabFormGroups}
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
 
export default AddTestingLab;
 