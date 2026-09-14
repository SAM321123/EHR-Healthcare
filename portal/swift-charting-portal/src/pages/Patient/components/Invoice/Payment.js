import React, { useCallback, useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Currency from 'src/components/Currency';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import useCRUD from 'src/hooks/useCRUD';
import { loadCollectJSScript } from 'src/lib/utils';
import { paymentType } from 'src/lib/constants';
import './payment.scss';

global.fields = {};

const Payment = ({
  paymentMethod,
  handleResponse,
  invoiceId,
  dueAmount,
  paymentFields,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentRes, paymentError, , paymentApi, clearPaymentRes] = useCRUD({
    id: 'SUBMIT_PAYMENT',
    url: API_URL.initiatePayment,
    type: REQUEST_METHOD.post,
  });

  // Test CC Cred.
  // PaymentTokenValue: 00000000-000000-000000-000000000000
  // Card: 4111111111111111
  // Expiration: October 2025
  // CVV: 999
  // test account
  // ABA: 123123123
  // Account: 123123123
  // Name: Jane Doe

  const finishSubmit = useCallback(
    (response) => {
      const data = {
        paymentToken: response.token,
        amount: dueAmount,
        currency: 'USD',
        invoice: invoiceId,
        paymentMethod,
      };
      setIsSubmitting(true);
      paymentApi({ data });
    },
    [isSubmitting]
  );

  useEffect(() => {
    if (paymentRes) {
      handleResponse({ paymentRes });
      setIsSubmitting(false);
      clearPaymentRes();
    } else if (paymentError) {
      handleResponse({ paymentError });
      setIsSubmitting(false);
      clearPaymentRes();
    }
  }, [paymentRes, paymentError]);

  function errorCallback(field, valid) {
    global.fields[field] = valid;
  };

  const configureCollectJS = useCallback(() => {
    window.CollectJS.configure({
      variant: 'inline',
      styleSniffer: true,
      callback: (token) => {
        finishSubmit(token);
      },
      validationCallback: errorCallback,
      fields: {
        ...paymentFields,
      },
    });
  }, [paymentFields]);

  useEffect(() => {
    loadCollectJSScript()
      .then(() => {
        configureCollectJS();
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (paymentMethod === paymentType.card) {
      const { ccnumber, ccexp, cvv } = global.fields;
      if (ccnumber && ccexp && cvv) {
        setIsSubmitting(true);
      }
    } else {
      const { checkname, checkaba, checkaccount } = global.fields;
      if (checkname && checkaba && checkaccount) {
        setIsSubmitting(true);
      }
    }
    window.CollectJS.startPaymentRequest();
  };

  return (
    <div key={paymentMethod}>
      <form id="form" onSubmit={handleSubmit} style={{ zIndex: 1 }}>
        {paymentMethod === paymentType.card ? (
          <div style={{ minHeight: '170px', zIndex: 1 }}>
            <div id="ccnumber" style={{ marginBottom: '16px' }} />
            <div id="ccexp" style={{ marginBottom: '16px' }} />
            <div id="cvv" style={{ marginBottom: '16px' }} />
          </div>
        ) : (
          <div>
            <div id="checkname" style={{ marginBottom: '16px' }} />
            <div id="checkaba" style={{ marginBottom: '16px' }} />
            <div id="checkaccount" style={{ marginBottom: '16px' }} />
          </div>
        )}
        <LoadingButton
          id="pay-Button"
          type="submit"
          loading={isSubmitting}
          label={`Pay ${Currency()}${dueAmount}`}
          sx={{ mt: 2 }}
        />
      </form>
    </div>
  );
};
export default Payment;
