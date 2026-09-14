/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import {
  ADD_APPOINTMENT,
  GET_APPOINTMENT,
  APPOINTMENT_ZOOM_SESSION,
} from 'src/store/types';
// import { dateFormats } from 'src/lib/constants';
import isEmpty from 'lodash/isEmpty';
import ModalComponent from 'src/components/modal';
import { getUserRole, showSnackbar, validateZoomSessionToken } from 'src/lib/utils';

import PatientInfo from '../patientInfo';
// import DocumentForm from './documentForm';
import { Menu, MenuItem } from '@mui/material';
import AlertDialog from 'src/components/AlertDialog';
import Typography from 'src/components/Typography';
import useCRUD from 'src/hooks/useCRUD';
import Events from 'src/lib/events';
import appointmentColumns from 'src/pages/Booking/Components/List/columns';
import palette from 'src/theme/palette';
import AddAppointment from './addAppointment';
import { getAppointmentEditData } from './formGroup';
import { decrypt, encrypt } from 'src/lib/encryption';
import usePatientDetail from 'src/hooks/usePatientDetail';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { appointmentJoinButtonCondition, getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import TableTextRendrer from 'src/components/TableTextRendrer';
import Notes from './notes';

const AppointmentList = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSeries, setEditSeries] = useState(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [appointmentData, setAppointmentData] = useState();
  const [viewNotes, setViewNotes] = useState(false);
  let { patientId } = params;
  patientId = decrypt(patientId);
  const [,patientDataLoading] = usePatientDetail({ patientId });
  const userRole = getUserRole();
  const [userInfo, , , , , , userData] = useAuthUser();

  const { isCreate, isDelete, isUpdate, isRead } = getModulePermisions({ moduleName: MODULE.paientAppointments, userData }) || {}

  const [deleteResponse, , , callAppointmentDeleteAPI, clearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-delete`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });
  const [updateStatus, , , callAppointmentUpdateStatusAPI, updateStatusclearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-statusUpdate`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });
  const [createZoomSessionResponse, , , callCreateZoomSessionApi, sessionClearData] = useCRUD({
    id: `${APPOINTMENT_ZOOM_SESSION}-create`,
    url: API_URL.createZoomSession,
    type: REQUEST_METHOD.update,
  });
  

  const handleEditAppointment = useCallback((rowData,event) => {
    if(patientDataLoading){
      return;
    }
    const temp = getAppointmentEditData(rowData);
    rowData.isRecurring ? setOpenEdit(event?.currentTarget) : setModalOpen(true);
    setDefaultData(temp);
  }, [patientDataLoading]);

  const showDocumentsModal = useCallback(() => {
    setModalOpen(true);
    setEditSeries(true);
  }, []);

  const closeDocumentsModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
    setOpenEdit(null)
    setEditSeries(false)
  }, []);

  const closeViewNotesModal = useCallback(() => {
    setViewNotes(false);
  }, []);

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          isCreate && {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px' },
            actionLabel: 'ADD APPOINTMENT',
            onClick: showDocumentsModal,
            disabled:patientDataLoading,
          },
        ],
      }),
    [patientDataLoading]
  );

  const [updateResponse, , updateLoading, callAppointmentUpdateAPI, updateClearData] = useCRUD({
    id: ADD_APPOINTMENT,
    url: API_URL.appointment,
    type:REQUEST_METHOD.update,
  });

  const handleJoinSession = (data) => {
    const { id } = data;
    if(!data?.zoomSession?.id){
      showSnackbar({
        message: 'Error in session please re-confirm appointment',
        severity: 'error',
      });
      return;
    }      
    callAppointmentUpdateStatusAPI({ statusCode: "on_going",role:userRole }, `/${id}`);
    
    if(data?.statusCode !== 'on_going'){
      callAppointmentUpdateAPI(
        {statusCode: 'on_going'},
        `/${data?.id}`)
    }
    const sessionUrl = generatePath(UI_ROUTES.zoomSession, {
      sessionId: encrypt(String(data?.zoomSession?.id)),
      module: 'appointment'
    });
    // Open the URL in a new tab
    window.open(sessionUrl, '_blank');
  }
  const deleteAppointment = useCallback(() => {
    if (appointmentData) {
      const { id } = appointmentData;
      callAppointmentDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callAppointmentDeleteAPI, appointmentData]);
  const deleteDialogBox = useCallback((data) => {
    setAppointmentData(data);
    setOpen((value) => !value);
  }, []);

  // const moreActions =[
  //   {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: handleEditAppointment,
  //   },
  //   {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //   },
  // ];
  // const moreActions =[
  //   isUpdate && {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: handleEditAppointment,
  //   },
  //   isDelete && {
  //     label: 'Delete',
  //     icon: 'delete',
  //     action: deleteDialogBox,
  //   },
  // ].filter(Boolean);
  const handleViewNotes = useCallback((rowData, event) =>{
    setViewNotes(true);
    setAppointmentData(rowData?.id);
  })

  const moreActions = (row) => {
    const actions = [
      isUpdate && {
        label: 'Edit',
        icon: 'edit',
        action: handleEditAppointment,
      },
      isDelete && {
        label: 'Delete',
        icon: 'delete',
        action: deleteDialogBox,
      },
    ];

    if(row?.isVirtual){
      actions.push({
        label: 'Note',
        icon: 'note',
        action: handleViewNotes,
      })
    }
    return actions;
  };

  const zoomSession = useMemo(() => ({
    label: 'Telehealth Video',
    dataKey: 'data',
    render: ({ data }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        {data?.isVirtual 
          ? (
              <LoadingButton 
                size="small" 
                style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller'}} 
                label="Join" 
                disabled={appointmentJoinButtonCondition(data)}
                onClick={() => handleJoinSession(data)} 
              />
            )
          : <TableTextRendrer>{'N/A'}</TableTextRendrer> 
        }
      </div>
    ),
  }), []);
  const columns = useMemo(() => [...appointmentColumns, zoomSession], [zoomSession]);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteAppointment,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteAppointment]
  );
  const editSeriesDialog = () => {
    setEditSeries(true);
    setOpenEdit(null);
    setModalOpen(true);
  };


  const editOccuranceDialog = () => {
    setEditSeries(false);
    setOpenEdit(null);
    setModalOpen(true);
  };

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
    listId: `${GET_APPOINTMENT}-${patientId}`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId, listView: true },
  });

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
      Events.trigger(`REFRESH-TABLE-${GET_APPOINTMENT}-${patientId}`);
    }
  }, [handleOnFetchDataList, deleteResponse,patientId]);
  useEffect(() => {
    if (!isEmpty(updateStatus)) {
      updateStatusclearData(true);
      handleOnFetchDataList();
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
      Events.trigger(`REFRESH-TABLE-${GET_APPOINTMENT}-${patientId}`);
    }
  }, [handleOnFetchDataList, updateStatus,patientId]);

  useEffect(() => {
    if (!isEmpty(createZoomSessionResponse)) {
      showSnackbar({
        message: 'Telehealth video session created successfully',
        severity: 'success',
      });
      sessionClearData(true);
      handleOnFetchDataList();
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
      Events.trigger(`REFRESH-TABLE-${GET_APPOINTMENT}-${patientId}`);
    }
  }, [handleOnFetchDataList, createZoomSessionResponse,patientId]);

