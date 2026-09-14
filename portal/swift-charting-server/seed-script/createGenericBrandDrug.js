const { sequelize } = require('../src/config/database');
const { initializeModels } = require('../src/models');
const { dbService } = require('../src/services');
const { brandNameDrugData } = require('./mastersData/brandNameDrugData');
const { genericDrugData } = require('./mastersData/genericDrugData');

const createGenericBrandDrug = async () => {
  const masterDB = initializeModels(sequelize);
  try {
    const genericDrugsPromises = [];
    genericDrugData.forEach((genericDrugDataItem) => {
      const {name,...rest} = genericDrugDataItem || {}
      genericDrugsPromises.push(dbService.upsert({model:masterDB.GenericDrug,filter:{where:{name}},reqParams:{...rest}}));
    });
    await Promise.all(genericDrugsPromises);
    const brandNameDrugPromises=[]
    brandNameDrugData.forEach((brandNameDrugDataItem) => {
      const {name,...rest} = brandNameDrugDataItem || {}
      brandNameDrugPromises.push(dbService.upsert({model:masterDB.BrandNameDrug,filter:{where:{name}},reqParams:{...rest}}));
    });
    await Promise.all(brandNameDrugPromises);

  } catch (err) {
  console.log("🚀 ~ createDefaultData ~ err:", err)

  }
};

module.exports = createGenericBrandDrug;
