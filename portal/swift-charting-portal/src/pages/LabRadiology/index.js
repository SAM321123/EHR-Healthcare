/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { LAB_RADIOLOGY_COLUMNS } from 'src/lib/tableConstants';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import palette from 'src/theme/palette';
import { isEmpty } from 'lodash';
import { showSnackbar, triggerEvents } from 'src/lib/utils';
import ModalComponent from 'src/components/modal';
import CreateOrder from './createOrder';
import useQuery from 'src/hooks/useQuery';
import {  SAVE_LABS_RADIOLOGY_DATA, DELETE_LABS_RADIOLOGY_DATA } from 'src/store/types';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import { getLabsRadiologyEditData } from './labsRadiologyHelper';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { RemoveRedEyeOutlined } from '@mui/icons-material';
import ShareAndFaxModal from './shareLabRadilogy';

import { LABS_RADIOLOGY_LIST, SEND_TO_LAB, MEDICATION_LIST } from 'src/store/types';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { successMessage, faxType } from 'src/lib/constants';
import ViewModal from './viewModal';
import Esignature from 'src/components/E-Signature';
import { encrypt } from 'src/lib/encryption';
import './viewModal.css';
import { Box, CardActions, CardContent, Typography } from '@mui/material';
import LabRequest from './labRequest';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const LabRadiologyList = ({dashboardView = false}) => {
  const navigate = useNavigate();
  const params = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sendToModalOpen, setSendToModalOpen] = useState(false);
  const [labsRadiologyData, setLabsRadiologyData] = useState();
  const [sendToLabData, setSendToLabData]= useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [viewData, setViewData] = useState(null);
  const [data, setData] = useState(null)
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState('');
  const [signatureError, setSignatureError] = useState(false);
  const [shareLabRadiologyData, setShareLabRadiologyData] = useState({});
  const [patientId, setPatientId]= useState();  
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
    listId: LABS_RADIOLOGY_LIST,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const [deleteResponse, , , callLabRadiologoDeleteAPI, clearData] = useCRUD({
    id: DELETE_LABS_RADIOLOGY_DATA,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.update,
  });
  const [hl7Response, , loadingSendToLab, callSendToLab, clearHl7Data] = useCRUD({
    id: SEND_TO_LAB,
    url: API_URL.hl7,
    type: REQUEST_METHOD.post,
  });
  const [updateDataResponse, , updateLoading, callLabRadiologyUpdateAPI, updateClearData] = useCRUD({
    id: SAVE_LABS_RADIOLOGY_DATA,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.update,
  });

  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead, isShare } = getModulePermisions({ moduleName: MODULE.labsRadiology, userData }) || {};

  const handleOrderModalVisibility = useCallback(() => {
    setModalOpen(true);                
  },[])

  const closeOrderModal = useCallback(() => {
    setModalOpen(false);
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
          (isCreate && !dashboardView) && {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px' },
            actionLabel: 'CREATE ORDER',
            onClick: handleOrderModalVisibility,
          },
        ],
      }),
    []
  );
  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);

  useEffect(() => {
    if (!isEmpty(hl7Response)) {
      showSnackbar({
        message: successMessage.sent,
        severity: 'success',
      });
      clearHl7Data();
      handleOnFetchDataList();
    }
  }, [hl7Response, clearHl7Data, handleOnFetchDataList]);

  const deleteOrder = useCallback(() => {
    if (labsRadiologyData) {
      const { id } = labsRadiologyData;

      callLabRadiologoDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callLabRadiologoDeleteAPI, labsRadiologyData]);

  const handleSendToLab = useCallback(() => {
    if (sendToLabData) {
      const { id } = sendToLabData;
      const data = {labsRadiologyId: id}
      setData(data);
      setShowSignature(true);
    
      // callSendToLab({ data: {data}});
    }
    setSendToModalOpen((pre) => !pre);
  // }, [callSendToLab, sendToLabData]);
}, [sendToLabData]);
  
  const closeSignature = () => {
    setShowSignature(false);
    setSignature('');
    setSignatureError(false);
  };


  const onSignatureSubmit = useCallback(() => {
    const _signature = signature || '';
    if (!_signature) {
      setSignatureError(true);
      return;
    }
    callLabRadiologyUpdateAPI({ signature }, `/${data?.labsRadiologyId}`);
    callSendToLab({ data: {data}});

    closeSignature();
  }, [
    callSendToLab,
    signature,
  ]);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setDeleteModalOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteOrder,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteOrder]
  );

  // const sendToLabDialogActions = useMemo(
  //   () => [
  //     {
  //       component: () => (
  //         <LoadingButton 
  //           label='Cancel' 
  //           onClick={() => setSendToModalOpen((current) => !current)}
  //           style={{ color: palette.primary.main, padding: '8px' }}
  //           variant="outlinedSecondary"
  //         />
  //       ),
  //     },
  //     {
  //       component: () => (
  //         <LoadingButton 
  //           label='Confirm' 
  //           onClick={handleSendToLab}
  //           style={{ color: palette.primary.main, padding: '8px' }}
  //         />
  //       ),
  //     },
  //   ],
  //   [handleSendToLab]
  // );

  const sendToLabDialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setSendToModalOpen((current) => !current),
        // actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'outlinedSecondary',
      },
      {
        title: 'Confirm',
        action: handleSendToLab,
        variant: "contained",
        // actionStyle: { color: palette.primary.main, padding: '8px' },
      },
    ],
    [handleSendToLab]
  );


  // const handlePrint = useCallback(
  //   (row) => {
  //     window.print();
  //   },
  //   []
  // );
  // const footer = useMemo(
  //   () => ({
  //     leftActions: [
  //       {
  //         name: 'Print',
  //         loading,
  //         className: 'modal-footer',
  //         action: (row) => {
  //           handlePrint(row)
  //         }
  //       },
  //     ],
  //   }),
  //   [ handlePrint, loading]
  // );


  const sendToLab = useMemo(() => ({
    label: 'HL7 Version',
    dataKey: 'hl7Version',
    render: ({ data }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        {/* {data?.hl7Data && ( */}

        {data?.hl7Message && (
          <LoadingButton 
            size="small" 
            style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller', backgroundColor: 'red'}} 
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <p style={{ margin: 0 }}>Preview and Print Request</p>
                <RemoveRedEyeOutlined style={{ height: '20px' }} />
              </div>
            }
            loading={loading}
            icon="view"
            onClick={() => handleViewHl7Data(data)} 
          />  
        )}
        {data?.isLabResult && (
          <LoadingButton 
            size="small" 
            style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller', backgroundColor: 'green'}} 
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <p style={{ margin: 0 }}>Preview and Print Request Report</p>
                <RemoveRedEyeOutlined style={{ height: '20px' }} />
              </div>
            }
            loading={loading}
            onClick={() => handleViewResult(data)} 
          />  
        )}
        {(!data?.sendToLab && data?.hl7Data) ? (
          <LoadingButton 
            size="small" 
            style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller'}} 
            label="Send to Lab" 
            loading={loadingSendToLab}
            // onClick={() => handleSendToLab(data)} 
            onClick={() => sendToDialogBox(data)}
          />
        ): (!data?.hl7Data && (
          <LoadingButton 
            size="small" 
            style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller'}} 
            label="Add Sending Details" 
            loading={loading}
            onClick={()=>handleEditLabsRadiology(data)} 
        />
        ))}
      </div>
    ),
  }), []);

  const columns = useMemo(() => [...LAB_RADIOLOGY_COLUMNS, sendToLab], [sendToLab]);

  const handleEditLabsRadiology =(data)=>{
    const editData=getLabsRadiologyEditData(data)
    setDefaultData(editData);
    setModalOpen(true);
  };
  const deleteDialogBox = useCallback((data) => {
    setLabsRadiologyData(data);
    setDeleteModalOpen((value) => !value);
  }, []);

  const sendToDialogBox = useCallback((data) => {
    setSendToLabData(data);
    setSendToModalOpen((value) => !value);
  }, []);

  const handleViewHl7Data = (data) => {
    const labRadiologyId = data?.id;
    navigate(
      generatePath(UI_ROUTES.labRequest, {
        labRadiologyId: encrypt(String(labRadiologyId)),
      })
    );
  }
  const handleViewResult = (data) => {
    const labRadiologyId = data?.id;
    navigate(
      generatePath(UI_ROUTES.labRadiologyResult, {
        labRadiologyId: encrypt(String(labRadiologyId)),
      })
    );
  }

  const handleShare = (data) =>{
    setShareLabRadiologyData(data);
    setPatientId(data?.patientId);
  }

  const closeShareAndFaxModal = ()=>{
    setShareLabRadiologyData({});
  }
  const onRefershShareAndFaxModal =()=>{
    triggerEvents(`${LABS_RADIOLOGY_LIST}-${patientId}`);
  }


  const moreActions = (row) => {
    const actions = [
      isDelete && {
        label: 'Delete',
        icon: 'delete',
        action: () => deleteDialogBox(row),
      },
    ];

    if(row.hl7Message){
      isShare && actions.unshift({
        label: 'Share',
        icon: 'share',
        action: () => handleShare(row), 
      }); 
    }
  
    if (!row.sendToLab) {
      isUpdate && actions.unshift({
        label: 'Edit',
        icon: 'edit',
        action: () => handleEditLabsRadiology(row),
      });
    }
  
    return actions;
  };

  // const moreActions = [
  //   {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: handleEditLabsRadiology,
  //   },
  //   {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //   },
  // ];

  return (
    <>
      <Container
        loading={loadingSendToLab || loading }
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
          actionButtons={row => moreActions(row)}
        />
        <AlertDialog
          open={deleteModalOpen}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
        <AlertDialog
          open={sendToModalOpen}
          boxStyle={{maxWidth:'100000px',width:'100%'}}
          content={
            <>
              <LabRequest isReview={true} dataId={sendToLabData?.id}/>
              <Typography
                variant="body2"  // Smaller font size for note
                style={{
                  fontStyle: 'italic',  // Italic to denote a note
                  color: 'gray',  // Light color for a note
                  marginTop: '10px',  // Adds some space above the note
                }}
              >
                Note: Are you sure you want to send this data to the lab? Once sent, it cannot be modified.
              </Typography>
            </>
          }
          actions={sendToLabDialogActions}
        />
        {/* <AlertDialog
          open={sendToModalOpen}
          content= `Are you sure you want to send this data to the lab ? Once sent , it cannot be modified </LabRequest>`
          actions={sendToLabDialogActions}
        /> */}
      </Container>
      {modalOpen && (
        <ModalComponent
        modalStyle={{width:'100%'}}
        open={modalOpen}
        boxStyle={{maxWidth:'1000px',width:'100%'}}
        header={{
          title: defaultData ? 'Edit Order' :'Create Order',
          closeIconAction: closeOrderModal,
        }}
      >
        <CreateOrder
          modalCloseAction={closeOrderModal}
          refetchData={handleOnFetchDataList}
          defaultData={defaultData} 
          fromMain={true}
        />
      </ModalComponent>
      )}
      {/* {openViewModal && (
        <ModalComponent
          open={openViewModal}
          header={{
            closeIconAction: closeOpenViewModal,
          }}
          // footer={footer}
        >
          <ViewModal 
            viewData={viewData}
            data={data}
            className="modal-content" 
          />

        </ModalComponent>
      )} */}
      {showSignature && (
        <ModalComponent
          open={showSignature}
          header={{
            title: 'Review & Sign',
            closeIconAction: closeSignature,
          }}
        >
          <Box>
            <CardContent>
              <Esignature
                error={signatureError}
                onChange={(value) => {
                  if (value) {
                    setSignatureError(false);
                  }
                  setSignature(value);
                }}
              />
            </CardContent>
            <CardActions sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
              <LoadingButton 
                label={'Submit'} 
                onClick={onSignatureSubmit} 
              />
            </CardActions>
          </Box>
        </ModalComponent>
      )}
      {!isEmpty(shareLabRadiologyData) && (
        <ShareAndFaxModal
          data={shareLabRadiologyData}
          onClose={closeShareAndFaxModal}
          url={`${API_URL.sharePatientLabRadiology}/${shareLabRadiologyData?.id}`}
          onRefersh={onRefershShareAndFaxModal}
          faxType={faxType.PATIENT_LAB_RADIOLOGY}
          title="Share Lab Request/Report"
        />
      )}
    </>
  );
};

export default LabRadiologyList;
