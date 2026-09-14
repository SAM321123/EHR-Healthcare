import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_MASTER_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import {WiredMasterAutoComplete} from 'src/wiredComponent/Form/FormFields';
import { regexCustomText, requiredField, successMessage } from 'src/lib/constants';
import {
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';
import { Typography } from '@mui/material';
import { tagsColorCodes } from 'src/lib/constants';
import SoapNoteTokensList from './addNoteTokens/soapNoteTokensList';

const AddMasterData = ({
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
      const isDefaultDataEmpty=isEmpty(defaultData);
      const globalCategoryTypeCode = data?.globalCategoryTypeCode?.code;
      if (isDefaultDataEmpty) {
        delete data.globalCategoryTypeCode;
        callMasterDataSaveAPI({ data: { ...data } }, `/${globalCategoryTypeCode}`);

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


  const ColorComponent = (props) => {
    const { form } = props || {};
    const { setValue = () => {}, getValues = () => {} } = form || {};
    const defaultColor = getValues('colorCode');
    const [selectedColor, setSelectedColor] = useState("#3498db");
    useEffect(() => {
      if (defaultColor) {
        setSelectedColor(defaultColor);
      } else {
        setValue('colorCode', '#3498db' , {
          shouldDirty: false,
        });
      }
    }, [defaultColor]);
    const handleClick = ({ colorCode }) => {
      const newColor = { color: colorCode };
      setSelectedColor(newColor);

      setValue('colorCode', newColor?.color)
    };
    return (
      <Box>
        <Typography mb={1}>Choose the color for the tag:</Typography>
        <Box style={{ display: 'flex', gap: 10 }}>
          {tagsColorCodes?.map((colorCode, index) => (
            <Box
              key={index}
              style={{
                backgroundColor: colorCode,
                width: 20,
                height: 20,
                cursor: 'pointer',
                ...(selectedColor === colorCode
                  ? {
                      border: '2px solid #78ff00',
                      boxShadow: '-1px 2px 20px 0 rgba(0, 0, 0, 0.4)',
                    }
                  : {}),
              }}
              onClick={() => handleClick({ colorCode })}
            />
          ))}
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    const newMasterFormGroups = [
      {
        ...WiredMasterAutoComplete({
          url: API_URL.globalTypeCategory,
          label: 'Global Type Category',
          name: 'globalCategoryTypeCode',
          placeholder: 'Search by keyword(s) or code',
          cache: false,
          labelAccessor: 'name',
          valueAccessor: 'code',
          required: requiredField,
          showDescription: true,
          descriptionAccessor: 'description',
          filter: { isActive: true },
        }),
      },
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

    if ((globalCategoryTypeCode && globalCategoryTypeCode?.isColorCode) || defaultData?.colorCode) {
      newMasterFormGroups.push({ 
        inputType: 'custome',
        name: 'colorCode', 
        component: ColorComponent
      })
    }

    if (globalCategoryTypeCode==='soap_note_template' || globalCategoryTypeCode?.code ==='soap_note_template' ) {
      newMasterFormGroups.push({ 
        inputType: 'custome',
        name: 'colorCode', 
        component:({form})=> <SoapNoteTokensList outerForm={form}/>,
        
      })
    }

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
 
export default AddMasterData;
 