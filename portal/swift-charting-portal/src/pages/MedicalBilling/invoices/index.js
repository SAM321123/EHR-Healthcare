/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { getFullName, practitionerFilterParser, showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import ModalComponent from 'src/components/modal';

import TableTextRendrer from 'src/components/TableTextRendrer';
import InvoiceForm from './invoiceForm';
import useQuery from 'src/hooks/useQuery';
import { GET_INVOICE_DATA, INVOICES_LIST } from 'src/store/types';
import { isEmpty } from 'lodash';
import { dateFormats } from 'src/lib/constants';
import palette from 'src/theme/palette';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import ViewInvoice from './viewInvoice';

const Invoices = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  // const [invoiceData, setInvoiceData] = useState();
  const [open, setOpen] = useState(false);

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
    url: API_URL.invoice,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const showInvoiceModal = useCallback((data) => {
    setModalOpen(true);
  }, []);

  const closeInvoiceModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);
  const closeViewInvoiceModal = useCallback(() => {
    setViewModalOpen(false);
    setDefaultData(null);
  }, []);


  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search patient',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px'},
            actionLabel: 'CREATE INVOICE',
            onClick: showInvoiceModal,
          },
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'practitionerFilter',
              url: API_URL.staff,
              label: 'Practitioner',
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              params: { isActive: true, limit: 300 },
              valueAccessor: 'id',
              placeholder: 'Filter by Practitioner',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'practitionerId',
            parser: practitionerFilterParser,
          },
        ],
      }),
    []
  );

    const viewInvoice = useCallback((data) => {
      if (data) {
        setViewModalOpen(true);
        setDefaultData(data);
      }
    }, []);
  
    // const deleteDialogBox = useCallback((data) => {
    //   setInvoiceData(data);
    //   setOpen((value) => !value);
    // }, []);

  const moreActions = [
    {
      label: 'View',
      icon: 'view',
      action: viewInvoice,
    },
    // {
    //   label: 'Delete',
    //   icon: 'delete',
    //   action: deleteDialogBox,
    // },
  ];

  const columns = [
    {
      label: 'Patient',
      type: 'text',
      dataKey: 'patientId',
      // sort: true,
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data.patient || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Prescriber',
      type: 'text',
      dataKey: 'providerId',
      // sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {getFullName(data?.encounter?.billing?.primaryProvider || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Invoice Date',
      type: 'text',
      dataKey: 'createdAt',
      sort: true,
      maxWidth: '10rem',
      format: dateFormats.MMDDYYYY,
    },
    {
      label: 'Invoice',
      type: 'text',
      dataKey: 'id',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
          <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {`INV${data?.id}`}
          </TableTextRendrer>
      ),
    },
    {
      label: 'Amount',
      type: 'text',
      dataKey: 'totalAmount',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
        {data?.totalAmount || 'N/A'}
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
          {data?.totalPayment || 'N/A'}
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

  const [
    deleteResponse,
    ,
    deleteFaxContactLoading,
    callDeleteInvoiceAPI,
    clearData,
  ] = useCRUD({
    id: `${GET_INVOICE_DATA}-delete`,
    url: API_URL.invoice,
    type: REQUEST_METHOD.update,
  });

  // const deleteInvoice = useCallback(() => {
  //   if (invoiceData) {
  //     const { id } = invoiceData;
  //     callDeleteInvoiceAPI({ isDeleted: true }, `/${id}`);
  //   }
  //   setOpen((pre) => !pre);
  // }, [callDeleteInvoiceAPI, invoiceData]);

  // const dialogActions = useMemo(
  //   () => [
  //     {
  //       title: 'Cancel',
  //       action: () => setOpen((current) => !current),
  //       actionStyle: { color: palette.common.black, padding: '8px' },
  //       variant: 'secondary',
  //     },
  //     {
  //       title: 'Confirm',
  //       action: deleteInvoice,
  //       actionStyle: { color: palette.primary.main, padding: '8px' },
  //       variant: 'secondary',
  //     },
  //   ],
    // [deleteInvoice]
  // );
  
  // useEffect(() => {
  //   if (!isEmpty(deleteResponse)) {
  //     showSnackbar({
  //       message: 'Delete successfully',
  //       severity: 'success',
  //     });
  //     clearData(true);
  //     handleOnFetchDataList();
  //   }
  // }, [handleOnFetchDataList, deleteResponse, clearData]);

  return (
    <>
      <Container
        loading={ loading }
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Table
          headerComponent={
            <div>
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
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
          actionButtons={moreActions}
        />
      </Container>
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: 'Add Invoice',
            closeIconAction: closeInvoiceModal,
          }}
          modalStyle={{ width: '100%' }}
          boxStyle={{width:'90% !important',maxWidth:'unset'}}
        >
          <InvoiceForm
            modalCloseAction={closeInvoiceModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
       {viewModalOpen && (
        <ModalComponent
          open={viewModalOpen}
          header={{
            title: 'View Invoice',
            closeIconAction: closeViewInvoiceModal,
          }}
          modalStyle={{ width: '100%' }}
          boxStyle={{width:'90% !important',maxWidth:'unset'}}
        >
          <ViewInvoice
            modalCloseAction={closeViewInvoiceModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
      {/* <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      /> */}
    </>
  );
};

export default Invoices;