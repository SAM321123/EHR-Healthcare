import { Box, CardActions, CardContent, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';
import { GET_APPOINTMENT_NOTES } from 'src/store/types';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { dateFormatter } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';

const Notes = ({modalCloseAction = () => {},appointmentId}) => {
  const [notes, setNotes] = useState('');

  const [getResponse, , , getNotesAPI, clearGetData] = useCRUD({
    id: GET_APPOINTMENT_NOTES,
    url: `${API_URL.appointmentNotes}/${appointmentId}`,
    type: REQUEST_METHOD.get,
  });

  useEffect(()=>{
    if(appointmentId)
    getNotesAPI();
  }, [appointmentId])

  useEffect(() => {
    if(getResponse)
      setNotes(getResponse);
  }, [getResponse])

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        maxWidth: '100%',
        margin: 'auto',
        width: '100%',
        height: '100%',
      }}
    >
      <CardContent>
        <Box className="form-appointment" sx={{ marginBottom: '16px' }}>
          <Box
            sx={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              whiteSpace: 'pre-wrap', 
              overflowWrap: 'break-word', 
              maxHeight: '200px', 
              overflowY: 'auto',
            }}
          >
            {notes?.length ? (
              notes.map((note, index) => (
                <Box
                  key={index}
                  sx={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word', 
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#337ab7',
                      marginBottom: '8px',
                      fontSize: '12px',
                    }}
                  >
                    {`Created At: ${
                      dateFormatter(note?.createdAt, dateFormats.MMMDDYYYYHHMMSS) || 'N/A'
                    }`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#333',
                      fontSize: '14px',
                      lineHeight: '20px',
                    }}
                    >
                      {note?.note || 'No content available.'}
                    </Typography>
                  </Box>
                  ))
                  ) : (
                <Typography
                variant="body2"
                sx={{
                  color: '#888',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                 No notes taken during this appointment.
              </Typography>
            )} 
          </Box>      
        </Box>
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          padding: '0 24px 16px 24px',
        }}
      >
        <LoadingButton
          onClick={modalCloseAction}
          label="Close"
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        />
      </CardActions>
    </Box>
  );
};

export default Notes;