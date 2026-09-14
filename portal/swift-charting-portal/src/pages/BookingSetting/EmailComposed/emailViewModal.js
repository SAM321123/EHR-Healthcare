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

const EmailViewModal = ({ open, onClose, mailId }) => {
  const [mailResponse, , mailLoading, fetchMailById] = useCRUD({
    id: 'GetEmailById',
    type: REQUEST_METHOD.get,
    url: API_URL.emailComposed,
  });

  useEffect(() => {
    if (mailId && open) {
      fetchMailById({}, `/${mailId}`);
    }
  }, [mailId, open, fetchMailById]);

  const details = mailResponse?.details || null;
  const staffList = mailResponse?.staffList || [];
  const clinics = details?.clinicName || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', py: 2 }}>
        View Logs
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {mailLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : details ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {clinics.map((clinicName) => (
              <Box key={clinicName}>
                {/* Clinic Header */}
                <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 'bold' }}>
                   🏥 {clinicName}
                </Typography>
                
                {/* Individual Scrollable Container 
                  maxHeight: controls when the scrollbar appears
                  overflowY: 'auto' ensures scrollbar only shows when needed
                */}
                <TableContainer 
                  component={Paper} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    // Custom scrollbar styling (optional)
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Staff Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Designated Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Email Address</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', textAlign: 'center' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffList
                        .filter((staff) => staff.clinicName === clinicName)
                        .map((staff, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{`${staff.firstName} ${staff.lastName}`}</TableCell>
                            <TableCell>
                              <Chip label={staff.role} size="small" variant="outlined" color="secondary" />
                            </TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={details.status} 
                                color={details.status === 'SENT' ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      
                      {staffList.filter(s => s.clinicName === clinicName).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                            No specific staff records found for this clinic.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center' }}>No detailed audit data available.</Typography>
        )}

        {/* Footer Meta Data */}
        {details && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', justifyContent: 'space-between', border: '1px solid #e0e0e0' }}>
            <Typography variant="caption"><strong>Selection:</strong> {details.selectionMode}</Typography>
            <Typography variant="caption"><strong>Sent:</strong> {new Date(details.dateTime).toLocaleString()}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary" variant="contained" sx={{ px: 4 }}>
          Close Audit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailViewModal;