const { dateFormatter, formatDate } = require("./dateUtility");

const generateRecurringSummary = (recurringSetting,timezone) => {
    const {
      startRecurringDate:startDate,
      endRecurringDate:endDate,
      repeateEvery,
      repeateType,
      repeateWeek,
      monthOnDay,
      monthWeek,
      monthWeekDay
    } = recurringSetting;
  
    let summary = 'Occurs every';
  
    // Repeat type
    if (repeateType === 'Day') {
      summary += ` ${repeateEvery} ${repeateEvery === '1' ? 'day' : 'days'}`;
    } else if (repeateType === 'Week') {
      summary += ` ${repeateEvery} ${repeateEvery === '1' ? 'week' : 'weeks'} on ${repeateWeek.join(', ')}`;
    } else if (repeateType === 'Month') {
      const ordinals = monthWeek.map((week, index) => {
        switch (week) {
          case '1':
            return 'First';
          case '2':
            return 'Second';
          case '3':
            return 'Third';
          case '4':
            return 'Fourth';
          case 'Last':
            return 'Last';
          default:
            return '';
        }
      });
  
      const days = monthWeekDay.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(' and '); // Capitalize the days
  
      const weekStr = ordinals.length > 1 ? `${ordinals.slice(0, -1).join(', ')} and ${ordinals.slice(-1)}` : ordinals[0];
  
      if (monthOnDay) {
        summary += ` ${repeateEvery} ${repeateEvery === '1' ? 'month' : 'months'} on day ${monthOnDay}`;
      } else {
        summary += ` ${repeateEvery} ${repeateEvery === '1' ? 'month' : 'months'} on the ${weekStr} ${days}`;
      }
    }
  
    // Start date
    summary += ` starting ${ formatDate(startDate , {
      timezone,
      format: dateFormatter.MMDDYYYY_WITH_SLASHES,
    })} until ${formatDate(endDate , {
      timezone,
      format: dateFormatter.MMDDYYYY_WITH_SLASHES,
    })}`;
  
    return summary;
  };

  module.exports ={
    generateRecurringSummary,
  }