const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { getFullName, capitalize } = require("../utils");
const { dbService } = require("../services");
const { getModels } = require('../utils/connection');
const ApiError = require("../utils/ApiError");
const fs = require("fs");
// const { Builder } = require("xmlbuilder"); // For XML construction
const xmlbuilder = require("xmlbuilder");
const https = require("https");
const net = require("net");
const axios = require('axios');
const FormData = require('form-data');
const xml2js = require('xml2js');
const { v4: uuidv4 } = require('uuid');
const edi = require('rdpcrystal-edi-library');
const path = require("path");
const { Op } = require("sequelize");
const pick = require("../utils/pick");
const { exit } = require("process");
const OFFICE_ALLY_REALTIME_URL = process.env.OFFICE_ALLY_REALTIME_URL || "https://wsd.officeally.com/TransactionSite/realtime-request/MIME";
const OFFICE_ALLY_REALTIME_TIMEOUT_MS = Number(process.env.OFFICE_ALLY_REALTIME_TIMEOUT_MS) || 45000;
const OFFICE_ALLY_REALTIME_RETRY_COUNT = Number(process.env.OFFICE_ALLY_REALTIME_RETRY_COUNT) || 1;
const OFFICE_ALLY_PREFLIGHT_TIMEOUT_MS = Number(process.env.OFFICE_ALLY_PREFLIGHT_TIMEOUT_MS) || 5000;
const OFFICE_ALLY_RETRYABLE_ERROR_CODES = ["ETIMEDOUT", "ECONNABORTED", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND"];
const officeAllyHttpsAgent = new https.Agent({
  keepAlive: true,
  family: 4,
  minVersion: "TLSv1.2",
});
const officeAllyRealtimeHost = (() => {
  try {
    return new URL(OFFICE_ALLY_REALTIME_URL).host;
  } catch (error) {
    return "unknown";
  }
})();
const officeAllyRealtimePort = (() => {
  try {
    const parsedUrl = new URL(OFFICE_ALLY_REALTIME_URL);
    return Number(parsedUrl.port) || (parsedUrl.protocol === "https:" ? 443 : 80);
  } catch (error) {
    return 443;
  }
})();

  // Helper to format date
  const getDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10).replace(/-/g, "");
  };


const constructPayload = ({ senderId, receiverId, payerId,payerName, providerNpi,providerFirstName,providerLastName, memberId, patientName, dob }) => {
  return `ISA*00*          *00*          *ZZ*${senderId.padEnd(15)}*ZZ*${receiverId.padEnd(15)}*${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}*1200*^*00501*000000001*0*P*:~
GS*HS*${senderId}*${receiverId}*${new Date().toISOString().slice(0, 10).replace(/-/g, '')}*1200*1*X*005010X279A1~
ST*270*0001*005010X279A1~
BHT*0022*13*10001234*${new Date().toISOString().slice(0, 10).replace(/-/g, '')}*1200~
HL*1**20*1~
NM1*PR*2*${payerName}*****PI*${payerId}~
HL*2*1*21*1~
NM1*1P*1*${providerLastName}*${providerFirstName}****XX*${providerNpi}~
HL*3*2*22*0~
NM1*IL*1*${patientName.last}*${patientName.first}****MI*${memberId}~
DMG*D8*${dob}~
EQ*30~
SE*11*0001~
GE*1*1~
IEA*1*000000001~`.trim();
};

