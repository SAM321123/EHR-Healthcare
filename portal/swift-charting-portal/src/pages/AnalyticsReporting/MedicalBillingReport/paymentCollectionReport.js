import React, { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { dateFormats, roleTypes } from 'src/lib/constants';
import {
  claimPractitionerFilterParser,
  convertWithTimezone,
  dateRangeFilterParser,
  getFullName,
  getUserTimezone,
  patientFilterParser,
  practiceLocationFilterParser,
  procedureCodeFilterParser,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box } from '@mui/material';
import EncounterViewModal from './encounterViewModal';
import ModalComponent from 'src/components/modal';
import dayjs from 'dayjs';

const PaymentCollectionReport = () => {
  const timezone = getUserTimezone();
  const [viewEncounter, setViewEncounter] = useState(false);
  const [encounterId, setEncounterId] = useState(null);

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
    listId: `procedure-report`,
    url: `${API_URL.analyticsAndReporting}/patient-payments`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });


  const handleViewEncounter = (data) => {
    setViewEncounter(true);
    setEncounterId(data?.encounterId);
  }
  const handleCloseViewModal = () => {
    setViewEncounter(false);
  };

  // const data = response?.results;
  const columns = [
    {
      label: 'Provider',
      type: 'text',
      dataKey: 'patientId',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data?.primaryProvider || {})}
        </TableTextRendrer>
      ),
    },
    {
        label: 'Patient',
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
        label: 'Encounter Id#',
        type: 'text',
        dataKey: 'encounterId',
        sort: true,
        maxWidth: '10rem',
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
        label: 'Payment Date',
        type: 'date',
        dataKey: 'paymentDate',
        sort: true,
        maxWidth: '10rem',
        format: dateFormats.MMDDYYYY,
        render: ({ data }) => {
          const date = data?.paymentDate ? 
          convertWithTimezone(data.paymentDate, { format: dateFormats.MMDDYYYY }) : 'N/A';
          return <TableTextRendrer>{date}</TableTextRendrer>;
        },
        
      },
      {
        label: 'Cash Payment',
        type: 'text',
        dataKey: 'cash',
        sort: true,
        maxWidth: '10rem',
        render: ({ data }) => (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
            ${data.cash || 0.00}
            </TableTextRendrer>
        ),
      },
      {
        label: 'Pre Paid Payment',
        type: 'text',
        dataKey: 'prePaidCash',
        sort: true,
        maxWidth: '10rem',
        render: ({ data }) => (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
            ${data.prePaidCash || 0.00}
            </TableTextRendrer>
        ),
      },
      {
        label: 'Insurance Payment',
        type: 'text',
        dataKey: 'insuranceSubmittedAmount',
        sort: true,
        maxWidth: '10rem',
        render: ({ data }) => (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${data.insuranceSubmittedAmount || 0.00}
            </TableTextRendrer>
        ),
      },
      {
        label: 'Card Payment',
        type: 'text',
        dataKey: 'cardAmount',
        sort: true,
        maxWidth: '10rem',
        render: ({ data }) => (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${data.cardAmount || 0.00}
            </TableTextRendrer>
        ),
      },
      {
        label: 'Invoice Payment',
        type: 'text',
        dataKey: 'invoiceAmount',
        maxWidth: '10rem',
        render: ({data}) =>{
          const totalPaymentAmount = data?.encounter?.invoice?.reduce((sum, item) => {
            return sum + (parseFloat(item?.paymentAmount) || 0);
          }, 0);
          return(
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${totalPaymentAmount || 0.00}
            </TableTextRendrer>
          )
        },
      },
      {
        label: 'Tax',
        type: 'text',
        dataKey: 'tax',
        maxWidth: '10rem',
        render: ({ data }) => {
          const totalTax = data?.encounterProcedureCodes?.reduce((total, code) => {
            let taxPer = 0;
            if(code?.addOnFields?.taxPer){
              taxPer = (code?.addOnFields?.price * code?.addOnFields?.taxPer)/100;
            }
            const tax = (code?.addOnFields?.taxAmt || taxPer) || 0; 
            return total + tax;
          }, 0);
      
          return (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${totalTax || 0.00}
            </TableTextRendrer>
          );
        },
      },
      {
        label: 'Co-pay/balance',
        type: 'text',
        dataKey: 'tax',
        maxWidth: '10rem',
        render: ({ data }) => {
          const totalPaymentAmount = data?.encounter?.invoice?.reduce((sum, item) => {
            return sum + (parseFloat(item?.paymentAmount) || 0);
          }, 0);
          const balance = data?.balance - totalPaymentAmount;
          return (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${balance.toFixed(2)|| 0.00}
            </TableTextRendrer>
          );
        },
      },
      {
        label: 'Total Price',
        type: 'text',
        dataKey: 'patientId',
        maxWidth: '10rem',
        render: ({ data }) => {
          // const totalTax = data?.encounterProcedureCodes?.reduce((total, code) => {
          //   const tax = code?.addOnFields?.taxAmt || 0; 
          //   return total + tax;
          // }, 0);
          // const total = (parseFloat(data?.cash) || 0) + 
          // (parseFloat(data?.prePaidCash) || 0) +
          // (parseFloat(data?.insuranceSubmittedAmount) || 0)+
          // (parseFloat(data?.cardAmount) || 0)
          return (
            <TableTextRendrer style={{ maxWidth: '8rem' }}>
              ${data?.total|| 0.00}
            </TableTextRendrer>
          )
        }
      },
  ];


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
              name: 'locationId',
              url: API_URL.practiceLocation,
              label: '',
              labelAccessor: [
                'name',
              ],
              placeholder: 'Filter by Location',
              size: 'small',
              style: { maxWidth: '200px' },
              fetchInitial: true,
              params: {
                isActive: true,
              },
            },
            name: 'locationId',
            parser: practiceLocationFilterParser,
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
          // {
          //   type: 'dateRangePicker',
          //   name: 'dateRangePicker',
          //   filterProps: {
          //     tabaleId: 'payment_report'
          //   },
          //   parser: dateRangeFilterParser,
          // },
        // ],
        // rightComponents: [
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
          Payment Collection Report
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
      </Box>
    </div>
  );
};

export default PaymentCollectionReport;
