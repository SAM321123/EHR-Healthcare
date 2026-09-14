/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import floor from 'lodash/floor';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import Edit from '@mui/icons-material/Edit';

import useCRUD from 'src/hooks/useCRUD';
import usePatientDetail from 'src/hooks/usePatientDetail';

import Box from 'src/components/Box';
import Table from 'src/components/Table';
import CustomForm from 'src/components/form';
import CustomButton from 'src/components/CustomButton';
import Typography from 'src/components/Typography';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import {
  GET_MEDICINE_TEMPLATE,
  PATIENT_PRESCRIPTION_DATA,
} from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import {
  dateFormats,
  durationUnitOptions,
  inputLength,
  medicineStatusOptions,
  noHtmlTagPattern,
  patientPrescriptionFrequencyOptions,
  regDecimal,
  regexCommonText,
  requiredField,
  roleTypes,
  strengthUnit,
  successMessage,
} from 'src/lib/constants';
import {
  calculateIdealWeight,
  convertWithTimezone,
  getUpdatedFieldsValue,
  getUserRole,
  medicineDuration,
  medicineFrequency,
  showSnackbar,
} from 'src/lib/utils';
import {
  WiredMedicineAutoComplete,
  WiredSelect,
} from 'src/wiredComponent/Form/FormFields';
import PageHeader from 'src/components/PageHeader';
import Accordion from 'src/components/Accordion';
import PageContent from 'src/components/PageContent';
import Loader from 'src/components/Loader';
import { responseModifierEPrescription } from 'src/api/helper';
import palette from 'src/theme/palette';
import UpdateWeight from '../ActivityLogs/UpdateWeight';
import ModalComponent from '../../../../components/modal';

const columns = [
  {
    label: 'Medication',
    type: 'text',
    render: ({ data }) => {
      const title = `${data?.medicine?.name} ${data?.dosage.strength} ${data?.dosage.strengthUnit} in ${data?.dosage.volume} ${data?.dosage.quantityUnit} ${data?.dosage.form}`;
      return (
        <Tooltip title={title}>
          {data?.medicine?.name}
          <br />
          {`${data?.dosage.strength}
        ${data?.dosage.strengthUnit} in ${data?.dosage.volume}
        ${data?.dosage.quantityUnit} ${data?.dosage.form}`}
        </Tooltip>
      );
    },
  },
  {
    label: 'Label',
    type: 'text',
    dataKey: 'label',
  },
  {
    label: 'Amount',
    type: 'text',
    dataKey: 'amount',
  },
  {
    label: 'Unit',
    type: 'text',
    dataKey: 'unit',
  },
  {
    label: 'Frequency',
    type: 'text',
    dataKey: 'frequency',
  },
  {
    label: 'Duration',
    type: 'text',
    dataKey: 'duration',
  },
  {
    label: 'Duration Unit',
    type: 'text',
    dataKey: 'durationUnit',
  },
  {
    label: 'Medication Status',
    type: 'text',
    dataKey: 'medicineStatus',
  },
  {
    label: 'Additional Note',
    type: 'text',
    dataKey: 'note',
  },
];

const amountFields = (strength) => {
  if (strength === strengthUnit.UNITS) {
    return true;
  }
  return false;
};

const unitsFields = (strength) => {
  if (
    strength === strengthUnit.UNITS ||
    strength === strengthUnit.MILLIGRAMS_PER_MILLILITRE
  ) {
    return false;
  }
  return true;
};

