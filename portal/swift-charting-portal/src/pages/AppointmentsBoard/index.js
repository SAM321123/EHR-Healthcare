import { useCallback, useEffect, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { getEndOfTheDate, getNewDate, getStartOfTheDate } from 'src/lib/utils';
import useCRUD from 'src/hooks/useCRUD';
import palette from 'src/theme/palette';
import AppointmentStatusLegends from '../../components/AppointmentStatusLegends';
import Filters from './Components/Filters';
import Widgets from './Components/Widgets';
import Appointments from './Appointments';
import Header from './Components/Header';

import './appointmentsBoard.scss';

const appointmentData = [
  {
    label: 'Pending',
    status: 'Pending Confirmation',
    color: palette.appointmentStatus['Pending Confirmation'],
  },
  {
    label: 'Confirmed',
    status: 'Confirmed',
    color: palette.appointmentStatus.Confirmed,
  },
  {
    label: 'Waiting Room',
    status: 'Waiting Room',
    color: palette.appointmentStatus['Waiting Room'],
  },
  {
    label: 'Check In',
    status: 'Check In',
    color: palette.appointmentStatus['Check In'],
  },
  {
    label: 'Ready for practitioner',
    status: 'Ready For Practitioner',
    color: palette.appointmentStatus['Ready For Practitioner'],
  },
  {
    label: 'Completed',
    status: 'Completed',
    color: palette.appointmentStatus.Completed,
  },
  {
    label: 'Cancelled',
    status: 'Cancelled',
    color: palette.appointmentStatus.Cancelled,
  },
  {
    label: 'Missed',
    status: 'missed',
    color: palette.appointmentStatus.Missed,
  },
];

const acceptance = {
  'Pending Confirmation': ['Missed'],
  Confirmed: ['Pending Confirmation', 'Check In', 'Missed'],
  'Waiting Room': ['Confirmed', 'Check In'],
  'Check In': ['Ready For Practitioner', 'Confirmed', 'Waiting Room'],
  Missed: [],
  Cancelled: ['Pending Confirmation', 'Missed', 'Confirmed'],
  Completed: ['Check In', 'Ready For Practitioner'],
  'Ready For Practitioner': ['Check In'],
};
const widgets = [
  {
    label: 'Completed',
    value: 'completed',
    startIcon: 'complete-icon',
  },
  {
    label: 'Cancelled',
    value: 'cancelled',
    startIcon: 'cancel-icon',
  },
  {
    label: 'Missed',
    value: 'missed',
    startIcon: 'due-icon',
  },
];

const responseModifier = (appointmentsResponse) => {
  const data = appointmentData?.map((item) => {
    const newAppointemntData = appointmentsResponse?.results?.filter(
      (appointment) => appointment?.status === item?.status
    );
    const newItem = { ...item, appointmentData: newAppointemntData };
    return newItem;
  });
  // eslint-disable-next-line no-underscore-dangle
  return { data, _metaData: appointmentsResponse._metaData };
};

const handleSocketData = ({ event, existingData = {} }) => {
  const allAppointmentData = { ...existingData };
  const { operation } = event || {};
  const { data } = event || {};

  if (data) {
    const desiredQueueIndex = allAppointmentData?.data?.findIndex(
      (queue) => queue?.status === data?.status
    );
    let desiredQueue = [
      ...(allAppointmentData?.data?.[desiredQueueIndex]?.appointmentData || []),
    ];
    if (Array.isArray(desiredQueue)) {
      if (operation === 'created') {
        desiredQueue.unshift(data);
      } else if (operation === 'updated') {
        const desiredAppointmentIndex = desiredQueue?.findIndex(
          (appt) => appt?.id === data?.id
        );
        if (desiredAppointmentIndex !== -1) {
          desiredQueue[desiredAppointmentIndex] = {
            ...desiredQueue[desiredAppointmentIndex],
            ...data,
          };
        } else {
          desiredQueue.unshift(data);
          const oldAppointmentQueueIndex = allAppointmentData?.data?.findIndex(
            (dataItem) =>
              dataItem?.appointmentData?.some((appt) => appt?.id === data?.id)
          );
          if (oldAppointmentQueueIndex !== -1) {
            const oldQueue = [
              ...(allAppointmentData?.data?.[oldAppointmentQueueIndex]
                ?.appointmentData || []),
            ];
            allAppointmentData.data[oldAppointmentQueueIndex].appointmentData =
              oldQueue?.filter((appt) => appt?.id !== data?.id);
          }
        }
      } else if (operation === 'remove') {
        desiredQueue = desiredQueue?.filter((appt) => appt?.id !== data?.id);
      }
    }
    allAppointmentData.data[desiredQueueIndex].appointmentData = desiredQueue;
  }
  return allAppointmentData;
};

const AppointmentsBoard = () => {
  const [filters, setFilters] = useState({
    startDate: getStartOfTheDate(getNewDate(), { unit: 'day' }),
    endDate: getEndOfTheDate(getNewDate(), { unit: 'day' }),
  });

  const [statsFilter, setStatsFilters] = useState({
    month: getNewDate().toDate().getMonth(),
    year: getNewDate().toDate().getFullYear(),
  });

  const [
    appointmentsResponseData,
    ,
    ,
    getAppointment,
    ,
    updateAppointmentData,
  ] = useCRUD({
    id: `appointments-data`,
    url: API_URL.appointment,
    type: REQUEST_METHOD.get,
    responseModifier,
    subscribeSocket: true,
    handleSocketData,
  });
  const [appointmentsStatsData, , , getAppointmentStatsData] = useCRUD({
    id: `appointments-stats-data`,
    url: `${API_URL.appointmentStats}?month=${statsFilter?.month}&year=${statsFilter?.year}`,
    type: REQUEST_METHOD.get,
  });

  const appointmentsResponse = appointmentsResponseData?.data;

  const [, error, , updateBooking] = useCRUD({
    id: `update-appointment-data`,
    url: `${API_URL.appointment}`,
    type: REQUEST_METHOD.update,
    subscribeSocket: true,
  });

  const fetchBookingAppointments = useCallback(() => {
    getAppointment(filters);
  }, [filters, getAppointment]);

  useEffect(() => {
    fetchBookingAppointments();
  }, [fetchBookingAppointments, filters, getAppointment]);

  if (error) {
    fetchBookingAppointments();
  }

  const onDrop = useCallback(
    ({ newItem, newStatus, index, oldStatus }) => {
      updateBooking({ status: newStatus }, `/${newItem?.id}`);
      const newData = appointmentsResponse?.map((item) => {
        if (item.status === newStatus) {
          const appointmentDataForDesiredList = [...item.appointmentData];
          if (index) {
            appointmentDataForDesiredList.splice(index, 0, newItem);
          } else {
            appointmentDataForDesiredList.push(newItem);
          }
          return { ...item, appointmentData: appointmentDataForDesiredList };
        }
        if (item.status === oldStatus) {
          const appointmentDataForOldList = [...item.appointmentData]?.filter(
            (oldItem) => oldItem?.id !== newItem?.id
          );
          return { ...item, appointmentData: appointmentDataForOldList };
        }
        return item;
      });
      updateAppointmentData({ ...appointmentsResponseData, data: newData });
    },
    [
      appointmentsResponse,
      appointmentsResponseData,
      updateAppointmentData,
      updateBooking,
    ]
  );

  const handleFilter = useCallback(
    (filter = {}) => {
      setFilters({ ...filters, ...filter });
    },
    [filters]
  );

  useEffect(() => {
    getAppointmentStatsData();
  }, [getAppointmentStatsData]);

  return (
    <div className="dashboard-container">
      <Header handleFilter={handleFilter} setStatsFilters={setStatsFilters} />
      <Widgets
        widgets={widgets}
        appointmentsStatsData={appointmentsStatsData}
      />
      <Filters handleFilter={handleFilter} />
      <div className="appointment-panel" key={filters}>
        <Appointments
          data={appointmentsResponse?.results || appointmentsResponse}
          accept={acceptance}
          onDrop={onDrop}
        />
      </div>
      <AppointmentStatusLegends />
    </div>
  );
};
export default AppointmentsBoard;
