const moment = require('moment');

function generateRecurringAppointments(appointmentBody) {
    const appointments = [];

    const {
        practionerId,
        startDateTime,
        endDateTime,
        title,
        patientId,
        isRecurring,
        recurringSetting
    } = appointmentBody;

    if (!isRecurring) {
        appointments.push({
            practionerId,
            startDateTime,
            endDateTime,
            title,
            patientId,
            isRecurring,
            recurringSetting
        });
        return appointments;
    }

    const { startDate, endDate, repeateType, repeateDay, repeateWeek, monthOnDay, monthWeekDay, monthWeek } = recurringSetting;

    let currentStart = moment(startDateTime);
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
            if (currentDay.weekday() === weekdayIndex) {
                count += 1;
                if (count === nth) {
                    return currentDay;
                }
            }
        }

        if (nth === 'Last') {
            for (let day = daysInMonth; day > 0; day--) {
                const currentDay = moment([year, month - 1, day]);
                if (currentDay.weekday() === weekdayIndex) {
                    return currentDay;
                }
            }
        }

        return null;
    }

    while (currentStart.isBefore(finalEnd)) {
        if (repeateType === 'Day') {
            appointments.push({
                practionerId,
                startDateTime: currentStart.toISOString(),
                endDateTime: moment(currentStart).add(moment(endDateTime).diff(startDateTime), 'milliseconds').toISOString(),
                title,
                patientId,
                isRecurring,
                recurringSetting
            });
            currentStart = addDays(currentStart, repeateDay);

        } else if (repeateType === 'Week') {
            repeateWeek.forEach(weekDay => {
                const appointmentDay = currentStart.clone().day(weekDay);
                if (appointmentDay.isBefore(finalEnd)) {
                    appointments.push({
                        practionerId,
                        startDateTime: appointmentDay.toISOString(),
                        endDateTime: moment(appointmentDay).add(moment(endDateTime).diff(startDateTime), 'milliseconds').toISOString(),
                        title,
                        patientId,
                        isRecurring,
                        recurringSetting
                    });
                }
            });
            currentStart = addWeeks(currentStart, repeateDay);

        } else if (repeateType === 'Month') {
            if (monthOnDay && monthOnDay.length > 0) {
                monthOnDay.forEach(day => {
                    const appointmentDay = currentStart.clone().date(day);
                    if (appointmentDay.isBefore(finalEnd)) {
                        appointments.push({
                            practionerId,
                            startDateTime: appointmentDay.toISOString(),
                            endDateTime: moment(appointmentDay).add(moment(endDateTime).diff(startDateTime), 'milliseconds').toISOString(),
                            title,
                            patientId,
                            isRecurring,
                            recurringSetting
                        });
                    }
                });
                currentStart = addMonths(currentStart, repeateDay);
            } else if (monthWeekDay && monthWeek && monthWeek.length > 0) {
                monthWeek.forEach(week => {
                    monthWeekDay.forEach(weekDay => {
                        const appointmentDay = getNthWeekdayOfMonth(currentStart.year(), currentStart.month() + 1,  weekDay,week);
                        if (appointmentDay && appointmentDay.isBefore(finalEnd)) {
                            appointments.push({
                                practionerId,
                                startDateTime: appointmentDay.toISOString(),
                                endDateTime: moment(appointmentDay).add(moment(endDateTime).diff(startDateTime), 'milliseconds').toISOString(),
                                title,
                                patientId,
                                isRecurring,
                                recurringSetting
                            });
                        }
                    });
                });
                currentStart = addMonths(currentStart, repeateDay);
            }
        }
    }

    return appointments;
}

// Example usage
const appointmentBody = {
    practionerId: '123',
    startDateTime: '2024-01-01T09:00:00Z',
    endDateTime: '2024-01-01T10:01:00Z',
    title: 'Consultation',
    patientId: '456',
    isRecurring: true,
    recurringSetting: {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        repeateType: 'Month',
        repeateDay: 1,
        repeateWeek: [],
        monthOnDay: [],
        monthWeekDay: [1],
        monthWeek: ['Monday']
    }
};

const appointments = generateRecurringAppointments(appointmentBody);
console.log(appointments);
