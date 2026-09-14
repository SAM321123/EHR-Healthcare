// /* eslint-disable no-unused-vars */
// import Box from '@mui/material/Box';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import isEmpty from 'lodash/isEmpty';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';

// import { useParams } from 'react-router-dom';
// import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
// import LoadingButton from 'src/components/CustomButton/loadingButton';
// import Typography from 'src/components/Typography';
// import CustomForm from 'src/components/form';
// import useCRUD from 'src/hooks/useCRUD';
// import usePatientDetail from 'src/hooks/usePatientDetail';
// import { fileInfo, idRegex, requiredField } from 'src/lib/constants';
// import Events from 'src/lib/events';
// import { showSnackbar } from 'src/lib/utils';
// import {
//   GET_OFFICE_ALLY_PAYER_LIST,
//   SAVE_INSURANCE_DATA,
// } from 'src/store/types';
// import {
//   WiredMasterAutoComplete,
//   WiredMasterField,
// } from 'src/wiredComponent/Form/FormFields';
// import './style.css';
// import { decrypt } from 'src/lib/encryption';
// import { getModulePermisions } from 'src/utils/genricMethods';
// import useAuthUser from 'src/hooks/useAuthUser';
// import { Tab, Tabs } from '@mui/material';

// const showOtherPrimaryHolder = (data) => {
//   if (
//     data?.primary?.[0]?.insurancePolicyCode === 'insurance_policy_holder_other'
//   ) {
//     return { hide: false };
//   }
//   return { hide: true };
// };

// const showOtherSecondaryHolder = (data) => {
//   if (
//     data?.secondary?.[0]?.insurancePolicyCode ===
//     'insurance_policy_holder_other'
//   ) {
//     return { hide: false };
//   }
//   return { hide: true };
// };

// const InsuranceForm = ({
//   modalCloseAction = () => {},
//   refetchData,
//   defaultData,
// }) => {
//   const params = useParams();

//   const [initialData, setInitialData] = useState({});
//   const [tabIndex, setTabIndex] = useState(0);

//   let { patientId } = params;
//   patientId = decrypt(patientId);

//   const [userInfo, , , , , , userData] = useAuthUser();
//   const { isCreate } =
//     getModulePermisions({ moduleName: MODULE.insurance, userData }) || {};

//   const [patientData] = usePatientDetail({ patientId });
//   const [insurance, , , getAllInsurance] = useCRUD({
//     id: `paitnet-insurance-${patientId}`,
//     url: API_URL.insurance,
//     type: REQUEST_METHOD.get,
//   });

//   useEffect(() => {
//     getAllInsurance({ patientId });
//     //getpayerList();
//   }, [patientId]);
//   useEffect(() => {
//       const { results = [] } = insurance || {};
//       const [primaryInsurance = {}] =
//         results.filter((item) => item.insuranceType === '1') || [];
//       const [secondaryInsurance = {}] =
//         results.filter((item) => item.insuranceType === '2') || [];

//       if(primaryInsurance?.payerData){
//         delete primaryInsurance.payerId
//       }
//       if(primaryInsurance?.claimStatusCheckPayerData){
//         delete primaryInsurance.claimStatusCheckPayerId
//       }
//       if(primaryInsurance?.eligibilityCheckPayerData){
//         delete primaryInsurance.eligibilityCheckPayerId
//       }
//       if(secondaryInsurance?.payerData){
//         delete secondaryInsurance.payerId
//       }
//       if(secondaryInsurance?.eligibilityCheckPayerData){
//         delete secondaryInsurance.eligibilityCheckPayerId
//       }
//       if(secondaryInsurance?.claimStatusCheckPayerData){
//         delete secondaryInsurance.claimStatusCheckPayerId
//       }
//       setInitialData({
//         haveSecondary:
//           !isEmpty(secondaryInsurance) && secondaryInsurance?.isActive,
//         primary: [
//           {
//             patientFirstName: patientData?.firstName || '',
//             patientMiddleName: patientData?.middleName || '',
//             patientLastName: patientData?.lastName || '',
//             patientPreferredName: patientData?.preferredName || '',
//             payerId: primaryInsurance?.payerData || '',
//             eligibilityCheckPayerId: primaryInsurance?.eligibilityCheckPayerData || '',
//             claimStatusCheckPayerId: primaryInsurance?.claimStatusCheckPayerData || '',
//             ...primaryInsurance,
//           },
//         ],
//         secondary: [
//           {
//             patientFirstName: patientData?.firstName || '',
//             patientMiddleName: patientData?.middleName || '',
//             patientLastName: patientData?.lastName || '',
//             patientPreferredName: patientData?.preferredName || '',
//             payerId: secondaryInsurance?.payerData || '',
//             eligibilityCheckPayerId: secondaryInsurance?.eligibilityCheckPayerData || '',
//             claimStatusCheckPayerId: secondaryInsurance?.claimStatusCheckPayerData || '',
//             ...secondaryInsurance,
//           },
//         ],
//       });
//   }, [patientData, insurance]);

