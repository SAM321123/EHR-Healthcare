const { sequelize } = require('../../src/config/database');
const { errorMessages } = require('../../src/config/error');
const { initializeModels } = require('../../src/models');

const GlobalTypeCategoryData = [
    {
      name: 'From Library',
      code: 'from_library',
      description: '',
      isDeleted: false,
      isActive: true,
    },
    {
      name: 'Form Types',
      code: 'form_type',
      description: 'Form Types',
      isDeleted: false,
      isActive: true,
    },
    {
      name: 'Form Category',
      code: 'form_category',
      description: 'Form Categories',
      isDeleted: false,
      isActive: true,
    },
    {
      name: 'Subscription Cancel Reason',
      code: 'subsription_cancel_reason',
      description: 'Subscription Cancel Reason',
      isDeleted: false,
      isActive: true,
    },
  ];
  
  const createGlobalTypeCategoryFixtures = async () => {
    try {
      const masterDB = initializeModels(sequelize);
  
      const promises = [];
      GlobalTypeCategoryData.forEach((master) => {
        promises.push(masterDB.GlobalCategoryType.upsert({...master}));
      });
      await Promise.all(promises);
    } catch (err) {
      if (err.message.indexOf(errorMessages.DUPLICATE_RECORD) < 0) {
        throw err;
      }
    }
  };
  
module.exports = createGlobalTypeCategoryFixtures;
  
  