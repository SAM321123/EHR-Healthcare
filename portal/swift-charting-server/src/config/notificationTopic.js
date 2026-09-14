const { roles } = require('./roles');
const topics = {
  APPOINTMENT_CREATED: {
    topic: `Appointment-created`,
    roles: [roles.PRACTITIONER, roles.ASSISTANT, roles.CLINIC_ADMIN],
  },
  INDIVIDUAL_APPOINTMENT_CREATED: {
    topic: `Appointment-created`,
    roles: [roles.PRACTITIONER, roles.ASSISTANT, roles.CLINIC_ADMIN],

  },
};

const getDynamicNotificationTopic = ({ topic, params={} }) => {
  return topic.replace(/\[([a-zA-Z]*)\]/g, (match, key) => {
    return params[key] || match;
  });
};

module.exports = { topics, getDynamicNotificationTopic };
