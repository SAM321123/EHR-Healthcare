const faxError = {
    'sAccountCode cannot be more than 20 characters': 'The submitted sAccountCode exceeds the 20 character limit.',
    'You must supply sQueueFaxDate and sQueueFaxTime': 'You must supply both sQueueFaxDate and sQueueFaxTime',
    '#sQueueFaxDate# is an invalid date format (YYYY-mm-dd)':
      'The value of sQueueFaxDate is in the incorrect format. The format must be YYYY-MM-DD',
    '#sQueueFaxTime# is an invalid time format (HH:MM)':
      'The value of sQueueFaxTime is in the incorrect format. The format must be HH:MM',
    'Queue Fax Date/Time must be in the future': 'You submitted a scheduled fax time that is not in the future.',
    'Fax Number < 11 digits /': 'Fax number must be 11 digits long',
    'Invalid Fax Number /': 'The submitted fax number is invalid',
    'This account is not authroized to send international faxes /':
      'The requesting account is not authorized to send to an international number',
    'Invalid Broadcast Fax # /': 'At least 1 number in the fax number list is invalid',
    "Too Many Fax #'s /": 'The maximum number of fax numbers per broadcast fax has been exceeded (normally 50 numbers)',
    'Invalid Fax Type /': 'sFaxType does not have a value of either SINGLE or BROADCAST',
  };
  
  module.exports = {
    faxError,
  };
  