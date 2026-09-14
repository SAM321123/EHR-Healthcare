import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useForm, Controller } from 'react-hook-form';
import { getAllTimezones, getTimezonesForCountry } from 'countries-and-timezones';
import { showSnackbar } from 'src/lib/utils';
import server from 'src/api/server';
import api from 'src/api';
import { API_URL } from 'src/api/constants';
import { formatTimezonesForDisplay } from 'src/lib/timezoneHelpers';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import { requiredField, regEmail, onlyNumber } from 'src/lib/constants';

const COUNTRY_NAME_TO_CODE = {
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'argentina': 'AR',
  'australia': 'AU', 'austria': 'AT', 'bangladesh': 'BD', 'belgium': 'BE',
  'brazil': 'BR', 'canada': 'CA', 'chile': 'CL', 'china': 'CN',
  'colombia': 'CO', 'croatia': 'HR', 'czech republic': 'CZ', 'denmark': 'DK',
  'egypt': 'EG', 'ethiopia': 'ET', 'finland': 'FI', 'france': 'FR',
  'germany': 'DE', 'ghana': 'GH', 'greece': 'GR', 'hungary': 'HU',
  'india': 'IN', 'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ',
  'ireland': 'IE', 'israel': 'IL', 'italy': 'IT', 'japan': 'JP',
  'jordan': 'JO', 'kenya': 'KE', 'malaysia': 'MY', 'mexico': 'MX',
  'morocco': 'MA', 'myanmar': 'MM', 'nepal': 'NP', 'netherlands': 'NL',
  'new zealand': 'NZ', 'nigeria': 'NG', 'norway': 'NO', 'pakistan': 'PK',
  'peru': 'PE', 'philippines': 'PH', 'poland': 'PL', 'portugal': 'PT',
  'romania': 'RO', 'russia': 'RU', 'saudi arabia': 'SA', 'singapore': 'SG',
  'south africa': 'ZA', 'south korea': 'KR', 'spain': 'ES', 'sri lanka': 'LK',
  'sweden': 'SE', 'switzerland': 'CH', 'taiwan': 'TW', 'thailand': 'TH',
  'turkey': 'TR', 'ukraine': 'UA', 'united arab emirates': 'AE',
  'united kingdom': 'GB', 'uk': 'GB', 'united states': 'US', 'usa': 'US',
  'venezuela': 'VE', 'vietnam': 'VN',
};


const toIsoCountryCode = (value) => {
  if (!value || typeof value !== 'string') return 'US';
  const trimmed = value.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  const code = COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()];
  return code || 'US';
};
const BILLING_COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' }, { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' }, { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' }, { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' }, { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' }, { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NZ', name: 'New Zealand' }, { code: 'ZA', name: 'South Africa' },
  { code: 'PK', name: 'Pakistan' }, { code: 'NG', name: 'Nigeria' },
  { code: 'PH', name: 'Philippines' }, { code: 'ID', name: 'Indonesia' },
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'gender_at_birth_other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const StripeElementBox = ({ children, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      border: '1px solid rgba(0,0,0,0.23)',
      borderRadius: 1,
      px: 1.5,
      py: 1.25,
      minHeight: 56,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      cursor: 'text',
      '& .StripeElement': { width: '100%' },
      '& iframe': { width: '100%' },
    }}
  >
    {children}
  </Box>
);

const stripeElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#111827',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#DC2626' },
  },
};

