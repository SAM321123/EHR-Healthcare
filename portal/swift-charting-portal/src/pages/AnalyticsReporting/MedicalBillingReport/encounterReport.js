import React, { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, roleTypes } from 'src/lib/constants';
import {
  assignedToIdFilterParser,
  convertWithTimezone,
  dateRangeFilterParser,
  getFullName,
  getUserTimezone,
  patientFilterParser,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box } from '@mui/material';
import EncounterViewModal from './encounterViewModal';
import ModalComponent from 'src/components/modal';
import ViewInvoice from 'src/pages/MedicalBilling/invoices/viewInvoice';
import dayjs from 'dayjs';

const EncounterReport = () => {
  const timezone = getUserTimezone();
  const [viewEncounter, setViewEncounter] = useState(false);
  const [encounterId, setEncounterId] = useState(null);
  const [viewInvoiceData, setViewInvoiceData] = useState(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  // const [startDate, setStartDate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
  ] = useQuery({
    listId: `meidcal-billing-encounter-report`,
    url: `${API_URL.analyticsAndReporting}/medical-billing-encounter-report`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });

  // const data = response?.results;
  const columns = [
    {
      label: 'Encounter Id #',
      type: 'text',
      maxWidth: '10rem',
      dataKey: 'id',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.id ? (
            <span
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={()=> handleViewEncounter(data)}
            >
              EN{data?.id}
            </span>
          ) : (
            'N/A'
          )}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Patient Name',
      type: 'text',
      dataKey: 'patientId',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data?.patient || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Assigned To',
      type: 'text',
      maxWidth: '10rem',
      dataKey: 'assignedTo',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data?.assignedTo || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Start Date',
      type: 'date',
      dataKey: 'startDate',
      maxWidth: '10rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Encounter Type',
      type: 'text',
      dataKey: 'encounterType.name',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterType?.name || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Billing Type',
      type: 'text',
      dataKey: 'billingType.name',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.billingType?.name || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Status',
      type: 'text',
      dataKey: 'atDraft',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.atDraft === true ? 'Not Signed' : 'Signed'}
        </TableTextRendrer>
      ),
    },
    {
      label: `Invoice Id #`,
      type: 'text',
      dataKey: 'invoice.id',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {data?.invoice[0]?.id ? (
          <span
            style={{
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={()=> handleViewInvoice(data)}
          >
            INV{data?.invoice[0]?.id}
          </span>
        ) : (
          'N/A'
        )}
      </TableTextRendrer>
      ),
    },
    {
      label: 'Invoice Date',
      type: 'text',
      dataKey: 'invoice.createdAt',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.invoice?.createdAt
            ? convertWithTimezone(data?.invoice?.createdAt, {
                format: dateFormats.MMDDYYYY,
              })
            : 'N/A'}
        </TableTextRendrer>
      ),
    },
  ];



  const handleViewEncounter = (rowData) => {
    setViewEncounter(true);
    setEncounterId(rowData?.id);
  };
  const handleCloseViewModal = () => {
    setViewEncounter(false);
  };

  const handleViewInvoice = (rowData) => {
    setViewInvoiceData({id: rowData?.invoice[0]?.id, patientId: rowData?.patientId});
    setViewInvoiceModal(true);
  };
  const handleCloseViewInvoiceModal = () => {
    setViewInvoiceData(null);
    setViewInvoiceModal(false);
  };
  // const handleChangePatient = (value) => {
  //   setPatientId(value ? value?.id : null);
  //   handleFilters({patientId: patientId})
  // };
  // const handleChangePractitioner = (value) => {
  //   setPractitionerId(value ? value?.id : null);
  //   handleFilters({practitionerId: practitionerId})
  // };

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          // {
            //   type: 'dateRangePicker',
          //   name: 'dateRangePicker',
          //   filterProps: {
          //     tabaleId: 'encounter_report',
          //   },
          //   parser: dateRangeFilterParser,
          // },
        // ],
        // rightComponents: [
          {
            type: 'autocomplete',
            filterProps: {
              name: 'assignedToId',
              url: API_URL.staff,
              label: '',
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              placeholder: 'Filter by assigned to',
              size: 'small',
              style: { maxWidth: '200px' },
              fetchInitial: true,
              params: {
                isActive: true,
                limit: 300,
                role: roleTypes.practitioner,
              },
            },
            name: 'assignedToId',
            parser: assignedToIdFilterParser,
          },
          {
            type: 'autocomplete',
            filterProps: {
              name: 'patientId',
              url: API_URL.patient,
              label: '',
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              placeholder: 'Filter by patient',
              size: 'small',
              style: { maxWidth: '200px' },
              fetchInitial: true,
              params: { isActive: true, limit: 300 },
            },
            name: 'patientId',
            parser: patientFilterParser,
          },
          {
          type: 'datePicker',
          name: 'from',
          filterProps: {
            maxDate: filters?.rawFilters?.to ? dayjs(filters?.rawFilters?.to) : undefined
          }
        },
        {
          type: 'datePicker',
          name: 'to',
          filterProps: {
            minDate: filters?.rawFilters?.from ? dayjs(filters?.rawFilters?.from) : undefined
          }
        },
        ],
      }),
    [filters]
  );
  return (
    <div style={{ marginTop: '40px' }}>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: '20px',
            color: palette.text.dark,
            padding: '8px',
          }}
        >
          Encounter Report
        </Typography>
        <Container
          style={{ display: 'flex', flexDirection: 'column' }}
          loading={loading}
        >
          <Table
            headerComponent={
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            }
            data={response?.results}
            totalCount={response?.totalResults}
            columns={columns}
            pagination
            rowsPerPage={rowsPerPage}
            page={page}
            handlePageChange={handlePageChange}
            loading={loading}
            sort={sort}
            handleSort={handleSort}
            wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
            timezone
          />
        </Container>
        {viewEncounter && (
          <ModalComponent
            open
            header={{
              title: `View Encounter Details`,
              closeIconAction: handleCloseViewModal,
            }}
            modalStyle={{ width: '100%' }}
          >
            <EncounterViewModal
              encounterId={encounterId}
            />
          </ModalComponent>
        )}
        {viewInvoiceModal && (
          <ModalComponent
            open
            header={{
              title: `View Invoice Details`,
              closeIconAction: handleCloseViewInvoiceModal,
            }}
            modalStyle={{ width: '100%' }}
          >
            <ViewInvoice
              modalCloseAction={handleCloseViewInvoiceModal}
              defaultData={viewInvoiceData}
            />
          </ModalComponent>
        )}
      </Box>
    </div>
  );
};

export default EncounterReport;
