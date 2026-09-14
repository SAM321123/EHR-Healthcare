const moment = require('moment');
const {  clientURL } = require('../config/config');
const { getFullName, decodeHtml, getDynamicTemplate } = require('../utils');
const { formatDate, dateFormatter, timeFormatter } = require('../utils/dateUtility');
const { sendEmail } = require('./email.service');
const { generateRecurringSummary } = require('../utils/appointmentUtility');
const dbService  = require('./db.service');
const { getModels } = require('../utils/connection');



const sendAppointmentMail = async (appointment,practiceSetting, { template, subject,replyTo,tenantId }) => {
    try {
      const db = getModels(tenantId);
      let recurringSummary = '';
      let previousRecurringSummary = '';

      // Validate inputs
      if (!appointment) {
        throw new Error("Appointment is required and should not be empty.");
      }
      if (!template || !subject) {
        throw new Error("Tenant ID, template, and subject are required.");
      }
      const patientTimeZone = 'Asia/Calcutta';
      appointment = await dbService.getOneById({model:db.Appointment,id:appointment.id});

      const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
  
        let { startDateTime,endDateTime, _previousDataValues } = appointment || {};
        if (!startDateTime) {
          throw new Error(`Invalid appointment object: missing startDateTime`)
        }
  
        const patients = await appointment.getPatients();
        const practitioner = await appointment.getPractitioner();
        const recurringSetting = await appointment.getRecurringSetting();
        const location = await appointment.getLocation();
        const appointmentType = await appointment.getType();
        const meetingLink = appointment.googleMeetLink || ' '
        if (!patients || !patients.length || !practitioner) {
          throw new Error(`Invalid appointment object: missing patient or practitioner`)
        }
  
  
        const {
          firstName: practionerFirstName = '',
          middleName: practitionerMiddleName = ' ',
          lastName: practitionerLastName = '',
        } = practitioner || {};
  
        const practitionerName = getFullName({
          firstName: practionerFirstName,
          middleName: practitionerMiddleName,
          lastName: practitionerLastName,
        });
  
    if (recurringSetting) {
      recurringSummary =generateRecurringSummary(recurringSetting);
    }
        template = decodeHtml(template);

        for(const patient of patients){
          const { email = '', firstName = '', middleName = '', lastName = '',timezone:patientTimeZone } = patient || {};
          if (!email) {
            throw new Error(`Invalid patient object: missing email`)
          }
            
        const appointmentStartDate = formatDate(startDateTime, {
          timezone: patientTimeZone,
          format: dateFormatter.MMDDYYYY_WITH_SLASHES,
        });
  
        const appointmentStartTime = formatDate(startDateTime, {
          timezone: patientTimeZone,
          format: timeFormatter.hhmma,
        });
        const appointmentEndTime = formatDate(endDateTime, {
          timezone: patientTimeZone,
          format: timeFormatter.hhmma,
        });
        let previousAppointmentStart = '';
        let previousAppointmentTime = '';
        let previousAppointmentEndTime ='';
        if (_previousDataValues) {
          const {endDateTime: previousEndDateTime} = _previousDataValues;
          const { startDateTime: previousStartDateTime } = _previousDataValues;
          previousAppointmentStart = formatDate(previousStartDateTime, {
            timezone: patientTimeZone,
            format: dateFormatter.MMDDYYYY_WITH_SLASHES,
          });
          previousAppointmentTime = formatDate(previousStartDateTime, {
            timezone: patientTimeZone,
            format: timeFormatter.hhmma,
          });
          previousAppointmentEndTime = formatDate(previousEndDateTime , {
            timezone: patientTimeZone,
            format: timeFormatter.hhmma,
          })
          if(_previousDataValues.recurringSetting){
          const previousRecurringSetting =_previousDataValues.recurringSetting;
          if (previousRecurringSetting) {
            previousRecurringSummary =generateRecurringSummary(previousRecurringSetting);
          }
        }
        }
        const patientName = getFullName({ firstName, middleName, lastName });

        const dynamicSubject = getDynamicTemplate({ text: subject, params: { patientName, practitionerName } });
        const dynamicTemplate = getDynamicTemplate({
          text: template,
          params: {
            patientFirstName: firstName,
            patientMiddleName: middleName || ' ',
            patientLastName: lastName,
            practionerFirstName: practionerFirstName,
            practionerMiddleName: practitionerMiddleName || ' ',
            practionerLastName: practitionerLastName,
            appointmentType:appointmentType?.name || '',
            location: location.name,
            logo,
            clientURL, // Ensure clientURL is defined
            startDate: appointmentStartDate,
            startTime: appointmentStartTime,
            endTime: appointmentEndTime,
            previousStartDate:previousAppointmentStart,
            previousStartTime:previousAppointmentTime, 
            previousEndTime:previousAppointmentEndTime,
            patientTimeZone,
            recurringSummary,
            previousRecurringSummary,
          },
        });
        // Send the email
           sendEmail({
            uuid: tenantId,
            to: email,
            replyTo,
            subject: dynamicSubject,
            html: dynamicTemplate,
            attachments: [practiceLogoAttechment],
          }).then(()=>{
              console.log(`Email sent to ${email}`);
          }).catch(sendError=>{
              console.error(`Failed to send email to ${email}:`, sendError);
          });
        }
     } catch (error) {
      console.error("Error in sendAppointmentMail:", error);
    }
  };
  
  

