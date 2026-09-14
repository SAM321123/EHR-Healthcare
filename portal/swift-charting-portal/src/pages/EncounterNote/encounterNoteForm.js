/* eslint-disable no-unused-vars */
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { successMessage } from 'src/lib/constants';
import {  showSnackbar } from 'src/lib/utils';
import { SAVE_ENCOUNTER_NOTE_DATA } from 'src/store/types';
import { encounterNoteFormGroup } from './formGroup';
import EncounterNoteList from './encounterNoteList';

const ENCOUNTER_NOTE_TYPES = {
  note: 'note',
  addendum: 'addendum',
};

const isMatchingNoteType = (note, noteType) => {
  if (noteType === ENCOUNTER_NOTE_TYPES.addendum) {
    return note?.noteType === ENCOUNTER_NOTE_TYPES.addendum;
  }

  return note?.noteType !== ENCOUNTER_NOTE_TYPES.addendum;
};

const EncounterNoteForm = ({ modalCloseAction, refetchData, encounterData, noteType = ENCOUNTER_NOTE_TYPES.note }) => {
  const form = useForm({ mode: 'onChange' });
  const { handleSubmit } = form;

    
  const encounterId = encounterData?.id;
  const patientId = encounterData?.patientId;
  const buttonLabel = noteType === ENCOUNTER_NOTE_TYPES.addendum ? 'Add Addendum' : 'Add Note';
  const emptyMessage =
    noteType === ENCOUNTER_NOTE_TYPES.addendum ? 'No Encounter Addendum Found' : 'No Encounter Notes Found';
  const filteredNotes = encounterData?.notes?.filter((note) => isMatchingNoteType(note, noteType)) || [];
  

  const [response, , loading, callAllergiesSaveAPI, clearData] = useCRUD({
    id: SAVE_ENCOUNTER_NOTE_DATA,
    url: API_URL.encounterNote,
    type: REQUEST_METHOD.post ,
  });

  const onHandleSubmit = useCallback(
    (data) => {
        const newData = data;
        
        callAllergiesSaveAPI({ data: { ...newData, noteType, patientId, encounterId } });
     
    },
    [callAllergiesSaveAPI, noteType, patientId, encounterId]
  );

  useEffect(() => {
    if (!isEmpty(response)) {
      showSnackbar({
        message: successMessage.create,
        severity: 'success',
      });
      clearData();
      refetchData();
      modalCloseAction();
    }
  }, [clearData, modalCloseAction, refetchData, response]);

  return (
    <Box>
      <CardContent>
        <EncounterNoteList notes={filteredNotes} emptyMessage={emptyMessage} />
        <CustomForm
          form={form}
          formGroups={encounterNoteFormGroup}
          columnsPerRow={1}
        />
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          paddingLeft:'24px',
          paddingRight:'24px',
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
          label={buttonLabel}
        />
      </CardActions>
    </Box>
  );
};

export default EncounterNoteForm;
