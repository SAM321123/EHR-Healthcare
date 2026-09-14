const moment = require('moment');

const dateFormat = 'YYYY-MM-DD';

const dateTimeFormat = 'YYYY-MM-DD HH:mm';
const dateTimeFormatTwelveHour = 'YYYY-MM-DD hh:mm A';

const timeFormat = 'HH:mm';

const dateFormatter = {
  YYYYMMDD: dateFormat,
  MMDDYYYY: 'MM-DD-YYYY',
  YYYYMMDDHHmm: dateTimeFormat,
  YYYYMMDDhhmmA: dateTimeFormatTwelveHour,
  MMDDYYYY_WITH_SLASHES: 'MM/DD/YYYY',
  MMDDYYYYhhmmA: 'MM/DD/YYYY hh:mm A',
};

const timeFormatter = {
  HHmm: timeFormat,
  hhmma: 'hh:mm a',
};

const getStartOfTheDay = (date, format = dateFormat) => {
  return moment.utc(date, format).startOf('day');
};

// Helper function to get the end of the day
const getEndOfTheDay = (date, format = dateFormat) => {
  return moment.utc(date, format).endOf('day');
};

// Helper function to get the date difference in the specified unit
const getDateDiff = (startDate, endDate, { unit }) => {
  const start = moment.utc(startDate);
  const end = moment.utc(endDate);
  return end.diff(start, unit);
};

const getStartOfTheDayWithTZ = (date, { timezone, format = dateFormat } = {}) => {
  return moment.tz(date, format, timezone).startOf('day').toDate();
};

const getEndOfTheDayWithTZ = (date, { timezone, format = dateFormat } = {}) => {
  return moment.tz(date, format, timezone).endOf('day').toDate();
};

const convertToUtc = (date, { timezone, format = dateFormat } = {}) => {
  return moment.tz(date, format, timezone).utc().format();
};

const formatDate = (date, { timezone = 'UTC', format = dateFormat } = {}) => {
  return moment(date)
    .tz(timezone || 'UTC')
    .format(format);
};

const getFormattedDate = (date, { format = dateFormat } = {}) => {
  return moment(date).format(format);
};

const getMonthYearFromDate = ({ date = new Date(), timezone = 'America/New_York' }) => {
  const dateMoment = moment.tz(date, timezone);
  const month = dateMoment.format('M');
  const year = dateMoment.format('YYYY');
  return { month, year };
};

const getCurrentMinuteRange = (data = new Date()) => {
  const currentDate = moment(data).utc();
  const start = currentDate.clone().startOf('minute');
  const end = currentDate.clone().endOf('minute');
  return { start, end };
};

const getTimezoneAbbreviation = (timezone) => moment.tz(timezone.toString()).format('z');
const getAge = (startDate, endDate, { unit }) => {
  const start = moment.utc(startDate);
  const end = moment.utc(endDate);
  return end.diff(start, unit);
};

const UtcToFormat = (date, { format }) => {
  return moment(date).utc().format(format);
};
const dobDateFormatter = (date, format = 'll') => moment(date).format(format);

const getDaysLeft = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = {
  getDateDiff,
  getEndOfTheDay,
  getStartOfTheDay,
  dateFormat,
  dateTimeFormat,
  timeFormat,
  convertToUtc,
  getStartOfTheDayWithTZ,
  getEndOfTheDayWithTZ,
  formatDate,
  dateTimeFormatTwelveHour,
  dateFormatter,
  getMonthYearFromDate,
  timeFormatter,
  getCurrentMinuteRange,
  getTimezoneAbbreviation,
  getFormattedDate,
  getAge,
  UtcToFormat,
  dobDateFormatter,
  getDaysLeft,
};
