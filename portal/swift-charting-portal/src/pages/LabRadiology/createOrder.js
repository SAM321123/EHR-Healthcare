import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useForm } from 'react-hook-form';
 
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_LABS_RADIOLOGY_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { useParams } from 'react-router-dom';
import IcdBrowser from '../Patient/components/Medication/icdBrowser';
import ModalComponent from 'src/components/modal';
import {
  WiredLocationField,
  WiredMasterAutoComplete,
  WiredMasterField,
  WiredPatientAutoComplete,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';
import { requiredField, roleTypes, successMessage, regexCustomText, dateFormats } from 'src/lib/constants';
import {
  getUTCDateTime,
  getUpdatedFieldsValues,
  showSnackbar,
} from 'src/lib/utils';
import PatientInfo from '../Patient/components/patientInfo';
import Events from 'src/lib/events';
import Typography from 'src/components/Typography';
 
import { decrypt } from 'src/lib/encryption';
import { Button } from '@mui/material';
import AddOtherSpecimen from './addOtherSpecimen';

const showSendingDetailsFieldGroup = (data) => {
  if (data.sendingDetails) {
    return { hide: false };
  }
  return { hide: true };
};
 
const showPatientInfo =(data)=>{
  if (data.patientId) {
    return { hide: false };
  }
  return { hide: true };
}
 
// const showProviderInfo =(data) => {
//   if(data.providerId) {
//     return { hide: false };
//   }
//   return { hide: true };
// }
 
const CreateOrder = ({
  modalCloseAction,
  defaultData,
  refetchData = () => {},
  fromMain=false,
}) => {

  const params = useParams();
  let { patientId } = params || {};
if(params.patientId){
  patientId =decrypt(patientId)
}

  const [icdBrowserModal, setIcdBrowserModal] = useState();
  const [icdBrowserData, setIcdBrowserData] = useState();
  const [otherSpecimen, setOtherSpecimen] = useState(false);
 
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue } = form;
 
  const [response, , loading, callLabRadiologoSaveAPI, clearData] = useCRUD({
    id: SAVE_LABS_RADIOLOGY_DATA,
    url: API_URL.labsRadiology,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
 
  useEffect(()=>{
    if(!isEmpty(defaultData)){
      setIcdBrowserData({icd:defaultData?.diagnosisIcdId,patientDiagnosis:defaultData?.patientDiagnosisId})
    }
  },[defaultData])
 
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
      Events.trigger(`ADD_LAB_ORDER_ON_ENCOUNTER`,response);
      modalCloseAction();
    }
  }, [refetchData, response, defaultData, clearData, modalCloseAction,patientId]);

  const handleIcdBrowser = useCallback(() => {
    setIcdBrowserModal(true);
  }, []);
 
  const handleOtherSpecimenModal = () =>{
    setOtherSpecimen(true);
  } 
 
  const handleCloseSpecimenModal = () => {
    setOtherSpecimen(false);
  }
  useEffect(()=>{
    if(isEmpty(defaultData) && !fromMain){
      form.setValue('patientId',{id:patientId})
    }
    form.setValue('hl7VersionCode','2.8')

  },[fromMain,defaultData]);
 
  const ordersFormGroups = useMemo(
    () => [
      {
        ...WiredPatientAutoComplete({
          name: 'patientId',
          label: 'Patient',
          url: API_URL.getPatients,
          colSpan: 1,
          params: { isActive: true },
          required: requiredField,
          hide:!fromMain,
          disabled: defaultData
        }),
      },
      {
        component:()=><PatientInfo wrapperStyle={{flex:1}} customPatientId={form.getValues('patientId')?.id}/>,
        dependencies: {
          keys: ['patientId'],
          calc: showPatientInfo,
        },
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Provider's Information</Typography>
      },
      {
        ...WiredStaffField({
          name: 'providerId',
          label: 'Who is the ordering provider?',
          required: requiredField,
          placeholder: 'Select',
        }),
      },
      // {
      //   component:()=><PatientInfo wrapperStyle={{flex:1}} customPatientId={form.getValues('providerId')?.id}/>,
      //   dependencies: {
      //     keys: ['providerId'],
      //     calc: showProviderInfo,
      //   },
      // },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Urgency/Priority</Typography>
      },
      {
        inputType: 'radio',
        name: 'priority',
        textLabel: 'Routine vs. stat (urgent) testing',
        // label: 'Stat?',
        options:[{label:'Stat (urgent)',value:'stat'},{label:'Routine',value:'routine'}],
        gridProps: { md: 4 },
        required: requiredField,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        name: 'requiredTestingTime',
        textLabel: 'Specific timing requirements for testing (e.g., results needed before surgery)',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Payer *</Typography>
      },
      {
        ...WiredMasterField({
          code: 'billing_type',
          filter: { limit: 100 },
          // textLabel: 'Payer',
          name: 'payer',
          labelAccessor: 'name',
          valueAccessor: 'code',
          placeholder: 'Select',
          required: requiredField,
          cache: false,
        }),
      },
      {
        ...WiredMasterAutoComplete({
          url: API_URL.diagnosisIcd,
          label: 'Diagnosis',
          name: 'diagnosisIcdId',
          colSpan: 0.7,
          placeholder: 'Search by keyword(S) or code',
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
        component: () => (
          <div
            style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}
          >
            <LoadingButton label="BROWSER" onClick={handleIcdBrowser} />
          </div>
        ),
        colSpan: 0.3,
        cstSx: {
          paddingLeft: '10px !important',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        },
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Tests Order</Typography>
      },
      {
        ...WiredMasterAutoComplete({
          filter: { limit: 20, isActive: true },
          name: 'laboratoryTestIds',
          label: 'Laboratory Test',
          labelAccessor: ['name', 'cptCode', 'loincCode'],
          valueAccessor: 'id',
          colSpan: 1,
          placeholder: 'Search by keywords(s) or code...',
          cache: false,
          url: API_URL.laboratoryTest,
          multiple: true,
          getOptionLabel: (option) => {
            return option
              ? `${option.name} (CPT: ${option.cptCode}, LOINC: ${option.loincCode})${option.description ? ' - ' + option.description : ''}`
              : '';
          },
        }),
      },
      {
        ...WiredMasterAutoComplete({
          code: 'otherLaboratoryTest',
          label: 'Other Laboratory Test',
          name: 'otherLaboratoryTest',
          pattern: regexCustomText,
          colSpan: 1,
          placeholder: 'Enter here',
          cache: false,
          multiple: true,
          labelAccessor: 'name',
          valueAccessor: 'code',
          freeSolo: true,
        }),
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Specimen Details</Typography>
      },
      {
        ...WiredMasterField({
          code: 'specimen_types_code',
          filter: { limit: 20 },
          name: 'specimenTypeCode',
          crudId: 'specimen-list',
          label: 'Type of specimen (blood, urine, stool, etc)',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.4,
          required: requiredField,
          placeholder: 'Select',
          cache: false,
          multiple: true
        }),
      },
      {
        component: () => (
          <div>
            <Button variant="outlined" size="small" onClick={handleOtherSpecimenModal}>
              Other Specimen
            </Button>
          </div>
        ),
        colSpan: 0.2,
        cstSx: {
          paddingLeft: '10px !important',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        },
      },
      {
        inputType: 'text',
        type: 'text',
        name: 'siteOfCollection',
        textLabel: 'Site of collection (if applicable, e.g., left arm vein for blood draw)',
        colSpan: 0.4,
      },
      {
        inputType: 'dateTime',
        name: 'collectionDateTime',
        textLabel: 'Collection date and time ',
        colSpan: 0.33,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'specimenQuantity',
        textLabel: 'Quantity',
        colSpan: 0.33,
      },
      {
        inputType: 'text',
        type: 'number',
        name: 'specimenVolume',
        textLabel: 'Volume (ml)',
        colSpan: 0.33,
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}> Clinical Indications/Reason for Test</Typography>
      },
      {
        inputType: 'textArea',
        name: 'clinicalInfo',
        textLabel: 'Relevant clinical information (goes with the order)',
      },
      {
        ...WiredMasterAutoComplete({
          code: 'family_condition',
          label: 'Differential diagnoses or suspected conditions ',
          name: 'suspectedCondition',
          colSpan: 1,
          placeholder: 'Enter here',
          cache: false,
          multiple: true,
          labelAccessor: 'name',
          valueAccessor: 'code',
          freeSolo: true,
        }),
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Special Instructions</Typography>
      },
      {
        inputType: 'radio',
        name: 'fasting',
        textLabel: 'Fasting status (if required for specific tests) ',
        options:[{label:'Yes',value: 1},{label: 'No',value:2}, {label: 'Unknown', value:3}],
        gridProps: { md: 4 },
        required: requiredField,
      },
      {
        inputType: 'text',
        name: 'sensitiveInsTime',
        textLabel: 'Time-sensitive instructions (e.g., collect early morning urine) ',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        name: 'patientPrepIns',
        textLabel: 'Patient preparation instructions (e.g., withhold medications) ',
        pattern: regexCustomText,
        colSpan: 0.5,
      },
      {
        component:()=><Typography style={{fontWeight: 'bolder'}}>Additional Information</Typography>
      },
      {
        ...WiredMasterAutoComplete({
          code: 'allergies',
          label: 'Allergies or contraindications relevant to the testing (e.g., latex allergy) ',
          name: 'allergies',
          pattern: regexCustomText,
          colSpan: 1,
          placeholder: 'Enter here',
          cache: false,
          multiple: true,
          labelAccessor: 'name',
          valueAccessor: 'code',
          freeSolo: true,
        }),
      },
      {
        ...WiredMasterAutoComplete({
          
          code: 'medicalHistory',
          label: 'Relevant medical history impacting testing (e.g., chronic conditions)',
          name: 'medicalHistory',
          pattern: regexCustomText,
          colSpan: 1,
          placeholder: 'Enter here',
          cache: false,
          multiple: true,
          labelAccessor: 'name',
          valueAccessor: 'code',
          freeSolo: true,
        }),
      },
      {
        inputType: 'checkBox',
        name: 'sendingDetails',
        label: 'Add Sending Details?',
        gridProps: { md: 4 },
      },
      {
        ...WiredMasterField({
          url: API_URL.testingLab,
          filter: { limit: 20 },
          name: 'testingLabId',
          label: 'Testing Lab',
          labelAccessor: 'name',
          valueAccessor: 'id',
          colSpan: 0.5,
          placeholder: 'Select the Testing Lab',
          cache: false,
        }),
        dependencies: {
          keys: ['sendingDetails'],
          calc: showSendingDetailsFieldGroup,
        },
      },
      // {
      //   ...WiredMasterField({
      //     code: 'bar_code',
      //     filter: { limit: 20 },
      //     name: 'barCode',
      //     label: 'Bar Code',
      //     labelAccessor: 'name',
      //     valueAccessor: 'code',
      //     colSpan: 0.33,
      //     placeholder: 'Enter Bar Code',
      //     cache: false,
      //   }),
      //   dependencies: {
      //     keys: ['sendingDetails'],
      //     calc: showSendingDetailsFieldGroup,
      //   },
      // },
      {
        inputType: 'hidden',
        name: 'hl7VersionCode',
        textLabel: 'HL7 Version',
        colSpan: 0.5,
        disabled: true,
        pattern: regexCustomText,
        dependencies: {
          keys: ['sendingDetails'],
          calc: showSendingDetailsFieldGroup,
        },
      },
      // {
      //   ...WiredMasterField({
      //     code: 'hl7_versions',
      //     filter: { limit: 20 },
      //     name: 'hl7VersionCode',
      //     label: 'HL7 Version1',
      //     labelAccessor: 'name',
      //     valueAccessor: 'code',
      //     colSpan: 0.5,
      //     placeholder: 'Select',
      //     cache: false,
      //     defaultValue: '2.5',
      //   }),
      //   dependencies: {
      //     keys: ['sendingDetails'],
      //     calc: showSendingDetailsFieldGroup,
      //   },
      // },
      {
        inputType: 'text',
        name: 'sendingApplication',
        textLabel: 'Sending Application',
        colSpan: 0.5,
        pattern: regexCustomText,
        dependencies: {
          keys: ['sendingDetails'],
          calc: showSendingDetailsFieldGroup,
        },
      },
      {
        ...WiredLocationField({
          name: 'sendingFacilityId',
          label: 'Sending Facility',
          colSpan: 0.5,
          placeholder: 'Select',
          filter: { limit: 20 },
        }),
        dependencies: {
          keys: ['sendingDetails'],
          calc: showSendingDetailsFieldGroup,
        },
      },
    ],
    [handleIcdBrowser,fromMain, handleOtherSpecimenModal, handleCloseSpecimenModal]
  );
 
  const onHandleSubmit = useCallback(
    (data) => {
      data.statusCode = 'active_status_code'
      if(data?.sendingDetails === true){
        if(!data?.hl7VersionCode){
          showSnackbar({
            message: 'Select HL7 Version',
            severity: 'error',
          });
          return
        }
        if(!data?.testingLabId){
          showSnackbar({
            message: 'Select Testing Lab',
            severity: 'error',
          });
          return
        }
      }
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
      if(payload.collectionDateTime){
        payload.collectionDateTime = getUTCDateTime(payload.collectionDateTime.format(dateFormats.MMDDYYYY),{hour:payload.collectionDateTime.format('hh'),minute:payload.collectionDateTime.format('mm'),meridien:payload.collectionDateTime.format('A')})
      }

      if (isEmpty(payload)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
        return;
      }
 
      if (payload?.laboratoryTestIds?.length) {
        payload.laboratoryTestIds = payload.laboratoryTestIds.map(
          (item) => item.id
        );
      }
      if (payload?.patientId) {
        payload.patientId = payload.patientId.id;
      }
      if (payload?.diagnosisIcdId) {
        payload.diagnosisIcdId = payload.diagnosisIcdId.id;
      }
      if(payload.patientDiagnosisId){
        payload.patientDiagnosisId = payload.patientDiagnosisId.id
      }

      if (isDefaultDataEmpty) {
        callLabRadiologoSaveAPI({ data: { ...payload } });
      } else {
        callLabRadiologoSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callLabRadiologoSaveAPI, defaultData]
  );
  const onHandleSubmitSend = useCallback(
    (data) => {
      data.statusCode = 'active_status_code'
      data.sendToLab = true;
      if(data?.sendingDetails === true){
        if(!data?.hl7VersionCode){
          showSnackbar({
            message: 'Select HL7 Version',
            severity: 'error',
          });
          return
        }
        if(!data?.testingLabId){
          showSnackbar({
            message: 'Select Testing Lab',
            severity: 'error',
          });
          return
        }
      }
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
      if(payload.collectionDateTime){
        payload.collectionDateTime = getUTCDateTime(payload.collectionDateTime.format(dateFormats.MMDDYYYY),{hour:payload.collectionDateTime.format('hh'),minute:payload.collectionDateTime.format('mm'),meridien:payload.collectionDateTime.format('A')})
      }

      if (isEmpty(payload)) {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
        return;
      }
 
      if (payload?.laboratoryTestIds?.length) {
        payload.laboratoryTestIds = payload.laboratoryTestIds.map(
          (item) => item.id
        );
      }
      if (payload?.patientId) {
        payload.patientId = payload.patientId.id;
      }
      if (payload?.diagnosisIcdId) {
        payload.diagnosisIcdId = payload.diagnosisIcdId.id;
      }
      if(payload.patientDiagnosisId){
        payload.patientDiagnosisId = payload.patientDiagnosisId.id
      }

      if (isDefaultDataEmpty) {
        callLabRadiologoSaveAPI({ data: { ...payload } });
      } else {
        callLabRadiologoSaveAPI({ ...payload }, `/${defaultData.id}`);
      }
    },
    [callLabRadiologoSaveAPI, defaultData]
  );
 
  const closeIcdBrowserModal = useCallback(() => {
    setIcdBrowserModal(false);
  }, []);
 
  const handleIcdBrowserSave = useCallback(
    (selectedPatientDiagnosis) => {
      if(selectedPatientDiagnosis.length){
      setValue('diagnosisIcdId', selectedPatientDiagnosis[0], { shouldValidate: true });
      }
      closeIcdBrowserModal();
    },
    [setValue, closeIcdBrowserModal]
  );
 
  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={ordersFormGroups}
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

         <LoadingButton
              loading={loading}
              onClick={handleSubmit(onHandleSubmitSend)}
              label="Save & Send To Lab"
            />
      </CardActions>
      {icdBrowserModal && (
        <ModalComponent
          open={icdBrowserModal}
          header={{
            title: 'ICD Browser',
            closeIconAction: closeIcdBrowserModal,
          }}
          modalStyle={{ width: '100%' }}
        >
          <Box>
            <IcdBrowser
               modalCloseAction={closeIcdBrowserModal}
               onSave={handleIcdBrowserSave}
               patientId={patientId}
               singleSelection={true}
              // modalCloseAction={closeIcdBrowserModal}
              // saveIcd={handleIcdBrowserSave}
              // defaultData={icdBrowserData}
              // patientId={form.getValues('patientId')?.id}
            />
          </Box>
        </ModalComponent>
      )}
      {otherSpecimen && (
        <ModalComponent
          open={otherSpecimen}
          header={{
            title: 'Add Other Specimen',
            closeIconAction: handleCloseSpecimenModal,
          }}
        >
          <AddOtherSpecimen 
            modalCloseAction={handleCloseSpecimenModal}
            fromMain={true}
          />
        </ModalComponent>
      )}
    </Box>
  );
};
 
export default CreateOrder;
 