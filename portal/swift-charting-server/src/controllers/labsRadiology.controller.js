const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, hl7Service, labRadiologyService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');
const { hl7Versions } = require('../../seed-script/mastersData/hl7Versions');
const { getDateDiff } = require('../utils/dateUtility');
const { notifications } = require('../config/notification');
const { sendLabOrderNotification } = require('../services/notification.service');

const { ftpService } = require('../services');
const path = require('path');
const fs = require('fs');
const { updateById } = require('../services/db.service');

const createLabsRadiology = catchAsync(async (req, res) => {
    const { user, body } = req;
    const { laboratoryTestIds,patientId,sendToLab,...rest } = body || {};
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
  
    const labsRadiology = await dbService.createOne({
      model: db.LabsRadiology,
      reqParams: { ...rest,patientId, createdById: userId },
    });

    let getConvertedToHl7File
    if(body?.sendingDetails && labsRadiology){
      const testingLab = await dbService.getOneById({
        model: db.TestingLab,
        id: body.testingLabId
      });
      const sendingFacility = await dbService.getOneById({
        model: db.PracticeLocation,
        id: body.sendingFacilityId
      });

      const sendingData = {
        sendingApplication: body?.sendingApplication,
        sendingFacility: sendingFacility?.name,
        sendingFacilityData: sendingFacility,
        receivingApplication: testingLab?.name,
        // receivingFacility: 0,
        hl7VersionCode: testingLab?.hl7VersionCode,
        patientId: body?.patientId,
        providerId: body?.providerId,
        priority: body?.priority,
        requiredTestingTime: body?.requiredTestingTime,
        diagnosisIcdId: body?.diagnosisIcdId,
        patientDiagnosisId: body?.patientDiagnosisId,
        barCode: body?.barCode,
        specimenTypeCode: body?.specimenTypeCode,
        siteOfCollection: body?.siteOfCollection,
        collectionDateTime: body?.collectionDateTime,
        specimenQuantity: body?.specimenQuantity,
        specimenVolume: body?.specimenVolume,
        clinicalInfo: body?.clinicalInfo,
        suspectedCondition: body?.suspectedCondition,
        fastingCode: body?.fasting,
        patientPrepIns: body?.patientPrepIns,
        sensitiveInsTime: body?.sensitiveInsTime,
        // processById: body?.processingOrderProviderId,
        orderId: labsRadiology?.id,
        laboratoryTestIds: body?.laboratoryTestIds,
        otherLaboratoryTest: body?.otherLaboratoryTest,
        allergies: body?.allergies,
        medicalHistory: body?.medicalHistory,
        payer: body?.payer,    
      }
      getConvertedToHl7File = await hl7Service.convertToHl7(req, sendingData)
      if(getConvertedToHl7File){
        const updateResult = await dbService.updateOne({
          model: db.LabsRadiology,
          updateParams: {hl7VersionCode: testingLab?.hl7VersionCode, hl7Data: getConvertedToHl7File?.hl7Raw, hl7Message: getConvertedToHl7File?.hl7Parse },
          filter: { where: { id: labsRadiology?.id } },
        });
        if (!updateResult || !updateResult[1] || !updateResult[1][0]) {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update LabsRadiology with HL7 data.');
        }
      }

     const labsRadiologyId= labsRadiology?.id;
  if(sendToLab)
  {
  const labRadiologyInfo = await dbService.getOneById({
    model: db.LabsRadiology,
    id: labsRadiologyId,
  });

  if(!labRadiologyInfo){
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const testingLabId = labRadiologyInfo?.testingLabId;
  const hl7Data = labRadiologyInfo?.dataValues?.hl7Data;
  const patientId = labRadiologyInfo?.dataValues?.patientId;
  // const testingLabId = 2; 

  let labInfo;
  if(testingLabId){
    labInfo = await dbService.getOneById({
      model: db.TestingLab,
      id: testingLabId,
    });
  } else{
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const config = {
    host: labInfo?.dataValues?.ftpHost,
    password: labInfo?.dataValues?.ftpPassword,
    user: labInfo?.dataValues?.ftpUser,
    secureOptions:{ rejectUnauthorized:true },
    secure: true,
    connectTimeout: 30000, // 30 seconds
    pasvTimeout: 30000, // 30 seconds
    keepalive: 10000 // 10 seconds
  }
  // Define the path to the local file where you want to store the HL7 content
  const outputPath = path.join(__dirname,'../../labOrderFiles', `${patientId}_${labsRadiologyId}_orders`);
  try{
    fs.writeFile(outputPath, hl7Data, (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('File written successfully:', outputPath);
      }
    });
    // code of FTP

    const fileName = '_orders'
    const localPathWithForwardSlashes = outputPath.replace(/\\/g, '/');
    const remotePath = `${labInfo?.ftpPath}/request`
    let result = await ftpService.uploadFile(config, localPathWithForwardSlashes, remotePath, labsRadiologyId, patientId, fileName);
    if (result.success) {
      // Delete the local file after successful upload
      fs.unlink(outputPath, (err) => {
        if (err) {
          console.error('Error deleting local file:', err);
        } else {
          console.log('Local file deleted successfully:', outputPath);
        }
      });
    } else {
      console.error('Upload failed, local file not deleted:', result.error);
    }
    const userId = user?.id;
    const [,[isUpdate]] = await dbService.updateOne({
      model: db.LabsRadiology,
      // updateParams: { labResult:fileContent, updateById: userId, sendToLab: true },
      updateParams: { updateById: userId, sendToLab},
      filter: { where: { id: labsRadiologyId } },
    });
    // if(isUpdate){
    //   res.status(httpStatus.OK).send(isUpdate);
    //   return; // Prevents sending another response
    // }
  
  } catch (error) {
    console.error('Error during file operations:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'An error occurred while processing your request.' });
  }
}

    }
    if(labsRadiology && laboratoryTestIds && laboratoryTestIds.length){
    await labsRadiology.setLaboratoryTests(laboratoryTestIds);
    }
    const patientNotificationInfo = notifications.Patient.LAB_ORDER_CREATED;
    sendLabOrderNotification({labsRadiology},{tenantId:uuid,patientNotificationInfo});
    res.status(httpStatus.CREATED).send(labsRadiology);
  });

const getLabsRadiology = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText , patientId } = req?.query || {};
  let countWhereClause = {}
  let whereClause = {}
  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  if(patientId){
    countWhereClause = { patientId: patientId };
  }
  const totalCount = await db.LabsRadiology.count({
     where: { ...countWhereClause,
      isDeleted: false,
    },
    include: [{ model: db.Patient, as: 'patient',include:[{ model: db.GlobalType, as: 'title' }] ,where: whereClause},]
  });
  const result = await dbService.getPaginated({
    model: db.LabsRadiology,
    req,
    allowedFilters: ['patientId','patientEncounterId'],
    include: [
      { model: db.Patient, as: 'patient',include:[{ model: db.GlobalType, as: 'title' }] ,where: whereClause},
      { model: db.Staff, as: 'provider',include:[{ model: db.GlobalType, as: 'title' }] },
      { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
      { model: db.Diagnosis, as: 'patientDiagnosis' },
      { model: db.LaboratoryTest, as: 'laboratoryTests' },
      { model: db.TestingLab, as: 'testingLabs' },
      { model: db.GlobalType, as: 'status' },
    ],
  });
  result.totalResults = totalCount,
  result.totalPages = Math.ceil(totalCount/ 10)
  res.status(httpStatus.OK).send(result);
});

