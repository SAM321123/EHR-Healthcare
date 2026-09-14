import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useForm } from 'react-hook-form';
import { Button, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import CustomForm from 'src/components/form';
import {
  defaultScheduleData,
  preferredScheduleCode,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import Box from 'src/components/Box';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { SAVE_STAFF_LOCATION_DATA } from 'src/store/types';
import useCRUD from 'src/hooks/useCRUD';
import { dateFormatterDayjs, showSnackbar } from 'src/lib/utils';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import PageContent from 'src/components/PageContent';
import PageHeader from 'src/components/PageHeader';
import ScheduleTable from './scheduleTable';
import {
  WiredLocationField,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { encrypt } from 'src/lib/encryption';
import palette from 'src/theme/palette';

const AddLocation = ({
  selectedLocation,
  onCancel,
  fetchLocations,
  staffId,
}) => {
  const [error, setError] = useState(false);
  const [tokenParams, setTokenParams] = useState({
    autoConfirmOnlineAppointment: selectedLocation?.autoConfirmOnlineAppointment ?? 0,
    gapInDays: selectedLocation?.gapInDays ?? 2,
    hidePricesForOnlineAppointments: selectedLocation?.hidePricesForOnlineAppointments ?? false,
    hideDurationsForOnlineAppointments: selectedLocation?.hideDurationsForOnlineAppointments ?? false,
    showPractitionerSelector: selectedLocation?.showPractitionerSelector ?? 'yes',
    howFarInFuture: selectedLocation?.howFarInFuture ?? '12_months',
    sendAppointmentConfirmationThroughTextAlso: selectedLocation?.sendAppointmentConfirmationThroughTextAlso ?? 'to_both',
    paymentForBooking: selectedLocation?.paymentForBooking ?? 'not_required',
    depositAmount: selectedLocation?.depositAmount ?? 0,
    textTemplateForPatientConfirmation: selectedLocation?.textTemplateForPatientConfirmation ?? '__not_required__',
    appointmentInterval: selectedLocation?.appointmentInterval ?? '',
  });

  const locationData = useSelector(
    (state) =>
      state?.crud?.get('wired-select-locationId')?.get('read')?.get('data')
        ?.results
  );

  // Generate encrypted booking URL with all booking settings
  const generatedBookingUrl = useMemo(() => {
    const WIDGET_BASE_URL = `${window.location.origin}/online-booking-registration`;

    if (!staffId) {
      return 'Please save the location to generate the booking URL.';
    }

const locationId = selectedLocation?.locationId ?? '';

const resolvedLocation = locationData?.find(
  (l) => Number(l?.id) === Number(locationId)
);
const locationName =
  resolvedLocation?.name ||
  selectedLocation?.location?.name ||
  selectedLocation?.locationName ||  
  '';
    const rawData = [
      `staffId=${staffId}`,
      `locationId=${locationId}`,
      `locationName=${encodeURIComponent(locationName)}`,
      `autoConfirm=${tokenParams.autoConfirmOnlineAppointment}`,
      `gapInDays=${tokenParams.gapInDays}`,
      `hidePrices=${tokenParams.hidePricesForOnlineAppointments ? 1 : 0}`,
      `hideDurations=${tokenParams.hideDurationsForOnlineAppointments ? 1 : 0}`,
      `showPractitioner=${tokenParams.showPractitionerSelector}`,
      `howFarInFuture=${tokenParams.howFarInFuture}`,
      `sendTextAlso=${tokenParams.sendAppointmentConfirmationThroughTextAlso}`,
      `paymentForBooking=${tokenParams.paymentForBooking}`,
      `depositAmount=${tokenParams.depositAmount}`,
      `textTemplate=${tokenParams.textTemplateForPatientConfirmation}`,
      `appointmentInterval=${tokenParams.appointmentInterval ?? ''}`,
    ].join('&');

    const encryptedData = encrypt(rawData);
    const safeEncryptedData = encodeURIComponent(encryptedData);

    return `${WIDGET_BASE_URL}?token=${safeEncryptedData}`;
  }, [staffId, tokenParams,locationData]);

  const handleCopyBookingUrl = useCallback(() => {
    if (!staffId) {
      showSnackbar({ message: 'Please save the location first', severity: 'error' });
      return;
    }
    navigator.clipboard.writeText(generatedBookingUrl);
    showSnackbar({
      message: 'Copied to clipboard!',
      severity: 'success',
    });
  }, [staffId, generatedBookingUrl]);

  const showLeadInterval = (data) => {
    if (data?.leadDays === '0_day') {
      return { hide: false };
    }
    return { hide: true };
  };

  const LocationFormGroups = useMemo(
    () => {
      const fieldInputSx = {
        '& .MuiSelect-select': {
          minHeight: '21px',
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '4px',
        },
      };

      const helperBoxSx = {
        backgroundColor: palette.background.offWhite,
        border: `1px solid ${palette.border.main}`,
        borderRadius: '4px',
        px: 1.5,
        py: 0.75,
        width: '100%',
      };

      return [
        {
          ...WiredLocationField({
            name: 'locationId',
            label: 'Location',
            colSpan: 1,
            placeholder: 'Select',
            filter: { limit: 20 },
            required: requiredField,
            labelAccessor: 'name',
            valueAccessor: 'id',
            disabled: !isEmpty(selectedLocation),
          }),
        },
        {
          ...WiredMasterField({
            code: 'appointment_confirmation',
            filter: { limit: 20 },
            name: 'appointmentConfirmation',
            label: 'Appointment confirmation',
            labelAccessor: 'name',
            valueAccessor: 'code',
            colSpan: 1,
            required: requiredField,
            cache: false,
          }),
        },
        {
          ...WiredMasterField({
            code: 'appointment_interval',
            filter: { limit: 20 },
            name: 'appointmentInterval',
            label: 'Appointment interval',
            labelAccessor: 'name',
            valueAccessor: 'code',
            colSpan: 1,
            required: requiredField,
            cache: false,
          }),
        },
        {
          ...WiredMasterField({
            code: 'lead_days',
            filter: { limit: 20 },
            name: 'leadDays',
            label: 'Lead days',
            labelAccessor: 'name',
            valueAccessor: 'code',
            colSpan: 1,
            required: requiredField,
            cache: false,
          }),
        },
        {
          ...WiredMasterField({
            code: 'lead_interval',
            filter: { limit: 20 },
            name: 'leadInterval',
            label: 'Lead Time',
            labelAccessor: 'name',
            valueAccessor: 'code',
            colSpan: 1,
            cache: false,
            dependencies: {
              keys: ['leadDays'],
              calc: showLeadInterval,
            },
          }),
        },

        {
          inputType: 'select',
          name: 'gapInDays',
          label: 'Gap In Days (Earliest Booking)',
          colSpan: 1,
          // required: requiredField,
          options: [0, 1, 2, 3, 4, 5, 6, 7, 14, 21].map((v) => ({
            label: String(v),
            value: v,
          })),
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
        },
        {
          component: () => (
            <Box sx={helperBoxSx}>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: palette.text.secondary,
                  lineHeight: '18px',
                  fontWeight: 400,
                }}
              >
                Choose how soon your earliest booking can happen - if you want
                slots to start showing up 2 days from today, set &apos;gap in
                days&apos; to 2; to allow same day booking, set gap in days to 0
              </Typography>
            </Box>
          ),
          colSpan: 2,
          cstSx: { mt: -1 },
        },
        {
          inputType: 'checkBox',
          name: 'hidePricesForOnlineAppointments',
          label: 'Hide Prices For Online Appointments',
          colSpan: 1,
          cstSx: { mt: 0.5 },
        },
        //  {
        //   component: () => <span />,
        //   colSpan: 1,
        // },
        {
          inputType: 'checkBox',
          name: 'hideDurationsForOnlineAppointments',
          label: 'Hide Durations For Online Appointments',
          colSpan: 1,
          cstSx: { mt: 0.5 },
        },
        {
          inputType: 'select',
          name: 'showPractitionerSelector',
          label: 'Show Practitioner Selector',
          colSpan: 1,
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
        },
        {
          inputType: 'select',
          name: 'howFarInFuture',
          label: 'How Far In Future',
          colSpan: 1,
          options: Array.from({ length: 36 }, (_, i) => ({
            label: `${i + 1} ${i + 1 === 1 ? 'Month' : 'Months'}`,
            value: `${i + 1}_month${i + 1 === 1 ? '' : 's'}`,
          })),
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
        },
        {
          component: () => <span />,
          colSpan: 1,
        },
        {
          component: () => (
            <Box sx={helperBoxSx}>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: palette.text.secondary,
                  lineHeight: '18px',
                  fontWeight: 400,
                }}
              >
                Choose how far into the future you offer appointment bookings
              </Typography>
            </Box>
          ),
          colSpan: 1,
          cstSx: { mt: -1 },
        },
        {
          inputType: 'select',
          name: 'autoConfirmOnlineAppointment',
          label: 'Automatically Confirm Online Appointment',
          colSpan: 1,
          options: [
            { label: '0 - Manual Confirmation Required', value: 0 },
            { label: '1 - Auto Confirm', value: 1 },
          ],
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
          cstSx: { mt: 1 },
        },
        {
          inputType: 'select',
          name: 'sendAppointmentConfirmationThroughTextAlso',
          label: 'Send Appointment Confirmation Through Text Also',
          colSpan: 1,
          options: [
            { label: 'None', value: 'none' },
            { label: 'To Practitioner', value: 'to_practitioner' },
            { label: 'To Patient', value: 'to_patient' },
            { label: 'To Both', value: 'to_both' },
          ],
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
          cstSx: { mt: 1 },
        },

        {
          inputType: 'select',
          name: 'paymentForBooking',
          label: 'Payment For Booking',
          colSpan: 1,
          options: [
            { label: 'Not Required', value: 'not_required' },
            {
              label: 'Just Save Card On File',
              value: 'just_save_card_on_file',
            },
            {
              label: 'A Deposite is required(Cancellation fee)',
              value: 'deposit_required_cancellation_fee',
            },
            {
              label: 'Full Payment is Required',
              value: 'full_payment_required',
            },
          ],
          labelAccessor: 'label',
          valueAccessor: 'value',
          sx: fieldInputSx,
          cstSx: { mt: 1.25 },
          dependencies: {
            keys: ['hidePricesForOnlineAppointments'],
            calc: (data) => ({ hide: !!data?.hidePricesForOnlineAppointments }),
          },
        },

        {
          inputType: 'number',
          name: 'depositAmount',
          textLabel: 'Deposit Amount($)',
          colSpan: 1,
          cstSx: { mt: 1.25 },
          inputStyle: {
            '& .MuiOutlinedInput-root': {
              minHeight: '44px',
              borderRadius: '6px',
            },
          },
          inputProps: {
            min: 0,
          },
          onKeyDown: (e) => {
            if (e.key === '-' || e.key === '+' || e.key === 'e') {
              e.preventDefault();
            }
          },
          onInput: (e) => {
            if (e.target.value < 0) e.target.value = 0;
          },
          validation: {
            min: {
              value: 0,
              message: 'Deposit amount cannot be negative',
            },
          },
          dependencies: {
            keys: ['hidePricesForOnlineAppointments', 'paymentForBooking'],
            calc: (data) => ({
              hide:
                !!data?.hidePricesForOnlineAppointments ||
                data?.paymentForBooking !== 'deposit_required_cancellation_fee',
            }),
          },
        },
        {
          inputType: 'wiredSelect',
          name: 'textTemplateForPatientConfirmation',
          label: 'Text Template For Patient Confirmation',
          colSpan: 1,
          url: `${API_URL.onlineBookingConfirmedTemplates}`,
          params: { limit: 100 },
          labelAccessor: 'name',
          valueAccessor: 'id',
          cache: false,
          sx: fieldInputSx,
          cstSx: { mt: 1.25 },
          accessor: (data) => {
            const results = Array.isArray(data) ? data : data?.results ?? [];
            return [
              { id: '__not_required__', name: 'Not Required' },
              ...results,
            ];
          },
        },
        {
          component: () => <span />,
          colSpan: 1,
        },
        {
          component: () => (
            <Box sx={helperBoxSx}>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: palette.text.secondary,
                  lineHeight: '18px',
                  fontWeight: 400,
                }}
              >
                Select a text template to send with patient confirmation emails;
                text and email communications are managed under Settings &gt;
                Patient Communication
              </Typography>
            </Box>
          ),
          colSpan: 1,
          cstSx: { mt: -1 },
        },
      ];
    },
    [selectedLocation]
  );

  const getInitialValue = useCallback(() => {
    if (selectedLocation && selectedLocation?.schedule?.length) {
      return cloneDeep(selectedLocation?.schedule);
    }
    return cloneDeep(defaultScheduleData);
  }, [selectedLocation]);

  const schedule = useRef(getInitialValue());
  const [scheduleKey, setScheduleKey] = useState(0);

  const [
    saveLocationRes,
    ,
    saveLocationLoading,
    saveLocation,
    clearSaveLocationRes,
  ] = useCRUD({
    id: SAVE_STAFF_LOCATION_DATA,
    url: API_URL.staffLocation,
    type: selectedLocation ? REQUEST_METHOD.update : REQUEST_METHOD.post,
  });

  const onClose = useCallback(() => {
    clearSaveLocationRes();
    onCancel();
  }, [clearSaveLocationRes, onCancel]);

  const defaultValue = useMemo(
    () =>
      selectedLocation
        ? {
            locationId: selectedLocation?.locationId,
            leadDays: selectedLocation?.leadDays,
            appointmentConfirmation: selectedLocation?.appointmentConfirmation,
            appointmentInterval: selectedLocation?.appointmentInterval,
            leadInterval: selectedLocation?.leadInterval,
            autoConfirmOnlineAppointment: selectedLocation?.autoConfirmOnlineAppointment ?? 0,
            hidePricesForOnlineAppointments:
              selectedLocation?.hidePricesForOnlineAppointments ?? false,
            hideDurationsForOnlineAppointments:
              selectedLocation?.hideDurationsForOnlineAppointments ?? false,
            showPractitionerSelector:
              selectedLocation?.showPractitionerSelector ?? 'yes',
            howFarInFuture: selectedLocation?.howFarInFuture ?? '12_months',
            sendAppointmentConfirmationThroughTextAlso:
              selectedLocation?.sendAppointmentConfirmationThroughTextAlso ??
              'to_both',
            textTemplateForPatientConfirmation:
              selectedLocation?.textTemplateForPatientConfirmation ??
              '__not_required__',
            paymentForBooking:
              selectedLocation?.paymentForBooking ?? 'not_required',
            depositAmount: selectedLocation?.depositAmount ?? 0,
            gapInDays: selectedLocation?.gapInDays ?? 2,
          }
        : {
            autoConfirmOnlineAppointment: 0,
            hidePricesForOnlineAppointments: false,
            hideDurationsForOnlineAppointments: false,
            showPractitionerSelector: 'yes',
            howFarInFuture: '12_months',
            sendAppointmentConfirmationThroughTextAlso: 'to_both',
            textTemplateForPatientConfirmation: '__not_required__',
            paymentForBooking: 'not_required',
            depositAmount: 0,
            gapInDays: 2,
          },
    [selectedLocation]
  );

  const form = useForm({ mode: 'onChange' });
  const { watch, handleSubmit } = form;

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'locationId' && type) {
        const selectedLocationSchedule = locationData?.find(
          (location) => location?.id === value?.locationId
        );
        schedule.current = cloneDeep(
          selectedLocationSchedule?.schedule || defaultScheduleData
        );
      }
      // Update token params whenever any booking setting field changes
      const tokenFields = [
        'autoConfirmOnlineAppointment',
        'gapInDays',
        'hidePricesForOnlineAppointments',
        'hideDurationsForOnlineAppointments',
        'showPractitionerSelector',
        'howFarInFuture',
        'sendAppointmentConfirmationThroughTextAlso',
        'paymentForBooking',
        'depositAmount',
        'textTemplateForPatientConfirmation',
        'appointmentInterval',
      ];
      if (tokenFields.includes(name)) {
        setTokenParams((prev) => ({
          ...prev,
          autoConfirmOnlineAppointment: value?.autoConfirmOnlineAppointment ?? prev.autoConfirmOnlineAppointment,
          gapInDays: value?.gapInDays ?? prev.gapInDays,
          hidePricesForOnlineAppointments: value?.hidePricesForOnlineAppointments ?? prev.hidePricesForOnlineAppointments,
          hideDurationsForOnlineAppointments: value?.hideDurationsForOnlineAppointments ?? prev.hideDurationsForOnlineAppointments,
          showPractitionerSelector: value?.showPractitionerSelector ?? prev.showPractitionerSelector,
          howFarInFuture: value?.howFarInFuture ?? prev.howFarInFuture,
          sendAppointmentConfirmationThroughTextAlso: value?.sendAppointmentConfirmationThroughTextAlso ?? prev.sendAppointmentConfirmationThroughTextAlso,
          paymentForBooking: value?.paymentForBooking ?? prev.paymentForBooking,
          depositAmount: value?.depositAmount ?? prev.depositAmount,
          textTemplateForPatientConfirmation: value?.textTemplateForPatientConfirmation ?? prev.textTemplateForPatientConfirmation,
          appointmentInterval: value?.appointmentInterval ?? prev.appointmentInterval,
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [locationData, watch]);

  useEffect(() => {
    if (!selectedLocation) {
    }
  }, [selectedLocation]);

  const handleCheckboxChange = useCallback(
    (index) => (event) => {
      schedule.current[index].isClosed = event.target.checked;
      setScheduleKey((prev) => prev + 1);
    },
    [schedule]
  );

  const handleStartTime = useCallback(
    (index) => (newValue) => {
      const endTime = schedule.current[index].endHrs;
      const startTime = dateFormatterDayjs(newValue, 'HH:mm');
      if (!startTime || !endTime) {
        setError(true);
      } else if (startTime > endTime) {
        setError(true);
      } else {
        setError(false);
      }
      schedule.current[index].startHrs = startTime;
    },
    [schedule]
  );

  const handleEndTime = useCallback(
    (index) => (newValue) => {
      schedule.current[index].endHrs = dateFormatterDayjs(newValue, 'HH:mm');
    },
    [schedule]
  );

  const handleSave = useCallback(
    (data) => {
      const {
        locationId,
        appointmentInterval,
        leadDays,
        leadInterval,
        appointmentConfirmation,
        autoConfirmOnlineAppointment,
        hidePricesForOnlineAppointments,
        hideDurationsForOnlineAppointments,
        showPractitionerSelector,
        howFarInFuture,
        sendAppointmentConfirmationThroughTextAlso,
        paymentForBooking,
        depositAmount,
        textTemplateForPatientConfirmation,
        gapInDays,
      } = data;

      const payload = {
        locationId,
        staffId,
        schedule: schedule.current,
        leadDays,
        appointmentConfirmation,
        leadInterval,
        appointmentInterval,
        autoConfirmOnlineAppointment: autoConfirmOnlineAppointment ?? 0,
        hidePricesForOnlineAppointments,
        hideDurationsForOnlineAppointments,
        showPractitionerSelector,
        howFarInFuture,
        sendAppointmentConfirmationThroughTextAlso,
        paymentForBooking,
        depositAmount: Math.max(0, Number(depositAmount) || 0),
        textTemplateForPatientConfirmation: textTemplateForPatientConfirmation === '__not_required__' ? null : textTemplateForPatientConfirmation,
        gapInDays: gapInDays !== undefined ? gapInDays : 2,
        ...(!selectedLocation && {
          preferredScheduleCode: preferredScheduleCode.DEFAULT_SCHEDULE,
        }),
      };

      if (selectedLocation) {
        const initialData = {
          locationId: selectedLocation?.locationId,
          leadDays: selectedLocation?.leadDays,
          appointmentInterval: selectedLocation?.appointmentInterval,
          leadInterval: selectedLocation?.leadInterval,
          appointmentConfirmation: selectedLocation?.appointmentConfirmation,
          autoConfirmOnlineAppointment: selectedLocation?.autoConfirmOnlineAppointment ?? 0,
          hidePricesForOnlineAppointments: selectedLocation?.hidePricesForOnlineAppointments ?? false,
          hideDurationsForOnlineAppointments: selectedLocation?.hideDurationsForOnlineAppointments ?? false,
          showPractitionerSelector: selectedLocation?.showPractitionerSelector ?? 'yes',
          howFarInFuture: selectedLocation?.howFarInFuture ?? '12_months',
          sendAppointmentConfirmationThroughTextAlso: selectedLocation?.sendAppointmentConfirmationThroughTextAlso ?? 'to_both',
          paymentForBooking: selectedLocation?.paymentForBooking ?? 'not_required',
          depositAmount: selectedLocation?.depositAmount ?? 0,
          textTemplateForPatientConfirmation: selectedLocation?.textTemplateForPatientConfirmation ?? '__not_required__',
          gapInDays: selectedLocation?.gapInDays ?? 2,
          preferredScheduleCode: selectedLocation?.preferredSchedule,
          schedule: cloneDeep(
            selectedLocation?.schedule?.length
              ? selectedLocation?.schedule
              : defaultScheduleData
          ),
        };
        if (!isEqual(payload, initialData)) {
          saveLocation(payload, `/${selectedLocation.id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
        return;
      }

      saveLocation({ data: payload });
    },
    [staffId, error, selectedLocation, saveLocation]
  );

  useEffect(() => {
    if (saveLocationRes) {
      showSnackbar({
        message: selectedLocation
          ? successMessage.update
          : successMessage.create,
        severity: 'success',
      });
      fetchLocations();
      onClose();
    }
  }, [fetchLocations, onClose, saveLocationRes, selectedLocation]);

  return (
    <PageContent disableGutters style={{ overflowY: 'scroll' }}>
      <PageHeader
        title="Location Details"
        showBackIcon
        onPressBackIcon={onClose}
      />

      <div>
        <CustomForm
          formGroups={LocationFormGroups}
          columnsPerRow={2}
          defaultValue={defaultValue}
          form={form}
        />
      </div>

      <ScheduleTable
        key={scheduleKey}
        handleStartTime={handleStartTime}
        handleEndTime={handleEndTime}
        handleCheckboxChange={handleCheckboxChange}
        schedule={schedule.current}
        error={error}
        setError={setError}
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          onClick={handleSubmit(handleSave)}
          loading={saveLocationLoading}
          label="Save"
        />
      </Box>

      {/* Online Booking URL Section */}
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Online Appointment Booking URL
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon fontSize="small" />}
            onClick={handleCopyBookingUrl}
          >
            Copy URL
          </Button>
        </Box>

        <TextField
          value={generatedBookingUrl}
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
      </Box>
    </PageContent>
  );
};

export default AddLocation;
