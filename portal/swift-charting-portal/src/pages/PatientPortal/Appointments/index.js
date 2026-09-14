import React, {useCallback, useMemo, useState, useEffect} from 'react';
import { API_URL, BASE_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import useAuthUser from 'src/hooks/useAuthUser';
import useQuery from 'src/hooks/useQuery';
import { GET_APPOINTMENT, ADD_APPOINTMENT } from 'src/store/types';
import FilterComponents from 'src/components/FilterComponents';
import usePatientDetail from 'src/hooks/usePatientDetail';
import AddAppointment from './addAppointment';
import ModalComponent from 'src/components/modal';
import { appointmentStatusCode, dateFormats, timeFormats } from 'src/lib/constants';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { convertWithTimezone, downloadPdf, getDateDiff, getFullName, getUserRole, getUserTimezone, validateZoomSessionToken } from 'src/lib/utils';
import ActionButton from 'src/components/ActionButton';
import { showSnackbar } from 'src/lib/utils';
import { handleJoinAppointment } from 'src/pages/VideoCall/utility';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { getAppointmentEditData } from './formGroup';
import Events from 'src/lib/events';
import palette from 'src/theme/palette';
import dayjs from 'dayjs';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { generatePath, useNavigate } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import { appointmentJoinButtonCondition, getModulePermisions } from 'src/utils/genricMethods';

const Appointment = () => {
  const [user, , , , , validateToken] = useAuthUser();
  const navigate = useNavigate();
  const patientId = user?.id;
  const [,patientDataLoading] = usePatientDetail({ patientId });
  const [defaultData, setDefaultData] = useState();
  const [appointmentData, setAppointmentData] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [open, setOpen] = useState(false);
  const userRole = getUserRole();

  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate, isDelete, isUpdate, isRead, isPrint, isShare } = getModulePermisions({ moduleName: MODULE.patientPortalAppointment, userData }) || {}

  const [updateStatus, , , callAppointmentUpdateStatusAPI, updateStatusclearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-statusUpdate`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });

  const handleJoinSession = (data) => {
    const { id } = data;
    callAppointmentUpdateStatusAPI({ statusCode: "on_going",role: userRole }, `/${id}`);
    if(!data?.zoomSession?.id){
      showSnackbar({
        message: 'Error in session please connect with clinic',
        severity: 'error',
      });
        return;
    }

    if(data?.statusCode !== 'ongoing'){
      callAppointmentUpdateAPI(
        {statusCode: 'ongoing'},
        `/${data?.id}`)
    }
    const sessionUrl = generatePath(UI_ROUTES.zoomSession, {
      sessionId: encrypt(String(data?.zoomSession?.id)),
    });
    
    // Open the URL in a new tab
    window.open(sessionUrl, '_blank');
  }

  const appointmentColumns = [
    {
      label: `Appointment ID`,
      type: 'text',
      dataKey: 'id',
      sort: true,
      maxWidth: '10rem',
    },
    {
      label: `Title`,
      type: 'text',
      dataKey: 'title',
      sort: true,
      maxWidth: '10rem',
      render:({data})=>{
        return <TableTextRendrer>{data?.title || 'N/A' }</TableTextRendrer>
      }
    },
    {
      label: 'Status',
      dataKey: 'statusCode',
      type: 'text',
      sort: true,
      render:({data})=>{
        return <TableTextRendrer style={{maxWidth:'10rem', color: data?.status?.colorCode || palette.text.offWhite}}>{data?.status?.name || 'N/A' }</TableTextRendrer>
      }
    },
    {
      label: 'Date',
      dataKey: 'startDateTime',
      type: 'date',
      format: dateFormats.MMDDYYYYhhmmA,
      sort: true,
      maxWidth: '10rem',
    },
    {
      label: 'Provider',
      type: 'date',
      sort: true,
      maxWidth: '10rem',
      dataKey: 'practitionerId',
      render: ({ data }) => (
        <>
          <TableTextRendrer>
            {getFullName(data?.practitioner)}
          </TableTextRendrer>
        </>
      ),
    },
    {
      label: 'Type',
      dataKey: 'typeCode',
      type: 'text',
      sort: true,
      maxWidth: '10rem',
    },
    {
      label: 'Reason for appointment',
      dataKey: 'reasonForAppointment',
      type: 'text',
      sort: true,
      maxWidth: '5rem',
      render:({data})=>{
        return <TableTextRendrer>{data?.reasonForAppointment || 'N/A' }</TableTextRendrer>
      }
    },
    {
      label: 'Telehealth Video',
      dataKey: 'data',
      render: ({ data }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          {data?.isVirtual
            ? (<LoadingButton 
              size="small" 
              style={{padding: '4px', marginTop: 0, height: 'auto', fontSize: 'smaller'}} 
              label="Join" 
              disabled={appointmentJoinButtonCondition(data)}
              onClick={() => handleJoinSession(data)} 
              />)
            : <TableTextRendrer>{'N/A'}</TableTextRendrer>  
          }
        </div>
      ),
    },
  ];

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

  const [updateResponse, , updateLoading, callAppointmentUpdateAPI, clearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-update`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (!isEmpty(updateStatus)) {
      updateStatusclearData(true);
      handleOnFetchDataList();
      Events.trigger(`REFRESH-PATIENT-DETAIL-${patientId}`);
      Events.trigger(`REFRESH-TABLE-${GET_APPOINTMENT}-${patientId}`);
    }
  }, [handleOnFetchDataList, updateStatus,patientId]);

  const cancelAppointment = useCallback(() => {
    if (appointmentData) {
      const { id } = appointmentData;
      callAppointmentUpdateAPI({ statusCode: 'canceled' }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callAppointmentUpdateAPI, appointmentData]);
  const cancelDialogBox = useCallback((data) => {
    setAppointmentData(data);
    setOpen((value) => !value);
  }, []);

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
        action: cancelAppointment,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [cancelAppointment]
  );

  useEffect(() => {
    if (!isEmpty(updateResponse)) {
      showSnackbar({
        message: 'Cancel successfully',
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
      Events.trigger(`REFRESH-TABLE-${GET_APPOINTMENT}-${patientId}`);
    }
  }, [handleOnFetchDataList, updateResponse,patientId]);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setDefaultData()
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
            onClick: handleOpenModal,
            disabled:patientDataLoading,
          },
        ],
      }),
    [patientDataLoading]
  );

  const handleRescheduleAppointment = useCallback((rowData,event) => {
    if(patientDataLoading){
      return;
    }
    setOpenModal(true);
    setDefaultData(rowData);
  }, [patientDataLoading]);

