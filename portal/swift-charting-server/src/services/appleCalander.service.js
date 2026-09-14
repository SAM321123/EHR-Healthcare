const { v4: uuid } = require('uuid');
const logger = require('../config/logger');
const { sendErrorMail } = require('./email.service');
const { email } = require('../config/config');
const { errorMessages } = require('../config/error');
const { getModels } = require('../utils/connection');
const  dbService  = require('./db.service');
const { formatDateToICS, getFormattedDate, UtcToFormat } = require('../utils/dateUtility');

/**
 * Generates an ICS file content for an event with optional attendees
 * @param {Object} event - The event details
 * @param {string} [uid] - Optional UID for updating an existing event
 * @returns {Buffer} The ICS file content as a buffer
 */
function generateICS(event, eventId) {
  if (!eventId) {
    eventId = uuid();
  }
  const { summary, description, startDateTime, endDateTime, attendees = [] } = event;
  console.log("🚀 ~ generateICS ~ startDateTime,endDateTime", startDateTime,endDateTime)

  // Convert attendees to ICS format
  const attendeesLines = attendees.map((email) => `ATTENDEE;RSVP=TRUE:mailto:${email}`).join('\n');

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//NONSGML Your Product//EN
BEGIN:VEVENT
UID:${eventId}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${UtcToFormat(startDateTime,{format:'YYYYMMDDTHHmmss'})}Z
DTEND:${UtcToFormat(endDateTime,{format:'YYYYMMDDTHHmmss'})}Z
SUMMARY:${summary}
DESCRIPTION:${description}
${attendeesLines}
SEQUENCE:1
END:VEVENT
END:VCALENDAR
    `;
  
  return { icsContent, eventId };
}

async function createOrUpdateAppleCalendarEvent(appointment, { tenantId }) {
  try {
    const {
      startDateTime,
      endDateTime,
      appleCalendarEventId: eventId = '',
      title,
      note,
    } = appointment || {};

    const db = getModels(tenantId);
    const patients = await appointment.getPatients();
    const practitioner = await appointment.getPractitioner();

    const attendees = [];

    if (practitioner?.email) {
      attendees.push(practitioner.email);
    }
    for (const patient of patients) {
      if (patient?.email) {
        attendees.push(patient.email);
      }
    }

    const event = {
      summary: title,
      description: note,
      startDateTime,
      endDateTime,
      attendees,
    };

    const { icsContent, eventId: generatedEventId } = generateICS(event, eventId);
    console.log("🚀 ~ createOrUpdateAppleCalendarEvent ~ icsContent:", icsContent)

    // Convert ICS content to buffer
    const icsBuffer = Buffer.from(icsContent);

    // Update the appointment in the database if it's a new event
    if (!eventId) {
      await dbService.updateById({
        model: db.Appointment,
        reqParams: { id: appointment.id, appleCalendarEventId: generatedEventId },
      });
    }

    return { icsBuffer, eventId: generatedEventId };
  } catch (err) {
    logger.error(err);
    sendErrorMail({
      to: email.applicationDeveloper,
      subject: errorMessages.GOOGLE_MEET_AUTHENTICATION_FAILED,
      text: err?.message,
    });
    return {};
  }
}

module.exports = {
  createOrUpdateAppleCalendarEvent,
};
