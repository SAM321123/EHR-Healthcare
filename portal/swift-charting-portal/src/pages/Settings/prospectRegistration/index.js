import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import { Controller, useForm } from 'react-hook-form';
import useCRUD from 'src/hooks/useCRUD';
import { CREATE_SUBSCRIPTION, GET_PROSPECT_REGISTRATION } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomForm from 'src/components/form';
import { requiredField, successMessage } from 'src/lib/constants';
import { showSnackbar } from 'src/lib/utils';
import Typography from 'src/components/Typography';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  Grid,
  MenuItem,
  Checkbox,
  Link,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { isEmpty } from 'lodash';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { ContentCopy, Visibility, VisibilityOff } from '@mui/icons-material';
// import cancelFormGroups from '../Subscription/cancelFormGroup';
import { WiredMasterAutoComplete } from 'src/wiredComponent/Form/FormFields';
import { encrypt } from 'src/lib/encryption';

const resolveTemplateId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') {
    return value?.id ?? value?.templateId ?? value?.value ?? null;
  }
  if (typeof value === 'string') {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }
  return value;
};

const resolveIdList = (value) => {
  const rawList = Array.isArray(value) ? value : value ? [value] : [];
  return rawList
    .map((item) => {
      if (item === null || item === undefined || item === '') return null;
      if (typeof item === 'object') {
        return item?.id ?? item?.staffId ?? item?.userId ?? item?.value ?? null;
      }
      if (typeof item === 'string') {
        const numericValue = Number(item);
        return Number.isNaN(numericValue) ? item : numericValue;
      }
      return item;
    })
    .filter((item) => item !== null && item !== undefined && item !== '');
};

