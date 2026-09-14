/* eslint-disable import/no-extraneous-dependencies */
import InteractionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { dateFormats, roleTypes } from 'src/lib/constants';
import { convertWithTimezone, downloadPdf, timeToMinutes } from 'src/lib/utils';

import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { useParams } from 'react-router-dom';
import Container from 'src/components/Container';
import { Iconify } from 'src/components/iconify';
import Modal from 'src/components/modal';
import useAuthUser from 'src/hooks/useAuthUser';
import { decrypt } from 'src/lib/encryption';
import { getUserTimezone } from 'src/lib/utils';
import { MAR_STATUS } from "src/store/types";
import AddMedicationSchedule from '../addMedicationSchedule';
import './calendar.scss';
import CalendarHeader from './calendarHeader';
import { filterEvents, filterResources, generateResources, genereateEvents } from './eventHelper';
import MARStatusLegends from './marStatusLegends';


const getStatus = (slotTime, eventTime) => {
  const convertToMinutes = (time) => {
    const [timePart, meridian] = time.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;

    if (meridian === "PM" && hours !== 12) {
      totalMinutes += 12 * 60;
    }
    if (meridian === "AM" && hours === 12) {
      totalMinutes -= 12 * 60;
    }
    return totalMinutes;
  };

  const slotMinutes = convertToMinutes(slotTime);
  const eventMinutes = convertToMinutes(eventTime);

  const timeDifference = Math.abs(slotMinutes - eventMinutes);

  let status;
  if (timeDifference <= 30 && (slotMinutes >= eventMinutes ||  slotMinutes <= eventMinutes)) {
    status = "On Time";
  } else if (slotMinutes > eventMinutes) {
    status = "Delay";
  } else {
    status = "Before Time";
  }
  return status;
};

const renderEventContent = (eventInfo) => {
  let icon={};
  let iconDescription;
  const { type, timeStart, timeEnd, medicationData, marLog } = eventInfo.event.extendedProps;
  const action = marLog?.action?.name;
  const actionCode = marLog?.action?.code;
  let date;
  let slotDate; 
  let eventDateTime;
  let eventTime;
  let eventLabel = action;
  if(!isEmpty(marLog)){
    date  = marLog?.date;
    slotDate = marLog?.slotDate;
    eventDateTime = convertWithTimezone(date, {requiredPlain:true});
    if(actionCode === 'taken' && medicationData?.medicineStatusCode === "medication_status_active"){
      eventDateTime = convertWithTimezone(slotDate, {requiredPlain:true});
      eventTime = eventDateTime?.format(dateFormats.hhmmA);
      let slotTime = convertWithTimezone(date, {requiredPlain:true})?.format(dateFormats.hhmmA);
      let status = getStatus(slotTime, eventTime);

      eventLabel = `${action}(${status})`
    }
  }else{
    date = medicationData?.eventDate;
    eventDateTime = convertWithTimezone(date, {requiredPlain:true});
    }

  // if (type?.code === 'follow_up') {
  //   icon.src = phoneIcon;
  //   icon.width = 18
  //   icon.height = 18
  //   iconDescription = type?.name;
  // } else if (type?.code === 'group_appointment_type') {
  //   icon.src = peopleIcon;
  //   icon.width = 24
  //   icon.height = 24
  //   iconDescription = type?.name;
  // } else {
  //   icon.src = personIcon;
  //   icon.width = 18
  //   icon.height = 18
  //   iconDescription = type?.name;
  // }
  return (
    <div className="calendar-event" style={{ color: '#fff', fontSize: '12px' }}>
      <p style={{ wordBreak: 'break-all', overflow: 'hidden', padding: '2px 5px', borderRadius: '4px', color: '#fff' }}>
        {/* {eventInfo.timeText} {eventInfo.event.title} */}
        {eventDateTime?.format(dateFormats.hhmmA) || ''}
        <br/><b>{eventLabel}</b>
      </p>
      {/* <CustomTooltip
        title={
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <img src={icon.src} alt={iconDescription} width={icon.width} height={icon.height} />
              <span>{type?.name}</span>
            </div>
            <p style={{ margin: '0' }}>
              <span>{timeStart}</span>
              {timeEnd && (
                <span> - {timeEnd}</span>
              )}
            </p>
          </div>
        }
        bgColor={eventInfo.event.backgroundColor}
      >
      </CustomTooltip> */}
    </div>
  );
};

