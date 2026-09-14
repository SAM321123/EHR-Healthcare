const  dbService  = require("./db.service");
const { getModels } = require("../utils/connection");
const { initializeModels } = require("../models");
const { sequelize } = require("../config/database");

const createPracticeSubscriptionHistory =async ({data}) => {
  const masterDB = initializeModels(sequelize, true);
  
  const practiceSubscriptionHisotryData = {
    // ...data,
    practiceId: data?.dataValues?.practiceId,
    subscriptionId: data?.dataValues?.subscriptionId,
    startDate: data?.dataValues?.startDate,
    endDate: data?.dataValues?.endDate,
    practitionerCount: data?.dataValues?.practitionerCount,
    prescriberCount: data?.dataValues?.prescriberCount,
    rnCount: data?.dataValues?.rnCount,
    cardNo: data?.dataValues?.cardNo,
    status: data?.dataValues?.status,    
    signature: data?.dataValues?.signature, // Assuming signature is part of the data
    cost: data?.dataValues?.cost, 
    isActive: data?.dataValues?.isActive,
    isCancel: data?.dataValues?.isCancel,
    cancelReason: data?.dataValues?.cancelReason,
    otherCancelReason: data?.dataValues?.otherCancelReason
  };
    
  await dbService.createOne({
    model: masterDB.SubscriptionHistory,
    reqParams: practiceSubscriptionHisotryData,
  });
  
  return 'created';
};

module.exports={
  createPracticeSubscriptionHistory,
}