//   const form = useForm({ mode: 'onChange' });
//   const { handleSubmit } = form;
//   const id = defaultData?.id;
//   const [response, , loading, callInsuranceSaveAPI, clearData] = useCRUD({
//     id: SAVE_INSURANCE_DATA,
//     url: API_URL.insurance,
//     type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
//   });


//   const calcSecondary = (data,from) => {
//     if (data.haveSecondary) {
//       return {
//         hide: false,
//       };
//     }
//     return {
//       hide: true,
//     };
//   };


//   // const insuranceFormGroups = useMemo(
//   //   () => [

//   //     {
//   //       inputType: 'nestedForm',
//   //       name: 'primary',
//   //       label: 'Dosage details for active ingredients',
//   //       textButton: 'Add New',
//   //       required: requiredField,
//   //       columnsPerRow: 1,
//   //       colSpan: 1,
//   //       isMore: false,
//   //       formGroups: [
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientFirstName',
//   //           textLabel: 'Patient First Name',
//   //           required: requiredField,
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientMiddleName',
//   //           textLabel: 'Patient Middle Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientLastName',
//   //           textLabel: 'Patient Last Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientPreferredName',
//   //           textLabel: 'Patient Preferred Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           ...WiredMasterField({
//   //             code: 'insurance_policy_holder',
//   //             filter: { limit: 20 },
//   //             name: 'insurancePolicyCode',
//   //             label: 'Primary Insurance Policy Holder',
//   //             labelAccessor: 'name',
//   //             valueAccessor: 'code',
//   //             colSpan: 0.33,
//   //             required: requiredField,
//   //           }),
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insurancePolicyOther',
//   //           textLabel: 'Primary Insurance Policy Holder (Other)',
//   //           colSpan: 0.33,
//   //           dependencies: {
//   //             keys: ['insurancePolicyCode'],
//   //             calc: showOtherPrimaryHolder,
//   //             listenAllChanges: true,
//   //           },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'firstName',
//   //           textLabel: 'First Name of Primary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'lastName',
//   //           textLabel: 'Last Name of Primary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insuranceId',
//   //           textLabel: 'Insurance ID#',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //           pattern: idRegex,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insuranceCompanyName',
//   //           textLabel: 'Insurance Company Name',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: API_URL.officeAllyPayerList,
//   //             label: 'Insurance Eligibility Check Payer ID #',
//   //             name: 'eligibilityCheckPayerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true ,transaction: 'Eligibility 270 / 271'},
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: `${API_URL.officeAllyPayerList}/claim`,
//   //             label: 'Insurance Claim Payer ID #',
//   //             name: 'payerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true },
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: API_URL.officeAllyPayerList,
//   //             label: 'Insurance Claim Status Check Payer ID #',
//   //             name: 'claimStatusCheckPayerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true, transaction: 'Claim Status 276 / 277'},
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
          
