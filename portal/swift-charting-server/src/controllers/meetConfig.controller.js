const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { errorMessages } = require("../config/error");
const { meetConfigService } = require("../services");

const createMeetConfig = catchAsync(async (req, res) => {
    const { user, body } = req;
    const userId = user.id;
    const uuid = req.clinicUuid;  
    const meetConfigWithVerificationURL = await meetConfigService.createMeetConfig({...body,createdBy:userId},{tenantId:uuid});
    res.status(httpStatus.CREATED).send(meetConfigWithVerificationURL);
  });

  
const verifyCalendarAccess = catchAsync(async (req, res) => {
    const { code, state } = req.query || {};
    const stateObject = JSON.parse(decodeURIComponent(state));
    const message = await meetConfigService.verifyCalendarAccess(code, stateObject);
    if (!message) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
    }
    res.status(httpStatus.OK).send(message);
  });
  
  module.exports = {
    verifyCalendarAccess,
    createMeetConfig,
  }