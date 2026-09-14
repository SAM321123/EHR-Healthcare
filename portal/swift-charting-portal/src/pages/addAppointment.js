import { useMemo, useState } from 'react';

import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import palette from 'src/theme/palette';
import AddAppointment from './Patient/components/Appointment/addAppointment';
import { getAppointmentEditData } from './Patient/components/Appointment/formGroup';
import { handleJoinAppointment } from './VideoCall/utility';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import moment from 'moment';
import useCRUD from 'src/hooks/useCRUD';
import { ADD_APPOINTMENT } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getUserRole, showSnackbar } from 'src/lib/utils';
import { generatePath } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { encrypt } from 'src/lib/encryption';
import { appointmentJoinButtonCondition } from 'src/utils/genricMethods';

const AddAppointmentSchedule = ({
  appointmentData,
  refetchData,
  modalCloseAction,
  addOnIntialData,
}) => {
  console.log("🚀 ~ appointmentData:", appointmentData)
  const [updateStatus, , , callAppointmentUpdateStatusAPI, updateStatusclearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-statusUpdate`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.update,
  });
  const [updateResponse, , updateLoading, callAppointmentUpdateAPI, updateClearData] = useCRUD({
    id: `${ADD_APPOINTMENT}-statusUpdate2`,
    url: API_URL.appointment,
    type:REQUEST_METHOD.update,
  });
  const [viewMode, setViewMode] = useState(!!appointmentData?.id);
  const [editSeries, setEditSeries] = useState(true);
  const userRole = getUserRole();


  const isAppointmentIdPresent = !!appointmentData?.id;
  const appointmentDate = moment(appointmentData?.startDateTime);

  // Get the current date and time
  const currentDateTime = moment();

  // Check if the appointmentDate is after the current date and time
  const isFutureAppointment = appointmentDate.isAfter(currentDateTime);

  const defaultData= useMemo(()=>{
    return getAppointmentEditData(appointmentData);
  },[appointmentData]);

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

  const handleEditOccurence = ()=>{
    setEditSeries(false);
    setViewMode(false);
  }
  const handleEditSeries = ()=>{
    setEditSeries(true);
    setViewMode(false);
  }

  return (
    <Container>
      <PageHeader
        isBreadCrumbVisible
        wrapperStyle={{marginTop:'22px'}}
        style={{paddingLeft:'24px',paddingRight:'24px',marginBottom:0 }}

        title={
          !appointmentData?.id
            ? 'Add Appointment'
            : viewMode
            ? 'View Appointment'
            : 'Edit Appointment'
        }
        leftContent={[
          isAppointmentIdPresent && {
            type: 'chip',
            label: appointmentData?.status?.name,
            sx: {
              fontSize: '1rem',
              height: 25,
              padding: 0.5,
              color: palette.common.white,
              backgroundColor:appointmentData?.status?.colorCode,
            },
          },
        ]}
        rightContent={[
          isAppointmentIdPresent &&
          appointmentData?.zoomSession?.id && {
              type: 'action',
              label:"Join",
                onClick:()=>handleJoinSession(appointmentData),
                disabled:appointmentJoinButtonCondition(appointmentData)
            },
          isAppointmentIdPresent && viewMode && {
              render: <LoadingButton label="Edit Occurance"  variant="outlinedSecondary" onClick={handleEditOccurence} sx={{height:36,marginRight:'10px'}} />,
            },
            isAppointmentIdPresent && viewMode && isFutureAppointment  && appointmentData.isRecurring && {
              render: <LoadingButton label="Edit Series"   variant="outlinedSecondary" onClick={handleEditSeries} sx={{height:36,marginRight:'10px'}} />,

            },
        ]}
      />
      <AddAppointment
        viewMode={viewMode}
        modalCloseAction={modalCloseAction}
        defaultData={defaultData}
        editSeries={editSeries}
        refetchData={refetchData}
        fromCalender={true}
        addOnIntialData={addOnIntialData}
      />
    </Container>
  );
};

export default AddAppointmentSchedule;
