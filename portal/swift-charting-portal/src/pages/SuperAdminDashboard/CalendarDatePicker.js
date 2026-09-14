import React from 'react';

function CalendarDatePicker({ currentYear }) {
  return (
    <div className="calendar-date-picker">
      <p>{currentYear}</p>
    </div>
  );
}

export default CalendarDatePicker;
