import { CardActions, CardContent } from '@mui/material';
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { regTextArea, requiredField } from 'src/lib/constants';

const formGroups = [  {
  inputType: 'text',
  name: 'cptCode',
  textLabel: 'CPT Code',
  pattern:regTextArea,
  required: requiredField,
  colSpan:0.25
}, {
  inputType: 'text',
  name: 'name',
  textLabel: 'Name',
  pattern:regTextArea,
  required: requiredField,
  colSpan:0.5
},  {
    inputType: 'text',
    name: 'price',
    textLabel: 'Price',
    pattern:regTextArea,
    required: requiredField,
    colSpan:0.25
  },
  {
    inputType: 'textArea',
    name: 'description',
    textLabel: 'Description',
    colSpan: 1,
    pattern:regTextArea,
    required: requiredField,
  },
]
const CustomProcedureForm = ({onSave,onClose}) => {
    const form = useForm({mode:'onChange'});
    const {handleSubmit}= form;
    const onHandleSubmit =useCallback((data)=>{
        onSave(data);
    },[])
  return (
    <Container>
    <CardContent>
     <CustomForm form={form} formGroups={formGroups}  />
        
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
      onClick={onClose}
      label="Cancel"
    />
    <LoadingButton
      onClick={handleSubmit(onHandleSubmit)}
      label={'Save'}
    />
  </CardActions>
  </Container>
  )
}

export default CustomProcedureForm