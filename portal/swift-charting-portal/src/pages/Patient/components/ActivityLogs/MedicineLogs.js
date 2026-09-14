/* eslint-disable no-underscore-dangle */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import {
  dateFormats,
  patientActivityTypes,
  regDecimal,
  requiredField,
  successMessage,
  timeFormats,
} from 'src/lib/constants';
import useCRUD from 'src/hooks/useCRUD';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import PageContent from 'src/components/PageContent';
import Typography from 'src/components/Typography';
import Modal from 'src/components/modal';
import CustomButton from 'src/components/CustomButton';
import palette from 'src/theme/palette';
import {
  convertWithTimezone,
  dateFormatterDayjs,
  showSnackbar,
} from 'src/lib/utils';
import BodyMap from './BodyMaps';
import HistoryTable from './HistoryTable';

const MedicineLogs = ({ patientData }) => {
  const [isBodyGraph, setBodyGraph] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [bodyGraphValue, setBodyGraphValue] = useState(null);
  const [isBodyGraphModal, setBodyGraphModal] = useState(null);
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, watch, setValue } = form;

  const medicineList =
    useSelector((state) =>
      state?.crud?.get('wired-select-medicine')?.get('read')?.get('data')
    ) || [];
  const [medicineLogs, , , getMedicineLogs] = useCRUD({
    id: 'GET_MEDICINE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.get,
  });

  const [response, , loading, updateMedicineLogs, clearUpdate] = useCRUD({
    id: 'UPDATE_MEDICINE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.post,
  });

  const [deleteResponse, , , deleteMedicienLog, clearDelete] = useCRUD({
    id: 'DELETE_MEDICINE_LOGS',
    url: API_URL.patientActivity,
    type: REQUEST_METHOD.delete,
  });

  const deleteMedicienLogEntery = (id) => {
    deleteMedicienLog({}, `/${id}`);
  };
  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      setValue('medicine', '');
      setValue('value', '');
      setValue('unit', '');
      setBodyGraphValue(null);
      setBodyGraph(null);
      clearUpdate();
    }
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: successMessage.delete,
        severity: 'success',
      });
      clearDelete();
    }

    getMedicineLogs({
      patient: patientData?.id,
      type: patientActivityTypes?.MEDICINE,
      limit: 40,
    });
  }, [deleteResponse, response]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name === 'medicine') {
        const medId = value?.medicine;
        const items = get(medicineList, 'results[0].items');
        const selectedItem = items?.find(
          (item) => item?.medicine?.id === medId
        );

        if (selectedItem.dosage?.form === 'Vial') {
          setBodyGraph(selectedItem);
        } else {
          setBodyGraph(null);
        }

        let unit = selectedItem.dosage?.strengthUnit;
        if (unit === 'mg/ml') {
          unit = unit.split('/');
          const keyValue = [];
          unit.forEach((ele) => {
            keyValue.push({ name: ele, value: ele });
          });
          keyValue.push({ name: 'units', value: 'units' });
          setSelectedUnits(keyValue);
        } else setSelectedUnits([{ name: unit, value: unit }]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, medicineList]);

  const toggleBodyGraphModal = () => {
    setBodyGraphModal(!isBodyGraphModal);
  };

  const formGroup = useMemo(
    () => [
      {
        ...WiredSelect({
          inputType: 'wiredSelect',
          name: 'medicine',
          label: 'Medication',
          required: requiredField,
          valueAccessor: 'medicine.id',
          labelAccessor: 'medicine.name',
          url: API_URL?.patientPrescription,
          responseKey: 'results[0].items',
          cache:false,
          params: { isActive: true, limit: 1, patient: patientData?.id },
        }),
        colSpan: 1,
      },
      {
        inputType: 'text',
        type: 'text',
        pattern: regDecimal,
        name: 'value',
        required: requiredField,
        textLabel: 'Amount',
        maxLength: { value: 5 },
        colSpan: 0.5,
      },
      {
        ...WiredSelect({
          name: 'unit',
          label: 'Amount Unit',
          required: requiredField,
          valueAccessor: 'value',
          labelAccessor: 'name',
          url: null,
          options: selectedUnits, // quantityUnitOptions,
        }),
        colSpan: 0.5,
      },
      {
        inputType: 'date',
        name: 'date',
        textLabel: 'Date',
        inputStyle: { width: '100%' },
        label: 'Date',
        // required: requiredField,
        disableFuture: true,
        minDate: dayjs().subtract(1, 'month'),
        colSpan: 1,
        // format: dateFormats.MMDDYYYY,
      },
    ],
    [response, selectedUnits]
  );

  const onSubmit = useCallback(
    (data) => {
      if (isBodyGraph && !bodyGraphValue) {
        showSnackbar({
          message: 'Please select body part',
          severity: 'error',
        });
        return;
      }

      const patientPrescription = get(medicineList, 'results[0]');
      const items = patientPrescription?.items?.find(
        (item) => item?.medicine?.id === data?.medicine
      );

      let date = convertWithTimezone(dayjs(), {
        format: dateFormats.YYYYMMMDDDTHHmmssZ,
      });
      if (data?.date) {
        date = `${dateFormatterDayjs(
          data?.date,
          dateFormats.YYYYMMDD
        )} ${dayjs().format(timeFormats.HHmm)}`;
        date = convertWithTimezone(dayjs(date), {
          format: dateFormats.YYYYMMMDDDTHHmmssZ,
        });
      }

      const payload = {
        type: patientActivityTypes.MEDICINE,
        patient: patientData?.id,
        patientPrescription: patientPrescription?.id,
        item: items?._id,
        ...data,
        date,
      };
      if (isBodyGraph) payload.bodyMapArea = bodyGraphValue?.value;

      updateMedicineLogs({ data: payload });
    },
    [isBodyGraph, bodyGraphValue, medicineList]
  );

  return (
    <PageContent loading={loading}>
      <Box sx={{ display: 'flex' }}>
        <CustomForm
          formGroups={formGroup}
          columnsPerRow={1}
          form={form}
          gridGap={2}
        />
      </Box>

      {isBodyGraph && (
        <CustomButton
          variant="outlined"
          label={`Vial injected on body part `}
          sx={{
            color: bodyGraphValue ? palette.primary.main : palette.error.main,
            fontSize: '12px',
            mt: 2,
            border: `1px solid ${palette.grey[300]}`,
          }}
          onClick={toggleBodyGraphModal}
        >
          <div
            style={{
              display: 'flex',
              marginLeft: '10px',
              alignItems: 'center',
              fontSize: '15px',
            }}
          >
            {bodyGraphValue?.title}
            <img
              style={{ width: 12, height: 12, marginLeft: '10px' }}
              alt="up-down"
              src="/assets/icons/forward.svg"
            />
          </div>
        </CustomButton>
      )}

      {isBodyGraphModal && (
        <Modal
          open={isBodyGraphModal}
          onClose={toggleBodyGraphModal}
          header={{
            title: 'Medication Logging',
          }}
        >
          <BodyMap
            modalCloseAction={toggleBodyGraphModal}
            setBodyGraphValue={setBodyGraphValue}
          />
        </Modal>
      )}
      {/* {isBodyGraph && <BodyMap />} */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        {/* <CustomButton variant="secondary" onClick={onCancel} label="Cancel" /> */}
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onSubmit)}
          label="Save"
        />
      </Box>
      {medicineLogs?.results?.length > 0 && (
        <>
          <Typography sx={{ fontSize: '14px', fontWeight: '400', mt: 2 }}>
            History
          </Typography>
          <HistoryTable
            logType={patientActivityTypes.MEDICINE}
            data={medicineLogs?.results}
            deleteEntery={deleteMedicienLogEntery}
            patient = {patientData}
            showDelete
          />
        </>
      )}
    </PageContent>
  );
};

export default MedicineLogs;
