import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import PageHeader from 'src/components/PageHeader';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { decrypt } from 'src/lib/encryption';
import { MEDICATION_ITEM_LIST } from 'src/store/types';
import AddMedicationSchedule from './addMedicationSchedule';
import dayjs from 'dayjs';
import { convertWithTimezone, getMedicineName } from 'src/lib/utils';


const medicationColumns = [
    {
      label: 'Medication',
      maxWidth: '6rem',
      type: 'text',
      render: ({ data }) => {
        return (
          <TableTextRendrer style={{ maxWidth: '20rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getMedicineName(data)}
        </TableTextRendrer>
        );
      },
    },
    {
      label: 'Start Date',
      type: 'date',
      dataKey: 'startDate',
      format: dateFormats.MMMDDYYYY,
      maxWidth: '10rem',
    },
    {
      label: 'Schedule',
      maxWidth: '6rem',
      type: 'text',
      dataKey: 'timeSlots',
      render: ({ data }) => {
        const timeSlots = data?.schedules?.timeSlots || [];
    
        const formattedTimeSlots = timeSlots
            .map(slot => {
                const { startHour, startMinute, startMeridien } = slot;
    
                // Parse the time slot to create a dayjs object in UTC
                const utcTimeString = `${startHour}:${startMinute} ${startMeridien}`;
                const utcTime = dayjs.utc(utcTimeString, "hh:mm A");
    
                // Convert the UTC time to the user's timezone
                const userTime = convertWithTimezone(utcTime, {
                    format: "hh:mm A" // Format back to hour, minute, and AM/PM
                });
    
                return userTime;
            })
            .join(', '); // Join all formatted times with a comma separator
    
        console.log('Formatted time slots in user timezone:', formattedTimeSlots);
    
        // Return the formatted time slots for display in the table
        return (
            <TableTextRendrer style={{ maxWidth: '20rem' }}>
                {formattedTimeSlots || 'N/A'}
            </TableTextRendrer>
        );
    }
    
  }
    // {
    //     label: 'Schedule',
    //     maxWidth: '6rem',
    //     type: 'text',
    //     dataKey: 'timeSlots',
    //     render: ({data}) => {
    //       console.log('data time slot------------------>', data?.schedules?.timeSlots)
    //     }
    // },
];

const MedicationSchedule = ({applyContainer=true, onClose}={}) => {
    const params = useParams();
    const [defaultData, setDefaultData] = useState();
    const [addMedicationSchedule, setAddMedicationSchedule] = useState(false);

    let { patientId, medicationId } = params || {};
    patientId = decrypt(patientId);

    if(medicationId){
      medicationId= decrypt(medicationId)
    }
   
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
      listId: `${MEDICATION_ITEM_LIST}-${patientId}-${medicationId}`,
      url: `${API_URL.medicationItems}`,
      type: REQUEST_METHOD.get,
      subscribeSocket: true,
      queryParams: { patientMedicationId: medicationId, patientId: patientId },
    });

    // const [
    //     response,
    //     loading,
    //     page,
    //     rowsPerPage,
    //     handlePageChange,
    //     filters,
    //     handleFilters,
    //     sort,
    //     handleSort,
    //     handleOnFetchDataList,
    //   ] = useQuery({
    //     listId: `${MEDICATION_LIST}-${patientId}`,
    //     url: API_URL.medication,
    //     type: REQUEST_METHOD.get,
    //     subscribeSocket: true,
    //     queryParams: { patientId,patientEncounterId: encounterId },
    //   });

    const navigate = useNavigate();
    const handleBack = () => {
        if (onClose) {
            onClose();
            return;
        }
        navigate(-1);
    };
  
    const handleAddMedicationSchedule = (data) => {
      // Convert each time slot to user's timezone
      const timeSlotsInUserTimezone = (data?.schedules?.timeSlots || []).map(slot => {
          const utcTimeString = `${slot.startHour}:${slot.startMinute} ${slot.startMeridien}`;
          const utcTime = dayjs.utc(utcTimeString, "hh:mm A");
  
          // Convert UTC time to user's timezone
          const userTime = convertWithTimezone(utcTime, {
              format: "hh:mm A"
          });
  
          // Split formatted time back into hour, minute, and meridien
          const [formattedHourMinute, formattedMeridien] = userTime.split(' ');
          const [startHour, startMinute] = formattedHourMinute.split(':');
  
          return {
              startHour,
              startMinute,
              startMeridien: formattedMeridien
          };
      });
  
      // Prepare default data values
      const defaultDataValues = {
        id: data?.id,
        startDate: data?.startDate,
        endDate: data?.schedules?.endDate,
        durationAmount: data?.durationAmount,
        durationCode: data?.durationCode,
        scheduleId: data?.schedules?.id || null,
        genericDrug: data?.genericDrug,
        schedules: data?.schedules,
        timeSlots: timeSlotsInUserTimezone
      };
  
      setDefaultData(defaultDataValues);
      setAddMedicationSchedule(true);
  };
  

    const moreActions = [
        {
          label: 'Add Schedule',
          icon: 'schedule',
          action: handleAddMedicationSchedule,
        },
      ];
    
    const closeMedicationModal = useCallback(() => {
        setAddMedicationSchedule(false);
        setDefaultData(null);
    }, []);  
    
    return (
            <>
              <Container
                style={{ display: 'flex', flexDirection: 'column' }}
                loading={loading}
                applyContainer={applyContainer}
              >
                <PageHeader showBackIcon title="Back" onPressBackIcon={handleBack} /> 
                <Table
                //   headerComponent={
                //     <div>
                //       {showPatientInfo && (
                //         <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
                //       )}
                //       {/* <FilterCollectionHeader    onFilterChange={handleFilters}
                //         filters={filters} /> */}
                //     </div>
                //   }
                  data={response?.results || []}
                  totalCount={response?.totalResults}
                  columns={medicationColumns}
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
                {/* <AlertDialog
                  open={open}
                  content="Are you sure you want to delete?"
                  actions={dialogActions}
                /> */}
              </Container>
               {/* {!isEmpty(shareMedicationData) && (
                <ShareAndFaxModal
                  data={setShareMedicationData}
                  onClose={closeShareAndFaxModal}
                  url={`${API_URL.sharePatientMedication}/${shareMedicationData?.id}`}
                  onRefersh={onRefershShareAndFaxModal}
                  faxType={faxType.PATIENT_MEDICATION}
                  title="Share Medication"
                />
              )} */}
              {addMedicationSchedule && (
                <ModalComponent
                open={addMedicationSchedule}
                header={{
                  title: 'Schedule Medication',
                  closeIconAction: closeMedicationModal,
                }}
                containerStyle={{ width: '90%' }}
                >
                  <AddMedicationSchedule
                    refetchData={handleOnFetchDataList}
                    modalCloseAction={closeMedicationModal}
                    defaultData={defaultData}  
                  />  
                  {/* <MedicationFormNew
                    customMedicationId={defaultData}
                    onClose={closeMedicationModal}
                    onRefersh={handleOnFetchDataList}
                    asPopUp={asPopUp}
                  /> */}

                </ModalComponent>
              )}
            </>
        );
}
export default MedicationSchedule;

