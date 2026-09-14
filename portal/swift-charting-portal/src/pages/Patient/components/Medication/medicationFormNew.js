/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Table from 'src/components/Table';
import CustomForm from 'src/components/form';
import ModalComponent from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import { Grid, IconButton } from '@mui/material';
import { cloneDeep, isEqual } from 'lodash';
import Accordion from 'src/components/Accordion';
import Container from 'src/components/Container';
import Esignature from 'src/components/E-Signature';
import PageHeader from 'src/components/PageHeader';
import TableTextRendrer from 'src/components/TableTextRendrer';
import Typography from 'src/components/Typography';
import useAuthUser from 'src/hooks/useAuthUser';
import {
  dateFormats,
  directionCodeType,
  frequencyCodeType,
  medicineStatusType,
  regDecimal,
  regexCustomText,
  requiredField,
  roleTypes,
  routeCodeType,
  successMessage,
} from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import Events from 'src/lib/events';
import { UI_ROUTES } from 'src/lib/routeConstants';
import {
  convertWithTimezone,
  getCurrentMeridien,
  getFullName,
  getUTCDateTime,
  getUpdatedFieldsValue,
  showSnackbar,
} from 'src/lib/utils';
import Search from 'src/assets/images/Search.png';
import {
  MEDICATION_DATA,
  MEDICATION_LIST,
  SAVE_MEDICATION_DATA,
} from 'src/store/types';
import palette from 'src/theme/palette';
import {
  WiredMasterAutoComplete,
  WiredMasterField,
  WiredStaffField,
} from 'src/wiredComponent/Form/FormFields';
import PatientInfo from '../patientInfo';
import IcdBrowser from './icdBrowser';
const currentMeridien = getCurrentMeridien();

