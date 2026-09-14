import moment from 'moment-timezone';

/**
 * Maps IANA timezone identifiers to user-friendly display labels
 * Format: (GMT±HH:MM) Timezone Name
 */

const US_TIMEZONE_MAPPINGS = {
  'America/New_York': 'Eastern Time (US & Canada)',
  'America/Chicago': 'Central Time (US & Canada)',
  'America/Denver': 'Mountain Time (US & Canada)',
  'America/Los_Angeles': 'Pacific Time (US & Canada)',
  'America/Phoenix': 'Mountain Time (US & Canada) - Arizona',
  'America/Anchorage': 'Alaska Time (US)',
  'Pacific/Honolulu': 'Hawaii Time (US)',
  'America/Adak': 'Alaska Time (US) - Aleutian Islands',
};

/**
 * Formats a timezone object or string to display format: (GMT±HH:MM) Timezone Name
 * @param {Object|string} timezone - Timezone object with 'name' property or IANA timezone string
 * @returns {string} Formatted timezone label
 */
export const formatTimezoneLabel = (timezone) => {
  const tzName = typeof timezone === 'string' ? timezone : timezone?.name;
  
  if (!tzName) return '';

  try {
    // Get the GMT offset for the timezone
    const offset = moment.tz(tzName).format('Z'); // Returns format like +05:00 or -05:00
    const gmtOffset = `GMT${offset}`;
    
    // Check if we have a friendly name mapping
    const friendlyName = US_TIMEZONE_MAPPINGS[tzName];
    
    if (friendlyName) {
      return `(${gmtOffset}) ${friendlyName}`;
    }
    
    // For timezones without custom mapping, format the IANA name
    // Convert America/New_York to New York, America/Los_Angeles to Los Angeles, etc.
    const parts = tzName.split('/');
    const locationName = parts[parts.length - 1].replaceAll('_', ' ');
    const region = parts[0];
    
    return `(${gmtOffset}) ${locationName} (${region})`;
  } catch (error) {
    console.error('Error formatting timezone:', error);
    // Fallback to just the timezone name if there's an error
    return tzName.replaceAll('_', ' ');
  }
};

/**
 * Converts an array of timezone objects to display format
 * Maintains the original timezone value while updating the display label
 * @param {Array} timezones - Array of timezone objects with 'name' property
 * @returns {Array} Array of timezones with formatted labels
 */
export const formatTimezonesForDisplay = (timezones) => {
  if (!Array.isArray(timezones)) return [];
  
  return timezones.map((tz) => ({
    ...tz,
    displayLabel: formatTimezoneLabel(tz),
    name: tz.name, // Keep the original IANA timezone identifier
  }));
};

/**
 * Gets the IANA timezone identifier from a timezone value
 * (handles both formatted display strings and IANA identifiers)
 * @param {string} timezoneValue - Either IANA identifier or formatted string
 * @returns {string} IANA timezone identifier
 */
export const getTimezoneValue = (timezoneValue) => {
  if (!timezoneValue) return '';
  
  // If it already looks like an IANA identifier (contains /), return as-is
  if (timezoneValue.includes('/')) {
    return timezoneValue;
  }

  return timezoneValue;
};

/**
 * @param {string} ianaTimezone - IANA timezone identifier (e.g., "America/New_York")
 * @param {Array} timezoneOptions - Array of timezone options to search through
 * @returns {string} Formatted display label or the original value
 */
export const getTimezoneDisplayLabel = (ianaTimezone, timezoneOptions = []) => {
  if (!ianaTimezone) return '';
  
  if (timezoneOptions.length > 0) {
    const matchingOption = timezoneOptions.find(tz => tz.name === ianaTimezone);
    if (matchingOption?.displayLabel) {
      return matchingOption.displayLabel;
    }
  }
  
  return formatTimezoneLabel(ianaTimezone);
};
