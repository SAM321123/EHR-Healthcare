import React from 'react';
import { Card, Divider, Grid, Typography } from '@mui/material';
import { convertWithTimezone, getFullName } from "src/lib/utils";
import { dateFormats, regTextArea, requiredField, successMessage } from 'src/lib/constants';
import Table from 'src/components/Table';
import Box from '@mui/material/Box'

const ChargesSummary = ({billing, due, balance, defaultData}) => {
    return (
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
            
                    {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                      <Typography variant="body1"><strong>Total Discount:</strong></Typography>
                      <Typography variant="body1">${totalDiscount}</Typography>
                    </Box> */}
            
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
            
                    {/* Balance Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="h6" fontWeight="bold">Balance:</Typography>
                      {defaultData?.due 
                        ? <Typography variant="h6" fontWeight="bold">{(defaultData?.due).toFixed(2)}</Typography>
                        : <Typography variant="h6" fontWeight="bold">
                            {(due !== null && !isNaN(due) ? due : balance).toFixed(2)}
                          </Typography>
                      }
                    </Box>
                  </Box>
        </div>
    )
}

export default ChargesSummary;