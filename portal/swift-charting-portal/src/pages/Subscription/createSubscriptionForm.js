import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { CREATE_PAYMENT_INTENT, CREATE_SUBSCRIPTION, CREATE_SUBSCRIPTION_AFTER_CANCEL, GET_PRACTICE_DATA_SETTING } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomForm from 'src/components/form';
import { emailValidatorPattern, maxLength, regEmail, regexDomain, requiredField, successMessage } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { decrypt } from 'src/lib/encryption';
import { Alert, Backdrop, Card, CardContent, CircularProgress, Divider, Link } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { isEmpty } from 'lodash';


// const stripePromise = loadStripe('pk_test_51PyAGYSBRtJRcKiMqCgZ7vNi9MNBl5zoWdbzzODqawS90DMsOZT832irXzcwtsVjw3WsonZpaRqGS7JDE10O4uyV00kbFthn2Q');

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

let stripePromise;

if(process.env.REACT_APP_IS_STRIPE_LIVE === "true"){
  stripePromise = loadStripe(process.env.REACT_APP_STRIPE_LIVE_PUBLISHABLE_KEY);
}else{
  stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
}


export const MembershipFormGroups = [
  {
    inputType: 'stripeCardNumber',
    name: 'cardNumber',
    type: 'text',
    textLabel: 'Card Number',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'stripeExpiry',
    name: 'expiry',
    type: 'text',
    textLabel: 'Expiration (MM/YY)',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'stripeCVV',
    name: 'cardCVV',
    type: 'text',
    textLabel: 'Card Code (CVV2/CVC2/CID)',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'text',
    name: 'cardholderName',
    type: 'text',
    textLabel: 'Cardholder Name',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'text',
    name: 'customerZip',
    type: 'number',
    textLabel: 'Customer Zip',
    colSpan: 0.5,
    required: requiredField,
  },
];

const MembershipFormForm = ({
  email, 
  practitionerCount, 
  rnCount, 
  prescriberCount, 
  cost, 
  closeCreateSubscriptionModal, 
  getSubscription,
  isTrial=false
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [getPracticeSettingResponse, ,getPracticeSettingLoading ,getPracticeSetting, clearPracticeSetting] = useCRUD({
    id: GET_PRACTICE_DATA_SETTING,
    url: API_URL.practiceSetting,
    type: REQUEST_METHOD.get,
  });

  const [response, , loading, callSubscriptionFormAPI, clearData] = useCRUD({
    id: CREATE_SUBSCRIPTION_AFTER_CANCEL,
    url: `${API_URL.clinic}/new-subscription`,
    type: REQUEST_METHOD.post,
  });

  const [responseCreate, , createLoading, callCreateSubscriptionFormAPI, clearCreateData] = useCRUD({
    id: CREATE_SUBSCRIPTION,
    url: `${API_URL.clinic}/subscription`,
    type: REQUEST_METHOD.post,
  });



  const [
    paymentIntentResponse,
    ,
    paymentIntentResponseLoading,
    callPaymentIntentAPI,
    clearPaymentIntentResponse,
  ] = useCRUD({
    id: CREATE_PAYMENT_INTENT,
    url: `${API_URL.stripePayment}/create-intent`,
    type: REQUEST_METHOD.post,
  });
  
  useEffect(() => {
    if (!isEmpty(response || responseCreate)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData(true);
      closeCreateSubscriptionModal();
      getSubscription({id: response?.practiceId || responseCreate?.subscription?.practiceId });
    //   navigate(navigateTo(UI_ROUTES.login));
    }
  },[response, responseCreate, clearData, closeCreateSubscriptionModal, getSubscription]);


  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;
     
  const handleMembershipForm = async (data) => {

    const { orderDescription,cardholderName } = data;
    if (!stripe || !elements) {
      return; // Stripe.js has not yet loaded
    }

    const cardElement = elements.getElement('cardNumber'); // Corrected to use 'cardNumber'
    

    // const cardElement = elements.getElement(CardElement);

    // Create payment method with Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
  
    const lastFourDigits = paymentMethod?.card?.last4;
    if (error) {
      showSnackbar({
        message: error.message,
        severity: 'error',
      });
      return;
    }
  
    // Call API to create a payment intent
    // callPaymentIntentAPI({
    //   data: {
    //     paymentMethodId: paymentMethod.id,
    //     amount,
    //     orderDescription,
    //     customerEmail,
    //     customerName:cardholderName,
    //   },
    // });

    // const practitionerCount = Number(data.practionerCount) || 1;
    // const rnCount = Number(data.rnCount) || 0;
    const practitionerPrice = practitionerCount > 1
      ? 99 + (practitionerCount - 1) * 49
      : 99;
    const total = practitionerPrice + rnCount * 25;

    const payload = {
      practitionerCount,
      rnCount,
      prescriberCount,
      cardNo: lastFourDigits,
      cardExpire: data.expiry,
      cvc: data.cardCVV,
      customerZip: data.customerZip,
      cost,
      paymentMethodId: paymentMethod.id,
      amount: total,
      orderDescription,
      // customerEmail: getPracticeSettingResponse?.email,
      customerName:cardholderName,
    };
  
    if(isTrial){
      callCreateSubscriptionFormAPI({
        data: payload,
      });
    }else{
      callSubscriptionFormAPI({
        data: payload,
      });
    }
  }

  return (
    <Box sx={{ 
      mt: 6, 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      position: "relative", 
    }}>
      <Backdrop
        sx={{
          position: "absolute",
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={loading || createLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 4, borderRadius: 3 }}> */}
            <Box sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  Your payment information is <strong>securely encrypted</strong> and will only be
                  used for subscription billing. 
                  <br />
                  You can cancel anytime before the trial period ends to avoid charges.
                </Alert>
              </Box>
        {/* Info Message */}
        <Box sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            You currently have <strong>{practitionerCount-1}</strong> Practitioner(s),{" "}
            <strong>{prescriberCount}</strong> Prescriber(s), and{" "}
            <strong>{rnCount}</strong> RN/Medical Assistant(s) added. <br />
            <strong>To update these counts, please use the Staff Module.</strong>
          </Alert>
        </Box>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomForm
                formGroups={MembershipFormGroups}
                form={form}
              />
              <LoadingButton
                sx={{
                  mt: 5,
                  fontSize: 18,
                  fontWeight: 'bold',
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
                fullWidth
                size="large"
                type="submit"
                loading={loading || createLoading}
                onClick={handleSubmit(handleMembershipForm)}
                label="Start Subscription"
              />
            </Grid>
          </Grid>
        </CardContent>
      {/* </Card> */}
    </Box>
  );
};

const MembershipForm = (props) => (
  <Elements stripe={stripePromise}>
    <MembershipFormForm {...props} />
  </Elements>
);

export default MembershipForm;