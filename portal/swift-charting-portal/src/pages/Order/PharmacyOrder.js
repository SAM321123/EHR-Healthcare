import React, { useCallback, useMemo, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';

import useQuery from 'src/hooks/useQuery';

import { GET_PHARMACY_ORDER_DATA } from 'src/store/types';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import {
  dateFormats,
  faxHistoryStatus,
  pharmacyOrderStatus,
  pharmacyOrderStatusOptions,
} from 'src/lib/constants';
import FilterComponents from 'src/components/FilterComponents';
import { downloadPdf, patientFilterParser } from 'src/lib/utils';
import PharmacyFaxDetails from './PharmacyFaxDetails';
import PatientOrderForm from './PatientOrderForm';
import ModalComponent from '../../components/modal';

const handleValidateQuery = (params) => {
  const modifiedQuery = { ...params };

  if (modifiedQuery?.status === 'ALL') {
    delete modifiedQuery?.status;
  }

  return {
    params: { ...modifiedQuery },
  };
};

const FilterCollectionHeader = FilterComponents({
  leftComponents: [{ type: 'text', label: 'Pharmacy Order' }],
  rightComponents: [
    {
      type: 'wiredSelect',
      filterProps: {
        name: 'status',
        defaultOptions: pharmacyOrderStatusOptions(),
        label: '',
        size: 'small',
        style: { maxWidth: '250px' },
        labelAccessor: 'name',
        valueAccessor: 'id',
        isAllOptionNeeded: true,
        defaultValue: 'ALL',
        disableClearable: true,
      },
      name: 'status',
    },
    {
      type: 'autocomplete',
      filterProps: {
        name: 'pharmacyOrderPatientFilter',
        url: API_URL.getPatients,
        label: '',
        placeholder: 'Filter by Patient',
        size: 'small',
        style: { maxWidth: '220px' },
        // disableClearable: true,
        labelAccessor: 'name',
      },
      name: 'patient',
      parser: patientFilterParser,
    },
  ],
});

const PharmacyOrder = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState();
  const [selectedPharmacyOrder, setSelectedPharmacyOrder] = useState(null);
  const [viewPatientPrescription, setViewPatientPrescription] = useState(false);

  const [
    pharmacyOrderList,
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
    listId: GET_PHARMACY_ORDER_DATA,
    url: API_URL.pharmacyOrder,
    type: REQUEST_METHOD.get,
    validateQuery: handleValidateQuery,
  });

  const handleModal = useCallback((data) => {
    setModalOpen((prev) => !prev);
    setSelectedOrder(data);
  }, []);

  const handlePatientOrderModal = useCallback(() => {
    setViewPatientPrescription((prev) => !prev);
  }, []);

  const columns = useMemo(
    () => [
      {
        label: 'Order_#',
        type: 'text',
        dataKey: 'orderNo',
        sort: true,
        maxWidth: '10rem',
        render: ({ data }) => {
          const { faxHistory = {} } = data || {};
          const { status: faxStatus, result: faxResult } = faxHistory || {};
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>{data?.orderNo}</div>
              {!isEmpty(faxHistory) &&
                faxStatus === faxHistoryStatus.FAILED && (
                  <Tooltip title={faxResult || 'Failed To Send Fax'}>
                    <WarningIcon
                      style={{
                        fontSize: '16px',
                        color: 'orange',
                        marginLeft: '5px',
                        marginBottom: '5px',
                      }}
                    />
                  </Tooltip>
                )}
            </div>
          );
        },
      },

      {
        label: 'Patient Name',
        type: 'text',
        dataKey: 'patient.name',
        maxWidth: '10rem',
        sort: true,
      },
      {
        label: 'Medication',
        maxWidth: '10rem',
        render: ({ data }) => {
          const title = data?.items
            ?.map((item) => item?.medicine?.name)
            .join(', ');
          return <Tooltip title={title}>{title}</Tooltip>;
        },
      },
      {
        label: 'Status',
        dataKey: 'status',
        type: 'chips',
      },
      {
        label: 'Created',
        dataKey: 'createdAt',
        type: 'date',
        format: dateFormats.MMMDDYYYYHHMMSS,
        sort: true,
        maxWidth: '10rem',
      },
    ],
    []
  );

  const rowPreRender = (row) => {
    if ((row.status|| '').toLocaleLowerCase() === pharmacyOrderStatus.FAXED)
      return { visibility: 'hidden', display: 'none' };
    return {};
  };

  const moreActions = useCallback(
    (item) => {
      const allActions = [];

      const downloadAction = {
        label: 'Download',
        icon: 'download',
        action: (row) => {
          if (row?.id)
            downloadPdf(
              `/${API_URL.downloadPharmacyOrderPDF}/${row?.id}`
            );
        },
      };

      const editAction = {
        label: 'Edit',
        icon: 'edit',
        preRender: rowPreRender,
        action: (row) => {
          setViewPatientPrescription(true);
          setSelectedPharmacyOrder(row);
        },
      };

      allActions.push(downloadAction, editAction);
      if (
        isEmpty(item?.faxHistory) ||
        item?.faxHistory?.status !== faxHistoryStatus.SUCCESS
      ) {
        const createPharmacyOrder = {
          label: 'Send Fax',
          icon: 'fax',
          action: handleModal,
        };
        allActions.splice(0, 0, createPharmacyOrder);
      }
      return allActions;
    },
    [handleModal]
  );

  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={loading}
    >
      {!viewPatientPrescription ? (
        <>
          <Table
            headerComponent={
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            }
            data={pharmacyOrderList?.results}
            totalCount={pharmacyOrderList?.totalResults}
            columns={columns}
            pagination
            rowsPerPage={rowsPerPage}
            page={page}
            handlePageChange={handlePageChange}
            loading={loading}
            sort={sort}
            handleSort={handleSort}
            actionButtons={moreActions}
            itemStyle={{ textTransform: 'capitalize' }}
            timezone
          />
          {modalOpen && (
            <ModalComponent
              open={modalOpen}
              header={{
                title: 'Send Fax ',
                closeIconAction: handleModal,
              }}
              isSmall
              isNotScrollable
            >
              <PharmacyFaxDetails
                modalCloseAction={handleModal}
                refetchData={handleOnFetchDataList}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
              />
            </ModalComponent>
          )}
        </>
      ) : (
        <PatientOrderForm
          modalCloseAction={handlePatientOrderModal}
          selectedPharmacyOrder={selectedPharmacyOrder}
          refetchData={handleOnFetchDataList}
        />
      )}
    </Container>
  );
};

export default PharmacyOrder;