const TemplateLink = ({ form, data }) => {
  const { index } = data;
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const { getValues, setValue, watch, clearErrors } = form;
  const formData = getValues();
  const medicineId = useMemo(
    () => formData?.items[index - 1]?.medicine?.id,
    [formData, index]
  );
  const isMedicineSelected = watch(`items.${index - 1}.medicine`);

  const [medicineTemplateList, , , callMedicineTemplateApi] = useCRUD({
    id: `${GET_MEDICINE_TEMPLATE}-GET-${medicineId}`,
    url: `${API_URL.patientPrescriptionTemplate}?medicine=${medicineId}`,
    type: REQUEST_METHOD.get,
  });

  const handleClose = () => {
    setOpenTemplateModal(false);
  };

  const handleOPen = (e) => {
    e.preventDefault();
    setOpenTemplateModal(true);
  };

  const handleClick = (item) => {
    setSelectedCard(item);
  };

  const handleSubmit = () => {
    setSelectedValue(selectedCard);
    setValue(`items.${index - 1}.label`, selectedCard?.label);
    setValue(`items.${index - 1}.dosage`, selectedCard?.dosage?._id);
    setValue(`items.${index - 1}.amount`, selectedCard?.amount);
    setValue(`items.${index - 1}.unit`, selectedCard?.unit);
    setValue(`items.${index - 1}.frequency`, selectedCard?.frequency);
    setValue(`items.${index - 1}.duration`, selectedCard?.duration);
    setValue(`items.${index - 1}.durationUnit`, selectedCard?.durationUnit);
    setOpenTemplateModal(false);
    clearErrors(`items.${index - 1}.label`);
    clearErrors(`items.${index - 1}.dosage`);
    clearErrors(`items.${index - 1}.amount`);
    clearErrors(`items.${index - 1}.unit`);
    clearErrors(`items.${index - 1}.frequency`);
    clearErrors(`items.${index - 1}.duration`);
    clearErrors(`items.${index - 1}.durationUnit`);
  };

  useEffect(() => {
    if (medicineId) {
      callMedicineTemplateApi();
    }
  }, [callMedicineTemplateApi, medicineId]);

  return isMedicineSelected && !isEmpty(medicineTemplateList?.results) ? (
    <>
      <Link
        sx={{ fontSize: '10px', mt: '4px' }}
        component="button"
        variant="body2"
        onClick={(e) => handleOPen(e)}
      >
        {selectedValue
          ? `${selectedValue?.label}: ${selectedValue?.amount} ${
              selectedValue?.unit
            } ${medicineFrequency(
              selectedValue?.frequency
            )} for ${medicineDuration(
              selectedValue?.duration,
              selectedValue?.durationUnit
            )}`
          : 'Select a template'}
      </Link>
      {openTemplateModal ? (
        <ModalComponent
          open={openTemplateModal}
          onClose={handleClose}
          isNotScrollable
          isSmall
          header={{
            title: 'Choose a Template ',
          }}
        >
          <Box sx={{ m: '20px' }}>
            <Grid container spacing={2}>
              {medicineTemplateList?.results?.[0]?.items ? (
                medicineTemplateList?.results?.[0]?.items?.map((item) => (
                  <Grid item xs={12} md={4} key={item.id}>
                    <Card
                      sx={{
                        borderColor:
                          selectedCard?.id === item.id
                            ? 'primary.main'
                            : 'inherit',
                        borderWidth: 2,
                        borderStyle:
                          selectedCard?._id === item._id ? 'solid' : 'none',
                      }}
                      onClick={() => handleClick(item)}
                    >
                      <CardContent>
                        <Typography sx={{}} color="text.secondary" gutterBottom>
                          {item?.label}
                        </Typography>
                        <Typography
                          sx={{ mb: 1.5, fontSize: '12px' }}
                          color="text.secondary"
                        >
                          {`${item?.amount} ${item?.unit} ${medicineFrequency(
                            item?.frequency
                          )} for ${medicineDuration(
                            item?.duration,
                            item?.durationUnit
                          )}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography
                  sx={{ mb: 1.5, ml: '20px', fontSize: 14 }}
                  color="text.secondary"
                >
                  No record found
                </Typography>
              )}
            </Grid>
          </Box>
          <CardActions
            sx={{
              justifyContent: 'center',
            }}
          >
            <CustomButton
              variant="secondary"
              onClick={() => setOpenTemplateModal(false)}
              label="Cancel"
            />
            <LoadingButton onClick={handleSubmit} label="Save" />
          </CardActions>
        </ModalComponent>
      ) : null}
    </>
  ) : null;
};

const EPrescriptionForm = ({ onPressBackIcon }) => {
  const [expandedCard, setExpandedCard] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState();
  const [patientInfo, setPatientInfo] = useState();
  const params = useParams();
  const [patientData, , getDetail] = usePatientDetail({
    patientId: params?.id,
  });
  const navigate = useNavigate();

  const userRole = getUserRole();

  const form = useForm({ mode: 'onChange' });

  const id = params?.patientPrescriptionId;

  const { handleSubmit, setValue, watch } = form;

  const [
    patientPrescription,
    ,
    patientPrescriptionLoading,
    callPatientPrescription,
  ] = useCRUD({
    id: `${PATIENT_PRESCRIPTION_DATA}-${id}`,
    url: `${API_URL.patientPrescription}/${id}`,
    type: REQUEST_METHOD.get,
    responseModifier: responseModifierEPrescription,
  });

  const isApproved = patientPrescription?.isApproved;

  const initialData = useMemo(
    () =>
      !isEmpty(patientPrescription) && {
        ...patientPrescription,
        items: patientPrescription?.items?.map((item) => ({
          dosage: item?.dosage?._id,
          medicine: item?.medicine,
          amount: item?.amount,
          unit: item?.unit,
          duration: item?.duration,
          durationUnit: item?.durationUnit,
          frequency: item?.frequency,
          label: item?.label,
          medicineStatus: item?.medicineStatus,
          _id: item?._id,
          note: item?.note,
        })),
      },
    [patientPrescription]
  );

  const [response, , loading, callPatientPharmacyAPI, clearData] = useCRUD({
    id: `${PATIENT_PRESCRIPTION_DATA}_CREATE_UPDATE`,
    url: API_URL.patientPrescription,
    type: isEmpty(id) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const amountCalc = useCallback(
    (data, index) => {
      if (data?.items?.length) {
        const value = amountFields(data?.items?.[index]?.dosage?.strengthUnit);
        if (
          data?.items?.[index]?.dosage?.strengthUnit ===
          strengthUnit.MILLIGRAMS_PER_MILLILITRE
        ) {
          const units = Number(data?.items?.[index]?.units) || 0;
          const st = data?.items?.[index]?.dosage?.strength;
          const amount = floor((st * units) / 100, 1);
          setValue(`items.${index}.amount`, units ? Number(amount) : '', {
            shouldValidate: true,
          });
        }
        return {
          disabled: value,
          required: { value: !value },
          label: 'Amount',
        };
      }
      return { disabled: false };
    },
    [setValue]
  );

  const unitCalc = useCallback(
    (data, index) => {
      if (data?.items?.length) {
        const value = unitsFields(data?.items?.[index]?.dosage?.strengthUnit);
        if (
          data?.items?.[index]?.dosage?.strengthUnit ===
          strengthUnit.MILLIGRAMS_PER_MILLILITRE
        ) {
          const amount = data?.items?.[index]?.amount;
          const st = data?.items?.[index]?.dosage?.strength;
          const units = Math.ceil((100 * amount) / st);
          setValue(`items.${index}.units`, amount ? units : '', {
            shouldValidate: true,
          });
        }
        return {
          disabled: value,
          required: { value: !value },
          label: 'Units',
        };
      }
      return { disabled: false };
    },
    [setValue]
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change') {
        if (name.indexOf('units') !== -1) {
          amountCalc(value, name.split('.')[1]);
        } else if (name.indexOf('amount') !== -1) {
          unitCalc(value, name.split('.')[1]);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // May be need for future
  // const getIsUnitRequired = useCallback(
  //   (index) => {
  //     const value = unitsFields(
  //       form.getValues()?.items?.[index]?.dosage?.strengthUnit
  //     );
  //     return { value: !value };
  //   },
  //   [form]
  // );

  // const getIsAmountRequired = useCallback(
  //   (index) => {
  //     const value = amountFields(
  //       form.getValues()?.items?.[index]?.dosage?.strengthUnit
  //     );
  //     return { value: !value };
  //   },
  //   [form]
  // );

  // const getIsUnitDisabled = useCallback(
  //   (index) => {
  //     const value = unitsFields(
  //       form.getValues()?.items?.[index]?.dosage?.strengthUnit
  //     );
  //     return !!value;
  //   },
  //   [form]
  // );

  // const getIsAmountDisabled = useCallback(
  //   (index) => {
  //     const value = amountFields(
  //       form.getValues()?.items?.[index]?.dosage?.strengthUnit
  //     );
  //     return !!value;
  //   },
  //   [form]
  // );

  // const getExtraProps = useCallback(
  //   (index) => {
  //     const value = getIsAmountDisabled(index);
  //     if (!value) {
  //       return {
  //         endAdornment: (
  //           <InputAdornment position="end">
  //             <Typography sx={{ fontSize: '12px' }}>
  //               {form.getValues()?.items?.[index]?.dosage?.strengthUnit ===
  //               strengthUnit.MILLIGRAMS_PER_MILLILITRE
  //                 ? 'mg'
  //                 : form.getValues()?.items?.[index]?.dosage?.strengthUnit}
  //             </Typography>
  //           </InputAdornment>
  //         ),
  //       };
  //     }
  //     return null;
  //   },
  //   [form, getIsAmountDisabled]
  // );

  const handleCurrentWeight = useCallback(() => {
    setOpenModal((curr) => !curr);
  }, []);

  const dosageCalc = useCallback(
    (data, index) => {
      if (data?.items.length) {
        const medicineData = data.items[index]?.medicine;

        if (medicineData) {
          const optionData = medicineData?.dosage?.map((item) => ({
            label: `${item?.strength} ${item?.strengthUnit} in ${item?.volume} ${item?.quantityUnit} ${item?.form}`,
            value: item?._id,
          }));
          form.setValue(`items.${index}.medicineStatus`, 'new');
          form.clearErrors(`items.${index}.medicineStatus`);

          return { reFetch: true, options: optionData };
        }
      }
      return { reFetch: false };
    },
    [form]
  );

  const amountUnitCalc = useCallback(
    (data, index) => {
      if (data?.items.length) {
        let options = [];
        const medicineData = data.items[index]?.medicine;
        const dosageData = data.items[index]?.dosage;

        if (medicineData) {
          const optionData = medicineData?.dosage?.find(
            (item) => item?._id === dosageData
          );
          if (optionData?.strengthUnit === 'mg/ml') {
            options = [
              { name: 'units', value: 'units' },
              { name: 'mg', value: 'mg' },
              { name: 'ml', value: 'ml' },
            ];
          } else {
            options = [
              {
                name: optionData?.strengthUnit,
                value: optionData?.strengthUnit,
              },
            ];
          }
          if (options.length)
            form.setValue(`items.${index}.unit`, options[0]?.value);
          return { reFetch: true, options };
        }
      }
      return { reFetch: false };
    },
    [form]
  );

  const handleApprove = useCallback(() => {
    if (!isApproved) {
      callPatientPharmacyAPI({ isApproved: true }, `/${id}`);
    }
  }, [callPatientPharmacyAPI, id, isApproved]);

  const ePrescriptionFormGroups = useMemo(
    () => [
      {
        inputType: 'text',
        name: 'patient.idealWeight',
        textLabel: 'Ideal Weight',
        disabled: true,
        colSpan: 0.3,
        pattern: {
          value: regexCommonText.value,
          message: `Ideal Weight ${regexCommonText.message}`,
        },
      },
      {
        inputType: 'text',
        name: 'patient.weightAndWeightUnit',
        textLabel: 'Current Weight',
        disabled: true,
        colSpan: 0.3,
        pattern: {
          value: regexCommonText.value,
          message: `Current Weight ${regexCommonText.message}`,
        },
        InputProps: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleCurrentWeight}
                edge="end"
              >
                <Edit
                  size="small"
                  sx={{
                    width: '18px',
                    height: '18px',
                    color: palette.common.icon,
                  }}
                />
              </IconButton>
            </InputAdornment>
          ),
        },
      },
      {
        inputType: 'nestedForm',
        name: 'items',
        label: 'Medications',
        textButton: 'Add New',
        columnsPerRow: 6,
        gridGap: 2,
        formGroups: [
          {
            label: 'Medication/Template',
            layout: 'col',
            fields: [
              {
                ...WiredMedicineAutoComplete({
                  name: 'medicine',
                  label: 'Medication',
                  labelAccessor: 'name',
                  required: requiredField,
                  params: { isActive: true },
                }),
              },
              {
                name: 'template',
                component: (data) => <TemplateLink form={form} data={data} />,
              },
            ],
          },
          {
            inputType: 'text',
            label: 'Label',
            name: 'label',
            multiline: true,
            minRows: 2,
            maxLength: { ...inputLength.firstName },
            pattern: noHtmlTagPattern,
          },
          {
            inputType: 'select',
            name: 'dosage',
            label: 'Dosage',
            labelAccessor: 'label',
            valueAccessor: 'value',
            required: requiredField,
            dependencies: {
              keys: ['medicine'],
              calc: dosageCalc,
              listenAllChanges: true,
            },
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
                sx: { width: '70px', marginRight: '4px' },
              },
              {
                inputType: 'select',
                name: 'unit',
                label: 'Unit',
                required: requiredField,
                valueAccessor: 'value',
                labelAccessor: 'name',
                dependencies: {
                  keys: ['dosage'],
                  calc: amountUnitCalc,
                  listenAllChanges: true,
                },
                colSpan: 0.3,
              },
            ],
          },
          {
            ...WiredSelect({
              name: 'frequency',
              label: 'Frequency',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'name',
              options: patientPrescriptionFrequencyOptions,
              colSpan: 0.3,
            }),
          },
          {
            label: 'Duration',
            type: 'group',
            fields: [
              {
                inputType: 'text',
                type: 'number',
                name: 'duration',
                required: requiredField,
                textLabel: 'Duration',
                sx: { width: '70px', marginRight: '4px' },
                maxLength: { value: 4 },
              },
              {
                ...WiredSelect({
                  name: 'durationUnit',
                  label: 'Duration Unit',
                  required: requiredField,
                  valueAccessor: 'value',
                  labelAccessor: 'name',
                  options: durationUnitOptions,
                }),
              },
            ],
          },
          {
            ...WiredSelect({
              name: 'medicineStatus',
              label: 'Medication Status',
              required: requiredField,
              valueAccessor: 'value',
              labelAccessor: 'name',
              options: medicineStatusOptions,
            }),
          },
          {
            inputType: 'text',
            name: 'note',
            textLabel: 'Add Note',
            multiline: true,
            minRows: 2,
            maxLength: { ...inputLength.commonTextLength },
            colSpan: 2,
            pattern: {
              value: regexCommonText.value,
              message: `Add Note ${regexCommonText.message}`,
            },
          },
        ],
      },
    ],
    [handleCurrentWeight, dosageCalc, amountUnitCalc, form]
  );

  const handleChange = (panel) => (event, newExpanded) => {
    setExpandedCard(newExpanded ? panel : false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const onHandleSubmit = useCallback(
    (data) => {
      if (isEmpty(id)) {
        const { items, patient } = data || {};
        const medicineData = items?.map((item) => {
          const {
            amount,
            medicine,
            frequency,
            duration,
            unit,
            note,
            durationUnit,
            medicineStatus,
            label,
          } = item;

          const dosage = medicine?.dosage?.find(
            (ele) => ele?._id === item?.dosage
          );

          return {
            dosage,
            duration,
            unit,
            frequency,
            note,
            amount,
            medicine: medicine?.id,
            durationUnit,
            medicineStatus,
            label,
          };
        });
        const payload = {
          items: medicineData,
          patient: patient?.id,
        };
        callPatientPharmacyAPI({ data: payload });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, initialData);
        delete updatedFields?.itemsHistory;
        delete updatedFields?.lastApprovedItem;
        if (isEqual(updatedFields.patient, initialData?.patient))
          delete updatedFields.patient;
        if (isEqual(updatedFields.items, initialData?.items))
          delete updatedFields.items;
        if (!isEmpty(updatedFields)) {
          const medicineData = updatedFields?.items?.map((item) => {
            const {
              amount,
              medicine,
              frequency,
              duration,
              unit,
              note,
              durationUnit,
              medicineStatus,
              label,
            } = item;

            const dosage = medicine?.dosage?.find(
              (ele) => ele?._id === item?.dosage
            );

            return {
              dosage,
              duration,
              unit,
              frequency,
              note,
              amount,
              medicine: medicine?.id,
              durationUnit,
              medicineStatus,
              label,
            };
          });
          updatedFields.items = medicineData;
          callPatientPharmacyAPI(updatedFields, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callPatientPharmacyAPI, id, initialData]
  );

  useEffect(() => {
    if (!isEmpty(id)) {
      callPatientPrescription();
    }
  }, [callPatientPrescription, id]);

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(id) ? successMessage.create : successMessage.update,
        severity: 'success',
      });
      clearData();
      navigate(-1);
    }
  }, [response]);

  useEffect(() => {
    if (patientData) {
      patientData.weightAndWeightUnit =
        patientData?.weight && patientData?.weightUnit
          ? `${patientData?.weight} ${patientData?.weightUnit}`
          : null;
      patientData.idealWeight =
        patientData?.height && patientData?.height !== 'NaN'
          ? calculateIdealWeight(patientData?.height, patientData?.gender)
          : null;
      setPatientDetails({ patient: patientData });
    }
  }, [patientData]);

  useEffect(() => {
    if (id) {
      setPatientInfo(patientPrescription);
    } else {
      setPatientInfo(patientData);
    }
  }, [id, patientData, patientPrescription]);

  return patientPrescriptionLoading ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Loader type="circular" loading={patientPrescriptionLoading} />
    </Box>
  ) : (
    <PageContent style={{ overflow: 'auto' }}>
      <PageHeader
        showBackIcon
        title="Med-Instructions"
        onPressBackIcon={
          isFunction(onPressBackIcon) ? onPressBackIcon : handleBack
        }
        rightContent={[
          typeof isApproved === 'boolean' &&
            !isApproved &&
            userRole === roleTypes.practitioner && {
              type: 'action',
              label: 'Approve',
              onClick: handleApprove,
              style: { borderRadius: 8, fontSize: '1rem' },
            },
        ]}
      />
      <CustomForm
        form={form}
        formGroups={ePrescriptionFormGroups}
        columnsPerRow={1}
        defaultValue={!isEmpty(id) ? initialData : patientDetails}
      />

      <CardActions
        sx={{
          justifyContent: 'end',
        }}
      >
        <CustomButton variant="secondary" onClick={handleBack} label="Cancel" />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
      {!isEmpty(id) && patientPrescription?.itemsHistory?.length ? (
        <>
          <Typography sx={{ fontSize: '16px', my: '10px' }}>History</Typography>
          {patientPrescription?.itemsHistory?.map((item, index) => (
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
                {
                  type: 'chips',
                  label: item?.weight
                    ? `${item?.weight} ${item?.weightUnit}`
                    : '',
                },
              ]}
            >
              <Table
                data={item?.items}
                totalCount={1}
                columns={columns}
                itemStyle={{ textTransform: 'capitalize', cursor: 'default' }}
              />
            </Accordion>
          ))}
        </>
      ) : null}
      {openModal ? (
        <ModalComponent
          open={openModal}
          onClose={handleCurrentWeight}
          isNotScrollable
          isSmall
          header={{
            title: 'Log Weight',
          }}
        >
          <UpdateWeight
            modalCloseAction={handleCurrentWeight}
            patientData={patientInfo}
            getDetail={getDetail}
            callPatientPrescription={callPatientPrescription}
          />
        </ModalComponent>
      ) : null}
    </PageContent>
  );
};

export default EPrescriptionForm;