const columns = [
  {
    label: 'Medication',
    type: 'text',
    render: ({ data }) => {
      const title = `${data.genericDrug} (${data.brandNameDrug})`;
      return (
        <TableTextRendrer style={{ maxWidth: '12rem' }}>
          {title}
        </TableTextRendrer>
      );
    },
    maxWidth: '10rem',
  },
  {
    label: 'Dosage Form',
    type: 'text',
    dataKey: 'doseForm.name',
    width: '20rem',
  },
  {
    label: 'Amount',
    type: 'text',
    dataKey: 'amount',
    maxWidth: '10rem',
  },
  {
    label: 'Unit',
    type: 'text',
    dataKey: 'unit.name',
    maxWidth: '10rem',
  },
  {
    label: 'Route',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.route?.code === routeCodeType.OTHER
          ? `${data?.routeOther} (Other)`
          : data?.route?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Frequency',
    type: 'text',
    dataKey: 'frequency.name',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.frequency?.code === frequencyCodeType.OTHER
          ? `${data?.frequencyOther} (Other)`
          : data?.frequency?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Direction',
    type: 'text',
    dataKey: 'direction.name',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title =
        data?.direction?.code === directionCodeType.OTHER
          ? `${data?.directionOther} (Other)`
          : data?.direction?.name;
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Duration',
    type: 'text',
    dataKey: 'durationAmount',
    maxWidth: '10rem',
  },
  {
    label: 'Duration Unit',
    type: 'text',
    dataKey: 'duration.name',
    maxWidth: '10rem',
  },
  {
    label: 'Reason Rx',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data?.diagnoses
        ?.map(
          (item) =>
            `${item?.icd?.name} ${
              item?.icd?.description ? `(${item?.icd?.description})` : ''
            }`
        )
        .join(', ');
      return (
        <TableTextRendrer style={{ maxWidth: '10rem' }}>
          {title || 'N/A'}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Reason Rx (Other)',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data?.diagnosesOther?.map((item) => `${item}`).join(', ');
      return (
        <TableTextRendrer style={{ maxWidth: '10rem' }}>
          {title || 'N/A'}
        </TableTextRendrer>
      );
    },
  },
  {
    label: 'Quantity',
    type: 'text',
    dataKey: 'quantity',
    maxWidth: '10rem',
  },
  {
    label: 'Refill',
    type: 'text',
    dataKey: 'refill',
    maxWidth: '10rem',
  },
  {
    label: 'Refill Date',
    type: 'date',
    dataKey: 'refillDate',
    format: dateFormats.MMDDYYYY,
    maxWidth: '10rem',
  },
  {
    label: 'Medication Status',
    type: 'text',
    dataKey: 'medicineStatus.name',
    maxWidth: '10rem',
  },
  {
    label: 'Medication Status Reason',
    type: 'text',
    dataKey: 'medicineStatus.medicineStatusReason',
    maxWidth: '10rem',
  },
  {
    label: 'Start On',
    type: 'date',
    dataKey: 'startDate',
    format: dateFormats.MMDDYYYY,
    maxWidth: '10rem',
  },
  {
    label: 'Dispense as Written',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.dispenseAsWritten ? 'Yes' : 'No';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Substitutions Permitted',
    type: 'text',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.substitutions ? 'Yes' : 'No';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Patient-specific Instructions',
    type: 'text',
    dataKey: 'patientSpecificInstructions',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.patientSpecificInstructions || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Allergies/Warnings',
    type: 'text',
    dataKey: 'allergiesWarnings',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.allergiesWarnings || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Additional Note',
    type: 'text',
    dataKey: 'additionalInstruction',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.additionalInstruction || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
  {
    label: 'Reason for Changes',
    type: 'text',
    dataKey: 'reasonForChanges',
    maxWidth: '10rem',
    render: ({ data }) => {
      const title = data.reasonForChanges || 'N/A';
      return <TableTextRendrer>{title}</TableTextRendrer>;
    },
  },
];

const calcGenericDrugId = (data, index) => {
  if (data?.items?.[index]?.genericDrugId?.id) {
    return {
      reFetch: true,
      queryParams: { genericDrugId: data?.items?.[index]?.genericDrugId?.id },
    };
  }
  return { reFetch: false };
};

const calcRouteOther = (data, index) => {
  if (data?.items?.[index]?.routeCode === routeCodeType.OTHER) {
    return {
      hide: false,
    };
  }
  return { hide: true };
};

const calcDirectionOther = (data, index) => {
  if (data?.items?.[index]?.directionCode === directionCodeType.OTHER) {
    return {
      hide: false,
    };
  }
  return { hide: true };
};

const calcFrequencyOther = (data, index) => {
  if (data?.items?.[index]?.frequencyCode === frequencyCodeType.OTHER) {
    return {
      hide: false,
    };
  }
  return { hide: true };
};

const calcmediscontinuedReason = (data, index) => {
  if (data?.items?.[index]?.medicineStatusCode === medicineStatusType.OTHER) {
    return {
      hide: false,
    };
  }
  return { hide: true };
};

const MedicationFormNew = ({
  customMedicationId,
  onClose,
  onRefersh = () => {},
  asPopUp = false,
}) => {
  const navigate = useNavigate();
  const params = useParams();
  console.log('🚀 ~ params:', params);

  const form = useForm({ mode: 'onChange' });

  let { patientId, medicationId } = useParams();
  patientId = decrypt(patientId);

  const memoMedicationId = useMemo(() => {
    if (medicationId) {
      return decrypt(medicationId);
    }
    return customMedicationId || '';
  }, [medicationId, customMedicationId]);

  const [icdBrowserModal, setIcdBrowserModal] = useState({});
  const [expandedCard, setExpandedCard] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [signature, setSignature] = useState('');

  // const [patientData] = usePatientDetail({ allergies:'rash' });
  const { handleSubmit, setValue } = form;
  const [userInfo] = useAuthUser();

  const [
    patientMedication,
    ,
    patientMedicationLoading,
    callPatientMedicationAPI,
  ] = useCRUD({
    id: `${MEDICATION_DATA}-${memoMedicationId}`,
    url: `${API_URL.medication}/${memoMedicationId}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (memoMedicationId) {
      callPatientMedicationAPI();
    }
  }, [memoMedicationId]);

  const handleIcdBrowser = useCallback((index) => {
    setIcdBrowserModal({ open: true, index });
  }, []);

  const [response, , loading, callMedicationSaveAPI, clearData] = useCRUD({
    id: SAVE_MEDICATION_DATA,
    url: API_URL.medication,
    type: !memoMedicationId ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const closeIcdBrowserModal = useCallback(() => {
    setIcdBrowserModal({});
  }, []);
  const closeSignature = () => {
    setShowSignature(false);
    setSignature('');
    setSignatureError(false);
  };

  const handleIcdBrowserSave = useCallback(
    (selectedPatientMedicationDiagnosis) => {
      const array1 = selectedPatientMedicationDiagnosis || [];
      const array2 =
        form.getValues(`items.${icdBrowserModal.index}.diagnoses`) || [];

      // Combine the arrays
      const combinedArray = array1.concat(array2);
      // Use reduce to filter out duplicates
      const uniqueArray = combinedArray.reduce((accumulator, current) => {
        // Check if the current id already exists in the accumulator
        if (current && !accumulator.some((item) => item.id === current.id)) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);
      form.setValue(`items.${icdBrowserModal.index}.diagnoses`, uniqueArray, {
        shouldValidate: true,
      });
      closeIcdBrowserModal();
    },
    [setValue, icdBrowserModal]
  );

  const initialData = useMemo(() => {
    let formData = {
      prescriptionDate: currentMeridien.now,
    };
    if (
      userInfo?.role === roleTypes.practitioner &&
      isEmpty(patientMedication)
    ) {
      formData = { ...formData, prescriberId: userInfo?.id };
    }

    if (!isEmpty(patientMedication)) {
      formData = {
        prescriberId: patientMedication.prescriberId,
        prescriptionDate: convertWithTimezone(
          patientMedication.prescriptionDate,
          { requiredPlain: true }
        ),
        items: patientMedication.items.map((item) => ({
          genericDrug: item.genericDrug,
          brandNameDrug: item.brandNameDrug,
          doseFormCode: item.doseFormCode,
          amount: item.amount,
          unitCode: item.unitCode,
          routeCode: item.routeCode,
          routeOther: item.routeOther || '',
          frequencyCode: item.frequencyCode,
          frequencyOther: item.frequencyOther || '',
          directionCode: item.directionCode,
          directionOther: item.directionOther || '',
          durationAmount: item.durationAmount,
          durationCode: item.durationCode,
          diagnosesOther: item.diagnosesOther || [],
          quantity: item.quantity,
          refill: item.refill,
          refillDate: item.refillDate
            ? convertWithTimezone(item.refillDate, { requiredPlain: true })
            : null,
          startDate: convertWithTimezone(item.startDate, {
            requiredPlain: true,
          }),
          dispenseAsWritten: item.dispenseAsWritten || false,
          substitutions: item.substitutions || false,
          allergiesWarnings: item.allergiesWarnings || '',
          patientSpecificInstructions: item.patientSpecificInstructions || '',
          additionalInstruction: item.additionalInstruction || '',
          medicineStatusCode: item.medicineStatusCode || '',
          medicineStatusReason: item?.medicineStatusReason || '',
          diagnoses: item.diagnoses.map((_item) => _item.icd),
          id: item.id,
          discontinueDate: item.discontinueDate || null,
          reasonForChanges: item.reasonForChanges || '',
        })),
        clinicalNotes: patientMedication.clinicalNotes || '',
      };
    }
    return formData;
  }, [patientMedication, userInfo]);

  const onSignatureSubmit = useCallback(() => {
    const _signature = signature || '';
    if (!_signature) {
      setSignatureError(true);
      return;
    }
    const data = form.getValues();
    if (!memoMedicationId) {
      const newData = cloneDeep(data);
      newData.items = newData?.items?.map((item) => {
        const updatedItem = { ...item };
        if (updatedItem.startDate) {
          updatedItem.startDate = getUTCDateTime(updatedItem.startDate);
        }
        if (updatedItem.refillDate) {
          updatedItem.refillDate = getUTCDateTime(updatedItem.refillDate);
        }
        return updatedItem;
      });
      newData.prescriptionDate = getUTCDateTime(newData.prescriptionDate);
      console.log('🚀 ~ onSignatureSubmit ~ newData:', newData.items);
      // return;
      callMedicationSaveAPI({
        data: { ...newData, patientId, signature: _signature },
      });
    } else {
      const updatedFields = getUpdatedFieldsValue(data, initialData);
      if (isEqual(updatedFields.items, initialData?.items)) {
        delete updatedFields.items;
      }
      if (updatedFields.items) {
        updatedFields.items = updatedFields.items.map((item) => {
          const updatedItem = { ...item };

          if (updatedItem.startDate) {
            updatedItem.startDate = getUTCDateTime(updatedItem.startDate);
          }
          if (updatedItem.refillDate) {
            updatedItem.refillDate = getUTCDateTime(updatedItem.refillDate);
          }

          return updatedItem;
        });
      }

      if (updatedFields.prescriptionDate) {
        updatedFields.prescriptionDate = getUTCDateTime(
          updatedFields.prescriptionDate
        );
      }

      if (!isEmpty(updatedFields)) {
        updatedFields.signature = _signature;

        callMedicationSaveAPI({ ...updatedFields }, `/${memoMedicationId}`);
      } else {
        showSnackbar({
          message: 'No changes found',
          severity: 'error',
        });
      }
    }
    closeSignature();
  }, [
    callMedicationSaveAPI,
    memoMedicationId,
    initialData,
    patientId,
    signature,
  ]);
  const onHandleSubmit = useCallback(
    (data) => {
      if (memoMedicationId) {
        const updatedFields = getUpdatedFieldsValue(data, initialData);
        if (isEqual(updatedFields.items, initialData?.items)) {
          delete updatedFields.items;
        }
        if (isEmpty(updatedFields)) {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
          return;
        }
      }
      setShowSignature(true);
    },
    [initialData, memoMedicationId]
  );

  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: !memoMedicationId
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      onRefersh();
      Events.trigger(`${MEDICATION_LIST}-${patientId}`);
      Events.trigger(`ADD_MEDICATION_ON_ENCOUNTER`, response);
      if (memoMedicationId && !asPopUp) {
        callPatientMedicationAPI();
      } else {
        handleBack();
      }
      clearData(true);
    }
  }, [response, memoMedicationId]);

  const renderDelete = (index) => {
    const values = form.getValues();
    const { items = [] } = values;
    console.log('>>>checking', index, items, items[index]);
    return !items[index]?.id;
  };

  const disableGenericDrug = useCallback((index) => {
    const formDate = form.getValues();
    const { items = [] } = formDate || {};
    return !!items?.[index]?.id;
  }, []);
  const disableBrandNameDrug = useCallback((index) => {
    const formDate = form.getValues();
    const { items = [] } = formDate || {};
    return !!items?.[index]?.id;
  }, []);
  const medicationFormGroups = useMemo(
    () => [
      {
        ...WiredStaffField({
          name: 'prescriberId',
          label: 'Prescriber',
          colSpan: 0.5,
          placeholder: 'Select',
          required: requiredField,
        }),
      },
      {
        inputType: 'date',
        name: 'prescriptionDate',
        textLabel: 'Prescription Date',
        required: requiredField,
        colSpan: 0.5,
      },
      {
        inputType: 'nestedTable',
        name: 'items',
        label: 'Medications',
        textButton: 'Add New',
        columnsPerRow: 6,
        gridGap: 2,
        formGroups: [
          {
            label: 'Medication (Generic/Brand)',
            fields: [
              {
                inputType: 'text',
                name: 'genericDrug',
                textLabel: 'Generic',
                required: requiredField,
                pattern: regexCustomText,
                sx: { width: '150px', marginRight: '4px' },
                disabled: disableGenericDrug,
                placeholder: 'Generic Name',
              },
              {
                inputType: 'text',
                name: 'brandNameDrug',
                textLabel: 'Brand',
                required: requiredField,
                pattern: regexCustomText,
                sx: { width: '150px', marginRight: '4px' },
                disabled: disableBrandNameDrug,
                placeholder: 'Brand Name',
              },
            ],
          },
          {
            ...WiredMasterField({
              code: 'dose_form_type',
              filter: { limit: 100 },
              name: 'doseFormCode',
              label: 'Dosage Form',
              labelAccessor: 'name',
              valueAccessor: 'code',
              colSpan: 0.25,
              required: requiredField,
            }),
          },
          {
            label: 'Amount/Unit',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'amount',
                textLabel: 'Amount',
                maxLength: { value: 5 },
                pattern: regDecimal,
                colSpan: 0.2,
                required: requiredField,
                sx: { width: '100px', marginRight: '4px' },
              },
              {
                ...WiredMasterField({
                  code: 'unit_type',
                  filter: { limit: 100 },
                  name: 'unitCode',
                  label: 'Unit',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  colSpan: 0.25,
                  required: requiredField,
                }),
              },
            ],
          },
          {
            label: 'Route',
            fields: [
              {
                ...WiredMasterField({
                  code: 'route_type',
                  filter: { limit: 100 },
                  name: 'routeCode',
                  label: 'Route',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  colSpan: 0.25,
                  required: requiredField,
                  sx: { minWidth: '100px', marginRight: '4px' },
                  cache: false,
                }),
              },
              {
                inputType: 'text',
                name: 'routeOther',
                textLabel: 'Other',
                placeholder: 'Route Other',
                pattern: regexCustomText,
                sx: { minWidth: '150px', marginRight: '4px' },
                dependencies: {
                  keys: ['routeCode'],
                  calc: calcRouteOther,
                  listenAllChanges: true,
                },
              },
            ],
          },

          {
            label: 'Frequency',
            fields: [
              {
                ...WiredMasterField({
                  code: 'frequency_type',
                  filter: { limit: 100 },
                  name: 'frequencyCode',
                  label: 'Frequency',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  colSpan: 0.25,
                  required: requiredField,
                  sx: { minWidth: '100px', marginRight: '4px' },
                  cache: false,
                }),
              },
              {
                inputType: 'text',
                name: 'frequencyOther',
                textLabel: 'Other',
                sx: { minWidth: '150px', marginRight: '4px' },
                placeholder: 'Frequency Other',
                pattern: regexCustomText,
                dependencies: {
                  keys: ['frequencyCode'],
                  calc: calcFrequencyOther,
                  listenAllChanges: true,
                },
              },
            ],
          },
          {
            label: 'Directions',
            fields: [
              {
                ...WiredMasterField({
                  code: 'direction_type',
                  filter: { limit: 100 },
                  name: 'directionCode',
                  label: 'Directions',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  required: requiredField,
                  sx: { minWidth: '100px', marginRight: '4px' },
                  cache: false,
                }),
              },
              {
                inputType: 'text',
                name: 'directionOther',
                textLabel: 'Other',
                placeholder: 'Direction Other',
                pattern: regexCustomText,
                sx: { minWidth: '150px', marginRight: '4px' },
                dependencies: {
                  keys: ['directionCode'],
                  calc: calcDirectionOther,
                  listenAllChanges: true,
                },
              },
            ],
          },
          {
            label: 'Duration',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'durationAmount',
                required: requiredField,
                textLabel: 'Duration',
                sx: { width: '100px', marginRight: '4px' },
                maxLength: { value: 4 },
              },
              {
                ...WiredMasterField({
                  code: 'duration_type',
                  filter: { limit: 20 },
                  name: 'durationCode',
                  label: 'Duration',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  colSpan: 0.5,
                  required: requiredField,
                  sx: { minWidth: '100px', marginRight: '4px' },
                }),
              },
            ],
          },
          {
            label: 'Reason for Rx',
            fields: [
              {
                ...WiredMasterAutoComplete({
                  url: API_URL.diagnosisIcd,
                  label: 'Reason for Rx',
                  name: 'diagnoses',
                  colSpan: 0.7,
                  placeholder: 'Enter ICD-10 code or name',
                  labelAccessor: 'name',
                  valueAccessor: 'id',
                  showDescription: true,
                  descriptionAccessor: 'description',
                  multiple: true,
                }),
                sx: { minWidth: '250px' },
              },

              {
                component: ({ index }) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '0.5rem',
                      justifyContent: 'center'
                    }}
                  >
                    <IconButton onClick={() => handleIcdBrowser(index)}>
                      <img
                        src={Search}
                        alt="search"
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          width: 30,
                          height: 30,
                        }}
                      />
                    </IconButton>
                  </div>
                ),
                colSpan: 0.3,
                cstSx: {
                  paddingLeft: '10px !important',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                },
              },
            ],
          },
          {
            label: 'Reason for Rx (Other)',
            fields: [
              {
                ...WiredMasterAutoComplete({
                  code: 'diagnosesOther',
                  name: 'diagnosesOther',
                  pattern: regexCustomText,
                  colSpan: 0.7,
                  placeholder: 'Enter here',
                  cache: false,
                  multiple: true,
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  freeSolo: true,
                }),
                sx: { minWidth: '250px' },
              },
            ],
          },
          {
            label: 'Quantity',
            inputType: 'text',
            type: 'number',
            name: 'quantity',
            textLabel: 'Quantity',
            required: requiredField,
            sx: { width: '100px', marginRight: '4px' },
          },
          {
            label: 'Refill',
            inputType: 'text',
            type: 'number',
            name: 'refill',
            textLabel: 'Refill',
            // required: requiredField,
            sx: { width: '100px', marginRight: '4px' },
          },
          {
            inputType: 'date',
            name: 'refillDate',
            textLabel: 'Refill Date',
            // required: requiredField,
            sx: { width: '150px', marginRight: '4px' },
          },
          {
            label: 'Medication Status',
            fields: [
              {
                ...WiredMasterField({
                  code: 'medication_status',
                  filter: { limit: 100 },
                  name: 'medicineStatusCode',
                  label: 'Medication Status',
                  labelAccessor: 'name',
                  valueAccessor: 'code',
                  required: requiredField,
                  sx: { minWidth: '100px', marginRight: '4px' },
                  cache: false,
                }),
              },
              {
                inputType: 'text',
                name: 'medicineStatusReason',
                textLabel: 'Discontinued Reason',
                sx: { minWidth: '150px', marginRight: '4px' },
                placeholder: 'Discontinued Reason',
                pattern: regexCustomText,
                dependencies: {
                  keys: ['medicineStatusCode'],
                  calc: calcmediscontinuedReason,
                  listenAllChanges: true,
                },
              },
            ],
          },
          {
            inputType: 'date',
            name: 'startDate',
            textLabel: 'Start on',
            required: requiredField,
            sx: { width: '150px', marginRight: '4px' },
          },
          {
            inputType: 'checkBox',
            name: 'dispenseAsWritten',
            label: 'Dispense as Written',
            gridProps: { md: 4 },
            colSpan: 1,
          },
          {
            inputType: 'checkBox',
            name: 'substitutions',
            label: 'Substitutions Permitted',
            gridProps: { md: 4 },
            colSpan: 1,
          },
          {
            inputType: 'textArea',
            type: 'text',
            name: 'patientSpecificInstructions',
            textLabel: 'Patient-specific Instructions',
            colSpan: 2,
            sx: { minWidth: '250px', marginRight: '4px' },
          },
          {
            inputType: 'textArea',
            type: 'text',
            name: 'allergiesWarnings',
            textLabel: 'Allergies/Warnings',
            colSpan: 2,
            sx: { minWidth: '250px', marginRight: '4px' },
          },
          {
            inputType: 'textArea',
            type: 'text',
            name: 'additionalInstruction',
            textLabel: 'Additional Instructions',
            colSpan: 2,
            sx: { width: '250px', marginRight: '4px' },
          },
          ...(!isEmpty(initialData.items)
            ? [
                {
                  inputType: 'textArea',
                  type: 'text',
                  name: 'reasonForChanges',
                  textLabel: 'Reason for Changes',
                  colSpan: 2,
                  sx: { width: '250px', marginRight: '4px' },
                },
              ]
            : []),
          
        ],
        renderDelete: renderDelete,
      },
      {
        inputType: 'textArea',
        type: 'text',
        name: 'clinicalNotes',
        textLabel: 'Clinical Notes',
        colSpan: 2,
        sx: { minWidth: '150px', marginRight: '4px' },
      },
    ],
    [disableBrandNameDrug, initialData.items]
  );

  const handleChange = (panel) => (event, newExpanded) => {
    setExpandedCard(newExpanded ? panel : false);
  };
  const navigateToSchedule = useCallback(() => {
    navigate(
      generatePath(UI_ROUTES.patientMedicationSchedule, {
        ...params,
      })
    );
  }, []);

  const navigateToMAR = useCallback(() => {
    navigate(
      generatePath(UI_ROUTES.patientEmarData, {
        ...params,
      })
    );
  }, []);

  return (
    <Container loading={patientMedicationLoading || loading}>
      {!asPopUp && (
        <PageHeader
          showBackIcon
          title="Back"
          onPressBackIcon={handleBack}
          rightContent={[
            memoMedicationId && {
              type: 'save',
              label: 'See Schedules',
              startIcon: <AccessTimeIcon />,
              style: { padding: '26px' },
              onClick: navigateToSchedule,
            },
            memoMedicationId && {
              type: 'save',
              label: 'See EMAR',
              startIcon: <ArticleIcon />,
              style: { padding: '26px' },
              onClick: navigateToMAR,
            },
          ]}
        />
      )}
      <Box>
        <CardContent>
          <div style={{ marginBottom: 40 }}>
            <PatientInfo />
          </div>
          <CustomForm
            form={form}
            formGroups={medicationFormGroups}
            columnsPerRow={1}
            defaultValue={initialData}
          />
        </CardContent>
        <CardActions
          sx={{
            justifyContent: 'flex-start',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          <LoadingButton
            variant="outlinedSecondary"
            onClick={handleBack}
            label="Cancel"
          />
          <LoadingButton
            loading={loading}
            onClick={handleSubmit(onHandleSubmit)}
            label={memoMedicationId ? 'Update' : 'Save'}
          />
        </CardActions>
        {memoMedicationId &&
        patientMedication?.patientMedicationHistory?.length ? (
          <CardContent>
            <Typography
              sx={{
                fontSize: '16px',
                my: '10px',
                fontWeight: 600,
                color: palette.background.main,
              }}
            >
              Medication History
            </Typography>
            {patientMedication?.patientMedicationHistory?.map((item, index) => (
              <Accordion
                defaultExpanded
                key={item?.id}
                expanded={expandedCard === index}
                onChange={handleChange(index)}
                panelId={item?.id}
                textLabels={[
                  {
                    type: 'text',
                    label: convertWithTimezone(item.updatedAt, {
                      format: dateFormats.MMMDDYYYYHHMMSS,
                    }),
                  },
                ]}
              >
                <div>
                  <div style={{ marginBottom: 30 }}>
                    <Grid container spacing={3}>
                      {/* Prescribed By */}
                      <Grid item xs={6}>
                        <Grid container spacing={2}>
                          <Grid item>
                            <Typography
                              style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                              Prescribed By :
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography style={{ fontSize: '14px' }}>
                              {getFullName(item?.prescribedBy)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Revised By */}
                      <Grid item xs={6}>
                        <Grid container spacing={2}>
                          <Grid item>
                            <Typography
                              style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                              Revised By :
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Typography style={{ fontSize: '14px' }}>
                              {getFullName(item?.revisedBy)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Prescriber */}
                      <Grid item xs={6}>
                        <Grid container spacing={2}>
                          <Grid item>
                            {/* <Typography
                              style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                              Prescriber :
                            </Typography> */}
                          </Grid>
                          <Grid item>
                            {/* <Typography style={{ fontSize: '14px' }}>
                              Piyush
                            </Typography> */}
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Prescriber Signature */}
                      <Grid item xs={6}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Typography
                              style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                              Prescriber Signature:
                            </Typography>
                          </Grid>
                          <Grid item>
                            <img src={item.signature} alt="signature" />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                  <Table
                    data={item?.items}
                    totalCount={1}
                    columns={columns}
                    itemStyle={{
                      textTransform: 'capitalize',
                      cursor: 'default',
                    }}
                    timezone
                  />
                </div>
                <div>
                  <div style={{ marginTop: 20 }}>
                    <Typography
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: '18px',
                      }}
                    >
                      Clinical Notes
                    </Typography>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Typography
                      color={palette.text.secondary}
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: '18px',
                        width: '80%',
                      }}
                    >
                      {item?.clinicalNotes || 'N/A'}
                    </Typography>
                  </div>
                </div>
              </Accordion>
            ))}
          </CardContent>
        ) : null}
        {icdBrowserModal && icdBrowserModal.open && (
          <ModalComponent
            open
            header={{
              title: 'ICD Browser',
              closeIconAction: closeIcdBrowserModal,
            }}
            modalStyle={{ width: '100%' }}
          >
            <Box>
              <IcdBrowser
                modalCloseAction={closeIcdBrowserModal}
                onSave={handleIcdBrowserSave}
                patientId={patientId}
              />
            </Box>
          </ModalComponent>
        )}
        <ModalComponent
          open={showSignature}
          header={{
            title: 'Review & Sign',
            closeIconAction: closeSignature,
          }}
        >
          <Box>
            <CardContent>
              <Esignature
                error={signatureError}
                onChange={(value) => {
                  if (value) {
                    setSignatureError(false);
                  }
                  setSignature(value);
                }}
              />
            </CardContent>
            <CardActions sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
              <LoadingButton label={'Submit'} onClick={onSignatureSubmit} />
            </CardActions>
          </Box>
        </ModalComponent>
      </Box>
    </Container>
  );
};

export default MedicationFormNew;
