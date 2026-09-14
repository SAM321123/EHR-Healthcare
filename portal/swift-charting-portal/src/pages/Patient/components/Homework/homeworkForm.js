/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import {
  dateFormats,
  regexCustomText,
  requiredField,
  successMessage,
} from 'src/lib/constants';
import {
  convertToUtc,
  convertWithTimezone,
  dateFormatterDayjs,
  getUTCDateTime,
  getUpdatedFieldsValue,
  showSnackbar,
} from 'src/lib/utils';
import { SAVE_HOMEWORK_DATA } from 'src/store/types';
import { decrypt } from 'src/lib/encryption';
import {
  WiredMasterAutoComplete,
  WiredMasterField,
} from 'src/wiredComponent/Form/FormFields';
import ModalComponent from 'src/components/modal';
import IcdBrowser from '../Medication/icdBrowser';

const HomeworkForm = ({ modalCloseAction, refetchData, defaultData }) => {
  const form = useForm({ mode: 'onChange' });
  const [icdBrowserModal, setIcdBrowserModal] = useState();

  const { handleSubmit, setValue } = form;
  const params = useParams();
  let { patientId } = params || {};
  patientId = decrypt(patientId);

  const id = defaultData?.id;

  const handleIcdBrowser = useCallback(() => {
    setIcdBrowserModal(true);
  }, []);

  const homeworkFormGroups = useMemo(
    () => [
      {
        inputType: 'text',
        name: 'title',
        textLabel: 'Title',
        pattern: regexCustomText,
        required: requiredField,
        colSpan: 1,
      },
      {
        ...WiredMasterAutoComplete({
          url: API_URL.diagnosisIcd,
          label: 'Diagnosis',
          name: 'ICDId',
          colSpan: 0.7,
          placeholder: 'Search by keyword(S) or code',
          cache: false,
          labelAccessor: 'name',
          valueAccessor: 'code',
          required: requiredField,
          showDescription: true,
          descriptionAccessor: 'description',
          filter: { isActive: true },
        }),
      },
      {
        component: () => (
          <div
            style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}
          >
            <LoadingButton label="BROWSER" onClick={handleIcdBrowser} />
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
      {
        ...WiredMasterField({
          code: 'homework_status',
          filter: { limit: 20 },
          name: 'statusCode',
          label: 'Status',
          labelAccessor: 'name',
          valueAccessor: 'code',
          colSpan: 0.33,
          placeholder: 'Select',
          required: requiredField,
          cache: false,
        }),
      },
      {
        inputType: 'date',
        name: 'startDate',
        textLabel: ' Start Date',
        required: requiredField,
        colSpan: 0.33,
      },
      {
        inputType: 'date',
        name: 'endDate',
        textLabel: ' End Date',
        required: requiredField,
        colSpan: 0.33,
      },
      {
        inputType: 'textArea',
        name: 'goalsOfExcercise',
        textLabel: 'Goals Of Exercise',
        placeholder: 'write here',
        colSpan: 1,
        required: requiredField,
        pattern: regexCustomText,
      },
      {
        inputType: 'textArea',
        name: 'suggestions',
        textLabel: 'Suggestions',
        placeholder: 'write here',
        colSpan: 1,
        required: requiredField,
        pattern: regexCustomText,
      },
    ],
    [handleIcdBrowser]
  );
  const [response, , loading, callHomeworkSaveAPI, clearData] = useCRUD({
    id: SAVE_HOMEWORK_DATA,
    url: API_URL.homework,
    type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const closeIcdBrowserModal = useCallback(() => {
    setIcdBrowserModal(false);
  }, []);

  const handleIcdBrowserSave = useCallback(
    (selectedPatientDiagnosis) => {
      if (selectedPatientDiagnosis.length) {
        setValue('ICDId', selectedPatientDiagnosis[0], {
          shouldValidate: true,
        });
      }
      closeIcdBrowserModal();
    },
    [setValue, closeIcdBrowserModal]
  );

  const onHandleSubmit = useCallback(
    (data) => {
      if (data.ICDId) {
        data.ICDId = data.ICDId.id;
      }
      if (isEmpty(defaultData)) {
        const newData = data;
        if (newData.startDate) {
          newData.startDate = getUTCDateTime(newData.startDate);
        }
        if (newData.endDate) {
          newData.endDate = getUTCDateTime(newData.endDate);
        }

        callHomeworkSaveAPI({ data: { ...newData, patientId } });
      } else {
        delete data?.createdBy;
        delete data?.diagnosisIcd;
        const updatedFields = getUpdatedFieldsValue(data, defaultData);

        if (updatedFields.startDate) {
          updatedFields.startDate = getUTCDateTime(updatedFields.startDate);
        }
        if (updatedFields.endDate) {
          updatedFields.endDate = getUTCDateTime(updatedFields.endDate);
        }
        if (!isEmpty(updatedFields)) {
          callHomeworkSaveAPI({ ...updatedFields }, `/${id}`);
        } else {
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        }
      }
    },
    [callHomeworkSaveAPI, defaultData, id]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: isEmpty(defaultData)
          ? successMessage.create
          : successMessage.update,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [refetchData, response]);

  return (
    <Box>
      <CardContent>
        <CustomForm
          form={form}
          formGroups={homeworkFormGroups}
          columnsPerRow={1}
          defaultValue={defaultData}
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
          onClick={modalCloseAction}
          label="Cancel"
        />
        <LoadingButton
          loading={loading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
        />
      </CardActions>
      {icdBrowserModal && (
        <ModalComponent
          open={icdBrowserModal}
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
              singleSelection={true}
            />
          </Box>
        </ModalComponent>
      )}
    </Box>
  );
};

export default HomeworkForm;
