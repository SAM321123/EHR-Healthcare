import { appointmentStatus, roleTypes } from 'src/lib/constants';
import { getUserRole } from 'src/lib/utils';

const showJoinButton = (data) => {
  const role = getUserRole() || '';
  const { status, sessionId, googleMeetLink = '' } = data || {};

  const statusToCheck = [
    appointmentStatus.CHECKIN,
    appointmentStatus.READY_FOR_PRACTITIONER,
  ];

  if (role === roleTypes.patient) {
    statusToCheck.push(appointmentStatus.CONFIRMED);
  }

  return (
    statusToCheck.includes(status) &&
    (sessionId || googleMeetLink) &&
    [roleTypes.assistant, roleTypes.practitioner, roleTypes.patient].includes(
      role
    )
  );
};

const showReadyForPractitionerButton = (data) => {
  const role = getUserRole() || '';
  const { status, sessionId, googleMeetLink = '' } = data || {};

  return (
    status === appointmentStatus.CHECKIN &&
    (sessionId || googleMeetLink) &&
    role === roleTypes.assistant
  );
};

const showConfirmButton = (data) => {
  const role = getUserRole() || '';
  const { status } = data || {};
  return (
    (status === appointmentStatus.PENDING_CONFIRMATION ||
      status === appointmentStatus.MISSED) &&
    [roleTypes.assistant, roleTypes.practitioner].includes(role)
  );
};

const handleJoinAppointment = (url) => {
  const newTab = window.open(url, '_blank');
  newTab.focus();
};

const getInitials = (name) =>
  name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

const getUserProfilePictureFromName = ({
  name = '',
  size = 40,
  textFont = 0.5,
}) => {
  const initials = getInitials(name);
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const textSize = size / 2;

  // Get the context of the canvas
  const ctx = canvas.getContext('2d');

  // Generate a random color
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  // Draw the circle
  ctx.fillStyle = randomColor;
  ctx.beginPath();
  ctx.arc(textSize, textSize, textSize, 0, Math.PI * 2, true);
  ctx.fill();

  // Draw the userName
  ctx.font = `${size * textFont}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.toUpperCase(), textSize, textSize);

  return canvas.toDataURL('image/png');
};

export {
  showJoinButton,
  handleJoinAppointment,
  getUserProfilePictureFromName,
  showConfirmButton,
  showReadyForPractitionerButton,
};