const handleDownloadICS = (rowData)=>{
  downloadPdf(`/${API_URL.createAppleCalanderEvent}/${rowData?.id}`)
}


const handleBookingSetting = useCallback((rowData,event) => {
  const bookingSettingObj = {};
  if(rowData?.practitioner?.bookingSetting){
    const time = convertWithTimezone(rowData?.startDateTime, { 
      timezone: getUserTimezone(),
    });

    const appointmentRemainingHrs = getDateDiff(new Date(), time, { unit: 'minutes' });
    const cancellationRescheduleTime = rowData?.practitioner?.bookingSetting?.cancellationRescheduleTime;
    const cancellationLeadTime = rowData?.practitioner?.bookingSetting?.cancellationLeadTime;


    if (cancellationRescheduleTime && appointmentRemainingHrs < (cancellationRescheduleTime * 60)) {
      bookingSettingObj.isReschedule = true;
    }
    
    if (cancellationLeadTime && appointmentRemainingHrs < (cancellationLeadTime * 60)) {
        bookingSettingObj.isCancel = true;
    }
  }
  return bookingSettingObj;
}, []);


  const moreActions = (row) => {
    const actions = [];
    
    const bookingSetting = handleBookingSetting(row)
    if (row.statusCode === 'pending' && isUpdate) {
      if(!bookingSetting?.isReschedule){
        actions.push(
          {
            label: 'Reschedule',  // could be done only if it is in pending
            action: () => handleRescheduleAppointment(row)
          },
        )
      }
    }
    if(row.statusCode !== 'canceled' && isUpdate){
      if(!bookingSetting?.isCancel){
        actions.push(
          {
            label: 'Cancel',   // all except cancel
            action: () => cancelDialogBox(row)
          }
        )
      }
    }
    actions.push({
      label: 'Calander Event',   // all except cancel
      action: () => handleDownloadICS(row)
    })
    return actions;
  };

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading || updateLoading}
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
          columns={appointmentColumns}
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
        <AlertDialog
          open={open}
          content="Are you sure you want to cancel this appointment?"
          actions={dialogActions}
        />
      </Container>
      {openModal && (
        <ModalComponent
          open={openModal}
          containerStyle={{ width: '90%' }}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Appointment'
              : 'Reschedule Appointment',
            closeIconAction: handleCloseModal,
          }}
        >
          <AddAppointment
            modalCloseAction={handleCloseModal}
            refetchData={handleOnFetchDataList}
            patientId={patientId}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
}

export default Appointment;