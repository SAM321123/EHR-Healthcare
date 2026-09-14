const config = require('../../src/config/config');

const defaultMeetConfig = {
    clientId: config.googleMeet.clientId || '',
    clientSecret: config.googleMeet.clientSecret || '',
    isDefault:true,
}
module.exports = {
    defaultMeetConfig,
}
