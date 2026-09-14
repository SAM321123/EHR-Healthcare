import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import usePatientDetail from 'src/hooks/usePatientDetail';

import { invoiceStatus } from 'src/lib/constants';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import { INVOICE_COLUMNS } from 'src/lib/tableConstants';

import Box from 'src/components/Box';
import Modal from 'src/components/modal';
import Table from 'src/components/Table';
import PageContent from 'src/components/PageContent';
import CustomButton from 'src/components/CustomButton';

import palette from 'src/theme/palette';
import { GET_ALL_PRODUCTS, GET_INVOICE, GET_SERVICES } from 'src/store/types';
import { downloadPdf } from 'src/lib/utils';
import InvoiceTotalAmount from './TotalAmount';
import CreateInvoice from './CreateInvoice';
import ViewInvoice from './ViewInvoice';

const topCards = [
  {
    label: 'Total Outsanding',
    amount: '0',
    icon: '/assets/icons/ic_outstanding.svg',
    backgroundColor: palette.background.mediumPurple,
    dataKey: 'totalOutstanding',
  },
  {
    label: 'Total Uninvoiced',
    amount: '0',
    icon: '/assets/icons/ic_uninvoiced.svg',
    backgroundColor: palette.background.pizazz,
    dataKey: 'totalUninvoiced',
  },
  {
    label: 'Total Paid',
    amount: '0',
    icon: '/assets/icons/ic_amount_paid.svg',
    backgroundColor: palette.background.appleGreen,
    dataKey: 'totalPaid',
  },
];

const PatientInvoiceList = () => {
  const { id: patientId } = useParams();
  const [patientData] = usePatientDetail({ patientId });
  const [isCreateInvoiceModalVisible, setIsCreateInvoiceModalVisible] =
    useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewInvoiceModalVisible, setIsViewInvoiceModalVisible] =
    useState(false);

  const [responseAggregate, , , invoiceAggregateApi, ,] = useCRUD({
    id: 'invoiceAggregateApi',
    url: `${API_URL.invoiceAggregate}?patient=${patientId}`,
    type: REQUEST_METHOD.get,
  });

  const [
    invoiceList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    ,
    ,
    sort,
    handleSort,
  ] = useQuery({
    listId: GET_INVOICE,
    url: API_URL.invoice,
    type: REQUEST_METHOD.get,
    queryParams: {
      patient: patientId,
    },
  });

  useEffect(() => {
    invoiceAggregateApi();
  }, []);

  const toggleModal = useCallback(() => {
    if (isCreateInvoiceModalVisible) {
      setSelectedInvoice(null);
      invoiceAggregateApi();
    }
    setIsCreateInvoiceModalVisible(!isCreateInvoiceModalVisible);
  }, [invoiceAggregateApi, isCreateInvoiceModalVisible]);

  const viewToggleModal = useCallback(() => {
    if (isViewInvoiceModalVisible) {
      setSelectedInvoice(null);
      invoiceAggregateApi();
    }
    setIsViewInvoiceModalVisible(!isViewInvoiceModalVisible);
  }, [invoiceAggregateApi, isViewInvoiceModalVisible]);

  const onRowClick = useCallback(
    (row) => {
      setSelectedInvoice(row);
      viewToggleModal();
    },
    [viewToggleModal]
  );

  const rowPreRender = (row) => {
    if (row?.status === invoiceStatus?.PAID)
      return { visibility: 'hidden', display: 'none' };
    return {};
  };

  const moreActions = [
    {
      label: 'Download',
      icon: 'download',
      action: (row) => {
        if(row?.id) downloadPdf(`/${API_URL.downloadInvoicePDF}/${row?.id}`)
      },
    },
    {
      label: 'Edit',
      icon: 'edit',
      preRender: rowPreRender,
      action: (row) => {
        setSelectedInvoice(row);
        toggleModal();
      },
    },
  ];

  const [serviceResponse, , , getServices] = useCRUD({
    id: GET_SERVICES,
    url: `${API_URL.services}?isActive=true`,
    type: REQUEST_METHOD.get,
  });

  const [productResponse, , , getProducts] = useCRUD({
    id: GET_ALL_PRODUCTS,
    url: `${API_URL.product}?isActive=true`,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (selectedInvoice) {
      const { items } = selectedInvoice || [];
      const filter = items.reduce((acc, _item) => {
        if (!acc[_item.type]) {
          acc[_item.type] = [_item[_item.type]];
        } else {
          acc[_item.type].push(_item[_item.type]);
        }
        return acc;
      }, {});
      getServices({services:filter.service});
      getProducts({products: filter.product});  
    }else {
      getServices();
      getProducts();
    }
    
  }, [selectedInvoice]);

  return (
    <PageContent style={{ overflow: 'auto' }}>
      <InvoiceTotalAmount
        data={topCards}
        responseAggregate={responseAggregate?.data}
      />
      <Box sx={{ display: 'flex', justifyContent: 'end', mb: 2 }}>
        <CustomButton
          label="Create Invoice"
          variant="primary"
          onClick={toggleModal}
        />
      </Box>
      <Table
        loading={loading}
        data={invoiceList?.results}
        totalCount={invoiceList?.totalPages}
        columns={INVOICE_COLUMNS}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{ overflow: 'auto' }}
        actionButtons={moreActions}
        onRowClick={onRowClick}
      />
      {isCreateInvoiceModalVisible && (
        <Modal
          open={isCreateInvoiceModalVisible}
          onClose={toggleModal}
          header={{
            title: 'Create Invoice',
          }}
        >
          <CreateInvoice
            modalCloseAction={toggleModal}
            patientData={patientData}
            selectedInvoice={selectedInvoice}
            serviceResponse={serviceResponse}
            productResponse={productResponse}
          />
        </Modal>
      )}
      {isViewInvoiceModalVisible && (
        <Modal
          open={isViewInvoiceModalVisible}
          onClose={viewToggleModal}
          header={{
            title: 'View Invoice',
          }}
          isNotScrollable
        >
          <ViewInvoice
            modalCloseAction={viewToggleModal}
            patientData={patientData}
            selectedInvoice={selectedInvoice}
          />
        </Modal>
      )}
    </PageContent>
  );
};

export default PatientInvoiceList;
