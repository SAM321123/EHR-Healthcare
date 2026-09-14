const { sequelize } = require('../src/config/database');
const { errorMessages } = require('../src/config/error');
const { initializeModels } = require('../src/models');
const { dbService } = require('../src/services');
const { users } = require('./mastersData/users');

const createDefaultUsers = async () => {
  try {
    const masterDB = initializeModels(sequelize);

    const promises = [];
    const roleData = await masterDB.Role.findOne({ where: { code: 'superAdmin' } });
    users.forEach((user) => {
      const {email,...rest} = user || {}
      promises.push(dbService.upsert({model:masterDB.User,filter:{where:{email}},reqParams:{...rest}}));
    });
    const newUsers= await Promise.all(promises);
   for(const newUser of newUsers){
      await newUser.item.setRoles([roleData])
    }
  } catch (err) {
    if (err.message.indexOf(errorMessages.EMAIL_EXISTS) < 0) {
      throw err;
    }
  }
};

module.exports = createDefaultUsers;
