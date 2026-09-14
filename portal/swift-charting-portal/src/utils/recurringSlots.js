import dayjs from "dayjs";
import { cloneDeep } from "lodash";

const moment = require('moment');
const { dateFormats } = require("src/lib/constants");
const { getMedicineName, convertWithTimezone, getUserTimezone } = require("src/lib/utils");



function getTimeSlotDate(baseDate, slot, timezone) {
  let date = baseDate;

  const utcTimeString = `${slot.startHour}:${slot.startMinute} ${slot.startMeridien}`;
  const utcTime = dayjs.utc(utcTimeString, "hh:mm A");

  // Convert UTC time to user's timezone
  const userTime = convertWithTimezone(utcTime, {
      format: "hh:mm A"
  });

  // Split formatted time back into hour, minute, and meridien
  const [formattedHourMinute, formattedMeridien] = userTime.split(' ');
  const [startHour, startMinute] = formattedHourMinute.split(':');



  let hour = parseInt(startHour);
  let minute = parseInt(startMinute);

  // Adjust hour based on AM/PM
  if (formattedMeridien === "PM" && hour < 12) {
      hour += 12;
  }
  if (formattedMeridien === "AM" && hour === 12) {
      hour = 0;
  }

  date = date.set('hour', hour).set('minute', minute).set('second', 0).set('millisecond', 0);
  return date;
}

