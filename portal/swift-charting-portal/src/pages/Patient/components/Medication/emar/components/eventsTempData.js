const medicationData = [
    {
        "id": 1,
        "genericDrug": {
            "name": "Aspirin",
        },
        "brandNameDrug": {
            "name": "Aspirin Plus",
        },
        "startDate": "2024-09-30T12:00:00.000Z",
        "timeSlots": [
            { "startHour": "08", "startMinute": "00", "startMeridien": "AM" },
            { "startHour": "01", "startMinute": "00", "startMeridien": "PM" },
            { "startHour": "06", "startMinute": "30", "startMeridien": "PM" }
        ],
        "duration": 9 // Number of days the medication is taken
    },
    {
        "id": 2,
        "genericDrug": {
            "name": "Ibuprofen",
        },
        "brandNameDrug": {
            "name": "Ibuprofen Extra",
        },
        "startDate": "2024-10-02T18:30:00.000Z",
        "timeSlots": [
            { "startHour": "09", "startMinute": "00", "startMeridien": "AM" },
            { "startHour": "03", "startMinute": "30", "startMeridien": "PM" }
        ],
        "duration": 7 // Number of days the medication is taken
    }
];

// Step 1: Map Resources (Each medication becomes a resource)
const RESOURCES = medicationData.map(medication => ({
    id: medication.id.toString(),
    title: medication.genericDrug.name, // Use generic or brand name
}));

// Helper function to convert time slots to Date objects
function getTimeSlotDate(baseDate, slot) {
    let date = new Date(baseDate);
    let hour = parseInt(slot.startHour);
    let minute = parseInt(slot.startMinute);

    // Adjust hour based on AM/PM
    if (slot.startMeridien === "PM" && hour < 12) {
        hour += 12;
    }
    if (slot.startMeridien === "AM" && hour === 12) {
        hour = 0;
    }

    date.setHours(hour, minute, 0, 0);
    return date;
}

// Step 2: Generate events for each medication based on duration and time slots
const TEMPORARYEVENTS = medicationData.flatMap(medication => {
    let start = new Date(medication.startDate);
    let events = [];

    // Loop over the duration (number of days)
    for (let day = 0; day < medication.duration; day++) {
        // Clone the start date and move it forward by the number of days
        let currentDate = new Date(start);
        currentDate.setDate(start.getDate() + day);

        // For each time slot, generate an event
        medication.timeSlots.forEach(slot => {
            let eventDate = getTimeSlotDate(currentDate, slot);

            // Add event object to the events array
            events.push({
                resourceId: medication.id.toString(),
                title: medication.genericDrug.name, // Use the medication name
                start: eventDate.toISOString(),
                end: eventDate.toISOString(), // Keeping end the same for now, or you can adjust if necessary
            });
        });
    }

    return events; // Return all events for this medication
});

// Exporting resources and events
export {
    TEMPORARYEVENTS,
    RESOURCES,
};
