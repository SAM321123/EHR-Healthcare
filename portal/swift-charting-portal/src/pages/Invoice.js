import React, { useCallback, useState } from 'react';

import useQuery from 'src/hooks/useQuery';
import useAuthUser from 'src/hooks/useAuthUser';

import { INVOICE_COLUMNS } from 'src/lib/tableConstants';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';

import PageHeader from 'src/components/PageHeader';
import Modal from 'src/components/modal';
import Table from 'src/components/Table';
import PageContent from 'src/components/PageContent';

import { GET_INVOICE } from 'src/store/types';
import { downloadPdf } from 'src/lib/utils';
import ViewInvoice from './Patient/components/Invoice/ViewInvoice';

const PatientInvoice = () => {
  const [userData] = useAuthUser();
  const patientId = userData?.id;

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewInvoiceModalVisible, setIsViewInvoiceModalVisible] =
    useState(false);

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
    listId: `${GET_INVOICE}-PATIENT_LIST`,
    url: API_URL.invoice,
    type: REQUEST_METHOD.get,
    queryParams: {
      patient: patientId,
    },
  });

  const viewToggleModal = useCallback(() => {
    if (isViewInvoiceModalVisible) {
      setSelectedInvoice(null);
    }
    setIsViewInvoiceModalVisible(!isViewInvoiceModalVisible);
  }, [isViewInvoiceModalVisible]);

  const onRowClick = useCallback(
    (row) => {
      setSelectedInvoice(row);
      viewToggleModal();
    },
    [viewToggleModal]
  );

  const moreActions = [
    {
      label: 'Download',
      icon: 'download',
      action: (row) => {
        if (row?.id)
          downloadPdf(`${BASE_URL}${API_URL.downloadInvoicePDF}/${row?.id}`);
      },
    },
  ];

  return (
    <PageContent style={{ overflow: 'auto' }}>
      <PageHeader title="Invoices" />
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
            patientData={userData}
            selectedInvoice={selectedInvoice}
            isPatient
          />
        </Modal>
      )}
    </PageContent>
  );
};

export default PatientInvoice;
