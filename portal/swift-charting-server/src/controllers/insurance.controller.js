const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { isEmpty } = require('lodash');
const { billingType } = require('../utils');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

const createInsurance = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId, primary = [], secondary = [],haveSecondary } = body || {};
    const userId = user.id;
    const uuid = req.clinicUuid;
    const db = getModels(uuid);

    const patient = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
    });
    if (!patient) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }

    const primaryItem = primary[0] || {};
    const secondaryItem = secondary[0] || {};
    primaryItem.insuranceFrontFileId = primaryItem?.insuranceFrontFile?.id;
    primaryItem.insuranceBackFileId = primaryItem?.insuranceBackFile?.id;
    delete primaryItem.patientFirstName;
    delete primaryItem.patientFirstName;
    delete primaryItem.patientMiddleName;
    delete primaryItem.patientLastName;
    delete primaryItem.patientPreferredName;
    delete primaryItem.insuranceFrontFile;
    delete primaryItem.insuranceBackFile;

    secondaryItem.insuranceFrontFileId = secondaryItem?.insuranceFrontFile?.id;
    secondaryItem.insuranceBackFileId = secondaryItem?.insuranceBackFile?.id;
    delete secondaryItem.patientFirstName;
    delete secondaryItem.patientMiddleName;
    delete secondaryItem.patientLastName;
    delete secondaryItem.patientPreferredName;
    delete secondaryItem.insuranceFrontFile;
    delete secondaryItem.insuranceBackFile;

    if (!isEmpty(primaryItem)) {
      await dbService.upsert({
        model: db.Insurance,
        filter: { where: { patientId, insuranceType: '1' } },
        reqParams: { ...primaryItem,isActive:true, createdById: userId, updatedById: userId,payerId: primaryItem?.payerId?.id, eligibilityCheckPayerId: primaryItem?.eligibilityCheckPayerId?.id, claimStatusCheckPayerId: primaryItem?.claimStatusCheckPayerId?.id},
      });
      await dbService.updateOne({model:db.Patient,filter:{where:{id:patientId}},updateParams:{billingType:billingType.INSURED,updatedById:userId}});
    }
    if (!isEmpty(secondaryItem) && haveSecondary) {
      await dbService.upsert({
        model: db.Insurance,
        filter: { where: { patientId, insuranceType: '2' } },
        reqParams: { ...secondaryItem,isActive:true, createdById: userId, updatedById: userId,payerId: secondaryItem?.payerId?.id,eligibilityCheckPayerId: secondaryItem?.eligibilityCheckPayerId?.id, claimStatusCheckPayerId: secondaryItem?.claimStatusCheckPayerId?.id  },
      });
    }else {
     const secondaryInsurance= await dbService.getOne({model:db.Insurance,filter:{where:{patientId, insuranceType: '2' }}});
     if(secondaryInsurance){
      await dbService.updateOne({
        model: db.Insurance,
        filter: { where: { patientId, insuranceType: '2' } },
        updateParams: { isActive:false, updatedById: userId },
      });
    }
    }
  res.status(httpStatus.CREATED).send('Created');
});

const getInsurance = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.Insurance,
    req,
    allowedFilters: ['patientId'], // pass patientId in query parameter
    searchFilter: ['firstName', 'lastName'], // if you search by text then searchText=value in query parameter
    customOrder: [['id', 'ASC']],
    include: [
      { model: db.File, as: 'insuranceFrontFile' },
      { model: db.File, as: 'insuranceBackFile' },
      { model: db.PayerList, as: 'payerData' },
      { model: db.PayerList, as: 'eligibilityCheckPayerData' },
      { model: db.PayerList, as: 'claimStatusCheckPayerData' },
      { model: db.EligibilityCheckHistory, as: 'eligibilityData', order: [['id', 'DESC']],limit: 1
   },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getInsuranceById = catchAsync(async (req, res) => {
  const { insuranceId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const diagnosis = await dbService.getOneById({ model: db.Insurance, id: insuranceId });
  if (!diagnosis) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Diagnosis not found');
  }
  res.status(httpStatus.OK).send(diagnosis);
});


const markBillingSelf = catchAsync(async (req, res) => {

  const { user, body } = req;
  const { patientId,} = body || {};
    const userId = user.id;
    const uuid = req.clinicUuid;
    const db = getModels(uuid);

    const patient = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
    });
    if (!patient) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }
    await dbService.updateOne({model:db.Patient,filter:{where:{id:patientId}},updateParams:{billingType:billingType.SELF,updatedById:userId}});
    const allInsurances = await dbService.getAll({model:db.Insurance,filter:{where:{patientId}}});
    if(allInsurances && allInsurances.length){
      await dbService.updateOne({model:db.Insurance,filter:{where:{patientId}},updateParams:{isActive:false}});
    }
    res.status(httpStatus.OK).send('Created');
});


module.exports = {
  createInsurance,
  getInsuranceById,
  getInsurance,
  markBillingSelf,
};
