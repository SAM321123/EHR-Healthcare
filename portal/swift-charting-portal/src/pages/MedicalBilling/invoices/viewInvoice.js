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
import { dateFormats, regTextArea, requiredField, successMessage } from 'src/lib/constants';
import { convertWithTimezone, getFullName, getUTCDateTime, getUpdatedFieldsValue, showSnackbar } from 'src/lib/utils';
import { ENCOUNTER_DATA, ENCOUNTERS_LIST_INVOICE, GET_INVOICE_DATA, SAVE_INVOICE_DATA } from 'src/store/types';
import { invoiceFormGroups } from './formGroup';
import { Card, Divider, Grid, Typography } from '@mui/material';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { WiredPatientAutoComplete, WiredSelect } from 'src/wiredComponent/Form/FormFields';
import PatientInfo from 'src/pages/Patient/components/patientInfo';
import EncounterInfo from './encounterInfo';
const ViewInvoice = ({ 
  modalCloseAction, 
  refetchData, 
  defaultData 
}) => {
    const id = defaultData?.id;

    const [
      response,
      ,
      loading,
      callGetInvoiceAPI,
      clearInvoiceData,
    ] = useCRUD({
      id: `${GET_INVOICE_DATA}-${id}`,
      url:`${API_URL.invoice}/${id}`,
      type: REQUEST_METHOD.get,
    });

    useEffect(() => {
        callGetInvoiceAPI();
    }, [])
    

 const billing = response?.encounter?.billing;

 const paymentType = response?.paymentType;
    let invoicePaymentType;
    if(paymentType === 'payInvoiceInFull'){
        invoicePaymentType = 'Pay Invoice in Full';
    } else if(paymentType === 'partialPayment'){
        invoicePaymentType = 'Partial Payment';
    }else{
        invoicePaymentType = 'N/A';
    }

  
  const handleCloseModal = () => {
    modalCloseAction(); 
  };
  

  return (
    <Card  sx={{ maxWidth: '100%', mx: 'auto', p: 3 }}>
        <CardContent>
            <div
                style={{ margin: '16px 0' }}
            >
                <PatientInfo wrapperStyle={{flex:1}} customPatientId={defaultData?.patientId}/>
            </div>
            <div
                style={{ margin: '16px 0' }}
            >
                <EncounterInfo encounterResponse={response?.encounter} defaultData={defaultData} />,
            </div>
            <div 
                style={{
                // display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #E8E8E8',
                padding: '10px',
                gap: '10px',
                borderRadius: '8px',
                width: '100%',
                }}
            >
                {/* <Divider sx={{ my: 2 }} /> */}
                  <Box sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                    
                    {/* Charges Section */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textDecoration: 'underline' }}>Charges</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Subtotal:</strong></Typography>
                      <Typography variant="body1">${billing?.subTotal || 0}</Typography>
                    </Box>
            
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Tip:</strong></Typography>
                      <Typography variant="body1">${billing?.tip || 0}</Typography>
                    </Box>
            
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Previous Balance:</strong></Typography>
                      <Typography variant="body1">${billing?.previousBalance || 0}</Typography>
                    </Box>
            
            
                    <Divider sx={{ my: 1 }} />
            
                    {/* Payments Section */}
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textDecoration: 'underline' }}>Payments</Typography>
            
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Payment (Cash):</strong></Typography>
                      <Typography variant="body1">${billing?.cash ? billing.cash : 0}</Typography>
                    </Box>
            
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Payment (Card):</strong></Typography>
                      <Typography variant="body1">${billing?.cardAmount ? billing.cardAmount : 0}</Typography>
                    </Box>
            
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Prepaid Amount:</strong></Typography>
                      <Typography variant="body1">${billing?.prePaidCash ? billing.prePaidCash : 0}</Typography>
                    </Box>

                   {billing?.insuranceSubmittedAmount && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Amount submited to insurance:</strong></Typography>
                      <Typography variant="body1">${billing?.insuranceSubmittedAmount ? billing.insuranceSubmittedAmount : 0}</Typography>
                    </Box>
                   )} 
                    <Divider sx={{ my: 1 }} />
                      {/* Payments Section */}
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textDecoration: 'underline' }}>Invoice Payments</Typography>
            
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Typography variant="body1"><strong>Invoice Payment Type :</strong></Typography>
                        <Typography variant="body1"> {invoicePaymentType}</Typography>
                      </Box>
              
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Typography variant="body1"><strong>Invoice Payment Mode : </strong></Typography>
                        <Typography variant="body1"> {response?.paymentMode || 'N/A'}</Typography>
                      </Box>
              
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Typography variant="body1"><strong>Invoice Payment Amount : </strong></Typography>
                        <Typography variant="body1">${response?.paymentAmount ? response?.paymentAmount : 0}</Typography>
                      </Box>

                    <Divider sx={{ my: 1 }} />
            
                    {/* Balance Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="h6" fontWeight="bold">Balance:</Typography>
                      <Typography variant="h6" fontWeight="bold">{response?.due}</Typography>
                    </Box>
                  </Box>
            </div>

        </CardContent>

    </Card>
  );
};

export default ViewInvoice;
