const Stripe = require('stripe');

const { dbService, practiceSubscriptionHistoryService } = require('../services');
const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { errorMessages } = require('../config/error');
const config = require('../config/config');
const { sendEmail, subCanOrDeacMailToClinicAndSuperAdmin } = require('../services/email.service');
const { Email_Templates } = require('../utils/constant');

// const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
const stripe = Stripe(config.stripe.stripeSecretKey)

const handleWebhook = async (req, res) => {
  console.log('-----------webhook handle--------------')
  const sig = req.headers['stripe-signature'];
  // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const endpointSecret = config.stripe.webhookKey;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;

      // Save payment in DB
      await storePayment(invoice, "succeeded");

      let customerEmail = invoice.customer_email;

      const receiptUrl = invoice.hosted_invoice_url;
      const pdfUrl = invoice.invoice_pdf;

      if (customerEmail) {
        // Send email to customer
        const emailOptions = {
          to: customerEmail,
          subject: `Your Invoice from Swiftcharting`,
          html: `<p>Hi,</p>
                 <p>Your payment was successful ✅</p>
                 <p><a href="${receiptUrl}">View Invoice</a></p>
                 <p><a href="${pdfUrl}">Download PDF</a></p>`,
        };
        await sendEmail(emailOptions);

      } else {
        console.warn("No customer email found for invoice:", invoice.id);
      }
      break;
    }

    case 'invoice.payment_failed':
      await storePayment(event.data.object, 'failed');
      break;

    case 'customer.subscription.deleted':
      await deactivateSubscription(event.data.object);
      break;

    // case 'customer.subscription.updated':
    //   await updateSubscription(event.data.object);
    //   break;
    case 'customer.subscription.updated':
      // Check if subscription was paused or resumed
      if (event.data.object.pause_collection && !event.data.object.cancel_at_period_end) {
        console.log('Subscription paused via webhook');
        await markSubscriptionAsPaused(event.data.object);
      // } else if (!event.data.object.pause_collection){
      //   console.log('Subscription resumed via webhook');
      //   await markSubscriptionAsActive(event.data.object);
      } else if (event.data.object.cancel_at_period_end){
        await cancelSubscription(event.data.object);
      } else{
        // You can still update other subscription metadata if needed
        await updateSubscription(event.data.object); // optional
      }
      break;
  }

  res.json({ received: true });
};

const storePayment = async (invoice, status) => {
  const masterDB = initializeModels(sequelize, true);
  const subscriptionId = invoice?.parent?.subscription_details?.subscription;
  const practice = await masterDB.Subscription.findOne({ where: { subscriptionId } });
  
  await dbService.createOne({
    model: masterDB.SubscriptionPayment,
    reqParams: {
        practiceId: practice?.practiceId,
        stripeCustomerId: invoice.customer,
        subscriptionId: subscriptionId,
        invoiceId: invoice.id,
        amountPaid: invoice.amount_paid /100,
        currency: invoice.currency,
        status: invoice.status,
        attemptCount: invoice.attempt_count,
        paymentDate: new Date(invoice.created * 1000),
        rawEvent: invoice,
    }
  })
};

const deactivateSubscription = async (subscription) => {
  const masterDB = initializeModels(sequelize, true);

 const updatedSubscription = await dbService.updateOne({
    model: masterDB.Subscription,
    updateParams: {
      isActive: false,
    },
    filter: {
      where: { subscriptionId: subscription.id },
    },
  });
 
};

const updateSubscription = async (subscription) => {
  try{
    const masterDB = initializeModels(sequelize, true);
  
    const isSubscriptionExists = await dbService.getOne({
      model: masterDB.Subscription,
      filter: { where: {subscriptionId : subscription.id} }
    })
    if (!isSubscriptionExists) {
      // throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Subscription'));
       throw new Error(errorMessages._NOT_FOUND('Subscription'));
    }
    
    await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
      data: {
      ...isSubscriptionExists
      },
    });
  
    // const BASE_PRICE_ID = process.env.SUBSCRIPTION_BASE_PRICE_ID;
    const BASE_PRICE_ID = config.stripe.basePriceId
    // const PRACTITIONER_PRICE_ID = process.env.SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID;
    const PRACTITIONER_PRICE_ID = config.stripe.perPractitionerPriceId
    // const STAFF_PRICE_ID = process.env.SUBSCRIPTION_PER_CLINIC_STAFF;
    const STAFF_PRICE_ID = config.stripe.perClinicStaffPriceId;
    // const PRESCRIBER_PRICE_ID = process.env.SUBSCRIPTION_PER_PRESCRIBER;
    const PRESCRIBER_PRICE_ID = config.stripe.perPrescriberPriceId;
  
  
    // Extract billing start and end from the subscription object directly
    const startDate = new Date(subscription.items.data[0].current_period_start * 1000);
    const endDate = new Date(subscription.items.data[0].current_period_end * 1000);
  
    let practitionerCount = 0;
    let prescriberCount = 0;
    let staffCount = 0;
    let baseAmount = 0;
    let totalAmount = 0;
  
    subscription.items.data.forEach(item => {
      const priceId = item.price.id;
      const quantity = item.quantity || 0;
      const unitAmount = item.price.unit_amount || 0;
  
      if (priceId === BASE_PRICE_ID) {
        baseAmount = unitAmount / 100; // Stripe uses cents
      } else if (priceId === PRACTITIONER_PRICE_ID) {
        practitionerCount = quantity+1 || 1;
      } else if (priceId === STAFF_PRICE_ID) {
        staffCount = quantity;
      } else if (priceId === PRESCRIBER_PRICE_ID){
        prescriberCount = quantity;
      }
  
      totalAmount += (unitAmount * quantity) / 100;
    });
    const updateParams = {
      startDate,
      endDate,
      practitionerCount,
      rnCount: staffCount,
      prescriberCount,
      isActive: true,
      isCancel: false,
      cost: totalAmount,
    }
  
    await dbService.updateOne({
      model: masterDB.Subscription,
      updateParams,
      filter: {  
        where: { id: isSubscriptionExists?.id } 
      },
    });
  } catch(err){
    console.error(`Failed to update subscription ${subscription.id}:`, err.message);
  }
};