const ClinicSubscriptionInfo = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      serviceIds: [],
      questionnaireFormId: '',
      paymentRequired: false,
      widgetInstructions:
        "Please complete the following appointment request form to contact our practice! We will then email you a new patient forms to complete securely online.\nPlease check your secondary and spam folders if you don't see our email in your inbox.\n\nPlease allow us 48 hours to review your request and respond to you via e-mail. Also, quick note that completing this questionnaire does not guarantee an appointment.",
    },
  });

  const params = useParams();
  const { handleSubmit, watch, setValue } = form;

  // ---  data fetch for existing config ---
  const [prospectData, , getLoading, getProspectConfig] = useCRUD({
    id: GET_PROSPECT_REGISTRATION,
    url: `${API_URL.ProspectRegistration}`,
    type: REQUEST_METHOD.get,
  });

  const [
    procedureCodes,
    ,
    procedureCodesLoading,
    getProcedureCodes,
  ] = useCRUD({
    id: 'PROCEDURE_CODES_PROSPECT_OVERVIEW',
    url: API_URL.procedureCode,
    type: REQUEST_METHOD.get,
  });

  const [
    questionnaireForms,
    ,
    questionnaireFormsLoading,
    getQuestionnaireForms,
  ] = useCRUD({
    id: 'QUESTIONNAIRE_FORMS_PROSPECT_OVERVIEW',
    url: API_URL.getFormList,
    type: REQUEST_METHOD.get,
  });

  // when the api returns the configuration, populate the form
  useEffect(() => {
    const config = prospectData?.data;
    if (config && !isEmpty(config)) {
      // templateName/staffs are wired autocompletes; seed with ids and let options resolve labels.
      setValue('templateName', config.templateId ? { id: config.templateId } : null);
      // staffs expects array of objects; provide simple objects with id.
      setValue(
        'staffs',
        Array.isArray(config.staffIds)
          ? config.staffIds.map((id) =>
              typeof id === 'object'
                ? { id: id.id ?? id.staffId ?? id.userId ?? id.value }
                : { id }
            )
          : []
      );
      setValue('serviceIds', Array.isArray(config.serviceIds) ? config.serviceIds : []);
      setValue('questionnaireFormId', config.questionnaireFormId || '');
      setValue('paymentRequired', !!config.paymentRequired);
      setValue('widgetInstructions', config.instructionText || '');
    }
  }, [prospectData, setValue]);

  useEffect(() => {
    setStripeConfigState(prospectData?.data || {});
  }, [prospectData]);

  // kick off initial fetch once
  useEffect(() => {
    getProspectConfig();
  }, [getProspectConfig]);

  useEffect(() => {
    if (!procedureCodes && !procedureCodesLoading) {
      getProcedureCodes({ limit: 300 });
    }
  }, [procedureCodes, procedureCodesLoading, getProcedureCodes]);

  useEffect(() => {
    if (!questionnaireForms && !questionnaireFormsLoading) {
      getQuestionnaireForms({ limit: 300, formTypeCode: 'FT_QUESTIONNAIRES' });
    }
  }, [
    questionnaireForms,
    questionnaireFormsLoading,
    getQuestionnaireForms,
  ]);

  // --- 1. WATCH THE TEMPLATE FIELD ---
  const selectedTemplate = watch('templateName');

  const selectedStaffs = watch('staffs');

  const clinicId = params?.id || 'default-clinic';

  // --- 2. DYNAMIC URL GENERATION ---
  const generatedUrl = useMemo(() => {
    // Works for both prod (`tenant.maindomain.com`) and local (`tenant.localhost:3000`).
    const WIDGET_BASE_URL = `${window.location.origin}/prospect-registration/`;
    const templateId =
      resolveTemplateId(selectedTemplate) ??
      resolveTemplateId(prospectData?.data?.templateId);

    const selectedStaffIds = resolveIdList(selectedStaffs);
    const savedStaffIds = resolveIdList(prospectData?.data?.staffIds);
    const staffIds = (selectedStaffIds.length > 0 ? selectedStaffIds : savedStaffIds).join(',');

    if (!templateId) {
      return 'Please select an Email Template Name to generate your unique embed link.';
    }

    // 1. Create the data string or object you want to hide
    // We include clinicId, templateId, and staffIds
    const rawData = `clinicId=${clinicId}&templateId=${templateId}&staffIds=${staffIds}`;

    // 2. Use your existing encrypt function
    const encryptedData = encrypt(rawData);

    // 3. Make it URL-safe (converts symbols like + and / to %xx format)
    const safeEncryptedData = encodeURIComponent(encryptedData);

    // 4. Return the final URL with a single 'p' (payload) or 'token' parameter
    return `${WIDGET_BASE_URL}?token=${safeEncryptedData}`;
  }, [selectedTemplate, selectedStaffs, clinicId, prospectData]);

  const [response, , loading, apiHandler, clearData] = useCRUD({
    id: CREATE_SUBSCRIPTION,
    url: `${API_URL.ProspectRegistration}`,
    type: REQUEST_METHOD.post,
  });

  const [
    stripeResponse,
    ,
    stripeSaving,
    saveStripeKeys,
    clearStripeResponse,
  ] = useCRUD({
    id: 'PROSPECT_REGISTRATION_STRIPE_KEYS',
    url: `${API_URL.ProspectRegistration}/stripe-keys`,
    type: REQUEST_METHOD.update,
  });

  const [
    stripeKeysResponse,
    ,
    stripeKeysLoading,
    getStripeKeys,
    clearStripeKeysResponse,
  ] = useCRUD({
    id: 'PROSPECT_REGISTRATION_STRIPE_KEYS_GET',
    url: `${API_URL.ProspectRegistration}/stripe-keys`,
    type: REQUEST_METHOD.get,
  });

  const [stripeDialogOpen, setStripeDialogOpen] = useState(false);
  const [stripeConfigState, setStripeConfigState] = useState({});
  const [stripeSecretCache, setStripeSecretCache] = useState(null);
  const [pendingRevealField, setPendingRevealField] = useState(null);
  const [showStripeSecrets, setShowStripeSecrets] = useState({
    stripeTestSecretKey: false,
    stripeTestWebhookSecret: false,
    stripeLiveSecretKey: false,
    stripeLiveWebhookSecret: false,
  });
  const [stripeDirty, setStripeDirty] = useState({
    stripePaymentMode: false,
    stripeTestPublishableKey: false,
    stripeTestSecretKey: false,
    stripeTestWebhookSecret: false,
    stripeLivePublishableKey: false,
    stripeLiveSecretKey: false,
    stripeLiveWebhookSecret: false,
  });
  const [stripeForm, setStripeForm] = useState({
    stripePaymentMode: 'test',
    stripeTestPublishableKey: '',
    stripeTestSecretKey: '',
    stripeTestWebhookSecret: '',
    stripeLivePublishableKey: '',
    stripeLiveSecretKey: '',
    stripeLiveWebhookSecret: '',
  });

  const isPaymentRequired = !!watch('paymentRequired');

  const hasSavedStripeSecrets = useMemo(() => {
    const cfg = stripeConfigState || {};
    return {
      stripeTestSecretKey: !!cfg?.hasStripeTestSecretKey,
      stripeTestWebhookSecret: !!cfg?.hasStripeTestWebhookSecret,
      stripeLiveSecretKey: !!cfg?.hasStripeLiveSecretKey,
      stripeLiveWebhookSecret: !!cfg?.hasStripeLiveWebhookSecret,
    };
  }, [stripeConfigState]);

   const Linking= generatedUrl
   console.log('Generated Prospect Registration URL:', Linking);
  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      getProspectConfig();
      clearData(true);
    }
  }, [response, clearData, getProspectConfig]);

  useEffect(() => {
    if (!isEmpty(stripeResponse)) {
      showSnackbar({
        message: stripeResponse?.message || successMessage.update,
        severity: 'success',
      });
      setStripeConfigState((prev) => ({
        ...prev,
        ...(stripeResponse?.data || {}),
      }));
      setStripeDialogOpen(false);
      // Clear secrets from memory after save
      setStripeForm((prev) => ({
        ...prev,
        stripeTestSecretKey: '',
        stripeTestWebhookSecret: '',
        stripeLiveSecretKey: '',
        stripeLiveWebhookSecret: '',
      }));
      clearStripeResponse(true);
    }
  }, [stripeResponse, clearStripeResponse]);

  useEffect(() => {
    if (!isEmpty(stripeKeysResponse) && stripeKeysResponse?.success) {
      if (!stripeDialogOpen) {
        clearStripeKeysResponse(true);
        return;
      }

      const data = stripeKeysResponse?.data || {};
      setStripeSecretCache(data);

      if (pendingRevealField) {
        setStripeForm((prev) => ({
          ...prev,
          [pendingRevealField]: data?.[pendingRevealField] || '',
        }));
        setShowStripeSecrets((prev) => ({ ...prev, [pendingRevealField]: true }));
        setPendingRevealField(null);
      }

      clearStripeKeysResponse(true);
    }
  }, [stripeKeysResponse, pendingRevealField, clearStripeKeysResponse, stripeDialogOpen]);

  const handleSaveAccountDetails = useCallback(
    (data) => {
      const {
        templateName,
        staffs: staffsRaw,
        serviceIds: serviceIdsRaw,
        questionnaireFormId: questionnaireFormIdRaw,
        paymentRequired,
        ...rest
      } = data;

      // The wired autocomplete can yield objects, ids, or (rarely) strings.
      const templateIdRaw =
        typeof templateName === 'object'
          ? templateName?.id ?? templateName?.templateId ?? templateName?.value
          : templateName;
      const templateId =
        typeof templateIdRaw === 'string'
          ? Number.isNaN(Number(templateIdRaw))
            ? templateIdRaw
            : Number(templateIdRaw)
          : templateIdRaw;

      const staffs = Array.isArray(staffsRaw)
        ? staffsRaw
            .map((s) => {
              if (s == null) return null;
              if (typeof s === 'object') {
                const id = s.id ?? s.staffId ?? s.userId ?? s.value;
                return id == null ? null : { id };
              }
              if (typeof s === 'string') {
                const n = Number(s);
                return { id: Number.isNaN(n) ? s : n };
              }
              return { id: s };
            })
            .filter(Boolean)
        : [];

      const serviceIds = Array.isArray(serviceIdsRaw)
        ? serviceIdsRaw
            .map((v) => {
              if (v == null || v === '') return null;
              if (typeof v === 'string') {
                const n = Number(v);
                return Number.isNaN(n) ? v : n;
              }
              return v;
            })
            .filter((v) => v !== null && v !== undefined && v !== '')
        : [];

      const questionnaireFormId =
        questionnaireFormIdRaw === null ||
        questionnaireFormIdRaw === undefined ||
        questionnaireFormIdRaw === ''
          ? null
          : Number.isNaN(Number(questionnaireFormIdRaw))
            ? questionnaireFormIdRaw
            : Number(questionnaireFormIdRaw);

      const payload = {
        ...rest,
        templateId,
        staffs,
        serviceIds,
        questionnaireFormId,
        paymentRequired: !!paymentRequired,
        link: Linking,
      };

      apiHandler({ data: payload });
    },
    [apiHandler, Linking]
  );

  const emailTemplateFormGroups = useMemo(
    () => [
      {
        ...WiredMasterAutoComplete({
          filter: { limit: 10 },
          name: 'templateName',
          label: 'Template',
          labelAccessor: ['name'],
          valueAccessor: 'id',
          colSpan: 1,
          required: requiredField,
          placeholder: 'Select Template',
          cache: false,
          fetchInitial: true,
          url: API_URL.emailCampaignTemplate,
          multiple: false,
        }),
      },
    ],
    []
  );

  const emailStaff = useMemo(
    () => [
      {
        ...WiredMasterAutoComplete({
          filter: { limit: 10 },
          name: 'staffs',
          label: 'Staffs *',
          labelAccessor: ['firstName', 'middleName', 'lastName'],
          valueAccessor: 'id',
          colSpan: 1,
          placeholder: 'Select Staff',
          cache: false,
          fetchInitial: true,
          url: API_URL.staff,
          multiple: true,
        }),
      },
    ],
    []
  );

  const handleCopy = (textToCopy) => {
    if (!selectedTemplate) {
      showSnackbar({ message: 'Select a template first', severity: 'error' });
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    showSnackbar({ message: 'Copied to clipboard!', severity: 'success' });
  };

  const openStripeDialog = useCallback(() => {
    const cfg = stripeConfigState || {};
    setStripeForm({
      stripePaymentMode: cfg?.stripePaymentMode || 'test',
      stripeTestPublishableKey: cfg?.stripeTestPublishableKey || '',
      stripeTestSecretKey: '',
      stripeTestWebhookSecret: '',
      stripeLivePublishableKey: cfg?.stripeLivePublishableKey || '',
      stripeLiveSecretKey: '',
      stripeLiveWebhookSecret: '',
    });
    setStripeSecretCache(null);
    setPendingRevealField(null);
    setShowStripeSecrets({
      stripeTestSecretKey: false,
      stripeTestWebhookSecret: false,
      stripeLiveSecretKey: false,
      stripeLiveWebhookSecret: false,
    });
    setStripeDirty({
      stripePaymentMode: false,
      stripeTestPublishableKey: false,
      stripeTestSecretKey: false,
      stripeTestWebhookSecret: false,
      stripeLivePublishableKey: false,
      stripeLiveSecretKey: false,
      stripeLiveWebhookSecret: false,
    });
    setStripeDialogOpen(true);
  }, [stripeConfigState]);

  const closeStripeDialog = useCallback(() => {
    setStripeDialogOpen(false);
    setStripeSecretCache(null);
    setPendingRevealField(null);
    setShowStripeSecrets({
      stripeTestSecretKey: false,
      stripeTestWebhookSecret: false,
      stripeLiveSecretKey: false,
      stripeLiveWebhookSecret: false,
    });
    setStripeDirty({
      stripePaymentMode: false,
      stripeTestPublishableKey: false,
      stripeTestSecretKey: false,
      stripeTestWebhookSecret: false,
      stripeLivePublishableKey: false,
      stripeLiveSecretKey: false,
      stripeLiveWebhookSecret: false,
    });
    setStripeForm((prev) => ({
      ...prev,
      stripeTestSecretKey: '',
      stripeTestWebhookSecret: '',
      stripeLiveSecretKey: '',
      stripeLiveWebhookSecret: '',
    }));
  }, []);

  const handleStripeFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setStripeForm((prev) => ({ ...prev, [name]: value }));
    setStripeDirty((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleStripeModeChange = useCallback((e) => {
    const nextMode = e.target.checked ? 'live' : 'test';
    setStripeForm((prev) => ({ ...prev, stripePaymentMode: nextMode }));
    setStripeDirty((prev) => ({ ...prev, stripePaymentMode: true }));
  }, []);

  const handleToggleStripeSecret = useCallback(
    (fieldName) => {
      const isShowing = !!showStripeSecrets?.[fieldName];
      if (isShowing) {
        setShowStripeSecrets((prev) => ({ ...prev, [fieldName]: false }));
        return;
      }

      const existingValue = stripeForm?.[fieldName];
      if (existingValue && String(existingValue).trim() !== '') {
        setShowStripeSecrets((prev) => ({ ...prev, [fieldName]: true }));
        return;
      }

      const cachedValue = stripeSecretCache?.[fieldName];
      if (cachedValue && String(cachedValue).trim() !== '') {
        setStripeForm((prev) => ({ ...prev, [fieldName]: cachedValue }));
        setShowStripeSecrets((prev) => ({ ...prev, [fieldName]: true }));
        return;
      }

      if (hasSavedStripeSecrets?.[fieldName]) {
        if (stripeKeysLoading) return;
        setPendingRevealField(fieldName);
        getStripeKeys();
        return;
      }

      // No existing secret: just toggle visibility so user can type it in.
      setShowStripeSecrets((prev) => ({ ...prev, [fieldName]: true }));
    },
    [
      showStripeSecrets,
      stripeForm,
      stripeSecretCache,
      hasSavedStripeSecrets,
      stripeKeysLoading,
      getStripeKeys,
    ]
  );

  const handleStripeSave = useCallback(() => {
    const payload = {};
    const hasSaved = hasSavedStripeSecrets || {};

    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return typeof value === 'string' ? value.trim() : String(value);
    };

    const addIfDirtyAndValue = (key, value) => {
      const v = normalize(value);
      if (!v) return;
      if (!stripeDirty?.[key]) return;
      payload[key] = v;
    };

    const addSecretIfChangedOrNew = (key, value) => {
      const v = normalize(value);
      if (!v) return;
      // If it already exists and user only revealed it (not edited), don't re-send.
      if (hasSaved?.[key] && !stripeDirty?.[key]) return;
      payload[key] = v;
    };

    addIfDirtyAndValue('stripeTestPublishableKey', stripeForm.stripeTestPublishableKey);
    addIfDirtyAndValue('stripeLivePublishableKey', stripeForm.stripeLivePublishableKey);
    addSecretIfChangedOrNew('stripeTestSecretKey', stripeForm.stripeTestSecretKey);
    addSecretIfChangedOrNew('stripeTestWebhookSecret', stripeForm.stripeTestWebhookSecret);
    addSecretIfChangedOrNew('stripeLiveSecretKey', stripeForm.stripeLiveSecretKey);
    addSecretIfChangedOrNew('stripeLiveWebhookSecret', stripeForm.stripeLiveWebhookSecret);
    if (stripeDirty?.stripePaymentMode) {
      payload.stripePaymentMode =
        stripeForm?.stripePaymentMode === 'live' ? 'live' : 'test';
    }

    if (Object.keys(payload).length === 0) {
      showSnackbar({ message: 'No Stripe key changes to save.', severity: 'error' });
      return;
    }

    saveStripeKeys(payload);
  }, [saveStripeKeys, stripeForm, stripeDirty, hasSavedStripeSecrets]);
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }} loading={getLoading}>
      <Card
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
          p: 3,
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            {/* Left Side: Title */}
            <Typography variant="h5" fontWeight={700} color="primary">
              Prospect Registration Overview
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CardContent sx={{ pt: 0 }}>
                <Controller
                  name="serviceIds"
                  control={form.control}
                  render={({ field }) => {
                    const selected = Array.isArray(field.value) ? field.value : [];
                    const selectedSet = new Set(selected.map(String));
                    const options = procedureCodes?.results || [];
                    const labelFor = (item) =>
                      item?.cptCode ? `${item.cptCode} - ${item.name}` : item?.name;
                    const labelById = new Map(options.map((o) => [String(o.id), labelFor(o)]));

                    return (
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Services That Prospects Can Choose From (Optional)"
                        value={selected}
                        onChange={(e) => field.onChange(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{
                          multiple: true,
                          displayEmpty: true,
                          renderValue: (values) => {
                            const v = Array.isArray(values) ? values : [];
                            if (v.length === 0) return 'Select';
                            return v
                              .map((id) => labelById.get(String(id)) || String(id))
                              .filter(Boolean)
                              .join(', ');
                          },
                        }}
                      >
                        {procedureCodesLoading ? (
                          <MenuItem value="" disabled>
                            Loading...
                          </MenuItem>
                        ) : null}
                        {options.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            <Checkbox checked={selectedSet.has(String(item.id))} size="small" />
                            {labelFor(item)}
                          </MenuItem>
                        ))}
                        {!procedureCodesLoading && Array.isArray(options) && options.length === 0 ? (
                          <MenuItem value="" disabled>
                            No services available
                          </MenuItem>
                        ) : null}
                      </TextField>
                    );
                  }}
                />
              </CardContent>
            </Grid>

            <Grid item xs={12}>
              <CardContent sx={{ pt: 0 }}>
                <Controller
                  name="questionnaireFormId"
                  control={form.control}
                  render={({ field }) => {
                    const options = Array.isArray(questionnaireForms?.results)
                      ? questionnaireForms.results.filter((item) => item?.isActive !== false)
                      : [];

                    return (
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Questionnaire Form To Send To Prospect (Optional)"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ displayEmpty: true }}
                        helperText="If selected, this questionnaire link will be emailed to the patient with the chosen email template after registration."
                      >
                        <MenuItem value="">
                          <em>Select Questionnaire Form</em>
                        </MenuItem>
                        {questionnaireFormsLoading ? (
                          <MenuItem value="" disabled>
                            Loading...
                          </MenuItem>
                        ) : null}
                        {options.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                        {!questionnaireFormsLoading && options.length === 0 ? (
                          <MenuItem value="" disabled>
                            No questionnaire forms available
                          </MenuItem>
                        ) : null}
                      </TextField>
                    );
                  }}
                />
              </CardContent>
            </Grid>

            <Grid item xs={12}>
              <CardContent sx={{ pt: 0 }}>
                <Controller
                  name="paymentRequired"
                  control={form.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Payment is required"
                    />
                  )}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  Payment settings below: Swiftcharting payment processor is required
                </Typography>

                {isPaymentRequired ? (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={openStripeDialog}
                      disabled={stripeSaving}
                    >
                      Connect to stripe/Addstripe details
                    </Button>
                    {stripeConfigState?.hasStripeTestSecretKey ||
                    stripeConfigState?.hasStripeLiveSecretKey ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        Stripe details saved
                      </Typography>
                    ) : null}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      Current payment mode:{' '}
                      {stripeConfigState?.stripePaymentMode === 'live' ? 'Live' : 'Test'}
                    </Typography>
                  </Box>
                ) : null}
              </CardContent>
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight={600} color="text.secondary">
                Email Template Name
              </Typography>
              <CardContent>
                <CustomForm
                  formGroups={emailTemplateFormGroups}
                  columnsPerRow={2}
                  form={form}
                />
              </CardContent>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight={600} color="text.secondary">
                Staff Name To Email When New Prospect Registers
              </Typography>
              <CardContent>
                <CustomForm
                  formGroups={emailStaff}
                  columnsPerRow={2}
                  form={form}
                />
              </CardContent>
            </Grid>
          </Grid>

          {/* Total Price */}
          <Divider sx={{ my: 3 }} />

          {/* widget instructions section enhanced with MUI TextField */}
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography fontWeight={600} color="text.secondary" gutterBottom>
                Instructions To Show On The Widget (If Any)
              </Typography>
              <TextField
                {...form?.register('widgetInstructions')}
                multiline
                rows={5}
                fullWidth
                variant="outlined"
                placeholder="Enter instructions to display on the widget"
                defaultValue="Please complete the following appointment request form to contact our practice! We will then email you a new patient forms to complete securely online.\nPlease check your secondary and spam folders if you don't see our email in your inbox.\n\nPlease allow us 48 hours to review your request and respond to you via e-mail. Also, quick note that completing this questionnaire does not guarantee an appointment."
                inputProps={{ maxLength: 1000 }}
                helperText={`${
                  (watch('widgetInstructions') || '').length
                }/1000 characters`}
                InputProps={{
                  sx: {
                    bgcolor: 'background.paper',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* 2. Embed Code / URL Section */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Use This Code To Embed In Your Website
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopy fontSize="small" />}
                  onClick={() => handleCopy(generatedUrl)}
                >
                  Copy URL
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                readOnly
                value={generatedUrl} // Shows the iframe code by default
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    bgcolor: '#f5f5f5',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* 3. Action Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 3,
              pt: 2,
            }}
          >
            <LoadingButton
              label="Save"
              onClick={handleSubmit(handleSaveAccountDetails)}
              loading={loading}
              sx={{
                minWidth: 144,
                px: 3.5,
                borderRadius: '12px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #1f7ae0 0%, #155bb5 100%)',
                boxShadow: '0 10px 24px rgba(21, 91, 181, 0.22)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1768c4 0%, #104991 100%)',
                  boxShadow: '0 12px 28px rgba(16, 73, 145, 0.26)',
                },
              }}
            />
          </Box>

          <Dialog
            open={stripeDialogOpen}
            onClose={closeStripeDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Stripe Details</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Secret keys are stored encrypted in the database. Click the eye icon to view saved secrets. 
                Edit any field and click Save to update.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Need help finding your Stripe API keys?{' '}
                <Link
                  href="https://docs.stripe.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Stripe docs
                </Link>
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stripeForm.stripePaymentMode === 'live'}
                      onChange={handleStripeModeChange}
                    />
                  }
                  label="Use live payment mode"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Checked uses the Live Stripe keys on the prospect registration widget. Unchecked uses the Test keys.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography fontWeight={600} color="text.secondary">
                    Test Keys
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeTestPublishableKey"
                    label="Stripe Publishable Key (Test)"
                    fullWidth
                    value={stripeForm.stripeTestPublishableKey}
                    onChange={handleStripeFieldChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeTestSecretKey"
                    label="Stripe Secret Key (Test)"
                    type={showStripeSecrets.stripeTestSecretKey ? 'text' : 'password'}
                    fullWidth
                    value={stripeForm.stripeTestSecretKey}
                    onChange={handleStripeFieldChange}
                    placeholder={
                      hasSavedStripeSecrets.stripeTestSecretKey && !stripeForm.stripeTestSecretKey
                        ? 'Saved (click eye to view)'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleToggleStripeSecret('stripeTestSecretKey')}
                            disabled={
                              stripeKeysLoading && pendingRevealField === 'stripeTestSecretKey'
                            }
                          >
                            {stripeKeysLoading && pendingRevealField === 'stripeTestSecretKey' ? (
                              <CircularProgress size={16} />
                            ) : showStripeSecrets.stripeTestSecretKey ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeTestWebhookSecret"
                    label="Webhook Secret (Test) (Optional)"
                    type={showStripeSecrets.stripeTestWebhookSecret ? 'text' : 'password'}
                    fullWidth
                    value={stripeForm.stripeTestWebhookSecret}
                    onChange={handleStripeFieldChange}
                    placeholder={
                      hasSavedStripeSecrets.stripeTestWebhookSecret && !stripeForm.stripeTestWebhookSecret
                        ? 'Saved (click eye to view)'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleToggleStripeSecret('stripeTestWebhookSecret')}
                            disabled={
                              stripeKeysLoading && pendingRevealField === 'stripeTestWebhookSecret'
                            }
                          >
                            {stripeKeysLoading && pendingRevealField === 'stripeTestWebhookSecret' ? (
                              <CircularProgress size={16} />
                            ) : showStripeSecrets.stripeTestWebhookSecret ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography fontWeight={600} color="text.secondary">
                    Live Keys
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeLivePublishableKey"
                    label="Stripe Publishable Key (Live)"
                    fullWidth
                    value={stripeForm.stripeLivePublishableKey}
                    onChange={handleStripeFieldChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeLiveSecretKey"
                    label="Stripe Secret Key (Live)"
                    type={showStripeSecrets.stripeLiveSecretKey ? 'text' : 'password'}
                    fullWidth
                    value={stripeForm.stripeLiveSecretKey}
                    onChange={handleStripeFieldChange}
                    placeholder={
                      hasSavedStripeSecrets.stripeLiveSecretKey && !stripeForm.stripeLiveSecretKey
                        ? 'Saved (click eye to view)'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleToggleStripeSecret('stripeLiveSecretKey')}
                            disabled={
                              stripeKeysLoading && pendingRevealField === 'stripeLiveSecretKey'
                            }
                          >
                            {stripeKeysLoading && pendingRevealField === 'stripeLiveSecretKey' ? (
                              <CircularProgress size={16} />
                            ) : showStripeSecrets.stripeLiveSecretKey ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="stripeLiveWebhookSecret"
                    label="Webhook Secret (Live) (Optional)"
                    type={showStripeSecrets.stripeLiveWebhookSecret ? 'text' : 'password'}
                    fullWidth
                    value={stripeForm.stripeLiveWebhookSecret}
                    onChange={handleStripeFieldChange}
                    placeholder={
                      hasSavedStripeSecrets.stripeLiveWebhookSecret && !stripeForm.stripeLiveWebhookSecret
                        ? 'Saved (click eye to view)'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleToggleStripeSecret('stripeLiveWebhookSecret')}
                            disabled={
                              stripeKeysLoading && pendingRevealField === 'stripeLiveWebhookSecret'
                            }
                          >
                            {stripeKeysLoading && pendingRevealField === 'stripeLiveWebhookSecret' ? (
                              <CircularProgress size={16} />
                            ) : showStripeSecrets.stripeLiveWebhookSecret ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeStripeDialog} disabled={stripeSaving}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleStripeSave} disabled={stripeSaving}>
                {stripeSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClinicSubscriptionInfo;
