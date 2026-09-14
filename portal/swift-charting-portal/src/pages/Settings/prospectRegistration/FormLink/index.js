import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { decrypt } from 'src/lib/encryption';
import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { showSnackbar } from 'src/lib/utils';
import api from 'src/api';

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

const RACE_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other',
  'Prefer not to say',
];

const ETHNICITY_OPTIONS = [
  'Hispanic or Latino',
  'Not Hispanic or Latino',
  'Prefer not to say',
];

const GENDER_IDENTITY_OPTIONS = [
  'Female',
  'Male',
  'Non-binary',
  'Transgender',
  'Other',
  'Prefer not to say',
];

const PRONOUN_OPTIONS = [
  'He/Him',
  'She/Her',
  'They/Them',
  'Other',
  'Prefer not to say',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Other',
];

const StripeElementBox = ({ children, sx, ...rest }) => (
  <Box
    {...rest}
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
      '& .StripeElement': {
        width: '100%',
      },
      '& iframe': {
        width: '100%',
      },
      ...sx,
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

const ProspectRegistrationFormBase = ({
  stripe = null,
  elements = null,
  params,
  widgetConfig,
  widgetConfigLoading,
  availableProcedureCodes,
  procedureCodesLoading,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const initialFormData = useMemo(
    () => ({
      firstName: '',
      lastName: '',
      preferredName: '',
      email: '',
      preferredContactNumber: '',
      optInTextReminder: false,
      dateOfBirth: '',
      sexAtBirth: '',
      race: '',
      ethnicity: '',
      genderIdentity: '',
      pronoun: '',
      preferredLanguage: '',
      streetAddress: '',
      city: '',
      state: '',
      zip: '',
      personalId: '',
      service: '',
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormData);

  const initialPaymentData = useMemo(
    () => ({
      cardName: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: '',
      billingPhone: '',
    }),
    []
  );
  const [paymentData, setPaymentData] = useState(initialPaymentData);
  const [submitting, setSubmitting] = useState(false);

  const selectedProcedure = useMemo(() => {
    const serviceId = formData?.service;
    if (!serviceId) return null;
    return (
      availableProcedureCodes?.find((p) => String(p?.id) === String(serviceId)) ||
      null
    );
  }, [availableProcedureCodes, formData?.service]);

  const selectedServicePrice = useMemo(() => {
    if (!selectedProcedure) return 0;
    const total = selectedProcedure?.total;
    if (Number.isFinite(Number(total))) return Number(total);
    const qty = Number(selectedProcedure?.qty ?? 0);
    const price = Number(selectedProcedure?.price ?? 0);
    const computed = qty * price;
    return Number.isFinite(computed) ? computed : Number.isFinite(price) ? price : 0;
  }, [selectedProcedure]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePaymentFieldChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const copyFromDemographics = useCallback(() => {
    setPaymentData((prev) => ({
      ...prev,
      cardName: `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim(),
      billingAddress: formData?.streetAddress || '',
      billingCity: formData?.city || '',
      billingState: formData?.state || '',
      billingZip: formData?.zip || '',
      billingCountry: prev.billingCountry || 'US',
      billingPhone: formData?.preferredContactNumber || '',
    }));
  }, [formData]);

  const formatUsd = useCallback((amount) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return '$0.00';
    return `$${n.toFixed(2)}`;
  }, []);

  const paymentRequired = !!widgetConfig?.paymentRequired;
  const widgetStripeMode = widgetConfig?.stripeMode || 'test';
  const stripePublishableKey = widgetConfig?.stripePublishableKey || '';
  const shouldShowPayment = paymentRequired && !!formData?.service && selectedServicePrice > 0;
  const stripeReady = !shouldShowPayment || (!!stripe && !!elements && !!stripePublishableKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!params) return;

    if (!stripeReady) {
      showSnackbar({
        message: 'Payment is required but Stripe is not configured or not ready.',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      let stripePaymentIntentId = null;
      let stripeMode = widgetStripeMode;

      if (shouldShowPayment) {
        const paymentIntentResp = await api.post({
          url: `${API_URL.formLinkProspect}/payment-intent`,
          data: {
            serviceId: formData?.service,
            email: formData?.email,
          },
        });

        const clientSecret = paymentIntentResp?.data?.clientSecret;
        stripePaymentIntentId = paymentIntentResp?.data?.paymentIntentId || null;
        stripeMode = paymentIntentResp?.data?.stripeMode || widgetStripeMode;

        if (!clientSecret) {
          throw new Error('Unable to start payment. Missing client secret.');
        }

        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) {
          throw new Error('Card details are required.');
        }

        const billingName =
          paymentData?.cardName?.trim() ||
          `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim();

        const confirmResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumber,
            billing_details: {
              name: billingName || undefined,
              email: formData?.email || undefined,
              phone: paymentData?.billingPhone || formData?.preferredContactNumber || undefined,
              address: {
                line1: paymentData?.billingAddress || formData?.streetAddress || undefined,
                city: paymentData?.billingCity || formData?.city || undefined,
                state: paymentData?.billingState || formData?.state || undefined,
                postal_code: paymentData?.billingZip || formData?.zip || undefined,
                country: paymentData?.billingCountry || 'US',
              },
            },
          },
        });

        if (confirmResult?.error) {
          throw new Error(confirmResult.error.message || 'Payment failed.');
        }

        const status = confirmResult?.paymentIntent?.status;
        if (status !== 'succeeded') {
          throw new Error(`Payment not completed (status: ${status || 'unknown'}).`);
        }

        stripePaymentIntentId =
          stripePaymentIntentId || confirmResult?.paymentIntent?.id || null;
      }

      const payload = {
        ...formData,
        clinicId: params.clinicId,
        templateId: params.templateId,
        staffIds: params.staffIds,
        stripePaymentIntentId,
        stripeMode,
      };

      const registrationResp = await api.post({
        url: API_URL.formLinkProspect,
        data: payload,
      });

      if (!registrationResp?.success) {
        throw new Error(registrationResp?.message || 'Registration failed.');
      }

      showSnackbar({
        message: registrationResp?.message || 'Registration submitted successfully.',
        severity: 'success',
      });

      setSubmitted(true);
      setFormData(initialFormData);
      setPaymentData(initialPaymentData);

      try {
        elements?.getElement(CardNumberElement)?.clear();
        elements?.getElement(CardExpiryElement)?.clear();
        elements?.getElement(CardCvcElement)?.clear();
      } catch (err) {
        // ignore
      }
    } catch (err) {
      showSnackbar({
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong while submitting the registration.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {widgetConfigLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : null}

          {widgetConfig?.instructionText ? (
            <Box
              sx={{
                backgroundColor: '#f4f6f8',
                borderRadius: 2,
                p: 3,
                mb: 4,
                whiteSpace: 'pre-line',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {widgetConfig.instructionText}
              </Typography>
            </Box>
          ) : null}

          <Typography variant="h6" fontWeight={700} gutterBottom>
            Patient Registration
          </Typography>

          {submitted ? (
            <Alert sx={{ mb: 3 }} severity="success">
              Registration submitted successfully.
            </Alert>
          ) : null}

          {paymentRequired && !stripePublishableKey ? (
            <Alert sx={{ mb: 3 }} severity="warning">
              Payment is required but Stripe is not configured for this clinic. Please contact the clinic.
            </Alert>
          ) : null}
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                label="First Name"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
              <TextField
                label="Last Name"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
              <TextField
                label="Preferred Name (optional)"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1 }}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                label="Preferred Contact Number"
                name="preferredContactNumber"
                type="tel"
                required
                value={formData.preferredContactNumber}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="optInTextReminder"
                    checked={formData.optInTextReminder}
                    onChange={handleToggle}
                  />
                }
                label="Opt-in to text reminders"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 3 }}>
              <TextField
                label="Date Of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{ shrink: true }}
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Box>
                <FormLabel>Sex At Birth</FormLabel>
                <RadioGroup row name="sexAtBirth" value={formData.sexAtBirth} onChange={handleChange}>
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                select
                label="Race (optional)"
                name="race"
                value={formData.race}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {RACE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Ethnicity (optional)"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {ETHNICITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Gender Identity (optional)"
                name="genderIdentity"
                value={formData.genderIdentity}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>add/select a value</em>
                </MenuItem>
                {GENDER_IDENTITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                select
                label="Pronoun (optional)"
                name="pronoun"
                value={formData.pronoun}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>add/select a value</em>
                </MenuItem>
                {PRONOUN_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Preferred Language (optional)"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>add/select a value</em>
                </MenuItem>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>

              <Box />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Address
              </Typography>
              <TextField
                label="Street Address"
                name="streetAddress"
                fullWidth
                value={formData.streetAddress}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <TextField
                select
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>Select State</em>
                </MenuItem>
                {US_STATES.map((st) => (
                  <MenuItem key={st.code} value={st.code}>
                    {st.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                label="Personal ID (Optional)"
                name="personalId"
                value={formData.personalId}
                onChange={handleChange}
                placeholder="Drivers License/State ID"
              />
              <Box />
              <Box />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                select
                label="Service"
                name="service"
                fullWidth
                required
                value={formData.service}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <em>Select Service</em>
                </MenuItem>
                {procedureCodesLoading ? (
                  <MenuItem value="" disabled>
                    Loading...
                  </MenuItem>
                ) : null}
                {availableProcedureCodes.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.cptCode ? `${item.cptCode} - ${item.name}` : item.name}
                  </MenuItem>
                ))}
                {!procedureCodesLoading &&
                Array.isArray(availableProcedureCodes) &&
                availableProcedureCodes.length === 0 ? (
                  <MenuItem value="" disabled>
                    No services available
                  </MenuItem>
                ) : null}
              </TextField>
            </Box>

            {shouldShowPayment ? (
              <Box sx={{ mb: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Payment Required <span style={{ fontWeight: 500 }}>{formatUsd(selectedServicePrice)}</span>
                </Typography>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Payment Information
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    label="First And Last Name On Card"
                    name="cardName"
                    fullWidth
                    value={paymentData.cardName}
                    onChange={handlePaymentFieldChange}
                  />
                  <Button variant="outlined" size="small" onClick={copyFromDemographics}>
                    Copy From Demographics
                  </Button>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 2 }}>
                  <TextField
                    label="Billing Address"
                    name="billingAddress"
                    fullWidth
                    value={paymentData.billingAddress}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    label="City"
                    name="billingCity"
                    fullWidth
                    value={paymentData.billingCity}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    select
                    label="State"
                    name="billingState"
                    fullWidth
                    value={paymentData.billingState}
                    onChange={handlePaymentFieldChange}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">
                      <em>Select State</em>
                    </MenuItem>
                    {US_STATES.map((st) => (
                      <MenuItem key={st.code} value={st.code}>
                        {st.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Zip"
                    name="billingZip"
                    fullWidth
                    value={paymentData.billingZip}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    label="Country"
                    name="billingCountry"
                    fullWidth
                    value={paymentData.billingCountry}
                    onChange={handlePaymentFieldChange}
                  />
                  <TextField
                    label="Phone number"
                    name="billingPhone"
                    fullWidth
                    value={paymentData.billingPhone}
                    onChange={handlePaymentFieldChange}
                  />
                </Box>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Card Details
                </Typography>

                {stripePublishableKey ? (
                  !stripe || !elements ? (
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
                  )
                ) : (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Stripe is not configured for this clinic.
                  </Alert>
                )}
              </Box>
            ) : null}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" disabled={submitting || (shouldShowPayment && !stripeReady)}>
                {submitting ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

const ProspectRegistrationStripeWrapper = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  return <ProspectRegistrationFormBase stripe={stripe} elements={elements} {...props} />;
};

const ProspectRegistration = () => {
  const [params, setParams] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const encryptedP = query.get('token');
    if (encryptedP) {
      try {
        const decryptedString = decrypt(decodeURIComponent(encryptedP));
        const searchParams = new URLSearchParams(decryptedString);

        const data = {
          clinicId: searchParams.get('clinicId'),
          templateId: searchParams.get('templateId'),
          staffIds: searchParams.get('staffIds')?.split(',') || [],
        };

        if (!data.clinicId || !data.templateId) throw new Error('Incomplete link');
        setParams(data);
      } catch (err) {
        console.error('Decryption Error:', err);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, []);

  const [
    procedureCodes,
    ,
    procedureCodesLoading,
    getProcedureCodes,
  ] = useCRUD({
    id: 'PROCEDURE_CODES_WIDGET',
    url: API_URL.procedureCode,
    type: REQUEST_METHOD.get,
  });

  const [widgetConfigResp, , widgetConfigLoading, getWidgetConfig] = useCRUD({
    id: 'PROSPECT_WIDGET_CONFIG',
    url: `${API_URL.ProspectRegistration}/widget-config`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (params && !widgetConfigResp && !widgetConfigLoading) {
      getWidgetConfig();
    }
  }, [params, widgetConfigResp, widgetConfigLoading, getWidgetConfig]);

  useEffect(() => {
    if (!procedureCodes && !procedureCodesLoading) {
      getProcedureCodes({ limit: 300 });
    }
  }, [procedureCodes, procedureCodesLoading, getProcedureCodes]);

  const widgetConfig = widgetConfigResp?.data || {};
  const paymentRequired = !!widgetConfig?.paymentRequired;
  const stripeKey = widgetConfig?.stripePublishableKey || '';

  const availableProcedureCodes = useMemo(() => {
    const all = procedureCodes?.results || [];
    const allowed = widgetConfig?.serviceIds;
    if (!Array.isArray(allowed) || allowed.length === 0) return all;
    const allowedSet = new Set(allowed.map(String));
    return all.filter((item) => allowedSet.has(String(item.id)));
  }, [procedureCodes, widgetConfig?.serviceIds]);

  const stripePromise = useMemo(() => {
    if (!stripeKey) return null;
    return loadStripe(stripeKey);
  }, [stripeKey]);

  if (error)
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="error">Invalid or expired registration link.</Alert>
      </Container>
    );

  if (!params)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!widgetConfigResp) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formProps = {
    params,
    widgetConfig,
    widgetConfigLoading,
    availableProcedureCodes,
    procedureCodesLoading,
  };

  // Only mount <Elements> when we have a Stripe key (avoids mounting with null then swapping later).
  if (paymentRequired && stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <ProspectRegistrationStripeWrapper {...formProps} />
      </Elements>
    );
  }

  return <ProspectRegistrationFormBase {...formProps} />;
};

export default ProspectRegistration;