const construct276EditPayload = ({ senderId, receiverId, payerId, payerName, providerNpi, providerFirstName, providerLastName, memberId, patientName, dob,transactionId,sex }) => {
    const now = new Date();
    const dateYYMMDD = now.toISOString().substring(2, 4) + now.toISOString().substring(5, 7) + now.toISOString().substring(8, 10);
    const dateYYYYMMDD = now.toISOString().substring(0, 10).replace(/-/g, '');
    const timeHHMM = now.toISOString().substring(11, 16).replace(':', '');

//     return `ISA*00*          *00*          *ZZ*${senderId.padEnd(15)}*ZZ*${receiverId.padEnd(15)}*${dateYYMMDD}*${timeHHMM}*^*00401*000016926*0*T*:~
// GS*HR*${senderId}*${receiverId}*${dateYYYYMMDD}*${timeHHMM}*6930*X*005010X212~
// ST*276*0002*005010X212~
// BHT*0010*13*${dateYYYYMMDD}*${timeHHMM}~
// HL*1**20*1~
// NM1*PR*2*${payerName}*****PI*${payerId}~
// HL*2*1*21*1~
// NM1*1P*1*${providerLastName}*${providerFirstName}****XX*${providerNpi}~
// HL*3*2*22*0~
// NM1*IL*1*${patientName.last}*${patientName.first}****MI*${memberId}~
// TRN*1*0123~
// AMT*T3*10~
// DTP*291*D8*20250307~
// SE*17*000000001~
// GE*1*6930~
// IEA*1*000016926~`.trim();

return `ISA*00*          *00*          *ZZ*${senderId.padEnd(15)}*ZZ*${receiverId.padEnd(15)}*${dateYYMMDD}*${timeHHMM}*^*00401*000016926*0*P*:~
GS*HN*${senderId}*${receiverId}*${dateYYYYMMDD}*${timeHHMM}*6930*X*005010X212~
ST*276*000016926*005010X212~
BHT*0010*13*${transactionId}*${dateYYYYMMDD}*${timeHHMM}~
HL*1**20*1~
NM1*PR*2*${payerName}*****PI*${payerId}~
HL*2*1*21*1~
NM1*41*1*${providerLastName}*${providerFirstName}****46*${providerNpi}~
HL*3*2*19*1~
NM1*1P*1*${providerLastName}*${providerFirstName}****XX*${providerNpi}~
HL*4*3*22*0~
DMG*D8*${dob}*${sex}~
NM1*IL*1*${patientName.last}*${patientName.first}****MI*${memberId}~
TRN*1*${transactionId}~
DTP*472*RD8*20250402-20250402~
SE*14*000016926~
GE*1*000016926~
IEA*1*000016926~`.trim();
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkOfficeAllyConnectivity = ({ host, port, timeoutMs }) => new Promise((resolve, reject) => {
  const socket = new net.Socket();
  let settled = false;

  const finish = (callback) => (value) => {
    if (settled) {
      return;
    }
    settled = true;
    socket.destroy();
    callback(value);
  };

  socket.setTimeout(timeoutMs);
  socket.once("connect", finish(() => resolve(true)));
  socket.once("timeout", finish(() => {
    const error = new Error(`connect ETIMEDOUT ${host}:${port}`);
    error.code = "ETIMEDOUT";
    reject(error);
  }));
  socket.once("error", finish((error) => reject(error)));
  socket.connect(port, host);
});

const buildOfficeAllyRealtimeForm = ({
  payloadType,
  payloadId,
  receiverId,
  payload,
  senderId,
  username,
  password,
}) => {
  const form = new FormData();
  form.append("PayloadType", payloadType);
  form.append("PayloadId", payloadId);
  form.append("ReceiverId", receiverId);
  form.append("Payload", payload);
  form.append("SenderId", senderId);
  form.append("UserName", username);
  form.append("ProcessingMode", "RealTime");
  form.append("Password", password);
  form.append("CoreRuleVersion", "2.2.0");
  return form;
};

const shouldRetryOfficeAllyRequest = (error = {}) => {
  const message = error?.message?.toLowerCase?.() || "";
  return OFFICE_ALLY_RETRYABLE_ERROR_CODES.includes(error?.code)
    || message.includes("timeout")
    || message.includes("socket hang up");
};

const extractOfficeAllyErrorResponse = (error = {}) => {
  const responseData = error?.response?.data;

  if (!responseData) {
    return null;
  }

  if (typeof responseData === "string") {
    return responseData.trim();
  }

  try {
    return JSON.stringify(responseData);
  } catch (jsonError) {
    return String(responseData);
  }
};

const getOfficeAllyErrorDetails = (error = {}, transactionType = "eligibility") => {
  const responseBody = extractOfficeAllyErrorResponse(error);

  return {
    transactionType,
    endpoint: OFFICE_ALLY_REALTIME_URL,
    host: officeAllyRealtimeHost,
    timeoutMs: OFFICE_ALLY_REALTIME_TIMEOUT_MS,
    retryCount: OFFICE_ALLY_REALTIME_RETRY_COUNT,
    actualCode: error?.code || null,
    actualError: error?.message || null,
    responseStatus: error?.response?.status || null,
    responseBody,
    attempts: error?.officeAllyAttempts || [],
  };
};

const getOfficeAllyTransactionName = (transactionType = "eligibility") => (
  transactionType === "claim status" ? "claim status" : "eligibility"
);

const getOfficeAllyMessageCode = (transactionType = "eligibility") => (
  transactionType === "claim status" ? "276/277" : "270/271"
);

const getOfficeAllyFailureDetails = (error, transactionType = "eligibility") => {
  const transactionName = getOfficeAllyTransactionName(transactionType);
  const messageCode = getOfficeAllyMessageCode(transactionType);
  const actualMessage = error?.message || "Unknown Office Ally request error";
  const details = getOfficeAllyErrorDetails(error, transactionType);

  if (error?.code === "ETIMEDOUT" || error?.code === "ECONNABORTED") {
    return {
      statusCode: "OFFICE_ALLY_TIMEOUT",
      userMessage: `Unable to reach Office Ally's real-time ${transactionName} service right now. The request timed out before Office Ally could validate the member, payer, or provider details. Please verify outbound access to ${officeAllyRealtimeHost}:${officeAllyRealtimePort} and confirm your Office Ally real-time ${messageCode} service is enabled.`,
      actualMessage,
      details,
    };
  }

  if (error?.code === "ENOTFOUND" || error?.code === "EAI_AGAIN") {
    return {
      statusCode: "OFFICE_ALLY_DNS_ERROR",
      userMessage: `Unable to resolve Office Ally's real-time ${transactionName} service right now. Please retry shortly or verify network and DNS access to Office Ally.`,
      actualMessage,
      details,
    };
  }

  if (error?.response?.status) {
    return {
      statusCode: `OFFICE_ALLY_HTTP_${error.response.status}`,
      userMessage: `Office Ally returned an unexpected response while processing the real-time ${transactionName} request. Please retry shortly.`,
      actualMessage,
      details,
    };
  }

  return {
    statusCode: error?.code || "OFFICE_ALLY_REQUEST_FAILED",
    userMessage: `Unable to complete the real-time ${transactionName} request right now. Please retry shortly.`,
    actualMessage,
    details,
  };
};

const getOfficeAllyConfigError = (transactionType = "eligibility") => ({
  statusCode: "OFFICE_ALLY_CONFIG_MISSING",
  userMessage: `Office Ally real-time ${getOfficeAllyTransactionName(transactionType)} is not configured on this server. Please verify the Office Ally username, password, and sender ID.`,
  actualMessage: "Missing one or more required Office Ally environment variables: OFFICE_ALLY_USERNAME, OFFICE_ALLY_PASSWORD, OFFICE_ALLY_SENDER_ID.",
  details: {
    transactionType,
    endpoint: OFFICE_ALLY_REALTIME_URL,
    host: officeAllyRealtimeHost,
    port: officeAllyRealtimePort,
    timeoutMs: OFFICE_ALLY_REALTIME_TIMEOUT_MS,
    preflightTimeoutMs: OFFICE_ALLY_PREFLIGHT_TIMEOUT_MS,
    retryCount: OFFICE_ALLY_REALTIME_RETRY_COUNT,
    actualCode: "OFFICE_ALLY_CONFIG_MISSING",
    actualError: "Missing required Office Ally configuration.",
    responseStatus: null,
    responseBody: null,
    attempts: [],
  },
});

const sendOfficeAllyRealtimeRequest = async ({ formFields }) => {
  try {
    await checkOfficeAllyConnectivity({
      host: officeAllyRealtimeHost,
      port: officeAllyRealtimePort,
      timeoutMs: OFFICE_ALLY_PREFLIGHT_TIMEOUT_MS,
    });
  } catch (error) {
    error.officeAllyAttempts = [{
      attempt: 0,
      code: error?.code || null,
      message: error?.message || "Office Ally preflight connectivity check failed",
      responseStatus: null,
    }];
    throw error;
  }

  let lastError;
  const attempts = [];

  for (let attempt = 0; attempt <= OFFICE_ALLY_REALTIME_RETRY_COUNT; attempt += 1) {
    const form = buildOfficeAllyRealtimeForm(formFields);

    try {
      return await axios.post(OFFICE_ALLY_REALTIME_URL, form, {
        headers: {
          ...form.getHeaders?.(),
          Connection: "keep-alive",
        },
        httpsAgent: officeAllyHttpsAgent,
        timeout: OFFICE_ALLY_REALTIME_TIMEOUT_MS,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        responseType: "text",
        transitional: {
          clarifyTimeoutError: true,
        },
        });
    } catch (error) {
      lastError = error;
      attempts.push({
        attempt: attempt + 1,
        code: error?.code || null,
        message: error?.message || "Unknown Office Ally request error",
        responseStatus: error?.response?.status || null,
      });

      if (attempt === OFFICE_ALLY_REALTIME_RETRY_COUNT || !shouldRetryOfficeAllyRequest(error)) {
        error.officeAllyAttempts = attempts;
        throw error;
      }

      await wait(Math.min(1500 * (attempt + 1), 3000));
    }
  }

  if (lastError) {
    lastError.officeAllyAttempts = attempts;
  }

  throw lastError;
};

const createEligibilityHistoryRecord = async ({
  db,
  patientId,
  insuranceId,
  providerId,
  userId,
  ediRequest,
  ediResponse = null,
  statusCode = null,
}) => db.EligibilityCheckHistory.create({
  patientId,
  insuranceId,
  providerId,
  ediRequest,
  ediResponse,
  createdById: userId,
  statusCode,
});

const getOfficeAllyResponseValue = (value) => (
  value && value !== "Not provided" ? value : null
);

const checkEligibility = catchAsync(async (req, res) => {
    const {insuranceId, patientId} = req.body;
    const userId = req.user?.id;

    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const patientData = await dbService.getOneById({
        model: db.Patient,
        id: patientId,
        include: [
            { model: db.GlobalType, as: 'sexAtBirth' },
        ]
    })
    if(!patientData?.primaryProviderId)
      {
        return res.status(httpStatus.OK).send({"status":false, "msg": "Provider's Information is Missing! Please check and submit again."});
      }
      const primaryProviderId=patientData?.primaryProviderId;
    const insurance = await dbService.getOne({
        model: db.Insurance,
        filter: {where: {id:insuranceId,patientId}}
    })
    if(!insurance)
    {
      return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(insurance);
    }

    const payerListId=insurance?.eligibilityCheckPayerId;
    const payerData = await dbService.getOne({
      model: db.PayerList,
      filter: {where: {id:payerListId}}
  })
  if(!payerListId)
  {
    return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(payerListId);
  }
  const providerData = await dbService.getOne({
    model: db.Staff,
    filter: {where: {id:primaryProviderId}}
})
if(!providerData)
{
  return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(payerListId);
}
    const { dob, sexAtBirth } = patientData;
    const gender = sexAtBirth?.name;
    const patientName = {
        last: insurance?.lastName,
        middle: insurance?.middleName,
        first: insurance?.firstName
    }

    const payerId=payerData?.payerId;
    const payerName=payerData?.payerName;
    const providerNpi=providerData?.npiNo;
    const providerFirstName=providerData?.firstName;
    const providerLastName=providerData?.lastName;
   
    const insurance_Id = insurance?.insuranceId;
    const dateOfService = new Date().toISOString().slice(0,8);
    const dateOfBirth = new Date(dob);
    const formattedDateOfBirth = dateOfBirth.toISOString().slice(0, 10).replace(/-/g, '')
    if(payerId== null || payerName== null || providerNpi== null)
    {
      return res.status(httpStatus.OK).send({"status":false, "msg": "Some Informations Are Missing! Please check Payer's & Provider's Information "});
    }

      let payload = null;

      try {
          // Static values
          const username = process.env.OFFICE_ALLY_USERNAME;
          const password = process.env.OFFICE_ALLY_PASSWORD;
          const senderId = process.env.OFFICE_ALLY_SENDER_ID;
          const payloadId = uuidv4();
        
          const receiverId = "OFFALLY";
          const memberId = insurance_Id;
          if (!username || !password || !senderId) {
            const configError = getOfficeAllyConfigError("eligibility");
            return res.status(httpStatus.OK).send({
              status: false,
              msg: configError.actualMessage,
              friendlyMessage: configError.userMessage,
              code: configError.statusCode,
              details: configError.details,
            });
          }

          payload = constructPayload({ senderId, receiverId, payerId,payerName, providerNpi,providerFirstName,providerLastName, memberId, patientName, dob:formattedDateOfBirth });
          const response = await sendOfficeAllyRealtimeRequest({
            formFields: {
              payloadType: "X12_270_Request_005010X279A1",
              payloadId,
              receiverId,
              payload,
              senderId,
              username,
              password,
            },
          });
                 

          const result271=parse270Response(response.data);
          const responsePayload = getOfficeAllyResponseValue(result271?.Payload);
          const responseCode = getOfficeAllyResponseValue(result271?.ErrorCode) || (responsePayload ? "RESPONSE_RECEIVED" : "OFFICE_ALLY_NO_RESPONSE");
          const responseMessage = getOfficeAllyResponseValue(result271?.ErrorMessage);

          await createEligibilityHistoryRecord({
            db,
            patientId,
            insuranceId,
            providerId: primaryProviderId,
            userId,
            ediRequest: payload,
            ediResponse: responsePayload,
            statusCode: responseCode,
          });
          
          if (responsePayload) {
            return res.status(httpStatus.CREATED).send({
              status: true,
              msg: "Eligibility response received successfully.",
              data: responsePayload,
              code: responseCode,
            });
          }

          return res.status(httpStatus.OK).send({
            status: false,
            msg: responseMessage || "Office Ally did not return a 271 eligibility response.",
            friendlyMessage: "Office Ally returned a response, but no 271 payload was available.",
            code: responseCode,
            details: {
              transactionType: "eligibility",
              endpoint: OFFICE_ALLY_REALTIME_URL,
              host: officeAllyRealtimeHost,
              timeoutMs: OFFICE_ALLY_REALTIME_TIMEOUT_MS,
              retryCount: OFFICE_ALLY_REALTIME_RETRY_COUNT,
              actualCode: responseCode,
              actualError: responseMessage || "Office Ally did not return a 271 eligibility response.",
              responseStatus: response?.status || null,
              responseBody: null,
              attempts: [],
            },
          });
          
        } catch (error) {
          const failure = getOfficeAllyFailureDetails(error, "eligibility");
          console.error("Error during eligibility request:", error.code || error.message);

          await createEligibilityHistoryRecord({
            db,
            patientId,
            insuranceId,
            providerId: primaryProviderId,
            userId,
            ediRequest: payload,
            statusCode: failure.statusCode,
          });

          return res.status(httpStatus.OK).send({
            status: false,
            msg: failure.actualMessage,
            friendlyMessage: failure.userMessage,
            code: failure.statusCode,
            details: failure.details,
          });

        }
});

const realTimeClaimStatus = catchAsync(async (req, res) => {
  const {insuranceId, patientId,encounterId,encounterBillingId,traceNumber} = req.body;
  const userId = req.user?.id;

  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const patientData = await dbService.getOneById({
      model: db.Patient,
      id: patientId,
      include: [
          { model: db.GlobalType, as: 'sexAtBirth' },
      ]
  })
  if(!patientData?.primaryProviderId)
    {
      return res.status(httpStatus.OK).send({"status":false, "msg": "Provider's Information is Missing! Please check and submit again."});
    }
    const billingData = await dbService.getOne({
      model: db.PatientEncounterBilling,
      filter:{where:{encounterId}},
      id: encounterBillingId,
    });

  const primaryProviderId=patientData?.primaryProviderId;
  if(!billingData?.insuranceId)
    {
      return res.status(httpStatus.OK).send({"status":false, "msg": "Insurance Information is Missing! Please check and submit again."});
    }
  const insurance = await dbService.getOne({
      model: db.Insurance,
      filter: {where: {id:billingData?.insuranceId,patientId}}
  })
  if(!insurance)
  {
    return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(insurance);
  }

  const payerListId=insurance?.claimStatusCheckPayerId;
  const transactionId=traceNumber;

if(!payerListId)
{
  return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(payerListId);
}
const payerData = await dbService.getOne({
  model: db.PayerList,
  filter: {where: {id:payerListId}}
})
const providerData = await dbService.getOne({
  model: db.Staff,
  filter: {where: {id:primaryProviderId}}
})
if(!providerData)
{
return   res.status(httpStatus.METHOD_NOT_ALLOWED).send(payerListId);
}
  const { dob, sexAtBirth } = patientData;
  const gender = sexAtBirth?.name?.trim().toLowerCase();
  let sex = 'U';
    
    if (gender === 'male') {
      sex = 'M';
    } else if (gender === 'female') {
      sex = 'F';
    }
  const patientName = {
      last: insurance?.lastName,
      middle: insurance?.middleName,
      first: insurance?.firstName
  }

  const payerId=payerData?.payerId;
  const payerName=payerData?.payerName;
  const providerNpi=providerData?.npiNo;
  const providerFirstName=providerData?.firstName;
  const providerLastName=providerData?.lastName;
 
  const insurance_Id = insurance?.insuranceId;
  const dateOfService = new Date().toISOString().slice(0,8);
  const dateOfBirth = new Date(dob);
  const formattedDateOfBirth = dateOfBirth.toISOString().slice(0, 10).replace(/-/g, '')
  if(payerId== null || payerName== null || providerNpi== null)
  {
    return res.status(httpStatus.OK).send({"status":false, "msg": "Some Informations Are Missing! Please check Payer's & Provider's Information "});
  }

    let payload = null;

    try {
        // Static values
        const username = process.env.OFFICE_ALLY_USERNAME;
        const password = process.env.OFFICE_ALLY_PASSWORD;
        const senderId = process.env.OFFICE_ALLY_SENDER_ID;
        const payloadId = uuidv4();
      
        const receiverId = "OFFALLY";
        const memberId = insurance_Id;
        if (!username || !password || !senderId) {
          const configError = getOfficeAllyConfigError("claim status");
          return res.status(httpStatus.OK).send({
            status: false,
            msg: configError.actualMessage,
            friendlyMessage: configError.userMessage,
            code: configError.statusCode,
            details: configError.details,
          });
        }

        payload = construct276EditPayload({
          senderId,
          receiverId,
          payerId,
          payerName,
          providerNpi,
          providerFirstName,
          providerLastName,
          memberId,
          patientName,
          dob: formattedDateOfBirth,
          transactionId,
          sex,
        });
        const response = await sendOfficeAllyRealtimeRequest({
          formFields: {
            payloadType: "X12_276_Request_005010X212",
            payloadId,
            receiverId,
            payload,
            senderId,
            username,
            password,
          },
        });
               

        const result271=parse270Response(response.data);
        const responsePayload = getOfficeAllyResponseValue(result271?.Payload);
        const responseCode = getOfficeAllyResponseValue(result271?.ErrorCode) || (responsePayload ? "RESPONSE_RECEIVED" : "OFFICE_ALLY_NO_RESPONSE");
        const responseMessage = getOfficeAllyResponseValue(result271?.ErrorMessage);

        await createEligibilityHistoryRecord({
          db,
          patientId,
          insuranceId,
          providerId: primaryProviderId,
          userId,
          ediRequest: payload,
          ediResponse: responsePayload,
          statusCode: responseCode,
        });
        
        if (responsePayload) {
          return res.status(httpStatus.CREATED).send({
            status: true,
            msg: "Claim status response received successfully.",
            data: responsePayload,
            code: responseCode,
          });
        }

        return res.status(httpStatus.OK).send({
          status: false,
          msg: responseMessage || "Office Ally did not return a 277 claim status response.",
          friendlyMessage: "Office Ally returned a response, but no 277 payload was available.",
          code: responseCode,
          details: {
            transactionType: "claim status",
            endpoint: OFFICE_ALLY_REALTIME_URL,
            host: officeAllyRealtimeHost,
            timeoutMs: OFFICE_ALLY_REALTIME_TIMEOUT_MS,
            retryCount: OFFICE_ALLY_REALTIME_RETRY_COUNT,
            actualCode: responseCode,
            actualError: responseMessage || "Office Ally did not return a 277 claim status response.",
            responseStatus: response?.status || null,
            responseBody: null,
            attempts: [],
          },
        });
        
      } catch (error) {
        const failure = getOfficeAllyFailureDetails(error, "claim status");
        console.error("Error during claim status request:", error.code || error.message);

        await createEligibilityHistoryRecord({
          db,
          patientId,
          insuranceId,
          providerId: primaryProviderId,
          userId,
          ediRequest: payload,
          statusCode: failure.statusCode,
        });

        return res.status(httpStatus.OK).send({
          status: false,
          msg: failure.actualMessage,
          friendlyMessage: failure.userMessage,
          code: failure.statusCode,
          details: failure.details,
        });

      }
});


const parse270Response= (fieldsData) => {
  try {
    const rawData = Buffer.isBuffer(fieldsData) ? fieldsData.toString("utf8") : String(fieldsData || "");
    const boundaryMatch = rawData.match(/^--([^\r\n]+)/m);
    const boundary = boundaryMatch?.[1];
    const parts = boundary
      ? rawData.split(`--${boundary}`).filter((part) => {
        const trimmedPart = part.trim();
        return trimmedPart && trimmedPart !== "--";
      })
      : [rawData];

    const parsedFields = {};
    for (const part of parts) {
      // Check if the part has a Content-Disposition header
      const contentDispositionMatch = part.match(/Content-Disposition: form-data; name="([^"]+)"/);
      if (contentDispositionMatch) {
        const fieldName = contentDispositionMatch[1];
        // Extract the actual value of the field
        const [, ...bodyParts] = part.split(/\r?\n\r?\n/);
        const fieldValue = bodyParts.join("\n\n").trim();
        parsedFields[fieldName] = fieldValue;
      }
    }

    // Construct the response object
    const response = {
      ErrorMessage: parsedFields.ErrorMessage || 'Not provided',
      ErrorCode: parsedFields.ErrorCode || 'Not provided',
      Payload: parsedFields.Payload || 'Not provided',
    };

    return response;
  } catch (error) {
    throw new Error(`Error parsing fields: ${error.message}`);
  }

  };

