const httpStatus = require('http-status');
const { zoomSessionService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const validateZoomSessionInvite = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid
    const {sessionId,roleType} = req.body || {};
    const {user} = req || {}
    // const currentDateTime = moment().utc();

  const sessionDetail = await zoomSessionService.validateZoomSessionInvite({sessionId,invitedUserId:user?.id,tenantId:uuid,roleType});
  const appointment = sessionDetail.appointment;
  // const startDateTime = moment(appointment?.startDateTime).utc();
  // if (startDateTime >= currentDateTime) {
    const fetchedRoleType =appointment?.practitioner?.userId==user?.id?1: 0;
    const sessionToken = await zoomSessionService.createZoomSession(sessionId,fetchedRoleType);
    res.status(httpStatus.OK).send({sessionDetail,sessionToken});
  // }else{
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong happened');
  // }
});

const addZoomSessionInvite = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid
    const {user} = req || {};
    const {sessionId,invitedUserIds,roleType} = req.body || {};

  const sessionDetail = await zoomSessionService.addZoomSessionInvite({sessionId,invitedUserIds,fromUserId:user.id,tenantId:uuid,roleType});

  res.status(httpStatus.OK).send({sessionDetail});
});


module.exports = { validateZoomSessionInvite,addZoomSessionInvite };
