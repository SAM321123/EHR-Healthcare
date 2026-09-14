const httpStatus = require("http-status");
const { stripeService, dbService } = require("../services");
const catchAsync = require("../utils/catchAsync");
const { getModels } = require("../utils/connection");

const createPaymentIntent = catchAsync(async (req, res) => {
    const { user, body,clinicUuid:uuid } = req;
    const db = getModels(uuid);
    const result=await stripeService.createPaymentIntent(body,{tenantId:uuid,user});
    if(result){
      const log = { 
        paymentIntentId: result?.paymentIntent?.id,
        response: JSON.stringify(result?.paymentIntent),
        error: result?.paymentIntent?.last_payment_error,
        status: result?.paymentIntent?.status,
        createdById: user?.id,
      }
      const paymentlog = await db.PaymentLogs.create(log)
    }
    res.status(httpStatus.OK).send(result)
  });

  module.exports={
    createPaymentIntent,
  }