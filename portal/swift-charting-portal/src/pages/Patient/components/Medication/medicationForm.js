/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { requiredField, roleTypes, successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { SAVE_MEDICATION_DATA } from 'src/store/types';
import {
  WiredMasterAutoComplete,
  WiredStaffField,
  WiredUserField
} from 'src/wiredComponent/Form/FormFields';
import BuildInstructions from './buildInstructions';
import IcdBrowser from './icdBrowser';

const initialData = { status: '1' };

const MedicationForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const { patientId } = useParams();
  const [buildInstructionsModal, setBuildInstructionsModal] = useState();
  const [buildInstructionData, setBuildInstructionData] = useState();
  const [icdBrowserModal, setIcdBrowserModal] = useState(); 
  const [icdBrowserData, setIcdBrowserData] = useState();
  // const [patientData] = usePatientDetail({ allergies:'rash' });
  const [patientData] = usePatientDetail({ patientId });
  const id = defaultData?.id;
  const { handleSubmit, setValue } = form;

  const masterFrequency = useSelector(
    (state) =>
      state?.crud?.get('wired-select-frequencyCode-frequency_type')?.get('read')?.get('data')?.results
  );
  const masterRoute = useSelector(
    (state) =>
      state?.crud?.get('wired-select-routeCode-route_type')?.get('read')?.get('data')?.results
  );
  const masterDirection = useSelector(
    (state) =>
      state?.crud?.get('wired-select-directionCode-direction_type')?.get('read')?.get('data')?.results
  );
  const masterDose = useSelector(
    (state) =>
      state?.crud?.get('wired-select-doseCode-dose_type')?.get('read')?.get('data')?.results
  );
  const masterUnit = useSelector(
    (state) =>
      state?.crud?.get('wired-select-unitCode-unit_type')?.get('read')?.get('data')?.results
  );
  const masterDuration = useSelector(
    (state) =>
      state?.crud?.get('wired-select-durationCode-duration_type')?.get('read')?.get('data')?.results
  );

  useEffect(()=>{
    if(!isEmpty(defaultData)){
      let buildInstructionDefaultData={};
      buildInstructionDefaultData.doseCode = defaultData?.doseCode?.code
      buildInstructionDefaultData.unitCode = defaultData?.unitCode?.code
      buildInstructionDefaultData.frequencyCode = defaultData?.frequencyCode?.code
      buildInstructionDefaultData.routeCode = defaultData?.routeCode?.code
      buildInstructionDefaultData.directionCode = defaultData?.directionCode?.code
      buildInstructionDefaultData.durationCode = defaultData?.durationCode?.code
      setBuildInstructionData(buildInstructionDefaultData)
    }
  },[defaultData])
  const handleBuildInstructions = useCallback(() => {
    setBuildInstructionsModal(true)
  }, []);

  const handleIcdBrowser = useCallback(() => {
    setIcdBrowserModal(true)
  }, []);

  
  const [response, , loading, callMedicationSaveAPI, clearData] = useCRUD({
    id: SAVE_MEDICATION_DATA,
    url: API_URL.medication,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
  
  const closeBuildInstructionModal = useCallback(() => {
    setBuildInstructionsModal(false)
  }, []);

  const closeIcdBrowserModal = useCallback(() => {
    setIcdBrowserModal(false)
  }, []);
 
  const handleBuildInstructionsSave = useCallback(
    (instructions) => {
      const frequencyName = masterFrequency?.find(data => data?.code === instructions?.frequencyCode)?.name;
      const directionName = masterDirection?.find(data => data?.code === instructions?.directionCode)?.name;
      const durationName = masterDuration?.find(data => data?.code === instructions?.durationCode)?.name;
      const routeName = masterRoute?.find(data => data?.code === instructions?.routeCode)?.name;
      const unitName = masterUnit?.find(data => data?.code === instructions?.unitCode)?.name;

      setBuildInstructionData(instructions);

      const ptInstruction = `${instructions?.doseCode} ${unitName} ${routeName} ${frequencyName} ${directionName} ${durationName}`;
      setValue('ptInstruction', ptInstruction,{shouldValidate:true});
      closeBuildInstructionModal();
    },
    [closeBuildInstructionModal, setValue, masterFrequency, masterDose, masterDirection, masterDuration, masterRoute, masterUnit]
  );


  const handleIcdBrowserSave = useCallback((icd,patientDiagnosis) => {
    setIcdBrowserData({icd,patientDiagnosis});
    setValue('rxReasonId', icd,{shouldValidate:true});
    setValue('patientDiagnosisId',patientDiagnosis || null,{shouldValidate:true})
    closeIcdBrowserModal();
  }, [closeBuildInstructionModal, setValue, icdBrowserData]);

  const onHandleSubmit = useCallback(
    (data) => {
      if(data.genericDrugId){
        data.genericDrugId = data.genericDrugId.id
      }
      if(data.brandNameDrugId){
        data.brandNameDrugId = data.brandNameDrugId.id
      }
      if(data.rxReasonId){
        data.rxReasonId = data.rxReasonId.id
      }
      if(data.patientDiagnosisId){
        data.patientDiagnosisId = data.patientDiagnosisId.id
      }

      if (isEmpty(defaultData)) {
        data = {
          ...data, 
          ...buildInstructionData,
        }
        const newData = data;
        callMedicationSaveAPI({ data: {...newData,patientId} });
      } else {
        defaultData.unitCode = defaultData.unitCode.code
        defaultData.doseCode = defaultData.doseCode.code
        defaultData.frequencyCode = defaultData.frequencyCode.code
        defaultData.routeCode = defaultData.routeCode.code
        defaultData.directionCode = defaultData.directionCode.code
        defaultData.durationCode = defaultData.durationCode.code
        data.unitCode=data.unitCode.code
        data.frequencyCode=data.frequencyCode.code
        data.doseCode=data.doseCode.code
        data.routeCode=data.routeCode.code
        data.durationCode=data.durationCode.code
        data.directionCode=data.directionCode.code
        if(buildInstructionData){
          if(data.routeCode && data.routeCode !== buildInstructionData.routeCode){
            data.routeCode = buildInstructionData.routeCode;
          }
          if(data.routeCode && data.doseCode !== buildInstructionData.doseCode){
            data.doseCode = buildInstructionData.doseCode;
          }
          if(data.routeCode && data.unitCode !== buildInstructionData.unitCode){
            data.unitCode = buildInstructionData.unitCode;
          }
          if(data.routeCode && data.durationCode !== buildInstructionData.durationCode){
            data.durationCode = buildInstructionData.durationCode;
          }
          if(data.routeCode && data.directionCode !== buildInstructionData.directionCode){
            data.directionCode = buildInstructionData.directionCode;
          }
          if(data.routeCode && data.frequencyCode !== buildInstructionData.frequencyCode || !data.frequencyCode){
            data.frequencyCode = buildInstructionData.frequencyCode;
          }
        }
        delete data.prescriber;
        
        const updatedFields = getUpdatedFieldsValue(data, defaultData);
        if (!isEmpty(updatedFields)) {
          callMedicationSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      } 
    },
    [callMedicationSaveAPI, buildInstructionData, defaultData, id]
  );


  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`)
      Events.trigger(`ADD_MEDICATION_ON_ENCOUNTER`,response);
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  const calcGenericDrugId = useCallback((data) => {
    if (data?.genericDrugId?.id) {
        return {
          reFetch: true,
          queryParams: { genericDrugId:data?.genericDrugId?.id },
        };
    }
    return { reFetch: false };
  }, []);

  const medicationFormGroups = useMemo(()=>[
    {
      label: 'Allergies',
      component: () => (
        <div 
          style={{
            width: '100%'
          }}
        >
          {!isEmpty(patientData?.allergies) && (
            <div style={{}}>
              <Typography
                style={{
                  // color: palette.text.offWhite,
                  fontSize: '12px',
                  // fontWeight: 600,
                  lineHeight: '18px',
                  backgroundColor: '#FFFF',
                  fontFamily: 'Poppins'
                }}
              >
                Allergies
              </Typography>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              // flexDirection: 'row',
              padding: '10px',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            {patientData?.allergies?.slice(0, 3).map(item => (
              <button
                key={item.id} // Ensure each item has a unique key
                style={{
                  backgroundColor: '#FFFF',
                  border: '0.97px solid #E8E8E8',
                  borderRadius: '3.89px',
                }}
              >
                <Typography
                  style={{
                    fontSize: '13.63px',
                    fontWeight: '400',
                    lineHeight: '20.45px',
                    color: '#666666',
                  }}
                >
                  {item.allergy}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      ),
      colSpan: 1,
    },
    {
      inputType: 'radio',
      name: 'status',
      required: requiredField,
      textLabel: 'Status',
      options:[{label:'Active',value:1},{label:'Discontinued',value:2}, {label:'No Administered',value:3}],
      colSpan: 1,
      gridProps: { fontSize: '12px' },
    },
    {
      ...WiredMasterAutoComplete({
        url:API_URL.genericDrug,
        name: 'genericDrugId',
        label: 'Generic',
        labelAccessor: 'name',
        valueAccessor: 'id',
        required: requiredField,
        // params: { isActive: true },
      }),
    },
    {
      ...WiredMasterAutoComplete({
        url:API_URL.brandDrug,
        name: 'brandNameDrugId',
        label: 'Brand',
        labelAccessor: 'name',
        valueAccessor: 'id',
        cache:false,
        dependencies: {
          keys: ['genericDrugId'],
          calc: calcGenericDrugId,
        },
        required: requiredField,
      }),
    },
    // {
    //   inputType: 'checkBox',
    //   name: 'isActive',
    //   label: 'Add to Favorite',
    //   gridProps: { md: 4 },
    // },
    {
      inputType: 'textArea',
      type:'text',
      name: 'ptInstruction',
      textLabel: 'Pt. Instructions',
      defaultValue: buildInstructionData,
      required: requiredField,
      colSpan: 0.7,
    },
    {
      component: () => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '2rem' }}>
          <LoadingButton label="BUILD INSTRUCTIONS" onClick={handleBuildInstructions}/>
        </div>
      ),
      colSpan: 0.3,
      gridProps: {height:'100%'}
    },
    {
      inputType: 'number',
      type:'text',
      name: 'quantity',
      textLabel: 'Quantity',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      inputType: 'number',
      type:'text',
      name: 'refill',
      textLabel: 'Refill',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      ...WiredMasterAutoComplete({
        url:API_URL.diagnosisIcd,
        label: 'Reason for Rx',
        name: 'rxReasonId',
        colSpan: 0.7,
        placeholder: 'Enter ICD-10 code or name',
        labelAccessor: 'name',
        valueAccessor: 'id',
        required: requiredField,
      }),
    },

    {
      component: () => (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
          <LoadingButton label="BROWSER" onClick={handleIcdBrowser}/>
        </div>
      ),
      colSpan: 0.3,
      cstSx: { paddingLeft: '10px !important', height: '100%', display:'flex', alignItems:'center' },
    },
    {
      ...WiredStaffField({
        name: 'prescriberId',
        label:"Prescriber",
        colSpan:0.5,
        placeholder:'Select',
        required: requiredField,
      }),
    },
    {
      inputType: 'date',
      name: 'startDate',
      textLabel: 'Start on',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      inputType: 'checkBox',
      name: 'administered',
      label: 'Administered During Visit',
      gridProps: { md: 4 },
      colSpan: 1,
    },
    {
      inputType: 'textArea',
      type:'text',
      name: 'additionalInstruction',
      textLabel: 'Additional Instructions',
      // required: requiredField,
      colSpan: 1,
    }
  ],[calcGenericDrugId]);

  useEffect(()=>{
    if(!isEmpty(defaultData)){
      setIcdBrowserData({icd:defaultData?.rxReasonId,patientDiagnosis:defaultData?.patientDiagnosisId})
    }
  },[defaultData])

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={medicationFormGroups}
          columnsPerRow={1}
          defaultValue={isEmpty(defaultData) ? initialData : defaultData}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft:'24px',
          paddingRight:'24px',
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
      {buildInstructionsModal && (
        <ModalComponent
          open={buildInstructionsModal}
          header={{
            title: 'Build Instructions',
            closeIconAction: closeBuildInstructionModal,
          }}
          modalStyle={{ width: '100%'}}
        >
          <BuildInstructions 
            modalCloseAction={closeBuildInstructionModal}
            saveInstructions={handleBuildInstructionsSave}
            style={{ width: '-webkit-fill-available' }}
            defaultData={buildInstructionData} 
            requiredField={requiredField}
          />
        </ModalComponent>
      )}
       {icdBrowserModal && (
        <ModalComponent
          open={icdBrowserModal}
          header={{
            title: 'ICD Browser',
            closeIconAction: closeIcdBrowserModal,
          }}
          modalStyle={{ width: '100%'}}
        >
           <Box>
              <IcdBrowser 
                modalCloseAction={closeIcdBrowserModal}
                saveIcd={handleIcdBrowserSave}
                defaultData={icdBrowserData} 
                patientId={patientId}
              />
          </Box>
        </ModalComponent>
      )}
    </Box>
  );
};

export default MedicationForm;
