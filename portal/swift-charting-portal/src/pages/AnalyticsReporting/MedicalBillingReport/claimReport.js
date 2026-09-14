import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, roleTypes } from 'src/lib/constants';
import {
  claimPractitionerFilterParser,
  claimReportStatusFilterParser,
  convertWithTimezone,
  dateRangeFilterParser,
  getFullName,
  getUserTimezone,
  patientFilterParser,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box, Grid, Tooltip } from '@mui/material';
import { Download } from '@mui/icons-material';
import useCRUD from 'src/hooks/useCRUD';
import viewIcon from 'src/assets/images/view.png';
import ModalComponent from 'src/components/modal';
import ViewEncounterDetails from './viewEncounterDetails';
import ViewInvoice from 'src/pages/MedicalBilling/invoices/viewInvoice';
import ClaimViewGenericModal from './claimViewGenericModal';
import dayjs from 'dayjs';

const ClaimReport = () => {
  const [claimFileId, setClaimFileId] = useState(null);
  const timezone = getUserTimezone();
  const [viewEncounterData, setViewEncounterData] = useState(null);
  const [viewEncounterModal, setViewEncounterModal] = useState(false);

  const [viewInvoiceData, setViewInvoiceData] = useState(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [encounterId, setEncounterId] = useState(null);
  const [viewClaimModal, setViewClaimModal] = useState(false);
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
    listId: `claim-report`,
    url: `${API_URL.analyticsAndReporting}/claim-report`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });

  const [responseDownload, , , handleOnFetchDataListDownload, clearDownload] =
    useCRUD({
      id: `claim-report-download`,
      url: `${API_URL.analyticsAndReporting}/claim-report-download`,
      type: REQUEST_METHOD.get,
      subscribeSocket: true,
    });

  const handleDownload = useCallback(
    async (data) => {
      if (data?.fileId) {
        clearDownload(); // Clear previous response before making a new request
        handleOnFetchDataListDownload({ fileId: data.fileId });
        setClaimFileId(data.fileId);
      }
    },
    [handleOnFetchDataListDownload, clearDownload]
  );

  useEffect(() => {
    const downloadFile = async () => {
      if (responseDownload) {
        const text = await responseDownload; // Get response as plain text
        const blob = new Blob([text], { type: 'text/plain' }); // Create Blob object
        const url = window.URL.createObjectURL(blob); // Create temporary URL

        // Create a hidden anchor element and trigger a click event to download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${claimFileId}-claims_summary.txt`; // Set the filename
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        clearDownload(); // Clear response after download to avoid using old data
      }
    };

    downloadFile();
  }, [responseDownload, clearDownload]);
  // const data = response?.results;

  const columns = [
    {
      label: 'Patient Name',
      type: 'text',
      dataKey: 'patientId',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data.patient || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Provider Name',
      type: 'text',
      dataKey: 'encounterBilling.primaryProvider',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data?.encounterBilling?.primaryProvider || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Id #',
      type: 'text',
      dataKey: 'encounterId',
      maxWidth: '11rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterId ? (
            <span
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={()=> handleViewEncounter(data)}
            >
              EN{data?.encounterId}
            </span>
          ) : (
            'N/A'
          )}
        </TableTextRendrer>
      ),
    },

    {
      label: 'Claim Id #',
      type: 'text',
      dataKey: 'claimId',
      maxWidth: '11rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.claimId ? (
            <span
            style={{
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              }}
              onClick={()=> handleViewClaim(data)}
            >
              {data?.claimId}
            </span>
          ) : (
            'N/A'
          )}
        </TableTextRendrer>
      ),
    },
    {
      label: `File Id #`,
      type: 'text',
      dataKey: 'fileId',
      maxWidth: '11rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.fileId || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Sub Total Amount',
      type: 'number',
      dataKey: 'encounterBilling.subTotal',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterBilling.subTotal
            ? `$${data?.encounterBilling.subTotal}`
            : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Insurance Submitted Amount',
      type: 'number',
      dataKey: 'encounterBilling.insuranceSubmittedAmount',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterBilling.insuranceSubmittedAmount
            ? `$${data?.encounterBilling.insuranceSubmittedAmount}`
            : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Total Amount',
      type: 'number',
      dataKey: 'encounterBilling.total',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterBilling.total
            ? `$${data?.encounterBilling.total}`
            : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Transaction Date',
      type: 'date',
      dataKey: 'createdAt',
      maxWidth: '10rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Claim Status',
      type: 'text',
      dataKey: 'claimStatus',
      maxWidth: '8rem',
      render: ({ data }) => (
        <TableTextRendrer
          style={{ maxWidth: '8rem', color: `${data?.status?.colorCode}` }}
        >
          {data?.status?.name || 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: `Invoice Id #`,
      type: 'text',
      dataKey: 'encounterBilling.encounter.invoice',
      maxWidth: '11rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterBilling?.encounter?.invoice[0]?.id ? (
            <span
              style={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={()=> handleViewInvoice(data)}
            >
              INV{data?.encounterBilling?.encounter?.invoice[0]?.id}
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
      dataKey: 'encounterBilling.encounter.invoice.createdAt',
      maxWidth: '8rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.encounterBilling?.encounter?.invoice[0]?.createdAt
            ? convertWithTimezone(
                data?.encounterBilling?.encounter?.invoice[0]?.createdAt,
                {
                  format: dateFormats.MMDDYYYY,
                }
              )
            : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Actions',
      type: 'text',
      dataKey: 'actions',
      maxWidth: '8rem',
      render: ({ data }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Download
            className={`text-blue-500 hover:text-blue-700 cursor-pointer'
}`}
            style={{
              opacity: data?.claimStatus === 'claim_status_pending' ? 0.2 : 1,
              pointerEvents:
                data?.claimStatus === 'claim_status_pending' ? 'none' : 'auto',
              cursor:
                data?.claimStatus === 'claim_status_pending'
                  ? 'default'
                  : 'pointer',
            }}
            size={20}
            onClick={() => handleDownload(data)}
          />
        </div>
      ),
    },
  ];

  const handleViewEncounter = (rowData) => {
    setViewEncounterData(rowData);
    setViewEncounterModal(true);
  };
  
  const handleCloseViewModal = () => {
    setViewEncounterData(null);
    setViewEncounterModal(false);
  };

  const handleViewInvoice = (rowData) => {
    // setViewInvoiceData(rowData);
    setViewInvoiceData({id: rowData?.encounterBilling?.encounter?.invoice[0]?.id, patientId: rowData?.patientId })
    setViewInvoiceModal(true);
  };

  const handleCloseViewInvoiceModal = () => {
    setViewInvoiceData(null);
    setViewInvoiceModal(false);
  };

  const handleViewClaim = (rowData) => {
    setEncounterId(rowData?.encounterId);
    setViewClaimModal(true);
  };
  const handleCloseViewClaimModal = () => {
    setEncounterId(null);
    setViewClaimModal(false);
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
            {
              type: 'autocomplete',
              filterProps: {
                name: 'practitionerId',
                url: API_URL.staff,
                label: '',
                labelAccessor: [
                  'title.name',
                  'firstName',
                  'middleName',
                  'lastName',
                ],
                placeholder: 'Filter by provider',
                size: 'small',
                style: { maxWidth: '200px' },
                fetchInitial: true,
                params: {
                  isActive: true,
                  limit: 300,
                  role: roleTypes.practitioner,
                },
              },
              name: 'practitionerId',
              parser: claimPractitionerFilterParser,
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
              type: 'autocomplete',
              filterProps: {
                name: 'claimStatusFilter',
                url: `${API_URL.getMasters}/general_claim_status`,
                labelAccessor: ['name'],
                params: { isActive: true, limit: 300 },
                valueAccessor: 'code',
                placeholder: 'Filter by Status',
                size: 'small',
                style: { maxWidth: '200px' },
                cache: false,
                fetchInitial: true,
              },
              name: 'claimStatus',
              parser: claimReportStatusFilterParser,
            },
          // ],
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
        ]
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
          Claim Report
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
          {viewEncounterModal && (
            <ModalComponent
              open
              header={{
                title: `View Encounter Details`,
                closeIconAction: handleCloseViewModal,
              }}
              modalStyle={{ width: '100%' }}
            >
              <ViewEncounterDetails viewEncounterData={viewEncounterData} />
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
          {viewClaimModal && (
            <ModalComponent
              open
              header={{
                title: `View Claim Details`,
                closeIconAction: handleCloseViewClaimModal,
              }}
              modalStyle={{ width: '100%' }}
            >
              <ClaimViewGenericModal
                modalCloseAction={handleCloseViewClaimModal}
                encounterId={encounterId}
              />
            </ModalComponent>
          )}
        </Container>
      </Box>
    </div>
  );
};

export default ClaimReport;