export const generateRecurringSchedules = (appointmentBody, pendingScheduleColor, {createForToday=false}={}, logMap) => {
    const schedulesSlots = [];
    const timezone=false;
    const { schedules } = appointmentBody;

  
    const { startDate, ...rest } = appointmentBody;

    const createEvent = (medication, eventDate, log = null) => {
      const startTime = eventDate.format(dateFormats.hhmmA) 
      // convertWithTimezone(eventDate, { timezone, format: dateFormats.hhmmA });
      const [time, startMeridien] = startTime.split(' ');
      const [startHour, startMinute] = time.split(':');

      const event = {
          resourceId: medication.id.toString(),
          title: getMedicineName(medication),
          start: eventDate.toISOString(),
          end: eventDate.toISOString(),
          medicationData: {
              ...medication,
              startHour,
              startMinute,
              eventDate,
              startMeridien,
          },
          marLog: { ...log },
          color: pendingScheduleColor?.colorCode || 'yellow',
      };

      if (log) {
          event.title = `${getMedicineName(medication)} (${log?.action?.name})`;
          event.color = log.action.colorCode;
      }
      return event;
    };
  
    if(!schedules){
      return [];
    }
    const {
      repeatType,
      repeatEvery,
      repeatWeek,
      monthOnDay,
      monthWeekDay,
      monthWeek,
      timeSlots,
      endDate,
    } = schedules;
  
    const endDateObject = new Date(endDate);   
    let currentStart = convertWithTimezone(startDate, {requiredPlain:true });
    const startDateWithTimeZone = convertWithTimezone(startDate, {requiredPlain:true });
    const finalEndConvert = convertWithTimezone(endDateObject, {requiredPlain:true });
    const finalEnd = moment(finalEndConvert.$d); 
    const startDateWithTimeZoneMoment = moment.tz(startDateWithTimeZone.toDate(), getUserTimezone());
  
    function addDays(date, days) {
      return date.add(days, 'days');
    }
  
    function addWeeks(date, weeks) {
      const newDate = date.clone(); 
      const result = newDate.add(weeks, 'weeks');
      return result;
    }
  
    function addMonths(date, months) {
      return date.add(months, 'months');
    }
  
    function getNthWeekdayOfMonth(year, month, nth, weekday, timezone) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdayIndex = weekdays.indexOf(weekday);
      const firstDay = moment.tz([year, month - 1], timezone).startOf('month');
      const daysInMonth = firstDay.daysInMonth();
      let count = 0;
    
      // Convert nth to a number if it's not 'Last'
      const nthNumber = nth === 'Last' ? nth : parseInt(nth, 10);
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = moment.tz([year, month - 1, day], timezone);
        if (currentDay.day() === weekdayIndex) {
          count += 1;
          if (count === nthNumber) {
            return currentDay;
          }
        }
      }
  
      if (nth === 'Last') {
        for (let day = daysInMonth; day > 0; day--) {
          const currentDay = moment.tz([year, month - 1, day], timezone);
          if (currentDay.day() === weekdayIndex) {
            return currentDay;
          }
        }
      }
  
      return null;
    }
    while (currentStart.isBefore(finalEnd) || currentStart.isSame(finalEnd, 'day')) {
      if (repeatType === 'Day') {
          timeSlots?.forEach(slot => {
            const eventDate = getTimeSlotDate(currentStart, slot, timezone);
            const eventDateStr = eventDate.toISOString();
            const matchingLog = logMap.get(appointmentBody.id)?.get(eventDateStr);
            const event = createEvent(appointmentBody,eventDate, matchingLog )
            const data = cloneDeep(event);
            schedulesSlots.push(data)
            // appointments.push({...event})
          })
        currentStart = addDays(currentStart, repeatEvery);
      } else if (repeatType === 'Week') {
        for (const weekDay of repeatWeek) {
          const weekdayNumber =  moment().day(weekDay).day();
          const currentStartWithTimezone = moment.tz(currentStart.toDate(), getUserTimezone());
          const appointmentDay = currentStartWithTimezone.clone().day(weekdayNumber);
          // const startDateWithTimeZoneMoment = moment.tz(startDateWithTimeZone.toDate(), getUserTimezone());
          if (
              (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
              appointmentDay.isSameOrAfter(startDateWithTimeZoneMoment)
          ) {
              timeSlots?.forEach((slot) => {
                const eventDate = getTimeSlotDate(appointmentDay, slot, timezone);
                const eventDateStr = eventDate.toISOString();
                const matchingLog = logMap.get(appointmentBody.id)?.get(eventDateStr);
                const event = createEvent(appointmentBody, eventDate, matchingLog);
                const data = cloneDeep(event);
                schedulesSlots.push(data)
                // appointments.push({...event});

              });
              // Exit the loop once the condition is satisfied
              // break;
          }
      }
        currentStart = addWeeks(currentStart, repeatEvery);
      } else if (repeatType === 'Month') {
        if (monthOnDay) {
          const currentStartWithTimezone = moment.tz(currentStart.toDate(), getUserTimezone());
          const appointmentDay = currentStartWithTimezone.clone().date(monthOnDay);
          // const startDateWithTimeZoneMoment = moment.tz(startDateWithTimeZone.toDate(), getUserTimezone());
          // const appointmentDay = currentStart.clone().date(monthOnDay);
          if (
            (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
            appointmentDay.isSameOrAfter(startDateWithTimeZoneMoment)
          ) {
            timeSlots?.forEach(slot => {
              const eventDate = getTimeSlotDate(appointmentDay, slot, timezone);
              const eventDateStr = eventDate.toISOString();
              const matchingLog = logMap.get(appointmentBody.id)?.get(eventDateStr);
              const event = createEvent(appointmentBody,eventDate, matchingLog )
              const data = cloneDeep(event);
              schedulesSlots.push(data)
              // appointments.push({...event})
            })
          }
          currentStart = addMonths(currentStart, repeatEvery);
        } else if (monthWeek && monthWeekDay && monthWeekDay.length > 0) {
         

         outerLoop: for( const weekDay of monthWeekDay){
            for( const week of monthWeek) {
              const appointmentDay = getNthWeekdayOfMonth(currentStart.year(), currentStart.month() + 1, week, weekDay, getUserTimezone());
              // const startDateWithTimeZoneMoment = moment.tz(startDateWithTimeZone.toDate(), getUserTimezone());
              if (
                appointmentDay &&
                (appointmentDay.isBefore(finalEnd) || appointmentDay.isSame(finalEnd, 'day')) &&
                appointmentDay.isSameOrAfter(startDateWithTimeZoneMoment)
              ) {
                timeSlots?.forEach(slot => {
                  const eventDate = getTimeSlotDate(appointmentDay, slot, timezone);
                  const eventDateStr = eventDate.toISOString();
                  const matchingLog = logMap.get(appointmentBody.id)?.get(eventDateStr);
                  const event = createEvent(appointmentBody,eventDate, matchingLog )
                  const data = cloneDeep(event);
                  schedulesSlots.push(data)
                })
                // Exit the loop once the condition is satisfied
              // break outerLoop;
              }
            }
          }
          currentStart = addMonths(currentStart, repeatEvery);
        }
      }
    }
    return schedulesSlots;
  }