/* eslint-disable import/no-extraneous-dependencies */
import dayGridPlugin from '@fullcalendar/daygrid';
import InteractionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridDay from '@fullcalendar/timegrid';
import { useCallback, useMemo, useRef, useState } from 'react';
import { dateFormats } from 'src/lib/constants';
import { convertWithTimezone } from 'src/lib/utils';

import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useCRUD from 'src/hooks/useCRUD';

import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import dayjs from 'dayjs';
import { STAFF_LOCATION_DATA } from 'src/store/types';
import peopleIcon from 'src/assets/images/people.png';
import personIcon from 'src/assets/images/person.png';
import phoneIcon from 'src/assets/images/phoneOutline.png';
import Container from 'src/components/Container';
import CustomTooltip from 'src/components/Tooltip';
import Modal from 'src/components/modal';
import { getUserTimezone } from 'src/lib/utils';
import './calendar.scss';
import CalendarHeader from './CalendarHeader';
import AddCalendarSchedule from './addCalendarSchedule';
import CustomForm from 'src/components/form';
import { useForm } from 'react-hook-form';
import { WiredLocationField } from 'src/wiredComponent/Form/FormFields';
import useAuthUser from 'src/hooks/useAuthUser';
import { isEmpty } from 'lodash';
import useQuery from 'src/hooks/useQuery';
import Typography from 'src/components/Typography';
import palette from 'src/theme/palette';

const renderEventContent = (eventInfo) => {
  const {  timeStart, timeEnd } = eventInfo.event.extendedProps;
  return (
    <div className="calendar-event" style={{ color: '#fff' }}>
      <CustomTooltip
        title={
          <div>
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

const CalendarSchedule = () => {
  const apiParams = useRef({});
  const [user, , ,] = useAuthUser();
  const practitionerId = user.id;
  const [showModal, setShowModal] = useState(false);
  const [addOnIntialData, setAddOnIntialData] = useState('');
  const [scheduleData, setScheduleData] = useState({});
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const calendarRef = useRef(null);
  const [
    calendarScheduleResponse,
    ,
    calendarScheduletLoading,
    getCalendarSchedule,
  ] = useCRUD({
    id: 'calendar--data',
    url: API_URL.calendarSchedule,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const [locationResponse, , , , , , , , , fetchLocations] = useQuery({
    listId: STAFF_LOCATION_DATA,
    url: API_URL.staffLocation,
    type: REQUEST_METHOD.get,
    queryParams: { staffId: practitionerId },
  });

  const appointmentEvents = useMemo(() => {
    const events = [];
    if (calendarScheduleResponse?.length) {
      calendarScheduleResponse?.forEach((item) => {
        const eventStart =
          currentView === 'dayGridMonth'
            ? convertWithTimezone(item.startDateTime, {
                format: dateFormats.YYYYMMDD,
              })
            : item?.startDateTime;
        events.push({
          id: item.id,
          ...(currentView === 'dayGridMonth'
            ? {
                title: `${item?.shiftTitle || ''} ${convertWithTimezone(
                  item.startDateTime,
                  {
                    format: 'hh:mm A',
                  }
                )} - ${convertWithTimezone(item?.endDateTime, {
                  format: 'hh:mm A',
                })}`,
              }
            : {}),
          start: eventStart,
          ...(currentView === 'dayGridMonth' ? {} : { end: item?.endDateTime }),
          timeStart: convertWithTimezone(item.startDateTime, {
            format: 'hh:mm A',
          }),
          timeEnd: convertWithTimezone(item?.endDateTime, {
            format: 'hh:mm A',
          }),
          backgroundColor: item?.isActive ? '#337AB7' : '#81878a',
        });
      });
    }
    return events;
  }, [calendarScheduleResponse]);

  const fetchCalendarSchedule = useCallback(
    (params) => {
      getCalendarSchedule(params);
    },
    [getCalendarSchedule]
  );

  const handleEditAppointment = useCallback(
    (eventClickInfo) => {
      const clickedEvent = eventClickInfo.event;
      // eslint-disable-next-line no-underscore-dangle
      const temp = clickedEvent?._def.publicId;
      const rowData =
        calendarScheduleResponse?.find((item) => item.id == temp) || {};
      setScheduleData(rowData);

      setShowModal(true);
    },
    [calendarScheduleResponse]
  );

  const onCaledarConfig = useCallback((calendarInfo) => {
    setAddOnIntialData({ startDate: dayjs(calendarInfo?.date) });

    setShowModal(true);
  }, []);

  const handleDatesSet = useCallback((arg) => {
    setCurrentView(arg.view.type);
  }, []);

  const refetchData = () => {
    fetchCalendarSchedule(apiParams.current);
    setShowModal(false);
    setScheduleData({});
  };

  const modalCloseAction = () => {
    setScheduleData({});
    setShowModal(false);
  };
  return (
    <Container loading={calendarScheduletLoading}>
      {showModal && (
        <Modal
          open={showModal}
          onClose={modalCloseAction}
          modalStyle={{ width: '100%' }}
        >
          <AddCalendarSchedule
            selectedLocation={apiParams.current.locationId}
            scheduleData={scheduleData}
            setShowModal={setShowModal}
            refetchData={refetchData}
            modalCloseAction={modalCloseAction}
            addOnIntialData={addOnIntialData}
          />
        </Modal>
      )}
      {locationResponse?.results && !isEmpty(locationResponse?.results) ? (
        <div className="calendar-view-container">
          <CalendarHeader
            calendarRef={calendarRef}
            fetchCalendarSchedule={fetchCalendarSchedule}
            apiParams={apiParams}
            defaultOptions={locationResponse?.results}
          />

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
            dateClick={onCaledarConfig}
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
          <div className="dashboard-legends-container">
            <div className="legends-item">
              <div
                className="color-item"
                style={{ backgroundColor: '#337AB7' }}
              />
              <div className="color-label">Active</div>
            </div>
            <div className="legends-item">
              <div
                className="color-item"
                style={{ backgroundColor: '#81878a' }}
              />
              <div className="color-label">Deactived</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            color={palette.text.secondary}
            sx={{ fontSize: 24, lineHeight: '36px', fontWeight: 700 , marginTop: 25}}
          >
            Please assign location first
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default CalendarSchedule;
