import React, { useCallback, useEffect, useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import Box from 'src/components/Box';
import Typography from 'src/components/Typography';
import Currency from 'src/components/Currency';
import { isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import { triggerEvents } from 'src/lib/utils';
import { GET_INVOICE } from 'src/store/types';
import { paymentType } from 'src/lib/constants';
import Payment from './Payment';

const paymentFields = {
  electronic: {
    checkname: {
      placeholder: 'Check Name',
      selector: '#checkname',
    },
    checkaba: {
      placeholder: 'Check ABA',
      selector: '#checkaba',
    },
    checkaccount: {
      placeholder: 'Account Number',
      selector: '#checkaccount',
    },
  },
  card: {
    ccnumber: {
      placeholder: '0000 0000 0000 0000',
      selector: '#ccnumber',
    },
    ccexp: {
      placeholder: 'MM/YY',
      selector: '#ccexp',
    },
    cvv: {
      placeholder: 'CVV',
      selector: '#cvv',
    },
  },
};
const Checkout = ({ patientData, dueAmount, invoiceId }) => {
  const [paymentMethod, setPaymentMethod] = useState(paymentType.card);
  const [paymentResponse, setPaymentResponse] = useState({});

  useEffect(() => () => setPaymentResponse({}), []);

  const handleResponse = useCallback(
    ({ paymentRes, paymentError }) => {
      if (paymentRes) {
        if (Number(paymentRes?.response) === 1) {
          setPaymentResponse({
            success: true,
            title: 'Payment successful',
            responsetext: `We'll email you a receipt, and for your records, your transation ID is: ${paymentRes?.transactionid}`,
            transationId: paymentRes?.transactionid,
          });
          triggerEvents(`REFRESH-TABLE-${GET_INVOICE}-PATIENT_LIST`);
        } else if (Number(paymentRes?.response) === 2) {
          setPaymentResponse({
            success: false,
            title: 'Payment Declined',
            responsetext: `${paymentRes?.responsetext} Try after some time`,
            transationId: paymentRes?.transactionid,
          });
        } else if (Number(paymentRes?.response) === 3) {
          setPaymentResponse({
            success: false,
            title: 'Duplicate payment',
            responsetext: `${paymentRes?.responsetext} Try after some time`,
            transationId: paymentRes?.transactionid,
          });
        }
      } else if (paymentError) {
        setPaymentResponse({
          success: false,
          title: 'Api error',
          responsetext: `Payment Error`,
          transationId: '',
        });
      }
    },
    [paymentResponse]
  );

  const onPaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  const SuccessView = useCallback(() => {
    const success = paymentResponse?.success;
    return (
      <>
        <div
          style={{
            borderRadius: '100px',
            height: '150px',
            width: '150px',
            background: success ? '#F8FAF5' : '#fcf0f0',
            margin: '0 auto',
          }}
        >
          <text
            style={{
              color: success ? palette.success.dark : palette.error.dark,
              fontSize: '70px',
              lineHeight: '150px',
            }}
          >
            {success ? `✓` : '✕'}
          </text>
        </div>
        <Typography variant="h6">{paymentResponse?.title}</Typography>
        <Typography variant="body2">{paymentResponse?.responsetext}</Typography>
      </>
    );
  }, [paymentResponse]);

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexGrow: 1,
        py: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        minHeight: 400,
        minWidth: 380,
      }}
    >
      <Stack
        align="center"
        spacing={3}
        sx={{
          alignItems: 'center',
          width: '80%',
        }}
      >
        {!isEmpty(paymentResponse) ? (
          <SuccessView />
        ) : (
          <div>
            <div
              style={{
                width: '100%',
                marginBottom: '16px',
                marginTop: ' 20px',
              }}
            >
              <input
                style={{
                  width: '100%',
                  border: 'solid 1px #C4CDD5',
                  borderRadius: '2px',
                  padding: '10px',
                  fontFamily: 'Poppins',
                  placeholderColor: '#9D9D9D',
                }}
                type="text"
                name="name"
                placeholder="Name"
                value={patientData?.name}
                disabled
              />
            </div>
            <div style={{ width: '100%', marginBottom: '16px' }}>
              <input
                style={{
                  width: '100%',
                  border: 'solid 1px #C4CDD5',
                  borderRadius: '2px',
                  padding: '10px',
                  fontFamily: 'Poppins',
                }}
                type="text"
                name="amount"
                placeholder="Amount"
                disabled
                value={`${Currency()}${dueAmount}`}
              />
            </div>

            <Box
              align="center"
              sx={{
                // display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                mt: 3,
                visibility: 'hidden',
                display: 'none',
              }}
            >
              <FormControl fullWidth>
                <FormLabel
                  align="left"
                  id="radio-buttons-group-label"
                  sx={{ color: palette.grey[800] }}
                >
                  Payment Method
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  row
                  onChange={onPaymentMethodChange}
                >
                  <FormControlLabel
                    key="options"
                    value={paymentType.card}
                    style={{
                      borderRadius: '8px',
                      paddingRight: '15px',
                    }}
                    sx={{
                      '& .MuiTypography-root': {
                        paddingBottom: '0',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '19.6px',
                      },
                    }}
                    control={<Radio />}
                    label="Card"
                  />
                  <FormControlLabel
                    key="options"
                    value={paymentType.electronic}
                    style={{
                      borderRadius: '8px',
                      paddingRight: '15px',
                    }}
                    sx={{
                      '& .MuiTypography-root': {
                        paddingBottom: '0',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '19.6px',
                      },
                    }}
                    control={<Radio />}
                    label="Electronic Check"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            <Payment
              paymentMethod={paymentMethod}
              handleResponse={handleResponse}
              invoiceId={invoiceId}
              dueAmount={dueAmount}
              paymentFields={paymentFields[paymentMethod]}
            />
          </div>
        )}
      </Stack>
    </Box>
  );
};

export default Checkout;