const refetchData = useCallback(()=>{
  handleOnFetchDataList();
  Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);

},[patientId,handleOnFetchDataList])

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
      >
        <Table
          headerComponent={
            <div>
              <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
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
          // actionButtons={moreActions}
        />
        <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </Container>
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          containerStyle={{ width: '90%' }}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Appointment'
              : 'Edit Appointment',
            closeIconAction: closeDocumentsModal,
          }}
        >
          <AddAppointment
            modalCloseAction={closeDocumentsModal}
            refetchData={refetchData}
            defaultData={defaultData}
            editSeries={editSeries}
          />
        </ModalComponent>
      )}
        {openEdit && <Menu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={openEdit}
        open={true}
        onClose={closeDocumentsModal}
      >
        <MenuItem onClick={editOccuranceDialog} disableRipple>
       <Typography sx={{ fontSize: '14px' }}> Edit Occurance</Typography>
        </MenuItem>
        <MenuItem onClick={editSeriesDialog} disableRipple>
        <Typography sx={{ fontSize: '14px' }}>Edit Series</Typography>
        </MenuItem>
      </Menu>}
      {viewNotes && (
        <ModalComponent
          open={viewNotes}
          containerStyle={{ width: '90%' }}
          header={{
            title:'Appointment Notes',
            closeIconAction: closeViewNotesModal,
          }}
        >
          <Notes
            modalCloseAction={closeViewNotesModal}
            appointmentId={appointmentData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default AppointmentList;
