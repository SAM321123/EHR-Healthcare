
import React from 'react';
import Container from 'src/components/Container';
import PageContent from 'src/components/PageContent';
import Calendar from './components/calendar';

// import AppointmentList from './Components/List';
import 'src/pages/Booking/booking.scss';

const EMARCalendar = () => {

  return (
    <Container className="booking-container">
      <PageContent style={{ overflow: 'scroll' }}>
        <Calendar  /> 
      </PageContent>
    </Container>
  );
};

export default EMARCalendar;