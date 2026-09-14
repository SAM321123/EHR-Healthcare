/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const dbService = require('../db.service');
const moment = require('moment');
const logger = require('../../config/logger');
const { getModels } = require('../../utils/connection');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require( 'path' );
const { readFilesFromFTP } = require('../ftp.service')
const hl7Parser = require('hl7-parser');
const hl7 = require('simple-hl7');

const getLabOrderResult = async ({tenantId}) => {
  try {
    const db = getModels(tenantId);
    const labResultNotPresent = await dbService.getAll({
      model: db.LabsRadiology,
      filter: {
        where:{
          isLabResult: false
        },
      },
    });
    if (!labResultNotPresent?.length) return;
  
    for (const data of labResultNotPresent) {
      try {
      const { id: orderId, patientId: pId, testingLabId: labId } = data;
      const labData = await dbService.getOneById({
        model: db.TestingLab,
        id: labId,
      });
      
      const folderPath = `${labData?.ftpPath}/result`;  
      const config = {
        host: labData?.ftpHost,
        password: labData?.ftpPassword,
        user: labData?.ftpUser,
        secureOptions:{ rejectUnauthorized:true },
        secure: true,
        connectTimeout: 30000, // 30 seconds
        pasvTimeout: 30000, // 30 seconds
        keepalive: 10000 // 10 seconds
      }

        let hl7ResultData;
        try {
          hl7ResultData = await readFilesFromFTP(config, labData, folderPath, { orderId, pId, labId });
        } catch (ftpErr) {
          logger.error(`FTP error for orderId: ${orderId}, labId: ${labId} – ${ftpErr.message}`);
          continue; // Skip this iteration if folder is missing or FTP fails
        }

        if (!hl7ResultData) continue;

        const lines = hl7ResultData.split('\n');
        const resultString = lines.map(line => line + '\r').join('');

        const parsedMessage = hl7Parser.parse(resultString);

        const flattenArray = (array) =>
        Array.isArray(array)
          ? array.reduce((acc, val) => acc.concat(flattenArray(val)), [])
          : [array];

      const getReadableMessage = (parsedMessage) => {
        const readableMessage = {};
        Object.keys(parsedMessage.raw).forEach(segmentName => {
          const segments = parsedMessage.raw[segmentName];
          readableMessage[segmentName] = segments.map(segment => flattenArray(segment));
        });
        return readableMessage;
      }

      const readableMessage = getReadableMessage(parsedMessage);

      function extractValues(segment) {
        let values = [];
      
        segment.forEach(item => {
          if (Array.isArray(item)) {
            if (item.length === 1 && Array.isArray(item[0])) {
              values.push(item[0].join(' '));
            } else {
              values = values.concat(extractValues(item));
            }
          } else if (typeof item === 'string') {
            values.push(item);
          }
        });
      
        return values;
      }
      const processData = (data) => {
        let result = {};
      
        Object.keys(data).forEach(segmentName => {
          const segmentData = data[segmentName];
          if (Array.isArray(segmentData) && segmentData.length > 0) {
            const segmentValues = segmentData.map(seg => extractValues(seg[0]?.segment || []));
            result[segmentName] = segmentValues;
          }
        });
      
        return result;
      }

      const labReport = processData(readableMessage);

      if(resultString){
      const labReportResult = await dbService.createOne({
        model: db.LabReport,
        reqParams: { labRadiologyId: orderId, hl7LabResult: hl7ResultData, labResult:labReport },
      });
      if(labReportResult){
        await dbService.updateOne({
          model: db.LabsRadiology,
          updateParams: { isLabResult: true},
          filter: { where: { id: orderId } },
        }); 
          }
        }
      } catch (err) {
        logger.error(`Error processing orderId: ${data.id}`, err);
        continue;
      }
    }

  } catch (err) {
    logger.error(`Error in cron getLabOrderResult`, err);
    throw new Error(err);
  }
};
module.exports = {
  getLabOrderResult,
};
