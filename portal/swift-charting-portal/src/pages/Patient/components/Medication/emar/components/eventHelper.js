import dayjs from "dayjs";
import { generateRecurringSchedules } from "src/utils/recurringSlots";

const { dateFormats } = require("src/lib/constants");
const { getMedicineName, convertWithTimezone } = require("src/lib/utils");

// Helper function to convert time slots to Date objects
// Updated getTimeSlotDate to include timezone conversion
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

// Updated generateEvents to include timezone parameter
// const genereateEvents = (medicationItemsResponse, medicationItemLogResponse,marCode) => {
//   const timezone=false;
//     const medicationLogs = medicationItemLogResponse?.results || [];
//     const pendingScheduleColor = marCode?.find(item => item.code === 'pendingSchedule')
//     const logMap = new Map();
//     const adHocLogs = new Map();

//     // Pre-process logs: categorize into scheduled (logMap) and unscheduled (adHocLogs)
//     medicationLogs.forEach(log => {
//         const logDate = convertWithTimezone(log.date, { requiredPlain:true });
//         const logKey = log.patientMedicationItemId;

//         if (!logMap.has(logKey)) {
//             logMap.set(logKey, new Map());
//         }

//         const isScheduledLog = medicationItemsResponse?.results.some(medication => {
//             if (medication.id !== log.patientMedicationItemId) return false;

//             return medication?.schedules?.timeSlots.some(slot => {
//                 const slotDate = getTimeSlotDate(logDate, slot, timezone);
//                 return slotDate.toISOString() === logDate.toISOString();
//             });
//         });

//         if (isScheduledLog) {
//             logMap.get(logKey).set(logDate.toISOString(), log);
//         } else {
//             if (!adHocLogs.has(logKey)) {
//                 adHocLogs.set(logKey, []);
//             }
//             adHocLogs.get(logKey).push(log);
//         }
//     });

//     const createEvent = (medication, eventDate, log = null) => {
//         const startTime = eventDate.format(dateFormats.hhmmA) 
//         // convertWithTimezone(eventDate, { timezone, format: dateFormats.hhmmA });
//         const [time, startMeridien] = startTime.split(' ');
//         const [startHour, startMinute] = time.split(':');

//         const event = {
//             resourceId: medication.id.toString(),
//             title: getMedicineName(medication),
//             start: eventDate.toISOString(),
//             end: eventDate.toISOString(),
//             medicationData: {
//                 ...medication,
//                 startHour,
//                 startMinute,
//                 eventDate,
//                 startMeridien,
//             },
//             marLog: { ...log },
//             color: pendingScheduleColor?.colorCode || 'yellow',
//         };

//         if (log) {
//             event.title = `${getMedicineName(medication)} (${log?.action?.name})`;
//             event.color = log.action.colorCode;
//         }

//         return event;
//     };

//     const events = medicationItemsResponse?.results?.flatMap(medication => {
//         let start = convertWithTimezone(medication.startDate, {requiredPlain:true });
//         let medicationEvents = [];

//         const { durationCode } = medication;
//         let totalDays = medication?.durationAmount;
//         if (durationCode === 'weeks') {
//             totalDays *= 7;
//         }

//         for (let day = 0; day < totalDays; day++) {
//             let currentDate = start.add(day, 'day');

//             medication?.schedules?.timeSlots.forEach(slot => {
//                 const eventDate = getTimeSlotDate(currentDate, slot, timezone);
//                 const eventDateStr = eventDate.toISOString();

//                 const matchingLog = logMap.get(medication.id)?.get(eventDateStr);
//                 medicationEvents.push(createEvent(medication, eventDate, matchingLog));
//             });
//         }

//         adHocLogs.get(medication.id)?.forEach(log => {
//             const logDate = convertWithTimezone(log.date, { requiredPlain:true });
//             medicationEvents.push(createEvent(medication, logDate, log));
//         });

//         return medicationEvents;
//     });

//     return events;
// };



