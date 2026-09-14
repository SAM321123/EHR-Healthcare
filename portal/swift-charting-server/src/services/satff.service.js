const dbService = require("./db.service");
const { getModels } = require("../utils/connection");
const { initializeModels } = require("../models");
const { sequelize } = require('../config/database');

const getStaffByUserId =async ({tenantId,userId})=>{
    const db = getModels(tenantId);
    const staff= await dbService.getOne({model:db.Staff,filter:{where:{userId}}});
    return staff;
}

const createStaffOnTrialPeriod = async({tenantId,userId, isPrescriber, roleIds})=>{
    const db = getModels(tenantId);
    const masterDB = initializeModels(sequelize, true);

    const rnRole = await db.Role.findOne({ where: { code: 'rn' } });
    const isNotRn = !(roleIds.length === 1 && roleIds[0] === rnRole?.id);
    let newPractitionerCount = 0;
    let cost = 0;


    let updateData = {};
    const trialSubscription = await dbService.getOne({
        model: masterDB.TrialSubscription,
        filter: { where: { practiceId: tenantId} },
    });
    cost = parseFloat(trialSubscription?.cost || 0);
    
    if(!isNotRn){
        cost = cost + 25.00;
        newPractitionerCount = trialSubscription?.rnCount + 1;
        updateData = { rnCount: newPractitionerCount, cost };
    }else{
        cost = cost + 49.00;
        newPractitionerCount = trialSubscription?.practitionerCount + 1;
        updateData = { practitionerCount: newPractitionerCount, cost };
    }

    if(isPrescriber){
        cost = cost + 37.99;
        updateData = { ...updateData, prescriberCount: trialSubscription?.prescriberCount + 1, cost};
    }

    const trialSubscriptionUpdate = await dbService.updateOne({
        model: masterDB.TrialSubscription,
        updateParams: { ...updateData },
        filter: { where: { practiceId: tenantId } },
    });
    
    return trialSubscriptionUpdate;
}

module.exports={
    getStaffByUserId,
    createStaffOnTrialPeriod
}