const getPayerList = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const payerList = await dbService.getPaginated({
        model: db.PayerList,
        req,
        allowedFilters: ['payerId','payerName','transaction'],
        searchFilter: ['payerId','payerName'],
        customOrder:[['payerName','ASC']],
        applySorting:false,
        attributes:['id','payerId','payerName','transaction']
      });
  res.status(httpStatus.OK).send(payerList);
});

const getClaimPayerList = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const payerList = await dbService.getPaginated({
        model: db.PayerList,
        req,
        allowedFilters: ['payerId','payerName',],
        searchFilter: ['payerId','payerName'],
        customOrder:[['payerName','ASC']],
        applySorting:false,
        addOnFilter: {
          [Op.and]: [
            { transaction: { [Op.notIn]: ['Eligibility 270 / 271', 'Claim Status 276 / 277'] } }, // Exclude transactions
          ],
        },
        attributes:['id','payerId','payerName','transaction']
      });
  res.status(httpStatus.OK).send(payerList);
});


const getEligibiltyHistory= catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientId } = req.params;
  const searchText = pick(req.query, ['searchText']);
  const searchValue = searchText?.searchText;
  const searchConditions =
  searchValue && typeof searchValue === 'string' && searchValue.trim() !== ''
    ? {
        [Op.or]: [
          { '$provider.firstName$': { [Op.iLike]: `%${searchValue}%` } },
          { '$provider.lastName$': { [Op.iLike]: `%${searchValue}%` } },
          // { '$insurance.payerData.payerName$': { [Op.iLike]: `%${searchValue}%` } },
          // { '$insurance.payerData.payerId$': { [Op.iLike]: `%${searchValue}%` } },
        ],
      }
    : {};
  const result = await dbService.getPaginated({
    model: db.EligibilityCheckHistory,
    req,
    allowedFilters: ['patientId', 'insuranceId', 'providerId','statusCode'],
    //searchFilter: ['patientId', 'insuranceId', 'providerId'],
    addOnFilter: {
      [Op.and]: [
        {
          patientId, // Add your additional condition here, e.g., matching a specific chatId
          // Add more conditions if needed
        },
      ],
    },
    include: [
      { model: db.Staff, as: 'provider',
        attributes: ['id', 'firstName', 'lastName'], 
        where: {
          [Op.and]: [
            {
              isDeleted: false,
              // Add more conditions if needed
            },
            searchConditions
          ],
        },
      },
      { model: db.Patient, as: 'patient',attributes: ['id', 'firstName', 'lastName']  },
      { model: db.Insurance, as: 'insurance', attributes: ['id', 'eligibilityCheckPayerId'],include:[{ model: db.PayerList, as: 'eligibilityCheckPayerData' },]},
    ],
  });
  res.status(httpStatus.OK).send(result);
});



module.exports = {
    checkEligibility,
    getPayerList,
    getEligibiltyHistory,
    realTimeClaimStatus,
    getClaimPayerList,
}
