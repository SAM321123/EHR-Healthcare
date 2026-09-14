/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormats, regexTextWithSpecialSymbol, regTextArea, requiredField, successMessage } from 'src/lib/constants';
import { convertWithTimezone, getFullName, getUTCDateTime, getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { ENCOUNTER_DATA, ENCOUNTERS_LIST_INVOICE, PRACTICE_SETTING, SAVE_INVOICE_DATA } from 'src/store/types';
import { invoiceFormGroups } from './formGroup';
import { Card, Divider, Grid, Typography } from '@mui/material';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { WiredPatientAutoComplete, WiredSelect } from 'src/wiredComponent/Form/FormFields';
import PatientInfo from 'src/pages/Patient/components/patientInfo';
import EncounterInfo from './encounterInfo';
import ChargesSummary from './chargesSummary';
const InvoiceForm = ({ 
  modalCloseAction, 
  refetchData, 
  defaultData 
}) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, setValue , control, watch, clearErrors, setError } = form;
 
  const id = defaultData?.id;
  const initialDefaultData = defaultData;
  const [initialData, setInitialData] = useState({});
  const [response, , loading, callInvoiceSaveAPI, clearData] = useCRUD({
    id: SAVE_INVOICE_DATA,
    url: API_URL.invoice,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });
  // Watch for changes in patientId and startDate
  const watchedPatientId = useWatch({ control, name: 'patientId' });
  const watchedEncounterType = useWatch({ control, name: 'encounterType' });

  const patientId = watchedPatientId || defaultData?.patientId;
  const encounterType = watchedEncounterType || defaultData?.encounterId;
  if(defaultData){
    defaultData.patientId = defaultData?.patient;
    defaultData.encounterType = defaultData?.encounter?.id;
  }
  
  const [
    encounterResponse,
    ,
    encounterLoading,
    callGetEncounterAPI,
    clearEncounterData,
  ] = useCRUD({
    id: `${ENCOUNTER_DATA}-${encounterType}`,
    url:`${API_URL.patientEncounterInfo}/${encounterType}`,
    type: REQUEST_METHOD.get,
  });
  
  const [practiceSettingData, , practiceSettingDataLoading, getPracticeSetting, clearPracticeSetting] =
  useCRUD({
    id: PRACTICE_SETTING ,
    url: `${API_URL.practiceSetting}`,
    type: REQUEST_METHOD.get,
  });
  
  useEffect(() => {
    if(patientId && encounterType){
      callGetEncounterAPI();
      getPracticeSetting();
    }
  }, [patientId,encounterType])
  
  const isInsurance = useMemo(() => encounterResponse?.billingTypeCode === 'insurance_billing_Type', [encounterResponse]);
  const claimStatus = useMemo(() => {
    const claim = encounterResponse?.billing?.claims?.find(claim => claim?.claimStatus === 'claim_status_accepted');
    return claim ? 'Claim Accepted' : 'Claim is not settled yet or in-progress';
  }, [encounterResponse]);
  const claimStatusColor = useMemo(() => {
    const claim = encounterResponse?.billing?.claims?.find(claim => claim?.claimStatus === 'claim_status_accepted');
    return claim ? '#00FF00' : '#FF0000';
  }, [encounterResponse]);
  
  const billing = useMemo(() => encounterResponse?.billing ?? 0, [encounterResponse]);
  const procedureCodes = useMemo(() => billing?.encounterProcedureCodes ?? [], [encounterResponse,billing]);
  const subtotal = useMemo(() => billing?.subTotal ?? 0, [encounterResponse,billing]);
  const tip = useMemo(() => billing?.tip ?? 0, [encounterResponse,billing]);
  const amountToInsurance = useMemo(() => billing?.insuranceSubmittedAmount ?? 0, [encounterResponse,billing]);
  const previousBalance = useMemo(() => billing?.previousBalance ?? 0, [encounterResponse,billing]);
  const cardPayment = useMemo(() => billing?.cardAmount ?? 0, [encounterResponse,billing]);
  const cashPayment = useMemo(() => billing?.cash ?? 0, [encounterResponse,billing]);
  const prePaidCash = useMemo(() => billing?.prePaidCash ?? 0, [encounterResponse,billing]);
  const balance = useMemo(() => {
    if (!billing) return 0;
    return (parseFloat(subtotal) + parseFloat(tip) + parseFloat(previousBalance)) - (parseFloat(cardPayment) + parseFloat(cashPayment) + parseFloat(amountToInsurance) + parseFloat(prePaidCash));
  }, [billing, subtotal, tip, previousBalance, cardPayment, cashPayment, amountToInsurance, prePaidCash, encounterResponse]);

  const totalWithDiscount = procedureCodes.reduce((total, item) => total + (item.addOnFields?.total || 0), 0);
  const totalDiscount = subtotal - totalWithDiscount;

  const [due, setDue] = useState(null);
  
  useEffect(() => {
    if (practiceSettingData?.name) {
      const timestamp = Date.now();
      const refId = `${practiceSettingData.name}_${timestamp}`;
      setInitialData(prev => ({
        ...prev,
        refrenceId: refId,
      }));
    }
  }, [practiceSettingData]);
  
  useEffect(() => {
    form.setValue('due', due);
  }, [due]); 
  // useEffect(() => {
  //   if (balance !== undefined) {
  //     setDue(balance); // Update due when balance changes
  //   }
  // }, [balance]); // Runs whenever balance updates
  // // let due = balance;


  const showPatientInfo =(data)=>{
    if (data.patientId && !isEmpty(data.patientId)) {
      return { hide: false };
    }
    return { hide: true };
  }
  
  // const [encounterList, , , getEncounter, clearGetData] = useCRUD({
  //   id:`${ENCOUNTERS_LIST_INVOICE}`,
  //   url: `${API_URL.patientEncounter}?atDraft=${false}`,
  //   type: REQUEST_METHOD.get,
  // });

  // useEffect(() => {
  //   if (form.getValues('patientId')?.id) {
  //     getEncounter({ patientId: form.getValues('patientId').id });
  //   }
  // }, [form.watch('patientId')]);
  // useEffect(() => {
  //   if (!form.getValues('patientId')?.id) {
  //     clearGetData();
  //   }
  // }, [form.watch('patientId')]);

  const encounterExists =(data)=>{
    if (data.encounterType) {
      return { hide: false };
    }
    return { hide: true };
  }
  const paymentExists =(data)=>{
    if (data.encounterType && data.paymentType === "partialPayment" ){
      return { hide: false };
    }
  return { hide: true };
}
const encounterCalc = (data) => {
  if (data?.patientId?.id) {
    return {
      reFetch: true,
      queryParams: { patientId: data?.patientId?.id , atDraft: false  },
    };
  }
  return { reFetch: false};
};

  const claimText =(data)=>{
    if(isInsurance){
      return {hide:false}
    }
  return {hide:true}
  }

  const invoiceFormGroups = [
    {
      ...WiredPatientAutoComplete({
        name: 'patientId',
        label: 'Patient',
        url: API_URL.getPatients,
        colSpan: 0.5,
        params: { isActive: true },
        required: requiredField,
      }),
      disabled: defaultData?.patient
    },
    // {
    //     inputType: 'select',
    //     name: 'encounterType',
    //     label: 'Encounter',
    //     required: requiredField,
    //     valueAccessor: 'id',
    //     labelAccessor: 'label',
    //     colSpan: 0.5,
    //     dependencies: {
    //       keys: ['patientId'],
    //       calc: (data, form, { isValueChanged } = {}) => {
    //         const { setValue = () => {} } = form || {};
    //         const { patientId } = data;

    //         if (!patientId?.id) {
    //           return { hide: true }; // Hide the field until patientId is selected
    //         }
    //         return {
    //           reFetch: true,
    //           options: patientId
    //             ? (encounterList?.results || [])?.map((encounter) => ({
    //                 ...encounter,
    //                 label: `${encounter?.startDate&& convertWithTimezone(encounter?.startDate, { format: dateFormats.MMDDYYYY}) || 'N/A' || 'No Date'} - ${encounter?.encounterType?.name || 'No Name'}`, 
    //               }))
    //             : [],
    //         };
    //         // return {
    //         //   reFetch: true,
    //         //   options: patientId ? [...(encounterList?.results || [])] : [],
    //         // };
    //       },
    //     },
    //     disabled: defaultData?.encounter
    // },
    {
    ...WiredSelect({
      name: 'encounterType',
      label: 'Encounter',
      required: requiredField,
      url: API_URL.patientEncounter,
      labelAccessor: [{type: 'date', label: 'startDate'},'encounterType.name'],
      valueAccessor: 'id',
      colSpan: 0.5,
      dependencies: {
        keys: ['patientId'],
        calc: encounterCalc,
      },
      cache: false,
      fetchInitial: false,
      disabled: defaultData?.encounter,
      getDisabled:(data ,loading)=>{return loading || !data}
    }),
  },
    {
      component:({form})=><PatientInfo wrapperStyle={{flex:1}} customPatientId={form.getValues('patientId')?.id} />,
      dependencies: {
        keys: ['patientId'],
        calc: showPatientInfo,
      },
    },
    {
      component: () => (
      <div style={{backgroundColor:claimStatusColor,padding:5,borderRadius:5}}>
        <Typography style={{ fontSize: '12px' }}>
          {claimStatus}
        </Typography>
      </div>
      ),
      dependencies: {
        keys: ['encounterType'],
        calc: claimText,
      }
    }, 
    {
      component:({form})=><EncounterInfo encounterResponse={encounterResponse} defaultData={defaultData} />,
      dependencies: {
        keys: ['encounterType'],
        calc: encounterExists,
      },
    },
    {
      inputType: 'textArea',
      name: 'comment',
      textLabel: 'Comments (Optional) ',
      placeholder: 'write here',
      colSpan: 1,
      pattern: regTextArea,
      dependencies: {
        keys: ['encounterType'],
        calc: encounterExists,
      },
    },
    {
      component:({form})=><ChargesSummary 
        billing={billing}
        due={due}
        balance={balance}
        defaultData={defaultData} 
      />,
      dependencies: {
        keys: ['encounterType'],
        calc: encounterExists,
      },
    },
    ...(balance !== 0 
      ? [{
          inputType: 'radio',
          name: 'paymentType',
          options: [
            { label: 'Pay Invoice in Full', value: 'payInvoiceInFull' },
            { label: 'Partial Payment', value: 'partialPayment' },
           // { label: 'Pay Non Covered Services', value: 'payNonCoveredServices' },
          ],
          colSpan: 1,
          dependencies: {
            keys: ['encounterType'],
            calc: encounterExists,
          },
          // style: isEmpty(defaultData) ? {opacity: 1} : { pointerEvents: 'none', opacity: 0.6 }, // D
        },
    ]: []),
    // {
    //   inputType: 'checkBox',
    //   name: 'payCopay',
    //   label: `Pay Copay (${billing?.coPay || 0}$)`,
    //   colSpan: 0.33,
    //   dependencies: {
    //     keys: ['encounterType'],
    //     calc: coPayExists,
    //   },
    // },
    {
      inputType: 'text',
      name: 'refrenceId',
      type: 'text',
      textLabel: 'Reference #',
      colSpan: 0.33,
      pattern: regexTextWithSpecialSymbol,
      dependencies: {
        keys: ['paymentType'],
        calc: paymentExists,
      },
      disabled: true,
    },
    {
      inputType: 'select',
      name: 'paymentMode',
      label: 'Payment Mode',
      labelAccessor: 'name',
      valueAccessor: 'value',
      options: [
        {name: 'Cash', value: 'cash'},
        {name: 'Card', value: 'card'},
        {name: 'Check', value: 'check'},
      ],
      colSpan: 0.33,
      dependencies: {
        keys: ['paymentType'],
        calc: paymentExists,
      },
    },
    {
      inputType: 'number',
      name: 'paymentAmount',
      type: 'number',
      textLabel: 'Payment Amount',
      colSpan: 0.33,
      
      dependencies: {
        keys: ['paymentType'],
        calc: paymentExists,
      },
    },
  ];

  
    const paymentValidation = (value) => {
      const {paymentAmount} = value || {};
      if (paymentAmount > balance) {
        setTimeout(
          () =>
            setError(
              'paymentAmount',
              {
                type: 'manual',
                message: 'Must be less than balance',
              },
              { shouldFocus: true }
            ),
          100
        );
          return true;
        } else {
          clearErrors(['paymentAmount']);
          return false;
        }
      };
  
  

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'paymentAmount' ) {
        const isNotvalid = paymentValidation(value);
        if(!isNotvalid){
          const due1 = (balance - parseInt(value.paymentAmount))
          setDue(due1);
        }  
      }
      if(name === 'paymentType'){
        if(value.paymentType === 'payInvoiceInFull'){
          setDue(0);
        }
        if(value.paymentType === 'payNonCoveredServices' || value.paymentType === 'partialPayment'){
          setDue(balance)
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, balance]);
  
  const onHandleSubmit = useCallback(
    (data) => {
      if(!data.due){
        data.due = 0;
      }
      data.patientId = data.patientId?.id;
      data.encounterId = data.encounterType;
      delete data.encounterType;
      data.subTotal = subtotal;
      data.totalDiscount = totalDiscount;
      data.grandTotal = totalWithDiscount;
      // data.due = latestDue;
      data.status = billing?.statusCode
      data.totalAmount = billing?.total;
      data.totalPayment = (parseFloat(billing?.cash || 0) + parseFloat(billing?.cardAmount || 0) + 
      parseFloat(billing?.prePaidCash || 0) + parseInt(data?.paymentAmount || 0) + 
      (billing?.insuranceSubmittedAmount ? parseInt(billing?.insuranceSubmittedAmount) : 0));
      if(data?.paymentType === 'payInvoiceInFull'){
        data.paymentAmount = balance.toFixed(2)
      }
      if(data?.paymentType !== 'partialPayment'){
        delete data.refrenceId;
      }
      data.totalDiscount = data.totalDiscount.toFixed(2);
      data.due = data.due.toFixed(2);
      if (isEmpty(initialDefaultData)) {
        callInvoiceSaveAPI({data})
      }else{
        const updatedFields = getUpdatedFieldsValue(data, initialDefaultData);
        delete updatedFields?.patient;
        delete updatedFields?.patientId;
        delete updatedFields?.encounter;
        callInvoiceSaveAPI({...updatedFields }, `/${data?.id}`);
      }
    },
    [callInvoiceSaveAPI, defaultData, id, encounterResponse]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      // clearGetData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  const handleCloseModal = () => {
    // clearGetData();
    modalCloseAction(); 
  };


  return (
    <Card sx={{ maxWidth: '100%', mx: 'auto', p: 3 }}>
    <CardContent>
      <CustomForm
        form={form}
        formGroups={invoiceFormGroups}
        columnsPerRow={1}
        defaultValue={isEmpty(defaultData) ? initialData : defaultData}
      />
    </CardContent>

    {/* Actions */}    
    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
      <LoadingButton
        variant="outlinedSecondary"
        onClick={handleCloseModal}
        label="Cancel"
      />
      { !defaultData?.patient && (
        <LoadingButton
           loading={loading}
           onClick={handleSubmit(onHandleSubmit)}
           label="Save"
         />
      )}
    </CardActions>
  </Card>
  );
};

export default InvoiceForm;
