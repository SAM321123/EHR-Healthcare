const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const { GOOGLE_MEET_AUTH_URL } = require('../utils/constant');
const { appointmentStatus } = require('../config/appointment');
const dbService = require('./db.service');
const { getModels } = require('../utils/connection');
const { Op } = require('sequelize');
const { sendErrorMail } = require('./email.service');
const { email } = require('../config/config');
const { errorMessages } = require('../config/error');

//Create oAuth2Client by providing tokens
const createOAuth2Client = ({ clientId, clientSecret, tokens }) => {
  const oauth2Client = new OAuth2Client(clientId, clientSecret, `${GOOGLE_MEET_AUTH_URL}`);
  oauth2Client.setCredentials(tokens);
  // oauth2Client.refreshAccessToken((err, latestTokens) => {
  //   if (err) {
  //     console.error(`Error refreshing access token: ${err}`);
  //     return;
  //   }
  //   tokens = latestTokens;
  // });
  return { oauth2Client };
};

//Create Calender Event
const createOrUpdateEvent = async ({ oauth2Client, event, calendarEventId }) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  let result = {};
  if (!calendarEventId) {
    const { data = {} } = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
    });
    result = { googleMeetLink: data?.hangoutLink || '', calendarEventId: data?.id || '' };
  } else {
    const res = await calendar.events.update({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
      eventId: calendarEventId,
    });
  }
  return result;
};

const createCalendarEvent = async (appointment, { tenantId }) => {
  try {
    const {
        statusCode = '',
      googleMeetLink: meetingLink = '',
      startDateTime,
      endDateTime,
      calendarEventId: eventId = '',
      title,
      note,
    } = appointment || {};

    if (statusCode === appointmentStatus.CONFIRMED) {
      const db = getModels(tenantId);
      const meetConfig = await dbService.getOne({ model: db.MeetConfig, filter: { where: { isDefault: true,tokens: {
        [Op.ne]: null
      }
   } } });
      const patients = await appointment.getPatients();
      const practitioner = await appointment.getPractitioner();
      const { clientId = '', clientSecret = '', tokens = {} } = meetConfig || {};
      if (!clientId || !clientSecret || !tokens ||!Object.keys(tokens).length) {
        throw new Error('Google meet config missing');
      }

      const attendees = [];

      if (practitioner?.email) {
        attendees.push({ email: practitioner.email });
      }
      for(const patient of patients){
      if (patient?.email) {
        attendees.push({ email: patient.email });
      }
    }

      const event = {
        summary: title,
        description: note,
        start: {
          dateTime: startDateTime,
        },
        end: {
          dateTime: endDateTime,
        },
        conferenceData: {
          createRequest: {
            requestId: appointment.id,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        attendees: [...attendees],
      };
      console.log("🚀 ~ createCalendarEvent ~ event:", event)

      const { oauth2Client } = createOAuth2Client({ clientId, clientSecret, tokens });
      const { googleMeetLink = '', calendarEventId = '' } = await createOrUpdateEvent({
        oauth2Client,
        event,
        calendarEventId: eventId,
      });

      if (!googleMeetLink) {
        throw new ApiError('Failed to create calendar invite');
      }
      //add google meet link in the aapointment
      await dbService.updateById({model:db.Appointment,reqParams:{id:appointment.id,googleMeetLink,calendarEventId}})
      return { googleMeetLink, calendarEventId };
      // return appointment;
    }
    return {};
  } catch (err) {
    logger.error(err);
    sendErrorMail({
      uuid: tenantId,
      to: email.applicationDeveloper,
      subject: errorMessages.GOOGLE_MEET_AUTHENTICATION_FAILED,
      text: err?.message,
    });
    return {};
  }
};

module.exports = {
  createCalendarEvent,
};
