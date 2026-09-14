/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { Image } from '@mui/icons-material';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import AddAppointment from 'src/pages/addAppointment';
import Modal from 'src/components/modal';

import './detailsCard.scss';

export const PatientBasicInfo = ({
  patientImage,
  patient: { name = '' } = {},
  status,
  data,
  service: { name: serviceName = '' },
  appointmentTime,
  statusHistory = [],
  color = '',
}) => {
  const statusUpdatedTime = statusHistory[statusHistory.length - 1]?.updatedOn;
  const {
    name: updatedBy = '',
    firstName = '',
    lastName = '',
  } = statusHistory[statusHistory.length - 1]?.updatedBy || {};

  const statusUpdatedBy = updatedBy || `${firstName || ' '} ${lastName || ''}`;

  const [initialTime, setInitialTime] = useState(new Date(statusUpdatedTime));
  const [elapsedTime, setElapsedTime] = useState('00: 00: 00');

  useEffect(() => {
    setInitialTime(new Date(statusUpdatedTime));
  }, [statusUpdatedTime]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (
      (status === 'Waiting Room' ||
        status === 'Check In' ||
        status === 'Ready For Practitioner') &&
      statusUpdatedTime
    ) {
      const intervalId = setInterval(() => {
        const currentTime = new Date();
        const timeDifference = new Date(currentTime - initialTime);
        const hours = String(timeDifference.getUTCHours()).padStart(2, '0');
        const minutes = String(timeDifference.getUTCMinutes()).padStart(2, '0');
        const seconds = String(timeDifference.getUTCSeconds()).padStart(2, '0');
        setElapsedTime(`${hours}: ${minutes}: ${seconds}`);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [initialTime, status, statusUpdatedTime]);
  return (
    <div className="row-details">
      <div className="avatar">
        <Image
          url={
            patientImage?.patientImageUrl
              ? patientImage?.patientImageUrl
              : data?.patientImageUrl
          }
          name="placeholder-img.png"
          alt="user-img"
        />
      </div>
      <div className="basic-info">
        <div className="row-name">
          <div className="patient-name">{name}</div>
          {(status === 'Waiting Room' ||
            status === 'Check In' ||
            status === 'Ready For Practitioner') && (
            <div style={{ width: '57px', color }}>{elapsedTime}</div>
          )}
        </div>
        <div className="row-time">
          <div className="time-stamp">Service: {serviceName}</div>
          <div className="time-stamp">Time: {appointmentTime}</div>
          {(status === 'Check In' ) && (
            <div className="time-stamp">
              Checked in by: {statusUpdatedBy}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProviderDetail = ({ providerName }) => (
  <div className="row-doctor">
    <div className="value"> Dr. {providerName}</div>
  </div>
);

const DetailsCard = ({
  data,
  style,
  cardRef,
  status,
  color,
  accept,
  onHover,
  index,
}) => {
  const ref = useRef();
  const [showModal, setShowModal] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: status,
    item: { data, index, color },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  useEffect(() => {
    if (cardRef) {
      cardRef.current = {
        clientWidth: ref?.current?.clientWidth,
        clientHeight: ref?.current?.clientHeight,
      };
    }
  }, [cardRef]);

  const [{ isOver }, drop] = useDrop({
    accept: accept || ['Pending Confirmation'],
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drag(drop(ref));

  useEffect(() => {
    if (isOver) onHover(data.id, index);
  }, [data.id, index, isOver, onHover]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const handleEditAppointment = () => {
    setShowModal(true);
  };

  return (
    <>
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <AddAppointment
          appointmentDate={data?.appointmentDate}
          appointmentId={data?.id}
          setShowModal={setShowModal}
        />
      </Modal>
      <div
        className="dashboard-card-container"
        ref={ref}
        style={{
          ...style,
          borderLeft: `4px solid ${color}`,
          opacity: isDragging ? '0.4' : 1,
        }}
        onClick={handleEditAppointment}
        key={data?.id}
      >
        <PatientBasicInfo {...data} color={color} />
        <div className="card_bottomcard_outer-wrapper">
          <div>
            <ProviderDetail
              providerName={`${data?.practitioner?.firstName} ${data?.practitioner?.lastName}`}
            />
          </div>
          <div className="card_event-wrapper">
            <div
              type="span"
              className="info-img sprite-img-before  cursor-pointer"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(DetailsCard);
