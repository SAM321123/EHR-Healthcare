import { format, getTime, formatDistanceToNow, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}


export function formatDate(dateString) {
  if(!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = (now - date) / 1000 / 60;

  if (diffInMinutes < 1) {
    return 'Just Now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  } else if (diffInMinutes < 1440) {
    return format(date, 'h:mm a'); // e.g., 8:23 AM
  } else if (diffInMinutes < 2880) {
    return 'Yesterday at ' + format(date, 'h:mm a'); // e.g., yesterday at 8:23 AM
  } else if (diffInMinutes < 10080) {
    return `${Math.floor(diffInMinutes / 1440)} days ago at ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMMM do, yyyy h:mm a'); // e.g., September 11, 2024 8:23 AM
  }
}

export function chatFormatDate(dateString) {
  const date = new Date(dateString); // Parse the ISO date string into a Date object
  const now = new Date();

  if (isToday(date)) {
    return format(date, 'h:mm a'); // Today's time e.g., 10:11 PM
  }

  if (isYesterday(date)) {
    return 'Yesterday'; // Just return "Yesterday"
  }

  const dayDifference = differenceInCalendarDays(now, date);

  if (dayDifference < 7) {
    return format(date, 'EEEE'); // e.g., Thursday (only the day name)
  }

  return format(date, 'dd/MM/yyyy'); // e.g., 12/09/2024 for dates older than 7 days
}

