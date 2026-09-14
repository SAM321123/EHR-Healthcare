/* eslint-disable no-prototype-builtins */
const { hl7Service, dbService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { ftpService } = require('../services');
const path = require('path');
const fs = require('fs');
const httpStatus = require('http-status');
const { updateById } = require('../services/db.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

// Function to convert a normal message to HL7 format
const sendToLab = catchAsync(async (req, res) => {
  const { user } = req
  const {labsRadiologyId} = req.body.data;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

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
  const outputPath = path.join(__dirname,'../../labOrderFiles', `${patientId}_orders`);
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
      updateParams: { updateById: userId, sendToLab: true},
      filter: { where: { id: labsRadiologyId } },
    });
    if(isUpdate){
      res.status(httpStatus.OK).send(isUpdate);
    }
    

    //////////////////////////////////////////////////// To store dummy result files in ftp////////////////////////////////////////
    // let resultFileName = '_results'
    // const resultFilePath = path.join(__dirname,'../../labOrderFiles', 'dummy_result.txt')
    // const resultFilePathWithForwardSlashes = resultFilePath.replace(/\\/g, '/');
    // const resultRemotePath = `${labInfo?.ftpPath}/result`
    // // Read data from the file
    // let fileContent
    // fs.readFile(resultFilePath, 'utf8', (err, data) => {
    //   if (err) {
    //     console.error('Error reading file:', err);
    //     return;
    //   }
    //   fileContent = data
    //   console.log('File content:', data);
    // });

    // result = await ftpService.uploadFile(config, resultFilePathWithForwardSlashes, resultRemotePath, patientId=0, resultFileName='file17.txt');
    ///////////////////////////////////////////////////////////////////////////////////////////////

  } catch (error) {
    console.error('Error during file operations:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'An error occurred while processing your request.' });
  }
})  
module.exports = {
  sendToLab,
};
