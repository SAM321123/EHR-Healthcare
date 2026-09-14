import React from 'react';
import { Route, Routes } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import Box from 'src/components/Box';
import { convertWithTimezone } from 'src/lib/utils';
import useQuery from 'src/hooks/useQuery';
import useAuthUser from 'src/hooks/useAuthUser';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageContent from 'src/components/PageContent';
import { dateFormats } from 'src/lib/constants';
import PageHeader from 'src/components/PageHeader';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import PatientPrescription from './PatientPrescription';

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          {convertWithTimezone(row?.createdAt, {
            format: dateFormats.MMMDDYYYYHHMMSS,
          })}
        </TableCell>
        <TableCell align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1 }}>
              <PatientPrescription prescriptionId={row?.id} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const EPrescriptionList = () => {
  const [userData] = useAuthUser();
  const patientId = userData?.id;

  const [patientPharmacyOrderList, loading] = useQuery({
    listId: 'PATIENT_PHARMACY_ORDER_LIST_DATA',
    url: API_URL.patientPrescription,
    type: REQUEST_METHOD.get,
    queryParams: {
      patient: patientId,
      isActive: true,
      isApproved: true,
    },
  });
  return (
    <PageContent loading={loading} style={{ overflow: 'scroll' }}>
      <PageHeader title="Med Instructions" />
      <TableContainer>
        <Table aria-label="collapsible table">
          <TableBody>
            {!isEmpty(patientPharmacyOrderList?.results) ? (
              patientPharmacyOrderList?.results?.map((row) => (
                <Row key={row?.id} row={row} />
              ))
            ) : (
              <Typography
                sx={{
                  ml: 1,
                  color: palette.grey[600],
                }}
              >
                No record found
              </Typography>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageContent>
  );
};

const EPrescription = () => (
  <PageContent style={{ overflow: 'auto' }}>
    <Routes>
      <Route path="/" element={<EPrescriptionList />} />
      <Route path="/:prescriptionId" element={<PatientPrescription />} />
    </Routes>
  </PageContent>
);

export default EPrescription;
