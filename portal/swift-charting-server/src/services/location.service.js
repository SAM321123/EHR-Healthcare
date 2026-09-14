const axios = require('axios');
const logger = require('../config/logger');

const getLocation = async(userIp) =>{
  try {
    if (!userIp || userIp === '127.0.0.1' || userIp === '::1' || userIp.startsWith('192.168.') || userIp.startsWith('10.')) {
      logger.info(`Geolocation skipped for local/private IP: ${userIp}`);
      return { city: null, state: null, country: null };
    }

    logger.info(`Fetching geolocation for IP: ${userIp}`);
    const { data } = await axios.get(`https://ipapi.co/${userIp}/json/`,{timeout: 5000 });

    logger.info(`Geolocation API response for ${userIp}:`, {
      city: data.city,
      region: data.region,
      country_name: data.country_name,
      error: data.error
    });

    if (data.error) {
      logger.warn(`Geolocation API error for IP ${userIp}: ${data.reason || data.error}`);
      return { city: null, state: null, country: null };
    }

    return {
      city: data.city || null,
      state: data.region || null,
      country: data.country_name || null
    };
  } catch (err) {
    logger.error(`Geolocation failed for IP ${userIp}:`, err.message);
    return { city: null, state: null, country: null };
  }
}

module.exports = getLocation;
