import React, { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import {
  getFullName,
  getUserTimezone,
} from 'src/lib/utils';
import palette from 'src/theme/palette';
import Typography from 'src/components/Typography';
import Container from 'src/components/Container';
import { Box } from '@mui/material';
import ModalComponent from 'src/components/modal';
import ViewSingleInvoice from './viewSingleInvoice';

const InvoiceReport = () => {
  const timezone = getUserTimezone();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState();

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
    listId: `invoice-report`,
    url: `${API_URL.analyticsAndReporting}/invoice-report`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: {
      timezone,
    },
  });

  const columns = [
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
        label: 'Invoice Count',
        type: 'text',
        dataKey: 'invoiceCount',
        maxWidth: '10rem',
        render: ({ data }) => (
          <TableTextRendrer style={{ maxWidth: '8rem' }}>
            {data?.invoiceCount}
          </TableTextRendrer>
        ),
      },
      {
        label: 'Invoice Amount',
        type: 'text',
        dataKey: 'patientId',
        maxWidth: '10rem',
        render: ({ data }) => (
          <TableTextRendrer style={{ maxWidth: '8rem' }}>
            ${data?.invoiceTotalAmount || 0.00}
          </TableTextRendrer>
        ),
      },
      {
        label: 'Payment Collected',
        type: 'text',
        dataKey: 'patientId',
        maxWidth: '10rem',
        render: ({ data }) => (
          <TableTextRendrer style={{ maxWidth: '8rem' }}>
             ${data?.invoiceTotalPayment || 0.00}
          </TableTextRendrer>
        ),
      },
      {
        label: 'Due',
        type: 'text',
        dataKey: 'due',
        maxWidth: '10rem',
        render: ({ data }) => (
          <TableTextRendrer style={{ maxWidth: '8rem' }}>
            ${data.patient?.due || 0.00}
          </TableTextRendrer>
        ),
      },
  ];


  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
            {
              type: 'search',
              filterProps: {
                placeholder: 'Search patient',
                size: 'small',
              },
              name: 'searchText',
            },
        //   {
        //     type: 'dateRangePicker',
        //     name: 'dateRangePicker',
        //     parser: dateRangeFilterParser,
        //   },
        ],
      }),
    []
  );
   
    const viewInvoice = useCallback((data) => {
      if (data) {
          setModalOpen(true);
          setDefaultData(data);
      }
    }, []);
    const closeInvoiceModal = useCallback(() => {
      setModalOpen(false);
      setDefaultData(null);
    }, []);
    

  const moreActions = [
    {
        label: 'View',
        icon: 'view',
        action: viewInvoice,
    },];

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
          Invoice Report
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
            data={response?.data}
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
            actionButtons={moreActions}
          />
        </Container>
         {modalOpen && (
            <ModalComponent
                open={modalOpen}
                header={{
                title: 'View Invoice',
                closeIconAction: closeInvoiceModal,
                }}
                modalStyle={{width:'100%'}}
                boxStyle={{width:'90% !important',maxWidth:'unset'}}
            >
                <ViewSingleInvoice
                    modalCloseAction={closeInvoiceModal}
                    defaultData={defaultData}
                />
            </ModalComponent>
            )}
      </Box>
    </div>
  );
};

export default InvoiceReport;
