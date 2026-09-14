/* eslint-disable no-param-reassign */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';

import { Divider, Grid, Link, Paper } from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';

import Box from 'src/components/Box';
import CustomForm from 'src/components/form';
import Typography from 'src/components/Typography';
import PageContent from 'src/components/PageContent';
import BackgroundLetterAvatars from 'src/components/Avatar';
import CustomButton from 'src/components/CustomButton';
import LoadingButton from 'src/components/CustomButton/loadingButton';

import { dateFormats, fileInfo, successMessage } from 'src/lib/constants';
import {
  convertWithTimezone,
  downloadFile,
  getUserRole,
  showSnackbar,
} from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import useCRUD from 'src/hooks/useCRUD';
import useAuthUser from 'src/hooks/useAuthUser';

const PatientNotes = () => {
  const params = useParams();
  const [userData] = useAuthUser();
  const patientId = params?.id || userData?.id;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

  const [
    createNotesResponse,
    ,
    createNotesLoading,
    createNotes,
    clearNotesResponse,
  ] = useCRUD({
    id: `create-notes-${patientId}`,
    url: API_URL.updatePatientNote,
    type: REQUEST_METHOD.post,
  });

  const [patientNotesResponse, , patientNotesLoading, getPatientNotes] =
    useCRUD({
      id: `patient-notes-${patientId}`,
      url: API_URL.getPatientNotes,
      type: REQUEST_METHOD.get,
    });

  const [updatePatientNoteResponse, , , updatePatientNote] = useCRUD({
    id: `patient-notes`,
    url: API_URL.updatePatientNote,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (createNotesResponse) {
      showSnackbar({
        message: successMessage.create,
      });
      setIsFormVisible(false);
      clearNotesResponse();
      getPatientNotes({ patient: patientId });
    }
  }, [createNotesResponse]);

  useEffect(() => {
    if (updatePatientNoteResponse) {
      getPatientNotes({ patient: patientId });
    }
  }, [updatePatientNoteResponse]);

  useEffect(() => {
    if (patientId) {
      getPatientNotes({ patient: patientId });
    }
  }, []);

  const handleRemoveNote = useCallback(
    (e) => {
      const noteId = e?.target?.id;
      updatePatientNote({ isDeleted: true }, `/${noteId}`);
    },
    [updatePatientNote]
  );

  const handleFormToggle = useCallback(() => {
    setIsFormVisible(!isFormVisible);
    form.reset();
  }, [form, isFormVisible]);

  const handleCommentSave = useCallback(
    (formValues) => {
      if (isEmpty(formValues?.note) && isEmpty(formValues?.file)) {
        delete formValues?.note;
        delete formValues?.file;
        return;
      }

      const userRole = getUserRole();
      createNotes({
        data: {
          note: formValues?.note,
          file: formValues?.file?.id,
          [userRole]: userData?.id,
          patient: patientId,
        },
      });
      form.reset();
    },
    [createNotes, form, patientId, userData?.id]
  );
  const handleDownload = (item) => {
    // Show snackbar message
    showSnackbar({
      message: 'Downloading...',
      severity: 'success',
    });

    // Download file
    downloadFile({ ...item?.file, patient: patientId }, `${patientId}/${item?.file?.name}`);
  };
  const commentFormGroups = useMemo(
    () => [
      {
        inputType: 'textArea',
        name: 'note',
        textLabel: 'Comment',
        multiline: true,
        colSpan: 2,
        maxLength: { value: 1000 },
      },
      {
        inputType: 'uploadFile',
        name: 'file',
        textLabel: 'Attach Files',
        showPreview: false,
        accept: '.jpg,.jpeg,.png,.pdf',
        alwaysShowLink: true,
        gridProps: { paddingTop: '6px' },
        fileInfo: {type: fileInfo.COMMENTS, patient: patientId},
      },
      {
        // eslint-disable-next-line react/no-unstable-nested-components
        component: () => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '6px',
            }}
          >
            <CustomButton
              variant="secondary"
              onClick={handleFormToggle}
              label="Cancel"
              sx={{ marginRight: '12px' }}
            />
            <LoadingButton
              loading={createNotesLoading}
              onClick={handleSubmit(handleCommentSave)}
              label="Save"
            />
          </Box>
        ),
      },
    ],
    [createNotesLoading, handleCommentSave, handleFormToggle, handleSubmit]
  );
  const getCommentAddedName = useCallback((item) => {
    if (item.clinicAdmin) {
      return item?.clinicAdmin?.name;
    }
    if (item?.practitioner) {
      return `${item?.practitioner?.firstName} ${item.practitioner.lastName}`;
    }
    if (item.assistant) {
      return `${item?.assistant?.firstName} ${item.assistant.lastName}`;
    }
    return 'N/A';
  }, []);

  return (
    <PageContent style={{ overflow: 'auto' }} loading={patientNotesLoading}>
      {patientNotesResponse?.results?.map((item) => (
        <Paper style={{ padding: '20px 20px 0px 20px' }} key={item}>
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item>
              <BackgroundLetterAvatars name={item?.patient?.name} />
            </Grid>
            <Grid justifyContent="left" item xs zeroMinWidth>
              <Typography variant="h6" style={{ margin: 0, textAlign: 'left' }}>
                {getCommentAddedName(item)}
              </Typography>
              <Typography variant="h7" style={{ textAlign: 'left' }}>
                {item.note}
              </Typography>
              {item?.file && (
                <Box sx={{ display: 'flex' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleDownload(item)
                    }
                  >
                    {item?.file?.name}
                  </Link>
                  <FileDownloadOutlined
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleDownload(item)
                    }
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  style={{ textAlign: 'left', color: 'gray' }}
                >
                  {convertWithTimezone(item.createdAt, {
                    format: dateFormats.MMMDDYYYYHHMMSS,
                  })}
                </Typography>
                <Typography
                  variant="body2"
                  id={item.id}
                  onClick={handleRemoveNote}
                  style={{
                    textAlign: 'left',
                    color: 'gray',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider variant="fullWidth" style={{ marginTop: '8px' }} />
        </Paper>
      ))}
      <Box sx={isFormVisible ? { padding: '20px' } : { padding: '10px 20px' }}>
        {isFormVisible ? (
          <CustomForm
            form={form}
            columnsPerRow={2}
            gridGap={0}
            formGroups={commentFormGroups}
          />
        ) : (
          <LoadingButton
            variant="outlined"
            component="label"
            sx={{ marginTop: '12px' }}
            label="Add Comment"
            onClick={handleFormToggle}
          />
        )}
      </Box>
    </PageContent>
  );
};

export default PatientNotes;
