/* eslint-disable no-prototype-builtins */
//////////////////////////////////////////////////// To store dummy result files in ftp////////////////////////////////////////
const { dbService } = require('../src/services');
const catchAsync = require('../src/utils/catchAsync');
const { getModels } = require('../src/utils/connection');
const { ftpService } = require('../src/services');
const path = require('path');
const fs = require('fs');
const httpStatus = require('http-status');
const ApiError = require('../src/utils/ApiError');
const { errorMessages } = require('../src/config/error');

// Function to convert a normal message to HL7 format
const sendDummyResult = catchAsync(async (req, res) => {

  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {body} = req || {};
  const {testingLabId} = body || {testingLabId:3}


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
  try{
    let resultFileName = 'fileK3';   //'ADD_FILE_NAME' //
    const resultFilePath = path.join(__dirname,'../labOrderFiles', 'dummy_result.txt')
    const resultFilePathWithForwardSlashes = resultFilePath.replace(/\\/g, '/');
    const resultRemotePath = `${labInfo?.ftpPath}/result`
    // Read data from the file
    let fileContent
    fs.readFile(resultFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      fileContent = data
      console.log('File content:', data);
    });

    result = await ftpService.uploadFile(config, resultFilePathWithForwardSlashes, resultRemotePath, labsRadiologyId=0, patientId=0, resultFileName);
    res.status(httpStatus.OK).send({uploaded:'success'})
  } catch (error) {
    console.error('Error during file operations:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: 'An error occurred while processing your request.' });
  }
})  
module.exports = {
  sendDummyResult,
};
///////////////////////////////////////////////////////////////////////////////////////////////