//   //         {
//   //           inputType: 'text',
//   //           name: 'groupName',
//   //           textLabel: 'Group Name',
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'groupNumber',
//   //           textLabel: 'Group Number',
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'date',
//   //           name: 'birthDate',
//   //           textLabel: 'Birthdate of Primary Insured',
//   //           label: 'Birthdate of Primary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insuredRelationship',
//   //           textLabel: 'Primary Insured Relationship to Patient',
//   //           required: requiredField,
//   //           colSpan: 0.32,
//   //         },
//   //         {
//   //           inputType: 'uploadFile',
//   //           name: 'insuranceFrontFile',
//   //           textLabel: 'Front of Image Needed',
//   //           showPreview: true,
//   //           accept: '.jpg,.jpeg,.png,.pdf',
//   //           alwaysShowLink: true,
//   //           gridProps: { paddingTop: '6px' },
//   //           fileInfo: { type: fileInfo.COMMENTS },
//   //           colSpan: 0.33,
//   //           buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
//   //           // required: requiredField,
//   //         },
//   //         {
//   //           inputType: 'uploadFile',
//   //           name: 'insuranceBackFile',
//   //           textLabel: 'Back of Image Needed',
//   //           showPreview: true,
//   //           accept: '.jpg,.jpeg,.png,.pdf',
//   //           alwaysShowLink: true,
//   //           gridProps: { paddingTop: '6px' },
//   //           fileInfo: { type: fileInfo.COMMENTS },
//   //           colSpan: 0.33,
//   //           buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
//   //           // required: requiredField,
//   //         },
//   //       ],
//   //     },
//   //     {
//   //       type: 'text',
//   //       component: ({ setValue, getValues }) => {
//   //         const haveSecondary = getValues('haveSecondary');
//   //         return (
//   //           <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
//   //             <div>
//   //               <Typography>Do you have secondary insurance</Typography>
//   //             </div>
//   //             <div>
//   //               <LoadingButton
//   //                 onClick={() => setValue('haveSecondary', true)}
//   //                 variant={haveSecondary ? 'contained' : 'outlinedSecondary'}
//   //                 label={'Yes'}
//   //               />
//   //             </div>
//   //             <div>
//   //               <LoadingButton
//   //                 onClick={() => setValue('haveSecondary', false)}
//   //                 variant={!haveSecondary ? 'contained' : 'outlinedSecondary'}
//   //                 label={'No'}
//   //               />
//   //             </div>
//   //           </div>
//   //         );
//   //       },
//   //     },
//   //     {
//   //       inputType: 'nestedForm',
//   //       name: 'secondary',
//   //       label: 'Dosage details for active ingredients',
//   //       textButton: 'Add New',
//   //       required: requiredField,
//   //       columnsPerRow: 1,
//   //       colSpan: 1,
//   //       isMore: false,
//   //       dependencies: {
//   //         keys: ['haveSecondary'],
//   //         calc: calcSecondary,
//   //       },
//   //       // dependencies: {
//   //       //   keys: ['location'],
//   //       //   calc: locationIdcalc,
//   //       // },
//   //       formGroups: [
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientFirstName',
//   //           textLabel: 'Patient First Name',
//   //           required: requiredField,
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientMiddleName',
//   //           textLabel: 'Patient Middle Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientLastName',
//   //           textLabel: 'Patient Last Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'patientPreferredName',
//   //           textLabel: 'Patient Preferred Name',
//   //           colSpan: 0.25,
//   //           InputProps: { readOnly: true },
//   //         },
//   //         {
//   //           ...WiredMasterField({
//   //             code: 'insurance_policy_holder',
//   //             filter: { limit: 20 },
//   //             name: 'insurancePolicyCode',
//   //             label: 'Secondary Insurance Policy Holder',
//   //             labelAccessor: 'name',
//   //             valueAccessor: 'code',
//   //             colSpan: 0.33,
//   //             required: requiredField,
//   //           }),
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insurancePolicyOther',
//   //           textLabel: 'Secondary Insurance Policy Holder (Other)',
//   //           colSpan: 0.33,
//   //           dependencies: {
//   //             keys: ['insurancePolicyCode'],
//   //             calc: showOtherSecondaryHolder,
//   //             listenAllChanges: true,
//   //           },
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'firstName',
//   //           textLabel: 'First Name of Secondary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'lastName',
//   //           textLabel: 'Last Name of Secondary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },

