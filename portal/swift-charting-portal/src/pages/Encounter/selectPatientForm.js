import { CardActions, CardContent } from '@mui/material'
import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { generatePath, useNavigate } from 'react-router-dom'
import { API_URL } from 'src/api/constants'
import Container from 'src/components/Container'
import LoadingButton from 'src/components/CustomButton/loadingButton'
import CustomForm from 'src/components/form'
import { requiredField } from 'src/lib/constants'
import { encrypt } from 'src/lib/encryption'
import { UI_ROUTES } from 'src/lib/routeConstants'
import { WiredPatientAutoComplete } from 'src/wiredComponent/Form/FormFields'

const patientFormGroup = [  {
    ...WiredPatientAutoComplete({
      name: 'patient',
      label: 'Patient',
      url: API_URL.getPatients,
      params: { isActive: true },
      required: requiredField,
    }),
  
  },]
const SelectPatientForm = ({onClose}) => {
    const form = useForm();
    const {handleSubmit} = form;
  const navigate = useNavigate();


    const onHandleSubmit = useCallback((data)=>{
        const {patient} = data || {};
        if(patient){
            navigate(
                generatePath(UI_ROUTES.addPatientEncounters, {
                  patientId:encrypt(String(patient.id)),
                })
              );
        }
    },[])
  return (
    <Container>
    <CardContent>
        <CustomForm form={form} formGroups={patientFormGroup}/>
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
          label={'Create'}
        />
      </CardActions>
    </Container>
  )
}

export default SelectPatientForm