const Calendar = () => {
  const [user, , , ] = useAuthUser();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const [clickedDateAndTime, setClickedDateAndTime] = useState('');
  const [defaultData, setDefaultData] = useState({});
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const [userInfo] = useAuthUser();

  const [allEvents, setAllEvents] = useState([]);

  const [filteredEvents, setFilteredEvents] = useState([]);

  const [allResources, setAllResources] = useState([]);

  const [filteredResources, setFilteredResources] = useState([]);

  const [appliedFilter, setAppliedFilter] = useState({});


  const timezone = getUserTimezone();

  let { patientId, medicationId } = params || {};
  if(patientId){
    patientId= decrypt(patientId)
  }
  if(medicationId){
    medicationId= decrypt(medicationId)
  }
  const calendarRef = useRef(null);
  const [medicationItemsResponse, ,medicationItemsLodaing ,getMedicationItems] = useCRUD({
    id: `MEDICATION-DATA-CALANDER-${medicationId}-${patientId}`,
    url: medicationId ? `${API_URL.medicationItems}?patientId=${patientId}&patientMedicationId=${medicationId}`: `${API_URL.medicationItems}?patientId=${patientId}`,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const [medicationItemLogResponse, ,medicationItemLogLodaing ,getMedicationItemLogs] = useCRUD({
    id: 'MEDICATION-ITEM-MAR-LOG-DATA-CALANDER',
    url: API_URL.medicationItemMARLog,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    });

    const marActionCode = 'mar_log_action';
    const [marCode, , ,getMARActionCode] = useCRUD({
      id:  MAR_STATUS,
      url: `${API_URL.getMasters}/${marActionCode}`,
      type: REQUEST_METHOD.get,
    });

const handleDownloadMAR = (data) => {
  const patientMedicationItemId = data?.id ;
  if(patientMedicationItemId){
    downloadPdf(
      `/${API_URL.downloadMedicationMARLogPDF}/${patientMedicationItemId}`, 'EMAR'
    )
  }
}

const renderResourceContent = (resourceInfo) => {
  const diagnosisList = resourceInfo?.resource?.extendedProps?.diagnosis?.map((diagnos)=> diagnos?.icd?.diagnosisProblem?.name)
  const medicationItemData = resourceInfo?.resource;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{ marginRight: 'auto' }}>{resourceInfo.resource.title}</h4>
        <span>
          {resourceInfo?.resource?.extendedProps?.isMARLogExists && (
            <IconButton
              loading={medicationItemsLodaing}
              onClick={() => handleDownloadMAR(medicationItemData)}
              sx={{
                mr: 1,
                color: 'text.primary',
              }}
            >
              <Iconify icon="mdi:file-pdf-box" />
            </IconButton>
          )}
        </span>
      </div>
      <p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          {diagnosisList.map((diagnosis, index) => (
            <li key={index}>{diagnosis}</li>
          ))}
        </ul>
      <br/><b>Status:</b> {resourceInfo?.resource?.extendedProps?.medicineStatus?.name}

      <br/><b>Start Date:</b> {convertWithTimezone(resourceInfo?.resource?.extendedProps?.startDate,{format:dateFormats.MMDDYYYY})}
      <br/><b>Duration:</b> {resourceInfo?.resource?.extendedProps?.durationAmount} {resourceInfo?.resource?.extendedProps?.durationName}
      <br/>
      <b>Discontinue Date:</b> {resourceInfo?.resource?.extendedProps?.medicineStatus?.code === 'medication_status_discontinued' 
      ? convertWithTimezone(resourceInfo?.resource?.extendedProps?.discontinueDate,{format:dateFormats.MMDDYYYY}) 
      : 'Not Available'}
      <br/>
      {resourceInfo?.resource?.extendedProps?.medicineStatus?.code === 'medication_status_discontinued' && (<><b>Discontinue Reason:</b> {resourceInfo?.resource?.extendedProps?.medicineStatusReason || 'N/A'}</>)}
      </p>
    </div>
  );
};


const fetchAppointment = useCallback(
    (params) => {
      getMedicationItemLogs({...params?.dynamicFilter,timezone});
      getMedicationItems();
    },
    [getMedicationItemLogs]
  );

  const onFilterChange = useCallback((params) => {
    setAppliedFilter(params)
  	},[]);

  useEffect(() => {
    getMedicationItemLogs();
    getMedicationItems();
    getMARActionCode();
  }, [getMedicationItems, getMedicationItemLogs]);



  useEffect(()=>{
      const events= filterEvents(allEvents,appliedFilter);
      setFilteredEvents(events);
      },[appliedFilter,allEvents])
      
  useEffect(()=>{
    if((!isEmpty(medicationItemsResponse) || !isEmpty(medicationItemLogResponse)) && !isEmpty(marCode)){
      const events = genereateEvents(medicationItemsResponse,medicationItemLogResponse,marCode?.results );
      setAllEvents(events)
    }
  },[medicationItemLogResponse,medicationItemsResponse,marCode]);


  useEffect(()=>{
    const resources= filterResources(allResources,appliedFilter);
    setFilteredResources(resources);
},[appliedFilter,allResources])

  useEffect(()=>{
    if(!isEmpty(medicationItemsResponse)){
      const resources = generateResources(medicationItemsResponse);
      setAllResources(resources)
    }
  },[medicationItemLogResponse,medicationItemsResponse]);

  const handleEditAppointment = useCallback((eventClickInfo) => {
    const clickedEvent = eventClickInfo.event;
    // eslint-disable-next-line no-underscore-dangle
    const{medicationData, marLog} =clickedEvent?._def.extendedProps;
    const {eventDate,startHour,startMeridien,startMinute, medicineStatusCode, slotStartHour, slotStartMinute,slotStartMeridien,slotDate} = medicationData || {}
    const actionCode = marLog?.action?.code;
    const { clinicianInitial, comment, givenByCaregiver, clinicianId, id, refusedReason,overrideReason} = marLog;
    const slotTimeInMinutes = timeToMinutes(slotStartHour, slotStartMinute, slotStartMeridien);
    const startTimeInMinutes = timeToMinutes(startHour, startMinute, startMeridien);
    const emarOntime = Math.abs(slotTimeInMinutes - startTimeInMinutes) > 30
    
  
    if(medicineStatusCode === "medication_status_active" && actionCode ==="taken"){
      setDefaultData({
        id,
        refusedReason,
        clinicianInitial,
        comment,
        givenByCaregiver,
        ...(clinicianId ?{clinicianId}:userInfo?.role === roleTypes.practitioner? {clinicianId:userInfo.id}:{} ),
        actionCode,
        patientMedicationItemId:medicationData.id,
        eventDate:dayjs(eventDate),
        startHour: slotStartHour,
        startMeridien: slotStartMeridien,
        startMinute: slotStartMinute, 
        medicineStatusCode,
        overrideReason: emarOntime ? overrideReason : null,
        ...(medicineStatusCode === 'medication_status_active'  && { slotStartHour: startHour ? startHour : slotStartHour}),
        ...(medicineStatusCode === 'medication_status_active'  && { slotStartMeridien: startMeridien? startMeridien: slotStartMeridien}),
        ...(medicineStatusCode === 'medication_status_active'  && { slotStartMinute: startMinute? startMinute: slotStartMinute}),
        ...(medicineStatusCode === 'medication_status_active'  && { slotEventDate: slotDate? dayjs(slotDate):dayjs(eventDate)}),
  
        medicationDosage: `${medicationData.brandNameDrug} ${medicationData.amount} ${medicationData.unit.name}`
      });
    }else{
      console.log('handleEditAppointment ELSE')
      setDefaultData({
        id,
        refusedReason,
        clinicianInitial,
        comment,
        givenByCaregiver,
        ...(clinicianId ?{clinicianId}:userInfo?.role === roleTypes.practitioner? {clinicianId:userInfo.id}:{} ),
        actionCode,
        patientMedicationItemId:medicationData.id,
        eventDate:dayjs(eventDate),
        startHour,
        startMeridien,
        startMinute, 
        medicineStatusCode,
        ...((medicineStatusCode !== 'medication_status_not_administered' || medicineStatusCode !== 'medication_status_discontinued') && { slotStartHour: slotStartHour ? slotStartHour : startHour}),
        ...((medicineStatusCode !== 'medication_status_not_administered' || medicineStatusCode !== 'medication_status_discontinued') && { slotStartMeridien: slotStartMeridien? slotStartMeridien: startMeridien}),
        ...((medicineStatusCode !== 'medication_status_not_administered' || medicineStatusCode !== 'medication_status_discontinued') && { slotStartMinute: slotStartMinute? slotStartMinute:startMinute}),
        ...((medicineStatusCode !== 'medication_status_not_administered' || medicineStatusCode !== 'medication_status_discontinued') && { slotEventDate: slotDate? dayjs(slotDate):dayjs(eventDate)}),

        medicationDosage: `${medicationData.brandNameDrug} ${medicationData.amount} ${medicationData.unit.name}`
      });
    }
    setShowModal(true);
  }, []);


  const onAddAppointmentClick = useCallback((eventClickInfo) => {
    const resource = eventClickInfo.resource._resource;
    const medicationStatusCode = resource.extendedProps.medicineStatus.code
    if(medicationStatusCode === 'medication_status_not_administered'){
      const eventDate=convertWithTimezone(dayjs(eventClickInfo.date).utc().format(),{format:dateFormats.MMDDYYYY})
      const startTime = convertWithTimezone(dayjs(eventClickInfo.date).utc().format(),{format:dateFormats.hhmmA})
       const recordTimeArray = startTime.split(' ');
       const time = recordTimeArray[0];
       const meridien = recordTimeArray[1];
   
       const timeArray = time.split(':');
       const hour = timeArray[0];
       const minute = timeArray[1];
      let loggedInPractitioner;
      if(userInfo?.role === roleTypes.practitioner){
        loggedInPractitioner = userInfo?.id;
      } 
  
  
      setDefaultData({
        patientMedicationItemId:resource.id,
        eventDate, startHour: hour,
        startMinute: minute,
        startMeridien: meridien,
        medicationDosage: resource.title,
        clinicianId: loggedInPractitioner,
      });
  
      setShowModal(true);
    }
  }, []);

  const handleDatesSet = useCallback((arg) => {
    setCurrentView(arg.view.type);
  }, []);

  const refetchData = ()=>{
    fetchAppointment();
    setShowModal(false);
    setDefaultData({});
  }

  const modalCloseAction =()=>{
    setDefaultData({});
    setShowModal(false);
  }


  return (
<Container loading={medicationItemsLodaing}>
    <div className="calendar-view-container">
      <CalendarHeader
        calendarRef={calendarRef}
        fetchAppointment={fetchAppointment}
        onFilterChange={onFilterChange}
        showModal={showModal}
        resourceInfo={filteredResources}
        patientId={patientId}
        medicationId={medicationId}
      />
     {showModal &&  <Modal
        open={showModal}
        onClose={modalCloseAction}
        modalStyle={{width:'100%'}}
      >
        <AddMedicationSchedule
          defaultData={defaultData}
          setShowModal={setShowModal}
          refetchData={refetchData}
          modalCloseAction={modalCloseAction}
          clickedDateAndTime={clickedDateAndTime}
        />
      </Modal>}
      <FullCalendar
        ref={calendarRef}
        plugins={[
          // dayGridPlugin,
          // timeGridDay,
          InteractionPlugin,
          momentTimezonePlugin,
          resourceTimelinePlugin,
        ]}
        slotMinWidth={60}
        initialView="resourceTimelineDay" // "resourceTimelineWeek" // 'resourceTimelineMonth'
        headerToolbar={false}
        weekends
        events={filteredEvents}
        eventClick={handleEditAppointment}
        eventContent={renderEventContent}
        // eventClassNames={eventClassNames}
        dateClick={onAddAppointmentClick}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: true,
        }}
        height="auto"
        slotEventOverlap={false}
        datesSet={handleDatesSet}
        resources={filteredResources}
        resourceLabelContent={renderResourceContent}
        resourceAreaColumns= {[
          {
            field: 'title',
            headerContent: 'Medications'
          }
        ]}
        timeZone={timezone}
      />

      {/* Color Chips Section */}
      <MARStatusLegends />

    </div>
    </Container>
  );
};

export default Calendar;
