/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { downloadPdf, getFullName,dateRangeFilterParser, invoicePractitionerFilterParser, getUserTimezone } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD, BASE_URL } from 'src/api/constants';

import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { INVOICES_LIST } from 'src/store/types';
import { dateFormats } from 'src/lib/constants';
import { roleTypes } from 'src/lib/constants';
import ModalComponent from 'src/components/modal';
import EncounterViewModal from '../encounterViewModal';
import ClaimViewModal from '../claimViewModal';
import dayjs from 'dayjs';

const ViewSingleInvoice = ({defaultData}) => {
    const patientId = defaultData?.patient?.id;
    const timezone = getUserTimezone();
    const [viewEncounter, setViewEncounter] = useState(false);
    const [viewClaim, setViewClaim] = useState(false);
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
    listId: `${INVOICES_LIST}`,
    url: `${API_URL.analyticsAndReporting}/patient-invoices`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {patientId, timezone}
  });


  const columns = [
    {
      label: 'Invoice Id',
      type: 'text',
      dataKey: 'id',
      sort: true,
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {`INV${data?.id}`}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Id',
      type: 'text',
      dataKey: 'encounterId',
      sort: true,
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
      label: 'Prescriber',
      type: 'text',
      dataKey: 'providerId',
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {getFullName(data?.encounter?.billing?.primaryProvider || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Invoice Date',
      type: 'date',
      dataKey: 'createdAt',
      sort: true,
      maxWidth: '10rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Amount',
      type: 'text',
      dataKey: 'totalAmount',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
        ${data?.totalAmount ? parseFloat(data?.totalAmount)?.toFixed(2) : 0.00}
        </TableTextRendrer>
    ),
    },
    {
      label: 'Payment',
      type: 'text',
      dataKey: 'totalPayment',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          ${data?.totalPayment?.toFixed(2) || 0.00}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Due',
      type: 'text',
      dataKey: 'due',
      sort: true,
      maxWidth: '10rem',
    },
    {
      label: 'Super Bill Status',
      type: 'text',
      dataKey: 'status',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.statusCode?.name || 'N/A'}
        </TableTextRendrer>
      ),
    },
  ]

   const FilterCollectionHeader = useMemo(
      () =>
        FilterComponents({
          leftComponents: [
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
            //     tabaleId: 'invoice_report'
            //   },
            //   parser: dateRangeFilterParser,
            // },
          ],
          rightComponents: [
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
                placeholder: 'Filter by Provider',
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
              parser: invoicePractitionerFilterParser,
            },
          ],
        }),
      []
    );

    const handleViewEncounter = (data) => {
      setViewEncounter(true);
      setEncounterId(data?.encounterId);
    }
    const handleCloseViewModal = () => {
      setViewEncounter(false);
    };
    const handleViewClaim = (data) => {
      setViewClaim(true);
      setEncounterId(data?.encounterId);
    }
    const handleCloseViewClaim = () => {
      setViewClaim(false);
    };

  const moreActions = (row) => {
    const actions = [{
          label: 'Print',
          icon: 'print',
          action: (row) => {
            if (row?.id)
              downloadPdf( 
            `/${API_URL.downloadPatientInvoicePDF}/${row?.id}`
          );
        },
      }]
      
      if (row?.encounter?.billingTypeCode === 'insurance_billing_Type') {
        actions.push(
          {
            label: 'Claim', 
            icon: 'view',
            action: (row) => handleViewClaim(row),
        })
      }
    return actions;
  };
  return (
    <>
      <Container
        loading={ loading }
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Table
           headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={response?.results || []}
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
          moreActions={row => moreActions(row)}
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
      {viewClaim && (
        <ModalComponent
          open
          header={{
            title: `View Claim Details`,
            closeIconAction: handleCloseViewClaim,
          }}
          modalStyle={{ width: '100%' }}
        >
          <ClaimViewModal encounterId={encounterId}/>
        </ModalComponent>
      )}
    </>
  );
};

export default ViewSingleInvoice;