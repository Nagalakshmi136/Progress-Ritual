// Helper to combine scheduledDate (midnight UTC Date) and time string (HH:mm) into a local Date object
// This function is for calculations and comparisons. The source data remains separate Date (UTC) and String.
// Be mindful of timezones! This assumes the timeString is in the local time context relevant to the user/server.
const combineDateAndTime = (date: Date | string, timeString?: string): Date | undefined => {
    let baseDate: Date;

    // Ensure date is a valid Date object
    if (typeof date === 'string') {
        baseDate = new Date(date); // Attempt to parse string date
        if (isNaN(baseDate.getTime())) {
            // console.warn("Invalid date string passed to combineDateAndTime:", date);
            return undefined; // Invalid date string
        }
    } else if (date instanceof Date && !isNaN(date.getTime())) {
        baseDate = new Date(date); // Use valid Date object
    } else {
        // console.warn("Invalid date object passed to combineDateAndTime:", date);
        return undefined; // Invalid date object
    }

    if (!timeString || typeof timeString !== 'string') {
        return undefined; // No valid time string provided
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString)) {
        // console.warn("Invalid time string format passed to combineDateAndTime:", timeString);
        return undefined; // Invalid time format
    }

    // Create a new Date object using the base date, and setting the time components
    // This will set the time in the local timezone of the server/environment where this code runs
    const combined = new Date(baseDate);
    const [hours, minutes] = timeString.split(':').map(Number);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
};

// Helper to extract time string (HH:mm) from a Date object (using local time)
const extractTimeString = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        // console.warn("Invalid date passed to extractTimeString:", date);
        return ""; // Return empty string for invalid date
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};


// Helper to create a delay event object with common fields
const createDelayEvent = (type: string, task: any, details: any = {}) => {
    const now = new Date();
    // Calculate the planned end time *Date object* at the moment of the event using the task's *current* scheduledDate and endTime string
    const plannedEndTimeAtEventDate = task.scheduledDate && task.endTime
        ? combineDateAndTime(task.scheduledDate, task.endTime)
        : undefined;

    const actualTimeAtEvent = now;
    const timeDifferenceMs = plannedEndTimeAtEventDate ? actualTimeAtEvent.getTime() - plannedEndTimeAtEventDate.getTime() : undefined;

    return {
        type,
        // timestamp: now, // Mongoose default will set this if omitted
        plannedEndTimeAtEvent: plannedEndTimeAtEventDate, // Store combined Date or undefined
        actualTimeAtEvent,
        timeDifferenceMs,
        ...details // Include any event-specific details passed
    };
};
export { combineDateAndTime, extractTimeString, createDelayEvent };