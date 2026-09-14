import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { TEMP_PRACTICE, CREATE_SUBSCRIPTION, CREATE_PAYMENT_INTENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomForm from 'src/components/form';
import { maxLength, regEmail, regexDomain, requiredField, successMessage } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigateTo, UI_ROUTES } from 'src/lib/routeConstants';
import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { decrypt } from 'src/lib/encryption';
import { Alert, Card, CardContent, Divider, Link } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { isEmpty } from 'lodash';


// const stripePromise = loadStripe('pk_test_51PyAGYSBRtJRcKiMqCgZ7vNi9MNBl5zoWdbzzODqawS90DMsOZT832irXzcwtsVjw3WsonZpaRqGS7JDE10O4uyV00kbFthn2Q');

const stripePromise = loadStripe(process.env.REACT_APP_IS_STRIPE_LIVE==="true" ?  process.env.REACT_APP_STRIPE_LIVE_PUBLISHABLE_KEY : process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


export const MembershipFormGroups = [
  {
    inputType: 'text',
    type: 'email',
    name: 'email',
    textLabel: 'Clinic Email Address ',
    required: requiredField,
    pattern: regEmail,
    gridProps: { md: 12 },
    colSpan: 0.5,
    disabled: true,
  },
  {
    inputType: 'text',
    name: 'domainName',
    textLabel: 'Domain Name',
    required: requiredField,
    maxLength: maxLength('Domain Name', 200),
    gridProps: { md: 12 },
    pattern: {
      value: regexDomain.value,
      message: `Domain Name ${regexDomain.message}`,
    },
    InputProps: { endAdornment: '.swiftcharting.com' },
    colSpan: 0.5,
    disabled: true,
  },
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
  {
    component: ({ form }) => {
      const practitionerCount = Number(form.watch('practionerCount')) || 1;
      const rnCount = Number(form.watch('rnCount')) || 0;
      const practitionerPrice = practitionerCount > 1
        ? 99 + (practitionerCount - 1) * 49
        : 99;
      const total = practitionerPrice + rnCount * 25;
      return (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            mt: 4,
            mb: 2,
            width: '100%',
          }}
        >
          <Card sx={{ minWidth: 280, boxShadow: 0, borderRadius: 2, width: '100%', bgcolor: '#f9f9f9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Estimated Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                   ${total.toFixed(2)} / month
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
                Please note monthly charges may vary based on usage of add-ons.
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <LockIcon fontSize="small" sx={{ color: '#1976d2', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Secure Payment
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 280, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Subscription Plan Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                $99/mo <span style={{ color: '#888' }}>for first practitioner</span>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                $49/mo <span style={{ color: '#888' }}>per additional practitioner</span>
              </Typography>
              <Typography variant="body1">
                $25/mo <span style={{ color: '#888' }}>per clinical staff</span>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    },
  },
];

const MembershipFormForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const decryptId = decrypt(id);
  
  const stripe = useStripe();
  const elements = useElements();

  const [response, , loading, callSubscriptionFormAPI, clearData] = useCRUD({
    id: CREATE_SUBSCRIPTION,
    url: `${API_URL.clinic}/subscription`,
    type: REQUEST_METHOD.post,
  });

  const [tempPractice, , tempPracticeLoading, getTempPractice, clearDataTempPractice] = useCRUD({
    id: TEMP_PRACTICE,
    url: `${API_URL.clinic}/temp-practice`,
    type: REQUEST_METHOD.get,
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
    if (decryptId) {
      getTempPractice({ id: decryptId });
    }
  }, [decryptId]);
  
  useEffect(() => {
    const id = response?.data?.id;
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData(true);
      navigate(navigateTo(UI_ROUTES.login));
    }
  },[response, clearData, navigate]);

  const defaultValues = useMemo(
    () => ({
      email: tempPractice?.email || '',
      domainName: tempPractice?.domainName || '',
      address: tempPractice?.address || '',
      practionerCount: 1,
      rnCount: 0,
    }),
    [tempPractice]
  );

  const form = useForm({ mode: 'onChange', defaultValues });
  const { handleSubmit } = form;
     
  const handleMembershipForm = async (data) => {

    const { customerEmail, orderDescription,cardholderName } = data;
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
    // const practitionerPrice = practitionerCount > 1
    //   ? 99.00 + (practitionerCount - 1) * 49
    //   : 99.00;
    // const total = (practitionerPrice + rnCount * 25).toFixed(2);

    const total = 99.00;

    const payload = {
      tempPracticeId: decryptId,
      practitionerCount: data.practionerCount,
      rnCount: data.rnCount,
      cardNo: lastFourDigits,
      cardExpire: data.expiry,
      cvc: data.cardCVV,
      customerZip: data.customerZip,
      cost: total,
      paymentMethodId: paymentMethod.id,
      amount: total,
      orderDescription,
      customerEmail,
      customerName:cardholderName,
    };
  
  
    callSubscriptionFormAPI({
      data: payload,
    });
  }

  return (
    <Box sx={{ mt: 6, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 4, borderRadius: 3 }}> */}
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
            We require your card details to set up the subscription.{" "}
            <strong>You will not be charged until your free trial ends.</strong>
            <br />
            Your payment information is <strong>securely encrypted</strong> and will only be
            used for subscription billing. 
            <br />
            You can cancel anytime before the trial period ends to avoid charges.
          </Alert>
        </Box>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomForm
                formGroups={MembershipFormGroups}
                form={form}
                defaultValue={defaultValues}
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
                loading={loading}
                onClick={handleSubmit(handleMembershipForm)}
                label="Start Subscription"
              />
              <Box mt={3} textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate(`/${UI_ROUTES.login}`)}
                  sx={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
                >
                  Back to Login
                </Link>
              </Box>
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
