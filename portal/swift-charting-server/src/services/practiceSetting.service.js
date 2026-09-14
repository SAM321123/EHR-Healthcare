const dbService  = require("./db.service");
const { getModels } = require("../utils/connection");
const { getOrganizationLogo } = require("./emailTemplate.service");
const { clientLogo } = require("../config/config");
const { initializeModels } = require("../models");
const { sequelize } = require('../config/database');

const getPracticeSettingsConfig = async({tenantId})=>{
    const masterDB = initializeModels(sequelize);
    const db = getModels(tenantId);

    let practiceSetting = await dbService.getOne({ model: db.PracticeSetting, include: { model: db.File, as: 'logo' } });
    const practice = await dbService.getOneById({
      model: masterDB.Practice,
      id: tenantId,
    });
    let { logo: practiceLogo } = practiceSetting || {};
    if (!practiceLogo) {
      practiceLogo = { file: clientLogo, name: 'swiftChartingDefaultLogo.png', type: 'defaultOrganizationLogo' };
    }
    practiceSetting ={ ...practiceSetting, domainName: practice?.domainName };
    

    const logoConfigs=  await getOrganizationLogo({ practiceLogo });
    return {practiceSetting,logoConfigs}
}

module.exports = {
    getPracticeSettingsConfig,
}
