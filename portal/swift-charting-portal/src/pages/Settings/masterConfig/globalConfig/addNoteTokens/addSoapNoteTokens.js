import { CardActions, CardContent } from '@mui/material';
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { noHtmlTagPattern, requiredField } from 'src/lib/constants';

const formGroups = [  {
  inputType: 'text',
  name: 'label',
  textLabel: 'Label',
  placeholder: 'Enter Field Label',
  required: requiredField,
  pattern: noHtmlTagPattern,
} , {
    inputType: 'tags',
    name: 'options',
    label: 'Options',
    multiple:true,
    optionsParser: (tagOptions) => tagOptions.map((option) => option.label || option),
  },]
const AddSoapNoteTokens = ({defaultData,modalCloseAction,onSave}) => {
  console.log("🚀 ~ AddSoapNoteTokens ~ defaultData:", defaultData)
  const form = useForm({mode:'onChange'});
  const {handleSubmit} = form || {}

  const onHandleSubmit =useCallback((data)=>{
    onSave(data,defaultData?.index);
  },[])

  return (
    <div>
      <CardContent>
        <CustomForm form={form} formGroups={formGroups} defaultValue={defaultData?.data}/>
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
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
    </div>
  )
}

export default AddSoapNoteTokens