//   //         {
//   //           inputType: 'text',
//   //           name: 'insuranceId',
//   //           textLabel: 'Insurance ID#',
//   //           required: requiredField,
//   //           pattern: idRegex,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insuranceCompanyName',
//   //           textLabel: 'Insurance Company Name',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: `${API_URL.officeAllyPayerList}/claim`,
//   //             label: 'Insurance Claim Payer ID #',
//   //             name: 'payerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true },
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: API_URL.officeAllyPayerList,
//   //             label: 'Insurance Claim Status Check Payer ID #',
//   //             name: 'claimStatusCheckPayerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true ,transaction: 'Claim Status 276 / 277'},
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
//   //         {
//   //           ...WiredMasterAutoComplete({
//   //             url: API_URL.officeAllyPayerList,
//   //             label: 'Insurance Eligibility Check Payer ID #',
//   //             name: 'eligibilityCheckPayerId',
//   //             placeholder: 'Search by Payer Name  or Payer ID',
//   //             cache: false,
//   //             labelAccessor: 'payerName',
//   //             valueAccessor: 'payerId',
//   //             required: requiredField,
//   //             showDescription: true,
//   //             descriptionAccessor: 'payerId',
//   //             params: { isActive: true ,transaction: 'Eligibility 270 / 271'},
//   //             colSpan: 0.33,
//   //             fetchInitial: true,
//   //           }),
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'groupName',
//   //           textLabel: 'Group Name',
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'groupNumber',
//   //           textLabel: 'Group Number',
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'date',
//   //           name: 'birthDate',
//   //           textLabel: 'Birthdate of Secondary Insured',
//   //           label: 'Birthdate of Secondary Insured',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'text',
//   //           name: 'insuredRelationship',
//   //           textLabel: 'Secondary Insured Relationship to Patient',
//   //           required: requiredField,
//   //           colSpan: 0.33,
//   //         },
//   //         {
//   //           inputType: 'uploadFile',
//   //           name: 'insuranceFrontFile',
//   //           textLabel: 'Front of Image Needed',
//   //           showPreview: true,
//   //           accept: '.jpg,.jpeg,.png,.pdf',
//   //           alwaysShowLink: true,
//   //           gridProps: { paddingTop: '6px' },
//   //           fileInfo: { type: fileInfo.COMMENTS },
//   //           colSpan: 0.33,
//   //           buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
//   //           required: requiredField,
//   //         },
//   //         {
//   //           inputType: 'uploadFile',
//   //           name: 'insuranceBackFile',
//   //           textLabel: 'Back of Image Needed',
//   //           showPreview: true,
//   //           accept: '.jpg,.jpeg,.png,.pdf',
//   //           alwaysShowLink: true,
//   //           gridProps: { paddingTop: '6px' },
//   //           fileInfo: { type: fileInfo.COMMENTS },
//   //           colSpan: 0.33,
//   //           buttonStyle: { padding: '62px 37px', textWrap: 'pretty' },
//   //           required: requiredField,
//   //         },
//   //       ],
//   //     },
//   //   ],
//   //   []
//   // );
//   const onHandleSubmit = useCallback(
//     (data) => {
//       const newData = data;
//       callInsuranceSaveAPI({ data: { ...newData, patientId } });
//     },
//     [callInsuranceSaveAPI, patientId]
//   );

//   useEffect(() => {
//     if (!isEmpty(response)) {
//       Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
//       getAllInsurance({ patientId });
//       showSnackbar({
//         message: 'Insurance saved successfully',
//         severity: 'success',
//       });
//       clearData();
//     }
//   }, [refetchData, response, patientId]);
  

//   return (
//     <Box>
//       <CardContent>
        //  <CustomForm
        //   form={form}
        //   formGroups={insuranceFormGroups}
        //   columnsPerRow={1}
        //   defaultValue={initialData}
        // /> 
//       </CardContent>
//       <CardActions
//         sx={{
//           justifyContent: 'flex-start',
//           paddingLeft: '24px',
//           paddingRight: '24px',
//         }}
//       >
//         <LoadingButton
//           variant="outlinedSecondary"
//           onClick={modalCloseAction}
//           label="Cancel"
//         />
//         {isCreate && (
//           <LoadingButton
//             loading={loading}
//             onClick={handleSubmit(onHandleSubmit)}
//             label="Save"
//           />
//         )}
//       </CardActions>
//     </Box>
//   );
// };

// export default InsuranceForm;