function generateRecurringAppointments(appointmentBody, recurringSetting,{createForToday=false}={}) {
  const appointments = [];

  const { startDateTime, endDateTime, isRecurring, ...rest } = appointmentBody;
  let today = moment();
  if(createForToday){
    today = moment().startOf('day');
  }


  const modifedBody = {
    isRecurring,
    ...rest,
  };
  if (!isRecurring) {
    appointments.push({
      ...modifedBody,
      startDateTime: moment(startDateTime).toISOString(),
      endDateTime: moment(endDateTime).toISOString(),
    });
    return appointments;
  }

  const {
    startRecurringDate: startDate,
    endRecurringDate: endDate,
    repeateType,
    repeateEvery,
    repeateWeek,
    monthOnDay,
    monthWeekDay,
    monthWeek,
  } = recurringSetting;

  let currentStart = moment(startDate);
  const finalEnd = moment(endDate);

  function addDays(date, days) {
    return date.add(days, 'days');
  }

  function addWeeks(date, weeks) {
    return date.add(weeks, 'weeks');
  }

  function addMonths(date, months) {
    return date.add(months, 'months');
  }

  function getNthWeekdayOfMonth(year, month, nth, weekday) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayIndex = weekdays.indexOf(weekday);
    const firstDay = moment([year, month - 1]).startOf('month');
    const daysInMonth = firstDay.daysInMonth();
    let count = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = moment([year, month - 1, day]);
      if (currentDay.day() === weekdayIndex) {
        count += 1;
                if (count == nth) {
                    return currentDay;
                }
      }
    }

    if (nth === 'Last') {
      for (let day = daysInMonth; day > 0; day--) {
        const currentDay = moment([year, month - 1, day]);
        if (currentDay.day() === weekdayIndex) {
          return currentDay;
        }
      }
    }

    return null;
  }

  while (currentStart.isBefore(finalEnd) || currentStart.isSame(finalEnd, 'day')) {
    if (repeateType === 'Day') {
      const appointmentStart = currentStart.clone().hour(moment(startDateTime).hour()).minute(moment(startDateTime).minute());
      const appointmentEnd = currentStart.clone().hour(moment(endDateTime).hour()).minute(moment(endDateTime).minute());

      if (currentStart.isSameOrAfter(moment(startDate)) && appointmentStart.isAfter(today)) {
        appointments.push({
          ...modifedBody,
          startDateTime: currentStart
            .clone()
            .hour(moment(startDateTime).hour())
            .minute(moment(startDateTime).minute())
            .toISOString(),
          endDateTime: currentStart
            .clone()
            .hour(moment(endDateTime).hour())
            .minute(moment(endDateTime).minute())
            .toISOString(),
        });
      }
      currentStart = addDays(currentStart, repeateEvery);
    } else if (repeateType === 'Week') {
      repeateWeek.forEach((weekDay) => {
        const appointmentDay = currentStart.clone().day(weekDay);
        if (
          (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
          appointmentDay.isSameOrAfter(moment(startDate)) && appointmentDay.isSameOrAfter(today) 
        ) {
          appointments.push({
            ...modifedBody,
            startDateTime: appointmentDay
              .clone()
              .hour(moment(startDateTime).hour())
              .minute(moment(startDateTime).minute())
              .toISOString(),
            endDateTime: appointmentDay
              .clone()
              .hour(moment(endDateTime).hour())
              .minute(moment(endDateTime).minute())
              .toISOString(),
          });
        }
      });
      currentStart = addWeeks(currentStart, repeateEvery);
    } else if (repeateType === 'Month') {
      if (monthOnDay) {
        const appointmentDay = currentStart.clone().date(monthOnDay);
        if (
          (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
          appointmentDay.isSameOrAfter(moment(startDate)) && appointmentDay.isSameOrAfter(today)
        ) {
          appointments.push({
            ...modifedBody,
            startDateTime: appointmentDay
              .clone()
              .hour(moment(startDateTime).hour())
              .minute(moment(startDateTime).minute())
              .toISOString(),
            endDateTime: appointmentDay
              .clone()
              .hour(moment(endDateTime).hour())
              .minute(moment(endDateTime).minute())
              .toISOString(),
          });
        }
        currentStart = addMonths(currentStart, repeateEvery);
      } else if (monthWeek && monthWeekDay && monthWeekDay.length > 0) {
        monthWeekDay.forEach((weekDay) => {
          monthWeek.forEach((week) => {
            const appointmentDay = getNthWeekdayOfMonth(currentStart.year(), currentStart.month() + 1, week, weekDay);
            if (
              appointmentDay &&
              (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
              appointmentDay.isSameOrAfter(moment(startDate)) && appointmentDay.isSameOrAfter(today)
            ) {
              appointments.push({
                ...modifedBody,
                startDateTime: appointmentDay
                  .clone()
                  .hour(moment(startDateTime).hour())
                  .minute(moment(startDateTime).minute())
                  .toISOString(),
                endDateTime: appointmentDay
                  .clone()
                  .hour(moment(endDateTime).hour())
                  .minute(moment(endDateTime).minute())
                  .toISOString(),
              });
            }
          });
        });
        currentStart = addMonths(currentStart, repeateEvery);
      }
    }
  }

  return appointments;
}



module.exports={
    generateRecurringAppointments,
    sendAppointmentMail,
}
