/* eslint-disable import/no-extraneous-dependencies */
import dayGridPlugin from '@fullcalendar/daygrid';
import InteractionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridDay from '@fullcalendar/timegrid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone, formatPatientNames } from 'src/lib/utils';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import dayjs from 'dayjs';
import { responseModifierAppointments } from 'src/api/helper';
import peopleIcon from 'src/assets/images/people.png';
import personIcon from 'src/assets/images/person.png';
import phoneIcon from 'src/assets/images/phoneOutline.png';
import Container from 'src/components/Container';
import CustomTooltip from 'src/components/Tooltip';
import Modal from 'src/components/modal';
import { getUserTimezone } from 'src/lib/utils';
import AddAppointmentSchedule from 'src/pages/addAppointment';
import CalendarHeader from './Components/CalendarHeader';
import './calendar.scss';

const renderEventContent = (eventInfo) => {
  let icon = {};
  let iconDescription;
  const { type, timeStart, timeEnd } = eventInfo.event.extendedProps;

  if (type?.code === 'follow_up') {
    icon.src = phoneIcon;
    icon.width = 18;
    icon.height = 18;
    iconDescription = type?.name;
  } else if (type?.code === 'group_appointment_type') {
    icon.src = peopleIcon;
    icon.width = 24;
    icon.height = 24;
    iconDescription = type?.name;
  } else {
    icon.src = personIcon;
    icon.width = 18;
    icon.height = 18;
    iconDescription = type?.name;
  }

  return (
    <div className="calendar-event" style={{ color: '#fff' }}>
      <CustomTooltip
        title={
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '5px',
              }}
            >
              <img
                src={icon.src}
                alt={iconDescription}
                width={icon.width}
                height={icon.height}
              />
              <span>{type?.name}</span>
            </div>
            <p style={{ margin: '0' }}>
              <span>{timeStart}</span>
              {timeEnd && <span> - {timeEnd}</span>}
            </p>
          </div>
        }
        bgColor={eventInfo.event.backgroundColor}
      >
        <p
          style={{
            wordBreak: 'break-all',
            overflow: 'hidden',
            padding: '2px 5px',
            borderRadius: '4px',
            color: '#fff',
          }}
        >
          {eventInfo.timeText} {eventInfo.event.title}
        </p>
      </CustomTooltip>
    </div>
  );
};

const Calendar = ({ state }) => {
  const [showModal, setShowModal] = useState(false);
  const [addOnIntialData, setAddOnIntialData] = useState('');
  const [appointmentData, setAppointmentData] = useState({});
  const [currentView, setCurrentView] = useState('dayGridMonth');
  console.log('🚀 ~ Calendar ~ currentView:', currentView);

  const calendarRef = useRef(null);
  const [appointmentsResponse, , appointmentLoading, getAppointment] = useCRUD({
    id: 'appointments-data',
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
    responseModifier: responseModifierAppointments,
    subscribeSocket: true,
  });

  useEffect(() => {
    if (appointmentsResponse) {
      const rowData =
        appointmentsResponse?.results?.find(
          (item) => item.id == state?.appointmentId
        ) || {};
      setShowModal(state?.showModal);
      setAppointmentData(rowData);
    }
  }, [state, appointmentsResponse]);

  const appointmentEvents = useMemo(() => {
    const events = [];
    if (appointmentsResponse?.results?.length) {
      appointmentsResponse?.results?.forEach((item) => {
        const eventStart =
          currentView === 'dayGridMonth'
          ? convertWithTimezone(item.appointmentStart, {
                format: dateFormats.YYYYMMDD,
              })
            : item?.appointmentStart;
        events.push({
          id: item.id,
          title: formatPatientNames(item?.patients),
          start: eventStart,
          status: item.status,
          ...(item?.appointmentEndDate
            ? { end: item?.appointmentEndDate }
            : {}),
          ...(item?.googleMeetLink
            ? { googleMeetLink: item?.googleMeetLink }
            : {}),
          patientId: item?.patient?.id,
          timeStart: item?.appointmentTime,
          timeEnd: item?.appointmentEndTime,
          type: item?.type,
          backgroundColor: item?.status?.colorCode,
          // allDay: false,
          // endTime: item.appointmentEndTime,
        });
      });
    }
    return events;
  }, [appointmentsResponse]);

  const fetchAppointment = useCallback(
    (params) => {
      getAppointment(params);
    },
    [getAppointment]
  );

  // useEffect(() => {
  //   fetchAppointment();
  // }, [showModal]);

  const handleEditAppointment = useCallback(
    (eventClickInfo) => {
      const clickedEvent = eventClickInfo.event;
      // eslint-disable-next-line no-underscore-dangle
      const temp = clickedEvent?._def.publicId;
      const rowData =
        appointmentsResponse?.results?.find((item) => item.id == temp) || {};
      setAppointmentData(rowData);
      setShowModal(true);
    },
    [appointmentsResponse]
  );

  const onAddAppointmentClick = useCallback((appointmentInfo) => {
    setAddOnIntialData({ startDate: dayjs(appointmentInfo?.date) });
    setShowModal(true);
  }, []);

  const handleDatesSet = useCallback((arg) => {
    setCurrentView(arg.view.type);
  }, []);

  const refetchData = () => {
    fetchAppointment();
    setShowModal(false);
    setAppointmentData({});
  };

  const modalCloseAction = () => {
    setAppointmentData({});
    setShowModal(false);
  };
  return (
    <Container loading={appointmentLoading}>
      <div className="calendar-view-container">
        <CalendarHeader
          calendarRef={calendarRef}
          fetchAppointment={fetchAppointment}
          showModal={showModal}
        />
        {showModal && (
          <Modal
            open={showModal}
            onClose={modalCloseAction}
            modalStyle={{ width: '100%' }}
          >
            <AddAppointmentSchedule
              appointmentData={appointmentData}
              setShowModal={setShowModal}
              refetchData={refetchData}
              modalCloseAction={modalCloseAction}
              addOnIntialData={addOnIntialData}
            />
          </Modal>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridDay,
            InteractionPlugin,
            momentTimezonePlugin,
          ]}
          initialView="dayGridMonth" // "timeGridWeek" // 'timeGridDay'
          headerToolbar={false}
          weekends
          events={appointmentEvents}
          eventClick={handleEditAppointment}
          eventContent={renderEventContent}
          // eventClassNames={eventClassNames}
          dateClick={onAddAppointmentClick}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: true,
          }}
          timeZone={getUserTimezone()}
          height="auto"
          slotEventOverlap={false}
          datesSet={handleDatesSet}
        />
      </div>
    </Container>
  );
};

export default Calendar;
