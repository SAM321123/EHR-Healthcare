const { errorMessages } = require('../src/config/error');
const { practiceService } = require('../src/services');
const { practices } = require('./mastersData/practices');

const createDefaultPractices = async () => {
  try {
    const promises = [];
    practices.forEach((practice) => {
      promises.push(practiceService.createPractice({ ...practice }));
    });
    await Promise.all(promises);
  } catch (err) {
    if (err.message.indexOf(errorMessages.EMAIL_EXISTS) < 0) {
      throw err;
    }
  }
};

module.exports = createDefaultPractices;
