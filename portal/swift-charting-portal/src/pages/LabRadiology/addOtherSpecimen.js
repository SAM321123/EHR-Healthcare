import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { MASTER_DATA, SAVE_MASTER_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { regexCustomText, requiredField, successMessage } from 'src/lib/constants';
import {
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';

const AddOtherSpecimen = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
}) => {
 
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = form;
  const globalCategoryTypeCode = watch('globalCategoryTypeCode');
  const [masterFormGroups, setMasterFormGroups] = useState();
  const [response, , loading, callMasterDataSaveAPI, clearData] = useCRUD({
    id: SAVE_MASTER_DATA,
    url: API_URL.saveMasters,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
   const [mastersList, ,masterloading,getMasterList, masterClearData] = useCRUD({
      id: 'specimen-list',
      url: `${API_URL.getMasters}/specimen_types_code`,
      type: REQUEST_METHOD.get,
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
      getMasterList();
      modalCloseAction();
    }
  }, [refetchData, response, defaultData, clearData, modalCloseAction]);
  
  const onHandleSubmit = useCallback(
    (data) => {
      const isDefaultDataEmpty=isEmpty(defaultData);
      if (isDefaultDataEmpty) {
        callMasterDataSaveAPI({ data: { ...data } }, `/${"specimen_types_code"}`);

      } else {
        const updatedFields = getUpdatedFieldsValues(data, defaultData);
        if (!isEmpty(updatedFields)) {
          if(updatedFields.globalCategoryTypeCode){
            updatedFields.globalCategoryTypeCode = updatedFields.globalCategoryTypeCode?.code;
          }
        callMasterDataSaveAPI({ ...updatedFields }, `/update/${defaultData.id}`);
          
        }else{
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callMasterDataSaveAPI, defaultData]
  );

  useEffect(() => {
    const newMasterFormGroups = [
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
        name: 'description',
        textLabel: 'Description',
      },
      {
        inputType: 'number',
        type: 'number',
        name: 'sortOrder',
        required: requiredField,
        textLabel: 'Sort Order',
      },
    ];

    setMasterFormGroups(newMasterFormGroups);
  }, [globalCategoryTypeCode]);
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={masterFormGroups}
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
 
export default AddOtherSpecimen;