///////////////////NEW code///////////////////////////////////////
const genereateEvents = (medicationItemsResponse, medicationItemLogResponse,marCode) => {
    const timezone=false;
    const medicationLogs = medicationItemLogResponse?.results || [];
    const pendingScheduleColor = marCode?.find(item => item.code === 'pendingSchedule')
    const logMap = new Map();
    const adHocLogs = new Map();

    // Pre-process logs: categorize into scheduled (logMap) and unscheduled (adHocLogs)
    medicationLogs.forEach(log => {
        const logDate = convertWithTimezone(log.date, { requiredPlain:true });
        const logKey = log.patientMedicationItemId;

        if (!logMap.has(logKey)) {
            logMap.set(logKey, new Map());
        }

        const isScheduledLog = medicationItemsResponse?.results.some(medication => {
            if (medication.id !== log.patientMedicationItemId) return false;

            return medication?.schedules?.timeSlots.some(slot => {
                const slotDate = getTimeSlotDate(logDate, slot, timezone);
                return slotDate.toISOString() === logDate.toISOString();
            });
        });

        if (isScheduledLog) {
            logMap.get(logKey).set(logDate.toISOString(), log);
        } else {
            if (!adHocLogs.has(logKey)) {
                adHocLogs.set(logKey, []);
            }
            adHocLogs.get(logKey).push(log);
        }
    });

    const createEvent = (medication, eventDate, slotDate = null,log = null) => {
        const startTime = eventDate.format(dateFormats.hhmmA) 
        const slotStartTime = slotDate?.format(dateFormats.hhmmA) 
        // convertWithTimezone(eventDate, { timezone, format: dateFormats.hhmmA });
        const [time, startMeridien] = startTime.split(' ');
        const [startHour, startMinute] = time.split(':');
        const [slotTime, slotStartMeridien] = slotStartTime.split(' ');
        const [slotStartHour, slotStartMinute] = slotTime.split(':');

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
                slotStartHour, 
                slotStartMinute,
                slotStartMeridien,
                slotDate,
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

    const events = medicationItemsResponse?.results?.flatMap(medication => {
        let start = convertWithTimezone(medication.startDate, {requiredPlain:true });
        let medicationEvents = [];

        // const { durationCode } = medication;
        // let totalDays = medication?.durationAmount;
        // if (durationCode === 'weeks') {
        //     totalDays *= 7;
        // }
        // const startDate = medication?.startDate;
        // const startDateObject = new Date(startDate);

        // const totalDays = medication?.durationCode === 'weeks' ? medication?.durationAmount*7 : medication?.durationAmount;
        // const endDate = new Date(startDateObject);
        // endDate.setDate(startDateObject.getDate() + totalDays);

        const recurringEvents = generateRecurringSchedules(medication, pendingScheduleColor, { createForToday: true }, logMap)        
        medicationEvents.push(...recurringEvents)


        adHocLogs.get(medication.id)?.forEach(log => {
            let logDate = convertWithTimezone(log?.date, { requiredPlain:true });
            let slotDate;
            if(log.actionCode ==='taken' && log?.slotDate!== null){
                logDate = convertWithTimezone(log.slotDate, { requiredPlain:true });
                slotDate = convertWithTimezone(log?.date, { requiredPlain:true });
            }else{
                slotDate = convertWithTimezone(log?.slotDate, { requiredPlain:true });
            }
            medicationEvents.push(createEvent(medication, logDate, slotDate, log));
        });

        return medicationEvents;
    });


        // adHocLogs.get(medication.id)?.forEach(log => {
        //     const logDate = convertWithTimezone(log.date, { requiredPlain:true });
        //     // const slotDate = convertWithTimezone(log?.slotDate, { requiredPlain:true });
        //     const slotDate = convertWithTimezone(log?.date, { requiredPlain:true });
        //     medicationEvents.push(createEvent(medication, logDate, slotDate, log));
        // });

        const filteredEvents = Array.from(
          (Array.isArray(events) ? events : []).reduce((map, event) => {
              const uniqueKey = `${event?.resourceId}-${event?.start}`;
              const existingEvent = map.get(uniqueKey);
          
              if (event?.medicationData?.medicineStatusCode === "medication_status_active") {
                if (
                  !existingEvent || 
                  (Object.keys(event?.marLog)?.length > 0 && Object.keys(existingEvent?.marLog)?.length === 0)
                ) {
                  map.set(uniqueKey, event);
                }
              } else {
                if (!existingEvent) {
                  map.set(uniqueKey, event);
                }
              }
              return map;
            }, new Map()).values()
          );
    return filteredEvents
};
/////////////////////////////////////////////////////////////////
  const generateResources = (medicationItemsResponse)=>{
   return medicationItemsResponse?.results?.map(medication => {
    return {
     id: medication?.id.toString(),
     title:getMedicineName(medication), // Use generic or brand name
     startDate: medication?.startDate, // Add start date
     endDate: medication?.endDate, // Add end date
     durationAmount: medication?.durationAmount, // Add duration amount
     durationName: medication?.duration?.name, // Add duration name
     medicineStatus: medication?.medicineStatus,
     updatedAt:medication?.updatedAt,
     diagnosis:medication?.diagnoses,
     doseForm:medication?.doseForm,
     amount: medication?.amount,
     unitCode: medication?.unitCode,
     isMARLogExists: medication?.marLogs?.length === 0 ? false: true ,
     medicineStatusReason:medication?.medicineStatusReason || '',
     discontinueDate:medication?.discontinueDate || '',
     patientMedicationId:medication?.patientMedicationId || '',
   }})
  };
  const filterResources = (allResources,appliedFilter)=>{
    const { staticFilter = {} } = appliedFilter;
  
    // Destructure filters
    const { statusCode = [] } = staticFilter;
    const filteredResources=allResources.filter(item=>{
       const hasStatusCodeFilter = statusCode.length > 0;
      const matchesStatusCode = !hasStatusCodeFilter || 
        (item.medicineStatus && statusCode.includes(item?.medicineStatus?.code));
        return matchesStatusCode;
    })
    return filteredResources;
  }

  const filterEvents = (allEvents=[], appliedFilter={}) => {
    const { staticFilter = {} } = appliedFilter;
  
    // Destructure filters
    const { statusCode = [], actionCode = [] } = staticFilter;
  
    const filteredEvents = allEvents.filter(event => {
      // 1. Filter by medicationData.status based on statusCode
      const hasStatusCodeFilter = statusCode.length > 0;
      const matchesStatusCode = !hasStatusCodeFilter || 
        (event.medicationData && statusCode.includes(event.medicationData.medicineStatusCode));
  
      // 2. Filter by marLog.actionCode based on actionCode
      const hasActionCodeFilter = actionCode.length > 0;
      const hasPendingScheduleInActionCode = actionCode.includes('pendingSchedule');
      const matchesActionCode = !hasActionCodeFilter || 
      (hasPendingScheduleInActionCode && (!event.marLog || !event.marLog.actionCode)) ||
        (event.marLog && actionCode.includes(event.marLog.actionCode));
  
      // Return true if the event matches all the conditions
      return matchesStatusCode && matchesActionCode;
    });
  
    return filteredEvents;
  };
  
  export {
  filterEvents, filterResources, generateResources, genereateEvents
};