const GuestPatientFormBase = ({ bookingData, onSuccess, stripe = null, elements = null }) => {

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: null,
      sexAtBirthCode: '',
      address: {},
      timezone: '',
      agreeToTerms: false,
    },
  });

  const formGroups = [
    {
      inputType: 'text',
      name: 'firstName',
      textLabel: 'First Name',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      inputType: 'text',
      name: 'lastName',
      textLabel: 'Last Name',
      required: requiredField,
      colSpan: 0.5,
    },
    {
      inputType: 'text',
      type: 'email',
      name: 'email',
      textLabel: 'Email',
      required: requiredField,
      pattern: regEmail,
      colSpan: 0.5,
    },
    {
      inputType: 'phoneInput',
      name: 'phone',
      textLabel: 'Phone Number',
      pattern: onlyNumber,
      required: requiredField,
      colSpan: 0.5,
    },
    {
      inputType: 'date',
      name: 'dob',
      textLabel: 'Date of Birth',
      required: requiredField,
      disableFuture: true,
      colSpan: 0.5,
      defaultValue: null,
    },
    {
      inputType: 'select',
      name: 'sexAtBirthCode',
      label: 'Sex at Birth',
      required: requiredField,
      options: GENDER_OPTIONS.map((g) => ({ label: g.label, value: g.value })),
      labelAccessor: 'label',
      valueAccessor: 'value',
      colSpan: 0.5,
    },
    {
      inputType: 'mapAutoComplete',
      name: 'address',
      label: 'Address',
      required: requiredField,
      itemProps: {
        address: { colSpan: 1 },
        countryCode: { colSpan: 0.25 },
        stateCode: { colSpan: 0.25 },
        city: { colSpan: 0.25 },
        postalCode: { colSpan: 0.25 },
      },
    },
    {
      inputType: 'select',
      name: 'timezone',
      label: 'Timezone',
      valueAccessor: 'name',
      labelAccessor: 'displayLabel',
      required: requiredField,
      colSpan: 1,
      dependencies: {
        keys: ['address', 'address.countryCode'],
        calc: (data, formInstance, { isValueChanged } = {}) => {
          const { setValue = () => {} } = formInstance || {};
          const allTimezones = getAllTimezones();
          const allTimezonesArray = Object.values(allTimezones);
          const raw = data?.address?.countryCode;
          const code = typeof raw === 'string' && /^[A-Z]{2}$/i.test(raw.trim()) ? raw.trim().toUpperCase() : null;
          if (isValueChanged) setValue('timezone', '');
          const tzForCountry = code ? getTimezonesForCountry(code) : null;
          const rawTimezones = tzForCountry && tzForCountry.length > 0 ? tzForCountry : allTimezonesArray;
          const formattedTimezones = formatTimezonesForDisplay(rawTimezones);
          return {
            reFetch: true,
            options: formattedTimezones,
          };
        },
      },
    },
  ];

  const [isLoading, setIsLoading] = useState(false);

  const initialPaymentData = useMemo(() => ({
    cardName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    billingPhone: '',
  }), []);
  const [paymentData, setPaymentData] = useState(initialPaymentData);

  const autoConfirmSetting = bookingData?.autoConfirm ?? 0;
  const hidePrices = bookingData?.hidePrices === true || bookingData?.hidePrices === 1;
  const paymentForBooking = bookingData?.paymentForBooking || 'not_required';
  const depositAmount = bookingData?.depositAmount ?? 0;
  const stripePublishableKey = bookingData?.stripePublishableKey || '';
  const paymentRequired = !hidePrices && paymentForBooking !== 'not_required';

  const chargeAmount = useMemo(() => {
    if (!paymentRequired) return 0;
    if (paymentForBooking === 'full_payment_required') {
      const price = Number(bookingData?.service?.price ?? bookingData?.service?.total ?? 0);
      return Number.isFinite(price) ? price : 0;
    }
    if (
      paymentForBooking === 'deposit_required_cancellation_fee' ||
      paymentForBooking === 'just_save_card_on_file'
    ) {
      return Number(depositAmount) || 0;
    }
    return 0;
  }, [paymentRequired, paymentForBooking, depositAmount, bookingData?.service]);

  const shouldChargeNow =
    paymentRequired &&
    paymentForBooking !== 'just_save_card_on_file' &&
    chargeAmount > 0;

  const shouldSaveCard = paymentForBooking === 'just_save_card_on_file';

  const stripeReady = !paymentRequired || (!!stripe && !!elements);

  const handlePaymentFieldChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const copyFromDemographics = useCallback(() => {
    const values = form.getValues();
    setPaymentData((prev) => ({
      ...prev,
      cardName: `${values.firstName || ''} ${values.lastName || ''}`.trim(),
      billingAddress: values.address?.addressLine1 || '',
      billingCity: values.address?.locality || '',
      billingState: values.address?.stateCode || '',
      billingZip: values.address?.postalCode || '',
      billingCountry: toIsoCountryCode(values.address?.countryCode || 'US'),
      billingPhone: values.phone || '',
    }));
  }, [form]);

  const formatUsd = (amount) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return '$0.00';
    return `$${n.toFixed(2)}`;
  };

  const onSubmit = async (data) => {
    if (!data.agreeToTerms) {
      showSnackbar({ message: 'Please agree to the terms and conditions', severity: 'error' });
      return;
    }

    if (paymentRequired && !stripeReady) {
      showSnackbar({ message: 'Payment is required but Stripe is not ready.', severity: 'error' });
      return;
    }

    form.clearErrors('email');

    setIsLoading(true);

    try {
      let stripePaymentIntentId = null;
      let stripeSetupIntentId = null;
      let stripePaymentMethodId = null;
      let stripeCustomerId = null;

      if (paymentRequired && stripe && elements) {
        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) {
          throw new Error('Card details are required.');
        }

        const billingName =
          paymentData.cardName?.trim() ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim();

        const billingDetails = {
          name: billingName || undefined,
          email: data.email || undefined,
          phone: paymentData.billingPhone || data.phone || undefined,
          address: {
            line1: paymentData.billingAddress || data.address?.addressLine1 || undefined,
            city: paymentData.billingCity || data.address?.locality || undefined,
            state: paymentData.billingState || data.address?.stateCode || undefined,
            postal_code: paymentData.billingZip || data.address?.postalCode || undefined,
            country: toIsoCountryCode(paymentData.billingCountry || data.address?.countryCode || 'US'),
          },
        };

        if (shouldChargeNow) {
          const paymentIntentResp = await api.post({
            url: `${API_URL.onlineBookingRegistration}/payment-intent`,
            data: {
              serviceId: bookingData?.service?.id,
              email: data.email,
              paymentForBooking,
              depositAmount: chargeAmount,
              serviceName: bookingData?.service?.name || '',
            },
          });

          const clientSecret = paymentIntentResp?.data?.clientSecret;
          stripePaymentIntentId = paymentIntentResp?.data?.paymentIntentId || null;

          if (!clientSecret) {
            throw new Error('Unable to start payment. Missing client secret.');
          }

          const confirmResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardNumber, billing_details: billingDetails },
          });

          if (confirmResult?.error) {
            throw new Error(confirmResult.error.message || 'Payment failed.');
          }

          const status = confirmResult?.paymentIntent?.status;
          if (status !== 'succeeded') {
            throw new Error(`Payment not completed (status: ${status || 'unknown'}).`);
          }

          stripePaymentIntentId = stripePaymentIntentId || confirmResult?.paymentIntent?.id || null;
        } else if (shouldSaveCard) {
          // Create setup intent to save card without charging
          const setupIntentResp = await api.post({
            url: `${API_URL.onlineBookingRegistration}/setup-intent`,
            data: { email: data.email, serviceName: bookingData?.service?.name || '' },
          });
          stripeCustomerId = setupIntentResp?.data?.customerId || null;
          const clientSecret = setupIntentResp?.data?.clientSecret;
          stripeSetupIntentId = setupIntentResp?.data?.setupIntentId || null;

          if (!clientSecret) {
            throw new Error('Unable to save card. Missing client secret.');
          }

          const confirmResult = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card: cardNumber, billing_details: billingDetails },
          });
          stripePaymentMethodId =
          confirmResult?.setupIntent?.payment_method || null;   

          if (confirmResult?.error) {
            throw new Error(confirmResult.error.message || 'Card save failed.');
          }

          stripeSetupIntentId = stripeSetupIntentId || confirmResult?.setupIntent?.id || null;
        }
      }

      // Step 1: Create Patient
      const patientPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        sexAtBirthCode: data.sexAtBirthCode,
        timezone: data.timezone?.name || data.timezone,
        primaryProviderId: bookingData?.practitionerId,
      };

      if (data.address) {
        patientPayload.address = {
          addressLine1: data.address.addressLine1 || '',
          addressLine2: data.address.addressLine2 || '',
          locality: data.address.locality || '',
          state: data.address.state || '',
          stateCode: data.address.stateCode || '',
          country: data.address.country || '',
          countryCode: data.address.countryCode || '',
          postalCode: data.address.postalCode || '',
          description: data.address.description || '',
          latitude: data.address.latitude || null,
          longitude: data.address.longitude || null,
          placeId: data.address.placeId || '',
        };
      }

      const patientResponse = await server.post(API_URL.onlineBookingCreatePatient, patientPayload);

      if (!patientResponse?.id) {
        throw new Error('Failed to create patient');
      }

      // Step 2: Create Appointment
      if (!bookingData?.practitionerId) throw new Error('Practitioner information is missing');
      if (!bookingData?.locationId) throw new Error('Location information is missing');
      if (!bookingData?.date || !bookingData?.time) throw new Error('Appointment date and time are required');

      const [hours, minutes] = bookingData.time.split(':');
      const startDateTime = dayjs(bookingData.date)
        .hour(Number.parseInt(hours, 10))
        .minute(Number.parseInt(minutes, 10))
        .second(0)
        .millisecond(0)
        .toISOString();

      // When hideDurations is false, use the appointmentInterval for slot duration;
      // otherwise fall back to the service duration.
      const hideDurations = bookingData?.hideDurations === true || bookingData?.hideDurations === 1;
      const intervalMinutes = hideDurations
        ? 0
        : Number((bookingData?.appointmentInterval || '').split('_')?.[0] || 0);
      const appointmentDuration = intervalMinutes > 0
        ? intervalMinutes
        : (bookingData?.service?.duration || 60);
      const endDateTime = dayjs(startDateTime).add(appointmentDuration, 'minute').toISOString();
      const appointmentStatus = autoConfirmSetting === 1 ? 'confirmed' : 'pending';

      const appointmentPayload = {
        patientIds: [patientResponse.id],
        practitionerId: bookingData.practitionerId,
        locationId: bookingData.locationId,
        startDateTime,
        endDateTime,
        typeCode: 'individual',
        statusCode: appointmentStatus,  
        isOnlineBookingStatus: autoConfirmSetting,
        ICDId: bookingData?.service?.id || 1,
        reasonForAppointment: bookingData?.service?.name || '',
        comments: `Online booking for ${bookingData?.service?.name || 'service'}`,
        isVirtual: false,
        confirmOnIntake: false,
        stripePaymentIntentId,
        stripeSetupIntentId,
        stripeCustomerId,
        stripePaymentMethodId,
        paymentForBooking,
        sendTextAlso: bookingData?.sendTextAlso || 'to_both',
        textTemplateId: bookingData?.textTemplate || null,
      };

      const appointmentResponse = await server.post(API_URL.onlineBookingCreateAppointment, appointmentPayload);

      if (!appointmentResponse) {
        throw new Error('Failed to create appointment');
      }

      showSnackbar({ message: 'Appointment booked successfully!', severity: 'success' });

      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to book appointment';
      
      if (error?.response?.status === 409 && errorMessage.toLowerCase().includes('email')) {
        form.setError('email', {
          type: 'manual',
          message: errorMessage,
        });
      } else {
        showSnackbar({ message: errorMessage, severity: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
      <CustomForm form={form} formGroups={formGroups} columnsPerRow={1} />

      {/* Payment Section */}
      {paymentRequired && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            {paymentForBooking === 'just_save_card_on_file'
              ? `Card On File Required${bookingData?.service?.name ? ` — ${bookingData.service.name}` : ''}`
              : `Payment Required — ${bookingData?.service?.name || ''}${chargeAmount > 0 ? ` ($${Number(chargeAmount).toFixed(2)})` : ''}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {paymentForBooking === 'just_save_card_on_file'
              ? `Your card will be saved on file for${bookingData?.service?.name ? ` ${bookingData.service.name}` : ' this appointment'}. No charge will be made at this time.`
              : paymentForBooking === 'deposit_required_cancellation_fee'
              ? `A deposit of $${Number(chargeAmount).toFixed(2)} is required to hold your appointment${bookingData?.service?.name ? ` for ${bookingData.service.name}` : ''}.`
              : `Full payment of $${Number(chargeAmount).toFixed(2)} is required to complete your booking${bookingData?.service?.name ? ` for ${bookingData.service.name}` : ''}.`}
          </Typography>

          {!stripePublishableKey ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Payment is required but Stripe is not configured for this clinic. Please contact the clinic.
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Payment Information
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  label="Name on Card"
                  name="cardName"
                  fullWidth
                  size="small"
                  value={paymentData.cardName}
                  onChange={handlePaymentFieldChange}
                />
                <Button variant="outlined" size="small" onClick={copyFromDemographics} sx={{ whiteSpace: 'nowrap' }}>
                  Copy From Demographics
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5, mb: 2 }}>
                <TextField
                  label="Billing Address"
                  name="billingAddress"
                  fullWidth
                  size="small"
                  value={paymentData.billingAddress}
                  onChange={handlePaymentFieldChange}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField
                    label="City"
                    name="billingCity"
                    fullWidth
                    size="small"
                    value={paymentData.billingCity}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    select
                    label="State"
                    name="billingState"
                    fullWidth
                    size="small"
                    value={paymentData.billingState}
                    onChange={handlePaymentFieldChange}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value=""><em>Select State</em></MenuItem>
                    {US_STATES.map((st) => (
                      <MenuItem key={st.code} value={st.code}>{st.name}</MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField
                    label="Zip"
                    name="billingZip"
                    fullWidth
                    size="small"
                    value={paymentData.billingZip}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    select
                    label="Country"
                    name="billingCountry"
                    fullWidth
                    size="small"
                    value={paymentData.billingCountry}
                    onChange={handlePaymentFieldChange}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value=""><em>Select Country</em></MenuItem>
                    {BILLING_COUNTRIES.map((c) => (
                      <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                </Box>
                <TextField
                  label="Phone"
                  name="billingPhone"
                  fullWidth
                  size="small"
                  value={paymentData.billingPhone}
                  onChange={handlePaymentFieldChange}
                />
              </Box>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Card Details
              </Typography>

              {!stripe || !elements ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Loading secure payment form...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5, mb: 2 }}>
                  <StripeElementBox onClick={() => elements.getElement(CardNumberElement)?.focus()}>
                    <CardNumberElement options={stripeElementOptions} />
                  </StripeElementBox>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <StripeElementBox onClick={() => elements.getElement(CardExpiryElement)?.focus()}>
                      <CardExpiryElement options={stripeElementOptions} />
                    </StripeElementBox>
                    <StripeElementBox onClick={() => elements.getElement(CardCvcElement)?.focus()}>
                      <CardCvcElement options={stripeElementOptions} />
                    </StripeElementBox>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Terms and Conditions */}
      <Box sx={{ mt: 3 }}>
        <Controller
          name="agreeToTerms"
          control={form.control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label={
                <Typography variant="body2">
                  I agree to the terms and conditions and privacy policy
                </Typography>
              }
            />
          )}
        />
        {form.formState.errors.agreeToTerms && (
          <Typography variant="caption" color="error">
            You must agree to the terms and conditions
          </Typography>
        )}
      </Box>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <LoadingButton
          type="submit"
          loading={isLoading}
          variant="contained"
          size="large"
          label="Book Appointment"
          disabled={paymentRequired && !stripeReady}
          sx={{
            px: 4,
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        />
      </Box>
    </Box>
  );
};

GuestPatientFormBase.propTypes = {
  bookingData: PropTypes.shape({
    practitionerId: PropTypes.string,
    locationId: PropTypes.string,
    autoConfirm: PropTypes.number,
    gapInDays: PropTypes.number,
    hidePrices: PropTypes.bool,
    hideDurations: PropTypes.bool,
    showPractitioner: PropTypes.string,
    howFarInFuture: PropTypes.string,
    sendTextAlso: PropTypes.string,
    paymentForBooking: PropTypes.string,
    depositAmount: PropTypes.number,
    textTemplate: PropTypes.string,
    stripePublishableKey: PropTypes.string,
    stripeMode: PropTypes.string,
    appointmentInterval: PropTypes.string,
    service: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      duration: PropTypes.number,
      price: PropTypes.number,
      total: PropTypes.number,
    }),
    date: PropTypes.object,
    time: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

// Wrapper that pulls stripe/elements from context when inside <Elements>
const GuestPatientFormStripeWrapper = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  return <GuestPatientFormBase stripe={stripe} elements={elements} {...props} />;
};

const GuestPatientForm = (props) => {
  const stripePublishableKey = props.bookingData?.stripePublishableKey || '';
  const hidePrices = props.bookingData?.hidePrices === true || props.bookingData?.hidePrices === 1;
  const paymentForBooking = props.bookingData?.paymentForBooking || 'not_required';
  const paymentRequired = !hidePrices && paymentForBooking !== 'not_required';
  const hasStripeKey = paymentRequired && stripePublishableKey.length > 0;

  const stripePromise = useMemo(() => {
    if (!hasStripeKey) return null;
    return loadStripe(stripePublishableKey);
  }, [hasStripeKey, stripePublishableKey]);

  if (hasStripeKey) {
    return (
      <Elements stripe={stripePromise}>
        <GuestPatientFormStripeWrapper {...props} />
      </Elements>
    );
  }

  return <GuestPatientFormBase {...props} />;
};

export default GuestPatientForm;
