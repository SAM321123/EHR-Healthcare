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
  initialBillingData,
  regexDecimal,
  regTextArea,
  requiredField,
} from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import {
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
import palette from 'src/theme/palette';
import IcdBrowser from 'src/pages/Patient/components/Medication/icdBrowser';
import CustomProcedureForm from 'src/pages/Patient/components/Encounters/createEncounters/superBill/customProcedureForm';
import DiagnosisTable from 'src/pages/Patient/components/Encounters/createEncounters/superBill/diagnosisTable';

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


const ReSubmitClaim = ({
  onClose,
  encounterType,
  patientId,
  encounterId,
  patientEncounterBillingData,
  refetchData,
} = {}) => {
  const [icdBrowserModal, setIcdBrowserModal] = useState(false);
  const [showCustomProcedure, setShowCustomProcedure] = useState(false);
  const [billingData, setBillingData] = useReduxState(
    `Patient_Encounter-Billing-Data`,
    initialBillingData
  );
  const form = useForm({ mode: 'onChange' });

  const insuranceTypeArr = [
    { name: 'Primary', value: '1' },
    { name: 'Secondary', value: '2' },
  ]
  const insuranceTypeOptions = insuranceTypeArr?.map((item) => {
    let match = 'not available'
    match = patientEncounterBillingData?.insurance?.insuranceType === item.value ? patientEncounterBillingData?.insurance : null
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
      inputType: 'text',
      name: 'tip',
      type: 'number',
      textLabel: 'Tips/Gratuity',
      pattern: regexDecimal,  
      colSpan: 0.2,
    },
    {
      inputType: 'text',
      name: 'insuranceSubmittedAmount',
      type: 'number',
      textLabel: 'Amount submited to insurance',
      pattern: regexDecimal,
      colSpan: 0.3,
    },
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
      disabled: true,
    },
    ...(encounterType === 'insurance_billing_Type'
      ? [
          {
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
            label: 'Select Insurance',
            required: requiredField,
          },
        ]
      : []),
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


  useEffect(() => {
    if (!isEmpty(patientEncounterBillingData)) {
      const clonedBilling = cloneDeep(patientEncounterBillingData);
      clonedBilling.encounterProcedureCodes =
        clonedBilling?.encounterProcedureCodes?.map((item) => {
          if (item.fields) {
            item = { ...item, ...item.fields };
            delete item.fields;
          }
          return item;
        }) || [];

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
        previousBalance: clonedBilling?.previousBalance,
        insuranceSubmittedAmount: clonedBilling?.insuranceSubmittedAmount,
        coPay: clonedBilling?.coPay,
        cash: clonedBilling?.cash,
        prePaidCash: clonedBilling?.prePaidCash,
        prePaidType: clonedBilling?.prePaidType,
        balance: clonedBilling?.balance,
        note: clonedBilling?.note,
        paymentDate: clonedBilling?.paymentDate,
        insuranceType: clonedBilling?.insuranceType,

      };
      setBillingData(data);
    }
  }, [patientEncounterBillingData]);
    useEffect(() => {
      if (!isEmpty(encounterClaimBillingSaveResponse)) {
        showSnackbar({
          message: 'Claim Re-Submitted',
          severity: 'success',
        });
        clearEncounterClaimBillingSaveData(true);
        refetchData();
        onClose();
      }
    }, [billingData,encounterClaimBillingSaveResponse, refetchData]);

  const { handleSubmit, watch } = form;

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

  const onHandleClaim = useCallback(
    (data) => {
      data.patientId = patientId;
      delete data.procedureCode;
      delete data.id;
      data.billingType = encounterType;
      data.encounterId = encounterId;
      data.reSubmit= true
      callEncounterClaimBillingSaveAPI({ ...data }, `/${billingData.id}`);
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

  const formGroups = useMemo(
    () => [
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
        label: 'Date of Visit',
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
          descriptionAccessor: 'description',
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
                  {
                    (getValues(`encounterProcedureCodes`) || [])?.[index]
                      ?.cptCode
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
      ...(encounterType !== 'insurance_billing_Type'
        ? [
            {
              component: () => (
                <Typography style={{ fontWeight: 'bolder' }}>
                  Payment
                </Typography>
              ),
            },

            {
              inputType: 'text',
              name: 'balance',
              type: 'number',
              pattern: regexDecimal,
              textLabel: 'Balance $',
              colSpan: 0.5,
            },
            {
              inputType: 'text',
              name: 'note',
              type: 'text',
              textLabel: ' ',
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
          ]
        : []),
    ],
    []
  );
  return (
    <Container>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={formGroups}
          defaultValue={billingData}
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
          onClick={onClose}
          label="Cancel"
        />
        {encounterType === 'insurance_billing_Type' && (
          <LoadingButton
            onClick={handleSubmit(onHandleClaim)}
            loading={encounterClaimBillingSaveLoading}
            label={'Send'}
          />
        )}
      </CardActions>
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
    </Container>
  );
};

export default React.memo(ReSubmitClaim);