const markSubscriptionAsPaused = async (stripeSub) => {
  console.log('mark subscription as pause')
  const masterDB = initializeModels(sequelize, true);
  const subscriptionId = stripeSub.id;

  const subscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: { where: { subscriptionId } }
  }); 
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const subscriptionHistoryMaintain = await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
    data: {
      ...subscription
    },
  });

  const subscriptionStatusUpdate = await dbService.updateOne({
    model: masterDB.Subscription,
    updateParams: {
      isActive: false, 
      updatedAt: new Date()
    },
    filter: { where: { subscriptionId } },
  });
   // send deactive mail to clinic admin and superadmin
  if(subscriptionStatusUpdate){
    const practice = await dbService.getOne({
      model: masterDB.Practice,
      filter: { where: {  id: subscription?.practiceId} },
    });
    const subCancelMailType = Email_Templates.SUBSCRIPTION_DEACTIVATED;
    const superAdmin = await masterDB.User.findOne();
    await subCanOrDeacMailToClinicAndSuperAdmin({practice, superAdminEmail: superAdmin?.email, mailType:subCancelMailType, subscription});

  }
};

const cancelSubscription = async (stripeSub) => {
  try{
    console.log('cancel subscription')
    const masterDB = initializeModels(sequelize, true);
    const subscriptionId = stripeSub.id;
  
    const subscription = await dbService.getOne({
      model: masterDB.Subscription,
      filter: { where: { subscriptionId } }
    }); 
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
    }
    ///////////////////to remove cancel reason//////////////////////
    let reasonForCancellation = {};
    if(subscription?.cancelReason !== "subscription_cancel_reason_other"){
      reasonForCancellation = { cancelReason: subscription?.cancelReason };
      subscription.cancelReason = null;
    }else{
      reasonForCancellation = { cancelReason: subscription?.cancelReason, otherCancelReason: subscription?.otherCancelReason };
      subscription.cancelReason = null;
      subscription.otherCancelReason = null;
    }
    
    const subscriptionHistoryMaintain = await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
      data: {
        ...subscription
      },
    });
  
    const reason = stripeSub.metadata?.cancel_reason || null;
    const otherReason = stripeSub.other_reason || null;

    const subscriptionStatusUpdate = await dbService.updateOne({
      model: masterDB.Subscription,
      updateParams: {
        isCancel: true, 
        cancelReason: reason,
        otherCancelReason: otherReason,
        updatedAt: new Date(),
        ...reasonForCancellation
      },
      filter: { where: { subscriptionId } },
    });
    if (subscriptionStatusUpdate) {
      // send cancellation mail to clinic admin and superadmin
      const practice = await dbService.getOne({
        model: masterDB.Practice,
        filter: { where: { id:subscription?.practiceId } },
      });
      const subCancelMailType = Email_Templates.SUBSCRIPTION_CANCELLED;
      const superAdmin = await masterDB.User.findOne();
      await subCanOrDeacMailToClinicAndSuperAdmin({practice, superAdminEmail: superAdmin?.email, mailType:subCancelMailType, subscription});
    }
  } catch (err) {
    console.log('Error while canceling subscription---', err);
  }

};


// const markSubscriptionAsActive = async (stripeSub) => {
//   console.log('mark subscription as active')
//   const masterDB = initializeModels(sequelize, true);
//   const subscriptionId = stripeSub.id;

//   const subscription = await dbService.getOne({
//     model: masterDB.Subscription,
//     filter: { where: { subscriptionId } }
//   }); 
//   if (!subscription) {
//     throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
//   }

//   const subscriptionStatusUpdate = await dbService.updateOne({
//     model: masterDB.Subscription,
//     updateParams: {
//       isActive: true, 
//       updatedAt: new Date()
//     },
//     filter: { where: { subscriptionId } },
//   });
// };



module.exports = {
   handleWebhook
}