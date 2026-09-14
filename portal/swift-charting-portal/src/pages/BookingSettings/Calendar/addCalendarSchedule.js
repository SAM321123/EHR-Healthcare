import { useMemo, useState } from 'react';

import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import moment from 'moment';
import AddSchedule from './addSchedule';
import { getScheduleEditData } from './formGroup';

const AddCalendarSchedule = ({
  selectedLocation,
  scheduleData,
  refetchData,
  modalCloseAction,
  addOnIntialData,
}) => {
  const [viewMode, setViewMode] = useState(!!scheduleData?.id);
  const [editSeries, setEditSeries] = useState(true);

  const isAppointmentIdPresent = !!scheduleData?.id;
  const appointmentDate = moment(scheduleData?.startDateTime);

  // Get the current date and time
  const currentDateTime = moment();

  // Check if the appointmentDate is after the current date and time
  const isFutureAppointment = appointmentDate.isAfter(currentDateTime);

  const defaultData= useMemo(()=>{
    return getScheduleEditData(scheduleData);
  },[scheduleData]);


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
          !scheduleData?.id
            ? 'Add Schedule'
            : viewMode
            ? 'View Schedule'
            : 'Edit Schedule'
        }
        rightContent={[
          isAppointmentIdPresent && viewMode && {
              render: <LoadingButton label="Edit Occurance"  variant="outlinedSecondary" onClick={handleEditOccurence} sx={{height:36,marginRight:'10px'}} />,
            },
            isAppointmentIdPresent && viewMode && isFutureAppointment  && scheduleData.isRecurring && {
              render: <LoadingButton label="Edit Series"   variant="outlinedSecondary" onClick={handleEditSeries} sx={{height:36,marginRight:'10px'}} />,

            },
        ]}
      />
      <AddSchedule
      selectedLocation={selectedLocation}
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

export default AddCalendarSchedule;