const getLabsRadiologyById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { labsRadiologyId } = req.params || {};
  // const { searchText } = req?.query || {};
  const result = await dbService.getOneById({
    model: db.LabsRadiology,
    id: labsRadiologyId,
    // allowedFilters: ['patientId','patientEncounterId'],
    // include: [
    //   { model: db.Patient, as: 'patient',include:[{ model: db.GlobalType, as: 'title' }] },
    //   { model: db.Staff, as: 'provider',include:[{ model: db.GlobalType, as: 'title' }] },
    //   { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
    //   { model: db.Diagnosis, as: 'patientDiagnosis' },
    //   { model: db.LaboratoryTest, as: 'laboratoryTests' },
    //   { model: db.TestingLab, as: 'testingLabs' },
    //   { model: db.GlobalType, as: 'status' },
    // ],
  });
  res.status(httpStatus.OK).send(result);
});


const updateLabsRadiology = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { labsRadiologyId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { laboratoryTestIds, signature,  ...rest } = body || {};

  const existingLabsRadiology = await dbService.getOneById({ 
    model: db.LabsRadiology, 
    id: labsRadiologyId,
    include:[{
      model:db.LaboratoryTest,
      as:'laboratoryTests'
    }] 
  });
  if (!existingLabsRadiology) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Labs/Radiology`));
  }

  if(!signature){
    const patient = await dbService.getOneById({
      model: db.Patient,
      id: body?.patientId,
    });

    let getConvertedToHl7File
  
    const sendingFacility = await dbService.getOneById({
      model: db.PracticeLocation,
      id: (body?.sendingFacilityId !== undefined && body?.sendingFacilityId !== null) ? body?.sendingFacilityId : existingLabsRadiology?.sendingFacilityId,
      // id: body?.sendingFacilityId || existingLabsRadiology?.sendingFacilityId, 
    });
  
    const testingLab = await dbService.getOneById({
      model: db.TestingLab,
      id: (body?.testingLabId !== undefined && body?.testingLabId !== null) ? body?.testingLabId : existingLabsRadiology?.testingLabId,
      // id: body?.testingLabId || existingLabsRadiology?.testingLabId, 
    });
   console.log("testingLab>>>>>>>>>>>>>>>>>",testingLab);
    const sendingData = {
      sendingApplication: (body?.sendingApplication !== undefined && body?.sendingApplication !== null) ? body?.sendingApplication : existingLabsRadiology?.sendingApplication,
      sendingFacility: sendingFacility?.name,
      sendingFacilityData: sendingFacility,
      receivingApplication: testingLab?.name,
      hl7VersionCode: (testingLab?.hl7VersionCode !== undefined && testingLab?.hl7VersionCode !== null) ? testingLab?.hl7VersionCode : existingLabsRadiology?.hl7VersionCode,
      patientId: (body?.patientId !== undefined && body?.patientId !== null) ? body?.patientId : existingLabsRadiology?.patientId,
      providerId: (body?.providerId !== undefined && body?.providerId !== null) ? body?.providerId : existingLabsRadiology?.providerId,
      priority: (body?.priority !== undefined && body?.priority !== null) ? body?.priority : existingLabsRadiology?.priority,
      requiredTestingTime: (body?.requiredTestingTime !== undefined && body?.requiredTestingTime !== null) ? body?.requiredTestingTime : existingLabsRadiology?.requiredTestingTime,
      diagnosisIcdId: (body?.diagnosisIcdId !== undefined && body?.diagnosisIcdId !== null) ? body?.diagnosisIcdId : existingLabsRadiology?.diagnosisIcdId,
      patientDiagnosisId: (body?.patientDiagnosisId !== undefined && body?.patientDiagnosisId !== null) ? body?.patientDiagnosisId : existingLabsRadiology?.patientDiagnosisId,
      barCode: (body?.barCode !== undefined && body?.barCode !== null) ? body?.barCode : existingLabsRadiology?.barCode,
      specimenTypeCode: (body?.specimenTypeCode !== undefined && body?.specimenTypeCode !== null) ? body?.specimenTypeCode : existingLabsRadiology?.specimenTypeCode,
      siteOfCollection: (body?.siteOfCollection !== undefined && body?.siteOfCollection !== null) ? body?.siteOfCollection : existingLabsRadiology?.siteOfCollection,
      collectionDateTime: (body?.collectionDateTime !== undefined && body?.collectionDateTime !== null) ? body?.collectionDateTime : existingLabsRadiology?.collectionDateTime,
      specimenQuantity: (body?.specimenQuantity !== undefined && body?.specimenQuantity !== null) ? body?.specimenQuantity : existingLabsRadiology?.specimenQuantity,
      specimenVolume: (body?.specimenVolume !== undefined && body?.specimenVolume !== null) ? body?.specimenVolume : existingLabsRadiology?.specimenVolume,
      clinicalInfo: (body?.clinicalInfo !== undefined && body?.clinicalInfo !== null) ? body?.clinicalInfo : existingLabsRadiology?.clinicalInfo,
      suspectedCondition: (body?.suspectedCondition !== undefined && body?.suspectedCondition !== null) ? body?.suspectedCondition : existingLabsRadiology?.suspectedCondition,
      fastingCode: (body?.fasting !== undefined && body?.fasting !== null) ? body?.fasting : existingLabsRadiology?.fasting,
      patientPrepIns: (body?.patientPrepIns !== undefined && body?.patientPrepIns !== null) ? body?.patientPrepIns : existingLabsRadiology?.patientPrepIns,
      sensitiveInsTime: (body?.sensitiveInsTime !== undefined && body?.sensitiveInsTime !== null) ? body?.sensitiveInsTime : existingLabsRadiology?.sensitiveInsTime,
      // processById: (body?.processingOrderProviderId !== undefined && body?.processingOrderProviderId !== null) ? body?.processingOrderProviderId : existingLabsRadiology?.processingOrderProviderId,
      orderId: existingLabsRadiology?.id || '',
      laboratoryTestIds: (body?.laboratoryTestIds !== undefined && body?.laboratoryTestIds !== null) ? body?.laboratoryTestIds : existingLabsRadiology?.laboratoryTests,
      allergies: (body?.allergies !== undefined && body?.allergies !== null) ? body?.allergies : existingLabsRadiology?.allergies,
      medicalHistory: (body?.medicalHistory !== undefined && body?.medicalHistory !== null) ? body?.medicalHistory : existingLabsRadiology?.medicalHistory,
      payer: (body?.payer !== undefined && body?.payer !== null) ? body?.payer : existingLabsRadiology?.payer,
      otherLaboratoryTest: (body?.otherLaboratoryTest !== undefined && body?.otherLaboratoryTest !== null) ? body?.otherLaboratoryTest : existingLabsRadiology?.otherLaboratoryTest,
    }
    if(existingLabsRadiology?.sendingDetails || body?.sendingDetails){
      getConvertedToHl7File = await hl7Service.convertToHl7(req, sendingData)
    }
  
    const updateParams = { ...rest, updatedById: userId,hl7VersionCode: testingLab?.hl7VersionCode, hl7Data: getConvertedToHl7File?.hl7Raw|| existingLabsRadiology?.dataValues?.hl7Data, hl7Message: getConvertedToHl7File?.hl7Parse|| existingLabsRadiology?.dataValues?.hl7Message  };
    if (body.isDeleted === true) {
      updateParams.deletedById = userId;
    }
    const [, [updatedLabsRadiology]] = await dbService.updateOne({
      model: db.LabsRadiology,
      updateParams,
      filter: { where: { id: labsRadiologyId } },
    });
    if (laboratoryTestIds) {
      await updatedLabsRadiology.setLaboratoryTests(laboratoryTestIds);
    }
    res.status(httpStatus.OK).send(updatedLabsRadiology); 
  } else{
    const [, [updatedLabsRadiology]] = await dbService.updateOne({
      model: db.LabsRadiology,
      updateParams: {signature},
      filter: { where: { id: labsRadiologyId } },
    });
    res.status(httpStatus.OK).send(updatedLabsRadiology);
  }
  // res.status(httpStatus.OK).send(updatedLabsRadiology);
});

const sharePatientLabRadiology = catchAsync(async (req, res) => {
  const { user, clinicUuid: uuid } = req || {};
  const patientRequest = await labRadiologyService.sharePatientLabRadiology(req.params.labRadiologyId, req.body, {
    user,
    tenantId: uuid,
  });

  res.status(httpStatus.OK).send(patientRequest);
});


module.exports = {
  createLabsRadiology,
  getLabsRadiology,
  updateLabsRadiology,
  getLabsRadiologyById,
  sharePatientLabRadiology,
};
