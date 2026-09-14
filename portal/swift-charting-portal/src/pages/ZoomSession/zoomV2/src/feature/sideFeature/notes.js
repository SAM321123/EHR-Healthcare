// import { Box, CardActions, CardContent, Typography } from '@mui/material';
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { API_URL, REQUEST_METHOD } from 'src/api/constants';
// import CustomForm from 'src/components/form';
// import useCRUD from 'src/hooks/useCRUD';
// import { ADD_APPOINTMENT_NOTES, GET_APPOINTMENT_NOTES, VALIDATE_ZOOM_SESSION_INVITE } from 'src/store/types';
// import LoadingButton from 'src/components/CustomButton/loadingButton';
// import { isEmpty, set } from 'lodash';
// import { dateFormatter, showSnackbar } from 'src/lib/utils';
// import { dateFormats, successMessage } from 'src/lib/constants';

// const Notes = () => {
//   const [{ sessionDetail: { appointment = {} } = {} }] = useCRUD({
//     id: VALIDATE_ZOOM_SESSION_INVITE,
//     url: API_URL.validateZoomSessionInvite,
//     type: REQUEST_METHOD.post,
//   });

//   const appointmentId = appointment?.id;
//   const [notes, setNotes] = useState(''); // Keep track of combined notes

//   const form = useForm({ mode: 'onChange' });
//   const { handleSubmit, reset } = form;

//   const formFields = [
//     {
//       inputType: 'textArea',
//       name: 'note',
//       textLabel: 'New Note',
//       colSpan: 1,
//     },
//   ];

//   const [getResponse, , , getNotesAPI, clearGetData] = useCRUD({
//     id: GET_APPOINTMENT_NOTES,
//     url: `${API_URL.appointmentNotes}/${appointmentId}`,
//     type: REQUEST_METHOD.get,
//   });
//   const [response, , loading, callAppointmentNoteSaveAPI, clearData] = useCRUD({
//     id: ADD_APPOINTMENT_NOTES,
//     url: API_URL.appointmentNotes,
//     type: REQUEST_METHOD.post,
//   });

//   useEffect(()=>{
//     if(appointmentId)
//     getNotesAPI();
//   }, [appointmentId])

//   useEffect(() => {
//     if(getResponse)
//       setNotes(getResponse);
//   }, [getResponse])
//   useEffect(() => {
//     if (!isEmpty(response)) {
//       showSnackbar({
//         message: successMessage.create,
//         severity: 'success',
//       });
//       clearData();
//     }
//   }, [response, clearData]);

//   const onHandleSubmit = useCallback(
//     (data) => {
//       if (!data.note?.trim()) {
//         showSnackbar({
//           message: 'No changes found',
//           severity: 'error',
//         });
//         return; // Prevent submission if the note is empty
//       }
//       const updatedNotes =  { note: data.note, appointmentId:appointmentId };
//       callAppointmentNoteSaveAPI({ data: updatedNotes });
//       getNotesAPI();
//       reset(); // Clear the textarea for new input
//     },
//     [callAppointmentNoteSaveAPI, notes, appointmentId, reset]
//   );

//   return (
//     <Box
//       sx={{
//         backgroundColor: '#fff',
//         borderRadius: '8px',
//         boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
//         padding: '16px',
//         maxWidth: '100%',
//         margin: 'auto',
//         width: '100%',
//         height: '100%',
//       }}
//     >
//       <CardContent>
//         <Box className="form-appointment" sx={{ marginBottom: '16px' }}>
//           <CustomForm
//             form={form}
//             formGroups={formFields}
//             columnsPerRow={1}
//           />
//           <Box
//             sx={{
//               marginTop: '16px',
//               padding: '12px',
//               borderRadius: '8px',
//               whiteSpace: 'pre-wrap', // Preserve line breaks
//               overflowWrap: 'break-word', // Handle long words
//               maxHeight: '200px', // Set a maximum height for the box
//               overflowY: 'auto', // Enable vertical scrolling
//             }}
//           >
//             {notes?.length ? (
//               notes.map((note, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     marginBottom: '16px',
//                     padding: '12px',
//                     backgroundColor: '#f9f9f9',
//                     borderRadius: '8px',
//                     whiteSpace: 'pre-wrap', // Preserve line breaks
//                     overflowWrap: 'break-word', // Handle long words
//                     maxHeight: '200px', // Set a maximum height for the box
//                     overflowY: 'auto', // Enable vertical scrolling
//                     boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
//                   }}
//                 >
//                   <Typography
//                     variant="subtitle2"
//                     sx={{
//                       color: '#337ab7',
//                       marginBottom: '8px',
//                       fontSize: '12px',
//                     }}
//                   >
//                     {`Created At: ${
//                       dateFormatter(note?.createdAt, dateFormats.MMMDDYYYYHHMMSS) || 'N/A'
//                     }`}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       color: '#333',
//                       fontSize: '14px',
//                       lineHeight: '20px',
//                     }}
//                     >
//                       {note?.note || 'No content available.'}
//                     </Typography>
//                   </Box>
//                   ))
//                   ) : (
//                 <Typography
//                 variant="body2"
//                 sx={{
//                   color: '#888',
//                   fontSize: '14px',
//                   textAlign: 'center',
//                 }}
//               >
//                 No notes yet.
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       </CardContent>
//       <CardActions
//         sx={{
//           justifyContent: 'flex-start',
//           padding: '0 24px 16px 24px',
//         }}
//       >
//         <LoadingButton
//           loading={loading}
//           onClick={handleSubmit(onHandleSubmit)}
//           label="Submit"
//           sx={{
//             backgroundColor: '#1976d2',
//             color: '#fff',
//             '&:hover': {
//               backgroundColor: '#1565c0',
//             },
//           }}
//         />
//       </CardActions>
//     </Box>
//   );
// };

