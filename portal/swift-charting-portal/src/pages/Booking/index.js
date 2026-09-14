import React, { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Container from 'src/components/Container';
import PageContent from 'src/components/PageContent';
import AppointmentStatusLegends from 'src/components/AppointmentStatusLegends';
import BookingHeader from './Components/BookingHeader';
import Calendar from './Components/Calendar';

import AppointmentList from './Components/List';
import './booking.scss';

const Bookings = () => {
  const { state } = useLocation();
  window.history.replaceState({}, document.title);
  const [view, setView] = useState('calendar');
  const handleViewChange = useCallback((e) => {
    setView(e.currentTarget.id);
  }, []);

  useEffect(() => {
    if (state?.showModal) {
      setView('calendar');
    }
  }, [state]);

  return (
    <Container className="booking-container">
      <BookingHeader view={view} onViewChange={handleViewChange} />
      <PageContent style={view === 'calendar' ? { overflow: 'scroll' } : {}}>
        {view === 'calendar' ? <Calendar state={state} /> : <AppointmentList />}
      </PageContent>
      {view === 'calendar' && <AppointmentStatusLegends />}
    </Container>
  );
};

export default Bookings;