/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';
import { fileInfo, idRegex, requiredField } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import {
  GET_OFFICE_ALLY_PAYER_LIST,
  SAVE_INSURANCE_DATA,
} from 'src/store/types';
import {
  WiredMasterAutoComplete,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import './style.css';
import { decrypt } from 'src/lib/encryption';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import PrimaryInsurance from './primaryInsurance';
import SecondaryInsurance from './secondaryInsurance';


const InsuranceForm = ({
  modalCloseAction = () => {},
  refetchData,
  defaultData,
}) => {
  const params = useParams();

  const [initialData, setInitialData] = useState({});
  const [haveSecondary, setHaveSecondary] = useState(false);

  let { patientId } = params;
  patientId = decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate } =
    getModulePermisions({ moduleName: MODULE.insurance, userData }) || {};

  const [patientData] = usePatientDetail({ patientId });
  const [insurance, ,initialLoading , getAllInsurance] = useCRUD({
    id: `paitnet-insurance-${patientId}`,
    url: API_URL.insurance,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    getAllInsurance({ patientId });
    //getpayerList();
  }, [patientId]);
  useEffect(() => {
      const { results = [] } = insurance || {};
      const [primaryInsurance = {}] =
        results.filter((item) => item.insuranceType === '1') || [];
      const [secondaryInsurance = {}] =
        results.filter((item) => item.insuranceType === '2') || [];

      if(primaryInsurance?.payerData){
        delete primaryInsurance.payerId
      }
      if(primaryInsurance?.claimStatusCheckPayerData){
        delete primaryInsurance.claimStatusCheckPayerId
      }
      if(primaryInsurance?.eligibilityCheckPayerData){
        delete primaryInsurance.eligibilityCheckPayerId
      }
      if(secondaryInsurance?.payerData){
        delete secondaryInsurance.payerId
      }
      if(secondaryInsurance?.eligibilityCheckPayerData){
        delete secondaryInsurance.eligibilityCheckPayerId
      }
      if(secondaryInsurance?.claimStatusCheckPayerData){
        delete secondaryInsurance.claimStatusCheckPayerId
      }
      setInitialData({
        haveSecondary:
          !isEmpty(secondaryInsurance) && secondaryInsurance?.isActive,
        primary: [
          {
            patientFirstName: patientData?.firstName || '',
            patientMiddleName: patientData?.middleName || '',
            patientLastName: patientData?.lastName || '',
            patientPreferredName: patientData?.preferredName || '',
            payerId: primaryInsurance?.payerData || '',
            eligibilityCheckPayerId: primaryInsurance?.eligibilityCheckPayerData || '',
            claimStatusCheckPayerId: primaryInsurance?.claimStatusCheckPayerData || '',
            ...primaryInsurance,
          },
        ],
        secondary: [
          {
            patientFirstName: patientData?.firstName || '',
            patientMiddleName: patientData?.middleName || '',
            patientLastName: patientData?.lastName || '',
            patientPreferredName: patientData?.preferredName || '',
            payerId: secondaryInsurance?.payerData || '',
            eligibilityCheckPayerId: secondaryInsurance?.eligibilityCheckPayerData || '',
            claimStatusCheckPayerId: secondaryInsurance?.claimStatusCheckPayerData || '',
            ...secondaryInsurance,
          },
        ],
      });
      setHaveSecondary(!isEmpty(secondaryInsurance) && secondaryInsurance?.isActive)
  }, [patientData, insurance]);

  // useEffect(() => {
  //   if (!isEmpty(response)) {
  //     Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
  //     getAllInsurance({ patientId });
  //     showSnackbar({
  //       message: 'Insurance saved successfully',
  //       severity: 'success',
  //     });
  //     clearData();
  //   }
  // }, [refetchData, response, patientId]);
  
  // const haveSecondary = watch('haveSecondary'); // live value tracking
;


return (
  <>
    <Box sx={{ p: 3, borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
      <PrimaryInsurance 
        modalCloseAction={modalCloseAction}
        defaultData={initialData}
        refetchData={refetchData}
        getAllInsurance={getAllInsurance}
        initialLoading={initialLoading}
      />
    </Box>

    {/* Question  */}
    <Box mt={4} sx={{ p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
      <Typography variant="subtitle1" gutterBottom>Do you have secondary insurance?</Typography>
      <Box display="flex" gap={2}>
        <LoadingButton
          onClick={() => setHaveSecondary(true)}
          variant={haveSecondary === true ? 'contained' : 'outlinedSecondary'}
          label="Yes"
        />
        <LoadingButton
          onClick={() => setHaveSecondary(false)}
          variant={haveSecondary === false ? 'contained' : 'outlinedSecondary'}
          label="No"
        />
      </Box>
    </Box>
    {haveSecondary && (
      <Box mt={4} sx={{ p: 3, borderRadius: 2, boxShadow: 2, bgcolor: 'white' }}>
        <SecondaryInsurance 
          modalCloseAction={modalCloseAction}
          defaultData={initialData}
          refetchData={refetchData}
          getAllInsurance={getAllInsurance}
          initialLoading={initialLoading}
        />
      </Box>
    )}
  </>
);
};

export default InsuranceForm;
