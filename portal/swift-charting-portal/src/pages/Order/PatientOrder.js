import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useQuery from 'src/hooks/useQuery';
import {
  GET_PATIENT_ORDER_DATA,
  GET_SHIPMENT_LABEL,
  GET_SHIPMENT_LABEL_UPS,
  UPDATE_PATIENT_ORDER_DATA,
} from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import {
  dateFormats,
  patientOInvoiceStatusOptions,
  patientOrderStatus,
  patientOrderStatusOptions,
  requiredField,
} from 'src/lib/constants';
import FilterComponents from 'src/components/FilterComponents';
import {
  getZplToPdfUrl,
  patientFilterParser,
  showSnackbar,
} from 'src/lib/utils';
import { useForm } from 'react-hook-form';
import { CardContent } from '@mui/material';
import CustomForm from 'src/components/form';
import Modal from 'src/components/modal';
import useCRUD from 'src/hooks/useCRUD';
import AlertDialog from 'src/components/AlertDialog';
import PatientOrderForm from './PatientOrderForm';

const handleValidateQuery = (params) => {
  const modifiedQuery = { ...params };
  if (modifiedQuery?.status === 'ALL') {
    delete modifiedQuery?.status;
  }
  if (modifiedQuery?.invoiceStatus === 'ALL') {
    delete modifiedQuery?.invoiceStatus;
  }
  return {
    params: { ...modifiedQuery },
  };
};

