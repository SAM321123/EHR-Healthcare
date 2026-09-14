import React, { useCallback, useEffect, useMemo } from 'react';
import CardContent from '@mui/material/CardContent';
import { useForm } from 'react-hook-form';
import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import { WiredSelect } from 'src/wiredComponent/Form/FormFields';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { CardActions } from '@mui/material';
import CustomButton from 'src/components/CustomButton';
import useCRUD from 'src/hooks/useCRUD';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import {
  inputLength,
  noHtmlTagPattern,
  requiredField,
} from 'src/lib/constants';
import useAuthUser from 'src/hooks/useAuthUser';
import Typography from 'src/components/Typography';
import { History } from './PatientNotesHistory';

export const formGroupTags = [
  {
    ...WiredSelect({
      label: 'Tags',
      name: 'tags',
      valueAccessor: 'id',
      labelAccessor: 'name',
      url: '',
      multiple: true,
      cache: false,
      params: { isActive: true },
      required: requiredField,
    }),
    colSpan: 1,
  },
];

export const formGroupNote = [
  {
    inputType: 'text',
    name: 'note',
    textLabel: 'Note',
    multiline: true,
    minRows: 3,
    required: requiredField,
    maxLength: { ...inputLength.textArea },
    pattern: noHtmlTagPattern,
  },
];

const AddPatientTags = ({
  type,
  getDetail,
  modalCloseAction,
  patientId,
  patientNote,
}) => {
  const [userData] = useAuthUser();
  const { practice } = userData || {};

  const formFields = useMemo(() => {
    if (type === 'tags') {
      formGroupTags[0].url = `${API_URL.getMasters}/PATIENT_TAGS?page=1&limit=100&practice=${practice?.id}`;
      return formGroupTags;
    }
    return formGroupNote;
  }, []);

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const [response, , loading, updatePatient, clearData] = useCRUD({
    id: `ADD_TAGS_${type}`,
    url: API_URL.patient,
    type: REQUEST_METHOD.update,
  });

  const [toggleResponse, , , updateStatus, clearToggleResponse] = useCRUD({
    id: `UPDATE_STATUS`,
    url: API_URL.patient,
    type: REQUEST_METHOD.update,
  });

  const handleSaveAccountDetails = useCallback((data) => {
    updatePatient({ ...data }, `/${patientId}`);
  }, []);

  useEffect(() => {
    if (response) {
      getDetail();
      modalCloseAction('');
      clearData();
    }
  }, [response]);

  useEffect(() => {
    if (toggleResponse) {
      getDetail();
      clearToggleResponse();
    }
  }, [toggleResponse]);

  const toggleStatus = (index) => {
    const obj = {
      ...patientNote[index],
      isActive: !patientNote[index]?.isActive,
    };
    // eslint-disable-next-line no-param-reassign
    patientNote[index] = obj;
    updateStatus(
      { noteIndex: index, noteStatus: obj?.isActive },
      `/${patientId}`
    );
  };

  return (
    <Box sx={{ minWidth: '400px' }}>
      <Box>
        <CardContent>
          <CustomForm formGroups={formFields} form={form} columnsPerRow={1} />
          <CardActions sx={{ justifyContent: 'center', mt: 4 }}>
            <CustomButton
              variant="secondary"
              onClick={() => modalCloseAction('')}
              label="Cancel"
            />
            <LoadingButton
              loading={loading}
              onClick={handleSubmit(handleSaveAccountDetails)}
              label="Save"
            />
          </CardActions>
          {Array.isArray(patientNote) &&
            patientNote?.length > 0 &&
            type !== 'tags' && (
              <>
                <Typography sx={{ fontSize: '14px', fontWeight: '700', mt: 2 }}>
                  History
                </Typography>
                <History data={patientNote} toggleStatus={toggleStatus} />
              </>
            )}
        </CardContent>
      </Box>
    </Box>
  );
};

export default AddPatientTags;