// export default Notes;

import { Box, CardActions, CardContent, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import CustomForm from 'src/components/form';
import useCRUD from 'src/hooks/useCRUD';
import { ADD_APPOINTMENT_NOTES, GET_APPOINTMENT_NOTES, VALIDATE_ZOOM_SESSION_INVITE } from 'src/store/types';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { isEmpty } from 'lodash';
import { dateFormatter, showSnackbar } from 'src/lib/utils';
import { dateFormats, successMessage } from 'src/lib/constants';

const Notes = () => {
  const [{ sessionDetail: { appointment = {} } = {} }] = useCRUD({
    id: VALIDATE_ZOOM_SESSION_INVITE,
    url: API_URL.validateZoomSessionInvite,
    type: REQUEST_METHOD.post,
  });

  const appointmentId = appointment?.id;
  const [notes, setNotes] = useState([]);

  const form = useForm({ mode: 'onChange' });
  const { handleSubmit, reset } = form;

  const formFields = [
    {
      inputType: 'textArea',
      name: 'note',
      textLabel: 'New Note',
      colSpan: 1,
    },
  ];

  const [getResponse, , getLoading, getNotesAPI] = useCRUD({
    id: GET_APPOINTMENT_NOTES,
    url: `${API_URL.appointmentNotes}/${appointmentId}`,
    type: REQUEST_METHOD.get,
  });
  const [appointmentNotes, , saveLoading, callAppointmentNoteSaveAPI] = useCRUD({
    id: ADD_APPOINTMENT_NOTES,
    url: API_URL.appointmentNotes,
    type: REQUEST_METHOD.post,
  });

  useEffect(()=>{
    if(appointmentId) getNotesAPI();
  }, [appointmentId, getNotesAPI]);

  useEffect(() => {
    // if (!isEmpty(getResponse)) {
    if (isEmpty(appointmentNotes)) {
      setNotes(getResponse);
    }else {
      setNotes(appointmentNotes)
    }
  }, [getResponse, appointmentNotes]);

  // Handle form submission
  const onHandleSubmit = useCallback(
    async (data) => {
      if (!data.note?.trim()) {
        showSnackbar({
          message: 'Note cannot be empty',
          severity: 'error',
        });
        return;
      }

      const updatedNotes = { note: data.note, appointmentId };

      try {
        await callAppointmentNoteSaveAPI({ data: updatedNotes });
        await getNotesAPI(); // Refresh notes after saving
        reset(); // Clear the form
        showSnackbar({
          message: 'Note saved successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error saving note:', error);
        showSnackbar({
          message: 'Failed to save note',
          severity: 'error',
        });
      }
    },
    [callAppointmentNoteSaveAPI, getNotesAPI, appointmentId, reset]
  );

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
        <CustomForm form={form} formGroups={formFields} columnsPerRow={1} />
        <Box
          sx={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {notes?.length ? (
            notes?.map((note, index) => (
              <Box
                key={index}
                sx={{
                  marginBottom: '12px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
                  {`Created At: ${dateFormatter(note?.createdAt, dateFormats.MMMDDYYYYHHMMSS) || 'N/A'}`}
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
      </CardContent>
      <CardActions
        sx={{
          justifyContent: 'flex-start',
          padding: '0 24px 16px 24px',
        }}
      >
        <LoadingButton
          loading={saveLoading}
          onClick={handleSubmit(onHandleSubmit)}
          label="Save"
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