const FilterCollectionHeader = FilterComponents({
  leftComponents: [
    {
      type: 'text',
      label: 'Patient Order',
    },
  ],
  rightComponents: [
    {
      type: 'wiredSelect',
      filterProps: {
        name: 'invoiceStatus',
        defaultOptions: patientOInvoiceStatusOptions(),
        label: '',
        size: 'small',
        style: { maxWidth: '250px' },
        labelAccessor: 'name',
        valueAccessor: 'code',
        isAllOptionNeeded: true,
        allOptionLabel: 'All Invoices',
        defaultValue: 'ALL',
        disableClearable: true,
      },
      name: 'invoiceStatus',
    },
    {
      type: 'wiredSelect',
      filterProps: {
        name: 'status',
        defaultOptions: patientOrderStatusOptions(),
        label: '',
        size: 'small',
        style: { maxWidth: '250px' },
        labelAccessor: 'name',
        valueAccessor: 'id',
        isAllOptionNeeded: true,
        defaultValue: 'ALL',
        allOptionLabel: 'All Orders',
        disableClearable: true,
      },
      name: 'status',
    },
    {
      type: 'autocomplete',
      filterProps: {
        name: 'patientOrderFilter',
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

const PatientOrder = () => {
  const [selectedOrder, setSelectedOrder] = useState();
  const [selectedRowData, setSelectedRowData] = useState();
  const [printLabel, setPrintLabel] = useState(false);
  const [shipStatus, setShipStatus] = useState(false);

  const form = useForm();
  const { handleSubmit, reset } = form;

  const [
    patientOrderList,
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
    listId: GET_PATIENT_ORDER_DATA,
    url: API_URL.patientOrder,
    type: REQUEST_METHOD.get,
    validateQuery: handleValidateQuery,
  });
  const [
    shipmentResponse,
    ,
    shipmentResponseLoading,
    callGenerateLabelApi,
    clearShipmentResponse,
  ] = useCRUD({
    id: GET_SHIPMENT_LABEL,
    url: API_URL.generateLabel,
    type: REQUEST_METHOD.post,
  });

  const [
    shipmentUpsResponse,
    ,
    shipmentUpsResponseLoading,
    callGenerateUpsLabelApi,
    clearShipmentUpsResponse,
  ] = useCRUD({
    id: GET_SHIPMENT_LABEL_UPS,
    url: API_URL.generateUpsLabel,
    type: REQUEST_METHOD.post,
  });
  const [orderResponse, , , callUpdatePatientOrderApi, ,] = useCRUD({
    id: UPDATE_PATIENT_ORDER_DATA,
    url: API_URL.updatePatientOrder,
    type: REQUEST_METHOD.update,
  });

  const handleModal = useCallback(() => {
    setSelectedOrder()
  }, []);

  const handlePrintModal = useCallback(() => {
    setPrintLabel(false);
    setSelectedRowData(null);
    reset();
  }, [reset]);

  const columns = useMemo(
    () => [
      {
        label: 'Patient_#',
        type: 'text',
        dataKey: 'patient.uhid',
        maxWidth: '6rem',
      },
      {
        label: 'Patient Name',
        type: 'text',
        dataKey: 'patient.name',
        maxWidth: '10rem',
      },
      {
        label: 'Invoice Status',
        dataKey: 'invoiceStatus',
        type: 'chips',
        labelAccessor: 'invoiceStatus',
      },
      {
        label: 'Created',
        dataKey: 'createdAt',
        type: 'date',
        format: dateFormats.MMMDDYYYYHHMMSS,
        sort: true,
        maxWidth: '10rem',
      },
      {
        label: 'Status',
        type: 'text',
        dataKey: 'status',
        maxWidth: '10rem',
      },
    ],
    []
  );

  useEffect(() => {
    if (shipmentResponse || shipmentUpsResponse) {
      if (shipmentResponse && shipmentResponse?.label) {
        getZplToPdfUrl(shipmentResponse.label)
          .then((url) => {
            window.open(url, '_blank');
            handlePrintModal();
          })
          .catch((error) => {
            showSnackbar({
              message: error?.message,
              severity: 'error',
            });
          });
      } else if (shipmentUpsResponse && shipmentUpsResponse?.label) {
        getZplToPdfUrl(shipmentUpsResponse.label)
          .then((url) => {
            window.open(url, '_blank');
            handlePrintModal();
          })
          .catch((error) => {
            showSnackbar({
              message: error?.message,
              severity: 'error',
            });
          });
      }
      handleOnFetchDataList();
      clearShipmentResponse(true);
      clearShipmentUpsResponse(true);
    }
  }, [
    shipmentResponse,
    clearShipmentResponse,
    handleOnFetchDataList,
    shipmentUpsResponse,
    clearShipmentUpsResponse,
    handlePrintModal,
  ]);

  const handlePrint = useCallback(
    async (row) => {
      if (row?.id && row?.shipment?.serviceType && row?.shipment?.label) {
        getZplToPdfUrl(row.shipment.label)
          .then((url) => {
            window.open(url, '_blank');
            handlePrintModal();
          })
          .catch((error) => {
            showSnackbar({
              message: error?.message,
              severity: 'error',
            });
          });
      } else if (
        row?.id &&
        !row?.shipment?.serviceType &&
        row?.shipment?.label
      ) {
        getZplToPdfUrl(row.shipment.label)
          .then((url) => {
            window.open(url, '_blank');
            handlePrintModal();
          })
          .catch((error) => {
            showSnackbar({
              message: error?.message,
              severity: 'error',
            });
          });
      } else {
        setSelectedRowData(row);
        setPrintLabel(true);
      }
    },
    [handlePrintModal]
  );

  const handleProceed = useCallback(
    async (data) => {
      const row = selectedRowData;
      if (row?.id && data?.shipmentType !== 'ups') {
        try {
          await callGenerateLabelApi(
            {
              data: {
                labelResponseOptions: 'LABEL',
              },
            },
            `/${row?.id}`
          );
          handlePrintModal();
        } catch (error) {
          showSnackbar(error);
          handlePrintModal();
        }
      } else if (row?.id && data?.shipmentType === 'ups') {
        try {
          await callGenerateUpsLabelApi(
            {
              data: {
                ShipmentRequest: {
                  LabelSpecification: {
                    LabelStockSize: {
                      Height: '6',
                      Width: '4',
                    },
                    LabelImageFormat: {
                      Code: 'GIF',
                      Description: 'GIF',
                    },
                    HTTPUserAgent: 'Mozilla/4.5',
                  },
                },
              },
            },
            `/${row?.id}`
          );
          handlePrintModal();
        } catch (error) {
          showSnackbar(error);
          handlePrintModal();
        }
      }
    },
    [
      selectedRowData,
      callGenerateLabelApi,
      handlePrintModal,
      callGenerateUpsLabelApi,
    ]
  );

  const handleRegenerate = useCallback((row) => {
    setSelectedRowData(row);
    setPrintLabel(true);
  }, []);

  const onShip = useCallback(() => {
    if (selectedRowData) {
      callUpdatePatientOrderApi(
        { status: 'shipped' },
        `/${selectedRowData?.id}`
      );
    }
  }, [selectedRowData]);

  const handleShip = useCallback((data) => {
    setShipStatus(true);
    setSelectedRowData(data);
  }, []);

  const moreActions = useCallback(
    (item) => {
      const allActions = [];
      const printLabelAction = {
        label: item?.shipment?.label ? 'Print' : 'Generate & Print',
        icon: 'print',
        action: handlePrint,
      };
      const createPharmacyOrder = {
        label: 'Create Pharmacy Order',
        icon: 'pharmacyOrder',
        action: ()=>setSelectedOrder(item),
      };

      allActions.push(printLabelAction);

      if (item?.shipment?.label) {
        const regenerateAction = {
          label: 'Regenerate & Print',
          icon: 'regenerate',
          action: handleRegenerate,
        };
        allActions.splice(1, 0, regenerateAction);
        const ship = {
          label: 'Ship',
          icon: 'ship',
          action: handleShip,
        };
        if(item?.status===patientOrderStatus['Rx. Order Created']) { allActions.push(ship); }
      }
      if (item?.status === 'received') {
        allActions.splice(0, 0, createPharmacyOrder);
      }
      return allActions;
    },
    [handleModal, handlePrint, handleRegenerate, handleShip]
  );
  const footer = useMemo(
    () => ({
      leftActions: [
        {
          name: 'Cancel',
          variant: 'text',
          action: handlePrintModal,
          style: { boxShadow: 'unset', color: '#303030' },
        },
        {
          name: 'Proceed',
          style: { marginRight: 16 },
          action: handleSubmit(handleProceed),
        },
      ],
    }),
    [handlePrintModal, handleProceed, handleSubmit]
  );
  const formGroups = useMemo(() => {
    const baseFormGroups = [
      {
        inputType: 'radio',
        name: 'shipmentType',
        required: requiredField,

        options: [
          { label: 'UPS', value: 'ups' },
          { label: 'FEDEX', value: 'fedex' },
        ],
        colSpan: 1,
      },
    ];

    return baseFormGroups;
  }, []);
  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setShipStatus((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: onShip,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [onShip]
  );
  useEffect(() => {
    if (orderResponse) {
      handleOnFetchDataList();
      setShipStatus(false);
    }
  }, [orderResponse]);

  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={loading || shipmentResponseLoading || shipmentUpsResponseLoading}
    >
      {!selectedOrder ? (
        <>
          <Table
            headerComponent={
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            }
            data={patientOrderList?.results}
            totalCount={patientOrderList?.totalResults}
            columns={columns}
            pagination
            rowsPerPage={rowsPerPage}
            page={page}
            handlePageChange={handlePageChange}
            loading={loading}
            actionButtons={moreActions}
            sort={sort}
            handleSort={handleSort}
            itemStyle={{ textTransform: 'capitalize' }}
            timezone
          />
          {printLabel && (
            <Modal
              open
              header={{
                title: 'Choose Mode',
                closeIconAction: handlePrintModal,
              }}
              footer={footer}
            >
              <CardContent sx={{ width: '300px' }}>
                <CustomForm
                  formGroups={formGroups}
                  columnsPerRow={1}
                  form={form}
                />
              </CardContent>
            </Modal>
          )}
        </>
      ) : (
        <PatientOrderForm
          modalCloseAction={handleModal}
          refetchData={handleOnFetchDataList}
          defaultData={selectedOrder}
        />
      )}
      <AlertDialog
        open={shipStatus}
        content="Are you sure you want to set the status to Shipped?"
        actions={dialogActions}
      />
    </Container>
  );
};

export default PatientOrder;
