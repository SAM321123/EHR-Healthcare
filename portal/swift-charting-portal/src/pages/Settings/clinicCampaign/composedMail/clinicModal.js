import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';

import useCRUD from 'src/hooks/useCRUD';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

const EmailClinicViewModal = ({ open, onClose, mailId }) => {
  const [mailResponse, , mailLoading, fetchMailById] = useCRUD({
    id: 'GetEmailById',
    type: REQUEST_METHOD.get,
    url: API_URL.composeMail,
  });

  useEffect(() => {
    if (mailId && open) {
      fetchMailById({}, `/${mailId}`);
    }
  }, [mailId, open, fetchMailById]);

  const details = mailResponse?.details || null;
  const staffList = mailResponse?.staffList || [];

  // console.log(
  //   '------------------------1111111111111111111122222222222222',
  //   details
  // );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
        }}
      >
        View Logs
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {mailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : details ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', color: 'text.secondary' }}
            >
              Targeted Patients ({staffList.length})
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Patient Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Email Address
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Dispatch Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffList.length > 0 ? (
                    staffList.map((staff, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          {`${staff.firstName} ${staff.lastName}`}
                        </TableCell>
                        <TableCell>{staff.email || 'N/A'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={details.status}
                            color={
                              details.status === 'SENT' ? 'success' : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          No recipient records found for this batch.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Meta Info Section */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: '1px dashed #ccc',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    color="textSecondary"
                  >
                    SEND MODE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {details.sendTo}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    color="textSecondary"
                  >
                    CREATED AT
                  </Typography>
                  <Typography variant="body2">
                    {new Date(details.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            No dispatch details found.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailClinicViewModal;
