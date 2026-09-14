import { CardActions, CardContent } from '@mui/material';
import { cloneDeep, isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Box from 'src/components/Box';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import TableTextRendrer from 'src/components/TableTextRendrer';
import Typography from 'src/components/Typography';
import CustomForm from 'src/components/form';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import useReduxState from 'src/hooks/useReduxState';
import {
  bankTransferType,
  cardType,
  initialBillingData,
  regTextArea,
  regexAlphanumeric,
  regexDecimal,
  regexUrl,
  requiredField,
  roleTypes,
  successMessage,
} from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import {
  ENCOUNTER_BILLING_DATA,
  ENCOUNTER_DATA,
  SAVE_PATIENT_ENCOUNTER_BILLING,
  SAVE_PATIENT_ENCOUNTER_CLAIM_BILLING,
} from 'src/store/types';
import {
  WiredLocationField,
  WiredMasterAutoComplete,
  WiredMasterField,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';
import { v4 } from 'uuid';
import IcdBrowser from '../../../Medication/icdBrowser';
import CustomProcedureForm from './customProcedureForm';
import DiagnosisTable from './diagnosisTable';
import palette from 'src/theme/palette';
import CardPayment from './cardPayment';
import useQuery from 'src/hooks/useQuery';
import './superBill.scss';

const calcBankAccount =(data)=>{
  if(data.bankTransferType==='check'){
    return {hide:true}
  }
return {hide:false}
}
const calcBankCheck =(data)=>{
  if(data.bankTransferType==='check'){
    return {hide:false}
  }
return {hide:true}
}
const paidText =(data)=>{
  if(data.statusCode ==='paid_billing_status'){
    return {hide:false}
  }
return {hide:true}
}


const defaultData ={
  bankTransferType:bankTransferType?.[0]?.value

}
const totalCalc = (data, index, form) => {
  const price = form.getValues(`encounterProcedureCodes.${index}.price`) || 0;
  const qty = form.getValues(`encounterProcedureCodes.${index}.qty`) || 1;
  const discPer = form.getValues(`encounterProcedureCodes.${index}.discPer`);
  const discAmt = form.getValues(`encounterProcedureCodes.${index}.discAmt`);
  const taxPer  = form.getValues(`encounterProcedureCodes.${index}.taxPer`);
  const taxAmt  = form.getValues(`encounterProcedureCodes.${index}.taxAmt`);
  const total = price * qty;
  const overAllDisc = discPer ? (total * discPer) / 100 : discAmt || 0;
  const overAllTax = taxPer ? (total * taxPer) / 100 :  parseInt(taxAmt) || 0;
  form.setValue(`encounterProcedureCodes.${index}.total`, (total + overAllTax) - overAllDisc);

  return { reFetch: false };
};

const discAmtValidation = (data, index, form) => {
  const path = `encounterProcedureCodes.${index}.discAmt`;

  const price = form.getValues(`encounterProcedureCodes.${index}.price`) || 0;
  const qty = form.getValues(`encounterProcedureCodes.${index}.qty`) || 0;
  const totalPrice = price * qty;
  const discAmt = form.getValues(path);

  const currentError = form.getFieldState(path)?.error;

  if (discAmt > totalPrice) {
    if (!currentError) {
      form.setError(path, {
        type: 'manual',
        message: 'Discount cannot be greater than total price.',
      });
    }
    return { reFetch: false };
  }

  if (currentError) {
    form.clearErrors(path);
  }
  return { reFetch: false };
};

const SuperBillForm = ({ onClose,encounterType, patientEncounter,patientId, encounterId,patientEncounterBillingData,callPatientEncounterBillingAPI } = {}) => {
  const [icdBrowserModal, setIcdBrowserModal] = useState(false);
  const [showCustomProcedure, setShowCustomProcedure] = useState(false);
  const [cardPaymentData,setCardPaymentData] = useState(null);
  const [paid, setPaid] = useState(null);
  const [billingData, setBillingData] = useReduxState(
    `Patient_Encounter-Billing-Data`,
    initialBillingData
  );
  const form = useForm({ mode: 'onChange' });
  console.log('form---------', form)
  const [
    encounterBillingSaveResponse,
    ,
    encounterBillingSaveLoading,
    callEncounterBillingSaveAPI,
    clearEncounterBillingSaveData,
  ] = useCRUD({
    id: SAVE_PATIENT_ENCOUNTER_BILLING,
    url: API_URL.patientEncounterBilling,
    type: !billingData?.id ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const insuranceTypeArr = [
      { name: 'Primary', value: '1' },
      { name: 'Secondary', value: '2' },
    ]
    const insuranceTypeOptions = insuranceTypeArr?.map((item) => {
      let match = 'not available'
      match = patientEncounter?.patient?.insurance?.find(
        (data) => data?.insuranceType === item.value
      );
      return { name: `${item?.name} (${match?.payerData?.payerName || 'not available'})`, value: item.value }
    });
  
const summaryOfChargesGroups = [
  {
    inputType: 'text',
    name: 'subTotal',
    type: 'number',
    textLabel: 'Subtotal',
    pattern: regexDecimal,
    disabled: true,
    colSpan: 0.2,
  },
  {
    inputType: 'number',
    type: 'number',
    name: 'tip',
    textLabel: 'Tips/Gratuity',
    pattern: regexDecimal,
    colSpan: 0.2,
  },
  ...(encounterType === "insurance_billing_Type" 
    ? [{
    inputType: 'text',
    name: 'insuranceSubmittedAmount',
    type: 'number',
    textLabel: 'Amount submited to insurance',
    pattern: regexDecimal,
    colSpan: 0.3,
    },
  ] : []),
  {
    inputType: 'text',
    name: 'previousBalance',
    type: 'number',
    textLabel: 'Previous Balance',
    pattern: regexDecimal,
    disabled: true,
    colSpan: 0.3,
  },
  {
    inputType: 'text',
    name: 'total',
    type: 'number',
    textLabel: 'Total',
    pattern: regexDecimal,
    colSpan: 0.5,
    disabled:true,
  },
  ...(encounterType === "insurance_billing_Type"
    ? [ {
    inputType: 'text',
    name: 'coPay',
    type: 'number',
    textLabel: 'Co-Pay',
    pattern: regexDecimal,
    colSpan: 0.25,
  },
  {
    inputType: 'wiredSelect',
    options: insuranceTypeOptions,
    // options: [
    //   { name: 'Primary', value: '1' },
    //   { name: 'Secondary', value: '2' },
    // ],
    name: 'insuranceType',
    labelAccessor: 'name',
    valueAccessor: 'value',
    colSpan: 0.25,
    label:'Select Insurance',
    required: requiredField,
  },] :[]),
];
  const [
    encounterClaimBillingSaveResponse,
    ,
    encounterClaimBillingSaveLoading,
    callEncounterClaimBillingSaveAPI,
    clearEncounterClaimBillingSaveData,
  ] = useCRUD({
    id: SAVE_PATIENT_ENCOUNTER_CLAIM_BILLING,
    url: API_URL.patientEncounterClaimBilling,
    type: !billingData?.id ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  // const [
  //   patientEncounterBillingData,
  //   ,
  //   patientEncounterBillingLoading,
  //   callPatientEncounterBillingAPI,
  //   clearPatientEncounterBilling,
  // ] = useCRUD({
  //   id: `${ENCOUNTER_BILLING_DATA}-${encounterId}`,
  //   url: `${API_URL.patientEncounterBilling}/encounter/${encounterId}`,
  //   type: REQUEST_METHOD.get,
  // });
 
 
  useEffect(() => {
    if (!isEmpty(patientEncounterBillingData)) {
      const clonedBilling = cloneDeep(patientEncounterBillingData);
      clonedBilling.encounterProcedureCodes =
      clonedBilling?.encounterProcedureCodes?.map((item) => {
          if (item.addOnFields) {
            item = { ...item, ...item.addOnFields };
            delete item.addOnFields;
          }
          return item;
        }) || [];
        if(clonedBilling.statusCode ==="paid_billing_status" ){
        setPaid(clonedBilling.statusCode);  
      }  
      const data = {
        patientId: clonedBilling.patientId,
        primaryProviderId: clonedBilling.primaryProviderId,
        referenceProviderId: clonedBilling.referenceProviderId,
        visitDate: clonedBilling.visitDate || null,
        locationId: clonedBilling.locationId,
        statusCode: clonedBilling.statusCode,
        comment: clonedBilling.comment || '',
        encounterDiagnosis: clonedBilling.encounterDiagnosis || [],
        encounterDiagnosisSnomeds:
          clonedBilling.encounterDiagnosisSnomeds || [],
        encounterProcedureCodes: clonedBilling.encounterProcedureCodes || [],
        id: clonedBilling.id,
        total: clonedBilling?.total,
        tip: clonedBilling?.tip,
        previousBalance: clonedBilling?.previousBalance || patientEncounter?.patient?.balance,
        insuranceSubmittedAmount: clonedBilling?.insuranceSubmittedAmount,
        coPay: clonedBilling?.coPay,
        cash: clonedBilling?.cash,
        prePaidCash: clonedBilling?.prePaidCash,
        prePaidType:clonedBilling?.prePaidType,
        balance: clonedBilling?.balance,
        note: clonedBilling?.note,
        paymentDate: clonedBilling?.paymentDate,
        insuranceType: clonedBilling?.insuranceType,
        cardType: clonedBilling?.cardType,
        cardNo: clonedBilling?.cardNo,
        cardAmount: clonedBilling?.cardAmount,
      };
      setBillingData(data);
    }else{
      setBillingData({...billingData,
        prePaidCash: 0,
        prePaidType: 'prepaid',
        cardType: 'creditCard',
        previousBalance: patientEncounter?.patient?.balance,
        primaryProviderId:patientEncounter?.assignedTo?.id,
        statusCode:'work_in_progress',

      })
    }
  }, [patientEncounterBillingData]);

  useEffect(() => {
    if (!isEmpty(encounterBillingSaveResponse) || !isEmpty(encounterClaimBillingSaveResponse)) {
      showSnackbar({
        message: !billingData.id
          ? 'Encounter Bill Created'
          : 'Encouter Bill Updated',
        severity: 'success',
      });
      clearEncounterBillingSaveData(true);
      clearEncounterClaimBillingSaveData(true);
      onClose();
    }
  }, [encounterBillingSaveResponse, billingData,encounterClaimBillingSaveResponse]);

  const { handleSubmit,watch } = form;

//  useEffect(() => {
//     const subscription = watch((value, { name, type }) =>{
//       if(name.includes('encounterProcedureCodes')){
//         const subTotal = value?.encounterProcedureCodes?.reduce((acc,item)=>{
//           acc=acc+(item?.total || 0);
//           return acc;
//          },0)
//          form.setValue('subTotal',subTotal)
//          form.setValue('insuranceSubmittedAmount', subTotal);
//       }
//       // if(['tip','subTotal','previousBalance','insuranceSubmittedAmount'].includes(name)){
//       if(['tip','subTotal','previousBalance'].includes(name)){
//         const total = parseInt(value.tip || 0)+parseInt(value.subTotal || 0)+parseInt(value.previousBalance || 0);
//         form.setValue('total',total)
//       }
//       if(['total','cash', 'prePaidCash','cardAmount'].includes(name)){
//         const balance = parseInt(value.total || 0)-parseInt(value.cash || 0)-parseInt(value.prePaidCash || 0)-parseInt(value.cardAmount || 0);
//         form.setValue('balance', balance)
//       }

//       if(['total','insuranceSubmittedAmount'].includes(name)){
//         const coPay = parseInt(value.total || 0)-parseInt(value.insuranceSubmittedAmount || 0);
//         form.setValue('coPay', coPay)
//       }
//     }
//     )
//     return () => subscription.unsubscribe()
//   }, [watch])
useEffect(() => {
  const subscription = watch((value, { name }) => {
      if (name.includes('encounterProcedureCodes')) {
          const subTotal = value?.encounterProcedureCodes?.reduce((acc, item) => {
              return acc + (parseFloat(item?.total) || 0);
          }, 0);
          form.setValue('subTotal', parseFloat(subTotal.toFixed(2))); // Ensuring float precision
          if(!billingData?.insuranceSubmittedAmount){
            form.setValue('insuranceSubmittedAmount', parseFloat(subTotal.toFixed(2)));
          }
      }

      if (['tip', 'subTotal', 'previousBalance'].includes(name)) {
          const total = 
              (parseFloat(value.tip) || 0) + 
              (parseFloat(value.subTotal) || 0) + 
              (parseFloat(value.previousBalance) || 0);

          form.setValue('total', parseFloat(total.toFixed(2)));
      }

      if (['total', 'cash', 'prePaidCash', 'cardAmount'].includes(name)) {
          const balance = 
              (parseFloat(value.total) || 0) - 
              (parseFloat(value.cash) || 0) - 
              (parseFloat(value.prePaidCash) || 0) - 
              (parseFloat(value.cardAmount) || 0);
              form.setValue('balance', parseFloat(balance.toFixed(2)));
            }
            
            if (['total', 'insuranceSubmittedAmount'].includes(name)) {
              const coPay = 
              (parseFloat(value.total) || 0) - 
              (parseFloat(value.insuranceSubmittedAmount) || 0);
              
              form.setValue('coPay', parseFloat(coPay.toFixed(2)));
      }
  });

  return () => subscription.unsubscribe();
}, [watch, billingData]);


  const onHandleSubmit = useCallback(
    (data) => {
      data.patientId = patientId;
      data.billingType = encounterType;
      if(data?.tip === ""){
        data.tip = 0;
      }
      if(data?.cash === ""){
        data.cash = 0;
      }
      delete data.procedureCode;
      
      if(encounterType !== "insurance_billing_Type"){
        delete data.coPay;
        delete data.insuranceSubmittedAmount;
      }else{
        data.balance = data.coPay;
      } 
      console.log('cc------', data)
      if (!billingData.id) {
        data.encounterId = encounterId;
        callEncounterBillingSaveAPI({ data });
      } else {
        delete data.id;
        data.encounterId = encounterId;
        callEncounterBillingSaveAPI({ ...data }, `/${billingData.id}`);
      }
    },
    [billingData, patientId, encounterId]
  );
  const onHandleClaim = useCallback(
    (data) => {
      data.patientId = patientId;
      if(data?.tip === ""){
        data.tip = 0;
      }

      delete data.procedureCode;
      if (!billingData.id) {
        data.encounterId = encounterId;
        data.billingType = encounterType;
        callEncounterClaimBillingSaveAPI({ data });
      } else {
        delete data.id;
        data.billingType = encounterType;
        data.encounterId = encounterId;
        callEncounterClaimBillingSaveAPI({ ...data }, `/${billingData.id}`);
      }
    },
    [billingData, patientId, encounterId]
  );
  const handleIcdBrowser = useCallback(() => {
    setIcdBrowserModal(true);
  }, []);
  const closeIcdBrowserModal = useCallback(() => {
    setIcdBrowserModal(false);
  }, []);

  const handleShowCustomProcedure = useCallback(() => {
    setShowCustomProcedure(true);
  }, []);
  const closeCustomProcedure = useCallback(() => {
    setShowCustomProcedure(false);
  }, []);

  useEffect(() => {
    if (encounterId) {
      callPatientEncounterBillingAPI();
    }
  }, [callPatientEncounterBillingAPI, encounterId]);
  const handleIcdBrowserSave = useCallback(
    (selectedPatientMedicationDiagnosis) => {
      const array1 = selectedPatientMedicationDiagnosis;
      const array2 = form.getValues(`encounterDiagnosis`) || [];

      // Combine the arrays
      const combinedArray = array1.concat(array2);

      // Use reduce to filter out duplicates
      const uniqueArray = combinedArray.reduce((accumulator, current) => {
        // Check if the current id already exists in the accumulator
        if (!accumulator.some((item) => item.id === current.id)) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);
      form.setValue(`encounterDiagnosis`, uniqueArray, {
        shouldValidate: true,
      });
      closeIcdBrowserModal();
    },
    []
  );

  const onSearchProcedure = useCallback((data) => {
    const array1 = [data];
    const array2 = form.getValues(`encounterProcedureCodes`) || [];

    // Combine the arrays
    const combinedArray = array2.concat(array1);

    // Use reduce to filter out duplicates
    const uniqueArray = combinedArray.reduce((accumulator, current = {}) => {
      // Check if the current id already exists in the accumulator
      if (!accumulator.some((item) => item.id === current.id)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
    form.setValue(`encounterProcedureCodes`, uniqueArray, {
      shouldValidate: true,
    });
  }, []);

  const handleCoustomProcedureSave = (data) => {
    const existingData = form.getValues(`encounterProcedureCodes`) || [];
    existingData.push({ ...data, id: `new_${v4()}` });
    form.setValue(`encounterProcedureCodes`, existingData, {
      shouldValidate: true,
    });
    closeCustomProcedure();
  };


  const handleTakePayment = useCallback(()=>{
    // const amount = form.getValues('cardAmount')
    const amount = form.getValues('balance')
    setCardPaymentData({amount});
  },[]);

  const closeCardPayment = useCallback((e,r)=>{
    setCardPaymentData(false);
  },[])

  const handleCardPayment = useCallback((amount, lastDigitOfCard)=>{
    form.setValue('cardAmount', amount);
    form.setValue('cardNo', lastDigitOfCard);
  },[]);

  const paymentGroups = useMemo(()=>[
    {
      inputType: 'date',
      type: 'text',
      name: 'paymentDate',
      label: 'Date of Payment',
      colSpan: 1,
    },
    {
      inputType: 'text',
      name: 'cash',
      type: 'number',
      textLabel: 'Payment (Cash) $',
      colSpan: 0.5,
    },
    {
      inputType: 'text',
      name: 'prePaidCash',
      type: 'number',
      textLabel: 'Prepaid Amount',
      colSpan: 0.25,
    },
    {
      inputType: 'wiredSelect',
      options: [
        { name: 'Prepaid', value: 'prepaid' },
      ],
      name: 'prePaidType',
      disabled: true,
      labelAccessor: 'name',
      valueAccessor: 'value',
      colSpan: 0.25,
      label:'Type'
    },
    ///////////////////BANK PAYMENT////////////////////////////////////////
    //
    // {
    //   inputType: 'text',
    //   name: 'bankAmount',
    //   type: 'number',
    //   textLabel: 'Payment (Bank) $',
    //   colSpan: 0.25,
    // },
    // {
    //   inputType: 'wiredSelect',
    //   options: bankTransferType,
    //   name: 'bankTransferType',
    //   labelAccessor: 'name',
    //   valueAccessor: 'value',
    //   colSpan: 0.25,
    //   label:'Transfer Type'
    // },
    // {
    //   inputType: 'text',
    //   name: 'bankName',
    //   type: 'text',
    //   textLabel: 'Bank Name',
    //   colSpan: 0.25,
    //   dependencies: {
    //     keys: ['bankTransferType'],
    //     calc: calcBankAccount,
    //   },
    // },
    // {
    //   inputType: 'text',
    //   name: 'holderName',
    //   type: 'text',
    //   textLabel: 'Holder Name',
    //   colSpan: 0.25,
    //   dependencies: {
    //     keys: ['bankTransferType'],
    //     calc: calcBankAccount,
    //   },
    // },
    // {
    //   inputType: 'text',
    //   name: 'accountNo',
    //   type: 'number',
    //   textLabel: 'Account No.',
    //   colSpan: 0.5,
    //   dependencies: {
    //     keys: ['bankTransferType'],
    //     calc: calcBankAccount,
    //   },
    // },
    // {
    //   inputType: 'text',
    //   name: 'ifsc',
    //   type: 'text',
    //   textLabel: 'IFSC code',
    //   pattern: regexAlphanumeric,
    //   colSpan: 0.5,
    //   dependencies: {
    //     keys: ['bankTransferType'],
    //     calc: calcBankAccount,
    //   },
    // },
    // {
    //   inputType: 'text',
    //   name: 'checkNo',
    //   type: 'text',
    //   textLabel: 'Check No.',
    //   colSpan: 0.5,
    //   pattern: regexAlphanumeric,
    //   dependencies: {
    //     keys: ['bankTransferType'],
    //     calc: calcBankCheck,
    //   },
    // },
    //
    ///////////////////////////////////////////////////////////
    {
      inputType: 'number',
      name: 'cardAmount',
      type: 'number',
      pattern: regexDecimal,
      textLabel:()=> <div style={{display:'flex',flexWrap:'wrap'}}><Typography style={{fontSize:'12px',lineHeight:'18px'}}> Payment (Card) $</Typography> <div><LoadingButton onClick={handleTakePayment} sx={{height:'auto',padding:'1px 10px'}} label={'Collect Card Payment'}/></div></div>,
      colSpan: 0.5,
    },
    {
      inputType: 'wiredSelect',
      options: cardType,
      name: 'cardType',
      labelAccessor: 'name',
      valueAccessor: 'value',
      colSpan: 0.25,
      label:'Type'
    },
    {
      inputType: 'text',
      name: 'cardNo',
      type: 'number',
      textLabel: 'Last 4',
      colSpan: 0.25,
    },
  
  
  ],[handleTakePayment]);



  const formGroups = useMemo(
    () => [
      {
        component: () => (
        <div style={{backgroundColor:palette.text.radio,padding:5,borderRadius:5}}>
          <Typography style={{ fontSize: '12px' }}>
            This Super Bill is not editable as it has already been paid.
          </Typography>
        </div>
        ),
        dependencies: {
          keys: ['statusCode'],
          calc: paidText,
        }
      }, 
      {
        ...WiredStaffField({
          name: 'primaryProviderId',
          label: 'Provider',
          colSpan: 0.5,
          placeholder: 'Select',
          required: requiredField,
        }),
      },
      {
        ...WiredStaffField({
          name: 'referenceProviderId',
          label: 'Reference Provider',
          colSpan: 0.5,
          placeholder: 'Select',
        }),
      },
      {
        inputType: 'date',
        type: 'text',
        name: 'visitDate',
        label: 'Visit Date',
        required: requiredField,
        colSpan: 0.5,
      },
      {
        ...WiredLocationField({
          name: 'locationId',
          label: 'Location',
          colSpan: 0.5,
          placeholder: 'Select',
          filter: { limit: 20 },
          required: requiredField,
        }),
      },
      {
        ...WiredMasterAutoComplete({
          url: API_URL.diagnosisIcd,
          label: 'ICD-10 code or name',
          name: 'encounterDiagnosis',
          colSpan: 0.7,
          placeholder: 'Enter ICD-10 code or name',
          labelAccessor: 'name',
          valueAccessor: 'id',
          multiple: true,
          showDescription: true,
          descriptionAccessor: 'description',
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
        ...WiredMasterAutoComplete({
          url: API_URL.diagnosisSnometCT,
          label: 'SnomedCT name',
          name: 'encounterDiagnosisSnomeds',
          colSpan: 0.7,
          placeholder: 'Enter name or description',
          labelAccessor: 'name',
          valueAccessor: 'id',
          multiple: true,
          showDescription: true,
          descriptionAccessor: 'description',
        }),
      },
      {
        component: ({ form }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1rem',
              flex: 1,
            }}
          >
            <DiagnosisTable form={form} />
          </div>
        ),
        colSpan: 1,
        cstSx: { height: '100%', display: 'flex', alignItems: 'center' },
      },

      {
        component: () => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1rem',
              justifyContent: 'space-between',
              gap: 10,
              flex: 1,
            }}
          >
            <div>
              <Typography style={{ fontSize: 14, fontWeight: 600 }}>
                Procedure Codes (enter E/M, CPT and HCPCS procedure codes here)
              </Typography>
            </div>
            <div>
              <LoadingButton
                onClick={handleShowCustomProcedure}
                label={
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Typography>+</Typography>{' '}
                    <Typography>Custom PROCEDURE CODE</Typography>
                  </div>
                }
              />
            </div>
          </div>
        ),
        colSpan: 1,
        cstSx: {
          paddingLeft: '10px !important',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        },
      },
      {
        inputType: 'wiredSelect',
        options: [
          { name: 'Standard Procedure Code', value: 'standardProcedureCode' },
          { name: 'Custom Procedure Code', value: 'customProcedureCode' },
        ],
        name: 'procedureCodeType',
        labelAccessor: 'name',
        valueAccessor: 'value',
        colSpan: 0.5,
      },
      {
        ...WiredMasterAutoComplete({
          url: API_URL.procedureCode,
          params: { isActive: true, useForBillingCode: true },
          label: ' ',
          name: 'procedureCode',
          colSpan: 0.5,
          placeholder: 'Enter code or name',
          labelAccessor: 'name',
          valueAccessor: 'id',
          onChange: onSearchProcedure,
          showDescription: true,
          descriptionAccessor: 'cptCode',
        }),
      },
      {
        inputType: 'nestedTableV2',
        name: 'encounterProcedureCodes',
        label: ' ',
        textButton: 'Add New',
        columnsPerRow: 8,
        gridGap: 1,
        isMore: false,
        formGroups: [
          {
            label: 'Index',
            component: ({ index, getValues }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '1rem',
                }}
              >
                <TableTextRendrer>{index + 1}</TableTextRendrer>
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
            label: 'CPT Code',
            component: ({ index, getValues }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '1rem',
                }}
              >
                <TableTextRendrer>
                  {(getValues(`encounterProcedureCodes`) || [])?.[index]?.cptCode}
                </TableTextRendrer>
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
            label: 'Name',
            component: ({ index, getValues }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '1rem',
                }}
              >
                <TableTextRendrer>
                  {(getValues(`encounterProcedureCodes`) || [])?.[index]?.name}
                </TableTextRendrer>
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
            label: 'Description',
            component: ({ index, getValues }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '1rem',
                }}
              >
                <TableTextRendrer>
                  {
                    (getValues(`encounterProcedureCodes`) || [])?.[index]
                      ?.description
                  }
                </TableTextRendrer>
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
            inputType: 'date',
            type: 'text',
            name: 'serviceDate',
            label: 'Date Of Service',
            required: requiredField,
            sx: { width: '100px' },
            disableFuture: true,
          },
          {
            inputType: 'text',
            name: 'qty',
            type: 'number',
            textLabel: 'Volume',
            label: 'Volume',
            placeholder: '',
            sx: { width: '60px' },
          },
          {
            label: 'Qualifiers',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'modifier1',
                required: requiredField,
                textLabel: '',
                sx: { width: '60px', marginRight: '4px' },
                maxLength: { value: 4 },
                placeholder: ' ',
              },
              {
                inputType: 'text',
                type: 'number',
                name: 'modifier2',
                required: requiredField,
                textLabel: '',
                sx: { width: '60px', marginRight: '4px' },
                maxLength: { value: 4 },
                placeholder: ' ',
              },
              {
                inputType: 'text',
                type: 'number',
                name: 'modifier3',
                required: requiredField,
                textLabel: '',
                sx: { width: '60px', marginRight: '4px' },
                maxLength: { value: 4 },
                placeholder: ' ',
              },
              {
                inputType: 'text',
                type: 'number',
                name: 'modifier4',
                required: requiredField,
                textLabel: '',
                sx: { width: '60px', marginRight: '4px' },
                maxLength: { value: 4 },
                placeholder: ' ',
              },
            ],
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'price',
            required: requiredField,
            label: 'Cost',
            placeholder: ' ',
            sx: { width: '70px' },
            maxLength: { value: 4 },
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'discPer',
            label: 'Disc',

            textLabel: '',
            sx: { width: '80px', marginRight: '4px' },
            maxLength: { value: 4 },
            placeholder: ' ',
            InputProps: { endAdornment: '%' },
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'discAmt',
            label: 'Disc Amt',
            textLabel: '',
            sx: { width: '100px', marginRight: '4px' },
            maxLength: { value: 4 },
            placeholder: ' ',
            InputProps: { endAdornment: '$' },
            dependencies: {
              keys: ['discAmt'],
              calc: discAmtValidation,
            }
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'taxPer',
            label: 'Tax',

            textLabel: '',
            sx: { width: '80px', marginRight: '4px' },
            maxLength: { value: 4 },
            placeholder: ' ',
            InputProps: { endAdornment: '%' },
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'taxAmt',
            label: 'Tax Amt',

            textLabel: '',
            sx: { width: '100px', marginRight: '4px' },
            maxLength: { value: 4 },
            placeholder: ' ',
            InputProps: { endAdornment: '$' },
          },
          {
            inputType: 'text',
            type: 'number',
            name: 'total',
            required: requiredField,
            label: 'Total',
            placeholder: ' ',
            sx: { width: '70px' },
            maxLength: { value: 4 },
            dependencies: {
              keys: ['price', 'qty', 'discAmt', 'discPer', 'taxPer', 'taxAmt'],
              calc: totalCalc,
              listenAllChanges: true,
            },
          },
        ],
      },
      {
        component: () => (
          <Typography style={{ fontWeight: 'bolder' }}>
            Summary of Charges
          </Typography>
        ),
      },
      ...summaryOfChargesGroups,
      {
        inputType: 'textArea',
        name: 'comment',
        textLabel: 'Comment',
        colSpan: 1,
        pattern: regTextArea,
      },
      ...(encounterType !== "insurance_billing_Type"
        ? [ {
        component: () => (
          <Typography style={{ fontWeight: 'bolder' }}>
            Payment
          </Typography>
        ),
      },
      ...paymentGroups,
      {
        component: () => (
          <div style={{backgroundColor:palette.text.radio,padding:5,borderRadius:5}}>
            <Typography style={{ fontSize: '12px' }}>
              To pay by card, select 'Collect Card Payment'. The remaining balance will automatically appear in the card payment window. Once the payment is successful, the paid amount will be updated accordingly.
            </Typography>

          {/* <Typography style={{ fontSize: '12px' }}>
            For Card Payment: click on 'Collect Card Payment' and the Balance Amount will populate automatically in the Card Payment pop up, if payment is successful the paid amount field will update automatically 
          </Typography> */}
          </div>
        ),
      },  

      {
        inputType: 'text',
        name: 'balance',
        type: 'number',
        textLabel: 'Balance $',
        pattern: regexDecimal,
        disabled: true,
        colSpan: 0.5,
      },
      {
        inputType: 'text',
        name: 'note',
        type: 'text',
        textLabel: 'Note ',
        colSpan: 1,
      },

      {
        ...WiredMasterField({
          code: 'billing_status',
          filter: { limit: 20 },
          name: 'statusCode',
          label: 'Set Status',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.5,
          placeholder: 'Select',
        }),
      },
      // {
      //   component: () => (
      //     <div
      //       style={{
      //         display: 'flex',
      //         alignItems: 'center',
      //         marginTop: '1rem',
      //         flex: 1,
      //         gap: 15,
      //       }}
      //     >
      //       {/* <LoadingButton onClick={() => {}} label={'PRINT'} /> */}
      //       {/* <LoadingButton
      //         variant="outlinedSecondary"
      //         onClick={() => {}}
      //         label="PAY NOW"
      //       /> */}
      //     </div>
      //   ),
      //   colSpan: 0.5,
      //   cstSx: { height: '100%', display: 'flex', alignItems: 'center' },
      // },
    ] : []),
    ],
    []
  );
  return (
    <Container >
      <CardContent>
        <Box className={paid && 'superbill-form-disable'}>
          <CustomForm
            form={form}
            formGroups={formGroups}
            defaultValue={isEmpty(billingData)?defaultData: billingData}
          />
        </Box>
      </CardContent>
      {!paid &&<CardActions
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
          loading={
            encounterBillingSaveLoading 
          }
          label={billingData?.id ? 'Update' : 'Save'}
        />
        {encounterType === "insurance_billing_Type" && (
          <LoadingButton
            onClick={handleSubmit(onHandleClaim)}
            loading={encounterClaimBillingSaveLoading}
            label={billingData?.id ? "Generate Claim" : "Save & Generate Claim"}
          />
        )}
      </CardActions>}
      {icdBrowserModal && (
        <ModalComponent
          open
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
            />
          </Box>
        </ModalComponent>
      )}

      {showCustomProcedure && (
        <ModalComponent
          open
          header={{
            title: 'Add Custom Procedure',
            closeIconAction: closeCustomProcedure,
          }}
          modalStyle={{ width: '100%' }}
        >
          <Box>
            <CustomProcedureForm
              onClose={closeCustomProcedure}
              onSave={handleCoustomProcedureSave}
            />
          </Box>
        </ModalComponent>
      )}
      {cardPaymentData &&  <ModalComponent
      open={true}
      header={{
        title: `Card Payment form`,
        closeIconAction: closeCardPayment,
      }}
      modalStyle={{width:'100%'}}
      shouldCloseOnBackdropClick={false}
    >
     <CardPayment defaultData={cardPaymentData} closeCardPayment={closeCardPayment} handleCardPayment={handleCardPayment}/>
    </ModalComponent>}
    </Container>
  );
};

export default React.memo(SuperBillForm);
