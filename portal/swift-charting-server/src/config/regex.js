const regex = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z-' ]+$/,
  TIMEZONE: /^([A-Za-z_]+\/[A-Za-z_]+)$/,
  DESCRIPTION: /^[\w\-.@#!?$ \n]+$/,
  PLACE_ID: /^[a-zA-Z0-9,' _-]+$/,
};

module.exports = {
  regex,
};
