import React, { useEffect, useState } from 'react';
import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { regEmail, regexCardExpiry, regexCommonText, requiredField } from 'src/lib/constants';
import { CardActions, CardContent } from '@mui/material';
import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { showSnackbar } from 'src/lib/utils';
import useCRUD from 'src/hooks/useCRUD';
import { CREATE_PAYMENT_INTENT } from 'src/store/types'; // Added CREATE_PAYMENT_INTENT
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { isEmpty } from 'lodash';

// Load Stripe with your publishable key
// const stripePromise = loadStripe('pk_test_51PyAGYSBRtJRcKiMqCgZ7vNi9MNBl5zoWdbzzODqawS90DMsOZT832irXzcwtsVjw3WsonZpaRqGS7JDE10O4uyV00kbFthn2Q');
const stripePromise = loadStripe(process.env.REACT_APP_IS_STRIPE_LIVE==="true" ?   process.env.REACT_APP_STRIPE_LIVE_PUBLISHABLE_KEY : process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);


const formGroups = [
  {
    inputType: 'stripeCardNumber',
    name: 'cardNumber',
    type: 'text', // Changed to 'text'
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
    pattern: regexCardExpiry,
    required: requiredField,
  },
  {
    inputType: 'stripeCVV',
    name: 'cardCVV',
    type: 'text', // Changed to 'text'
    textLabel: 'Card Code (CVV2/CVC2/CID)',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'text',
    name: 'amount',
    type: 'number',
    textLabel: 'Amount',
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
    textLabel: 'ZIP Code',
    colSpan: 0.5,
    required: requiredField,
  },
  {
    inputType: 'text',
    name: 'customerEmail',
    type: 'text',
    textLabel: 'Email Address',
    colSpan: 0.5,
    pattern: regEmail,
    required: requiredField,
  },
  {
    inputType: 'text',
    name: 'orderDescription',
    type: 'text',
    textLabel: 'Description',
    colSpan: 0.5,
    pattern: regexCommonText,
    required: requiredField,
  },
  {
    inputType: 'checkbox',
    name: 'saveCard',
    label: 'Save card details for future use.',
    colSpan: 0.5,
  },
];

const CardPaymentForm = (props) => {
  const { onSuccess = () => {},defaultData, closeCardPayment, handleCardPayment } = props || {};
  const form = useForm({ mode: 'onChange' });
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);


  // Create Payment Intent API call (for confirmation)
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

  const { handleSubmit } = form;

  const handleTakePayment = async (data) => {
    const { customerEmail, amount, orderDescription,cardholderName } = data;

    if (!stripe || !elements) {
      return; // Stripe.js has not yet loaded
    }

    setIsLoading(true);

    const cardElement = elements.getElement('cardNumber'); // Corrected to use 'cardNumber'

    // Create payment method with Stripe
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });
    const lastFourDigits = paymentMethod?.card?.last4;
    setIsLoading(false);
    if (error) {
      showSnackbar({
        message: error.message,
        severity: 'error',
      });
      return;
    }

    // Call API to create a payment intent
    callPaymentIntentAPI({
      data: {
        paymentMethodId: paymentMethod.id,
        amount,
        orderDescription,
        customerEmail,
        customerName:cardholderName,
      },
    });
    handleCardPayment(amount,lastFourDigits);
  };


  useEffect(() => {
    if (!isEmpty(paymentIntentResponse && stripe)) {
      const { paymentIntent } = paymentIntentResponse;
      const {client_secret, error} = paymentIntent || {}
      clearPaymentIntentResponse(true);
      if (error) {
        showSnackbar({
          message: error.message,
          severity: 'error',
        });
      } else {
        setIsLoading(true);
        // Confirm the payment intent on the client side
        stripe.confirmCardPayment(client_secret).then(({ error, paymentIntent }) => {
          if (error) {
            showSnackbar({
              message: error.message,
              severity: 'error',
            });
          } else if (paymentIntent.status === 'succeeded') {
            showSnackbar({
              message: 'Payment successful!',
              severity: 'success',
            });
            closeCardPayment();
            onSuccess({});
          }
        }).finally(()=>{

          setIsLoading(false);
        });
      }
    }
  }, [paymentIntentResponse,stripe]);

  return (
    <div>
      <CardContent>
        <CustomForm form={form} formGroups={formGroups} defaultValue={defaultData} />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <LoadingButton
          loading={isLoading  || paymentIntentResponseLoading}
          onClick={handleSubmit(handleTakePayment)}
          label="Collect Payment"
        />
      </CardActions>
    </div>
  );
};

const CardPayment = (props) => (
  <Elements stripe={stripePromise}>
    <CardPaymentForm {...props} />
  </Elements>
);

export default CardPayment;
