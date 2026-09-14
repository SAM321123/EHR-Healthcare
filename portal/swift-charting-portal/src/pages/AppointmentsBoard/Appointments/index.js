import React, { useMemo, useRef } from 'react';
import CustomDragLayer from '../CustomDragLayer';
import List from '../Components/List';
import MultiList from '../Components/MultiList';

import './appointments.scss';

const Appointments = ({ data = [], ...restProps }) => {
  const [pendingConfirmedAppointments,inProgressAppointments, closedAppointments] = useMemo(() => {
    const clonedData = [...data];
    const pendingConfirmedAppointmentsData = clonedData?.splice(0,2);
    const multipleStatusList = clonedData?.splice(3, 3) || [];
    return [pendingConfirmedAppointmentsData,clonedData, multipleStatusList];
  }, [data]);
  const draggingCardRef = useRef({});

  return (
    <>
      <CustomDragLayer ref={draggingCardRef} />
      <MultiList
      data={pendingConfirmedAppointments}
      cardRef={draggingCardRef}
      {...restProps}
      />
      {inProgressAppointments?.map(
        ({ label, status = '', color = '', appointmentData = [] }) => (
          <List
            label={label}
            status={status}
            key={label}
            color={color}
            cardRef={draggingCardRef}
            data={appointmentData}
            {...restProps}
          />
        )
      )}
      <MultiList
        data={closedAppointments}
        cardRef={draggingCardRef}
        {...restProps}
      />
    </>
  );
};

export default React.memo(Appointments);
