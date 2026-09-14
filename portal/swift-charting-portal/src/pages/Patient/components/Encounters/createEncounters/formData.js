import React from 'react';
import AllergiesList from '../../Allergies';
import DiagnosisList from '../../Diagnosis';
import LabRadiologyList from '../../LabRadiology';
import MedicationList from '../../Medication/medicationList';
import SoapForm from '../../Soap/soapForm';
import VitalsList from '../../Vitals';
import DynamicForm from './dynamicForm';

const componentMapping = {
    allergiesList:AllergiesList,
    diagnosisList:DiagnosisList,
    vitalsList:VitalsList,
    medicationList:MedicationList,
    labList:LabRadiologyList,
    soapForm:SoapForm,
    dynamicForm:DynamicForm,
}

const FormData = ({data}) => {
    const Component = componentMapping[data?.type] 

    return <Component showPatientInfo={false} applyContainer={false} asPopUp={true} {...data}/>
}

export default React.memo(FormData);