const { OAuth2Client } = require("google-auth-library");
const  dbService  = require("./db.service");
const { meetConfigStatus } = require("../config/meetConfig");
const { getModels } = require("../utils/connection");
const httpStatus = require("http-status");
const { errorMessages } = require("../config/error");
const { GOOGLE_MEET_AUTH_URL, GOOGLE_MEET_SCOPES } = require("../utils/constant");

const createMeetConfig  = async (reqParams,{tenantId})=>{
  const {clientId,...rest} = reqParams;
    const db = getModels(tenantId);
    const meetConfig = await dbService.upsert({
        model: db.MeetConfig,
        filter:{where:{clientId}},
        reqParams: { ...rest },
      });
    const meetConfigWithVerificationURL =await verifyMeetConfigById(meetConfig?.item?.id,{tenantId});
    console.log("🚀 ~ createMeetConfig ~ meetConfigWithVerificationURL:", meetConfigWithVerificationURL)
    return meetConfigWithVerificationURL;

}
const verifyMeetConfigById = async (id,{tenantId}) => {
    const db = getModels(tenantId);
    let meetConfig = await dbService.getOneById({
      model: db.MeetConfig,
      id,
    });
    if (!meetConfig) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
    }  

      const {clientId = '', clientSecret = '' } = meetConfig;
      const oauth2Client = new OAuth2Client(clientId, clientSecret, `${GOOGLE_MEET_AUTH_URL}`);
      const stateObject = { id, tenantId };

// Encode the state object as a URL-safe string
const state = encodeURIComponent(JSON.stringify(stateObject));
      const authUrl = await oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_MEET_SCOPES,
        state,
      });
      meetConfig = { ...meetConfig, authUrl };
    return meetConfig;
  };

const verifyCalendarAccess = async (code, state) => {
    const {id,tenantId} = state || { };
    const db = getModels(tenantId);
    const meetConfig = await dbService.getOneById({ model: db.MeetConfig,  id  });
    const {  clientId = '', clientSecret = '', tokens: pretokens = {} } = meetConfig || {};
    if (!pretokens ||  !Object.keys(pretokens).length) {
      const oauth2Client = new OAuth2Client(clientId, clientSecret, `${GOOGLE_MEET_AUTH_URL}`);
      const { tokens } = await oauth2Client.getToken(code);
      await dbService.updateById({
        model: db.MeetConfig,
        reqParams: { id, clientId, clientSecret, tokens , status: meetConfigStatus.VERIFIED },
      });
    }
    return 'Verified Successfully!';
  };

  module.exports = {
    createMeetConfig,
    verifyCalendarAccess,
    verifyMeetConfigById,
  }