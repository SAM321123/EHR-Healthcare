const Stripe = require('stripe');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const ApiError = require('../utils/ApiError');
const { dbService, practiceSubscriptionHistoryService } = require('.');
const { initializeModels } = require('../models');
const { getModels } = require('../utils/connection');
const httpStatus = require('http-status');
const { errorMessages } = require('../config/error');
const config = require('../config/config');

const stripe = Stripe(config.stripe.stripeSecretKey);

const updateSubscription = async ({ tenatId, userId, roleIds, existingStaff }) => {
  // Step 1: Update Stripe only if you're in the first half of *this* billing cycle
  /////check practice subscribe date
  const masterDB = initializeModels(sequelize, true);
  const db = getModels(tenatId);

  const subscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: { where: { practiceId: tenatId, isActive: true } },
  });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Subscription'));
  }

  // const previousSubscriptionPractitionerCount = subscription?.practitionerCount;
  ///// check if today date is within 15 days of subscription date and first staff added
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const today = new Date();
  const practiceCreationDate = new Date(subscription.createdAt);
  const subscriptionId = subscription.subscriptionId;
  // const priceId = subscription.priceId;

  // Step 1: Figure out how many full billing cycles have passed
  const daysSinceStart = Math.floor((today - practiceCreationDate) / MS_PER_DAY);
  const billingCycleIndex = Math.floor(daysSinceStart / 30);

  // Step 2: Get current billing cycle start and end
  const currentBillingStart = new Date(practiceCreationDate);
  currentBillingStart.setDate(practiceCreationDate.getDate() + billingCycleIndex * 30);

  const currentBillingEnd = new Date(currentBillingStart);
  currentBillingEnd.setDate(currentBillingStart.getDate() + 30); // End = start + 30 days

  // Step 3: Calculate first and second half
  const firstHalfStart = new Date(currentBillingStart);
  firstHalfStart.setDate(firstHalfStart.getDate() + 1); // +1 day

  const firstHalfEnd = new Date(firstHalfStart);
  firstHalfEnd.setDate(firstHalfStart.getDate() + 14); // ends at +15th day

  const secondHalfStart = new Date(firstHalfEnd);
  secondHalfStart.setDate(firstHalfEnd.getDate() + 1);

  const secondHalfEnd = new Date(currentBillingEnd);

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const previousSecondHalfStart = subtractDays(secondHalfStart, 30);
  const previousSecondHalfEnd = subtractDays(secondHalfEnd, 30);

  const previousBillingCycleStart = secondHalfEnd;
  const previousBillingCycleEnd = previousSecondHalfEnd;

  const isInFirstHalfOfCycle = today <= firstHalfEnd;

  let newPractitionerCount = subscription?.practitionerCount - 1;
  let newPrescriberCount = subscription?.prescriberCount;

  if (isInFirstHalfOfCycle) {
    // Step 1: Get previous month from subscription start
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    const rnRole = await db.Role.findOne({ where: { code: 'rn' } });
    // const isNotRn = roleIds.some(role => role?.id !== rnRole?.id);
    const isNotRn = !(roleIds.length === 1 && roleIds[0] === rnRole?.id);

    // const role = await dbService.getOne({
    //   model: db.Role,
    //   filter: { where: {id: roleIds[0]} }
    // });

    let priceId = config.stripe.perPractitionerPriceId;
    if (!isNotRn) {
      priceId = config.stripe.perClinicStaffPriceId;
      newPractitionerCount = subscription?.rnCount;
    }

    if (!existingStaff) {
      newPractitionerCount = newPractitionerCount + 1;
    } else {
      const userRoles = await dbService.getAll({
        model: db.UserRole,
        filter: {
          where: { userId: existingStaff?.user?.id },
          attributes: ['roleId'],
        },
      });
      const existingRoleIds = userRoles?.map((role) => role?.roleId);
      const isRnRoleExists = existingRoleIds.some((role) => role === rnRole?.id);
      if (isRnRoleExists) {
        if (isNotRn) {
          newPractitionerCount = newPractitionerCount + 1;
        } else {
          // newPractitionerCount = newPractitionerCount - 1;
          newPractitionerCount = newPractitionerCount + 1;
        }
        let rnCount = subscription?.rnCount;
        if (existingRoleIds.length === 1) {
          rnCount = rnCount - 1;
        }
        const staffItemPrice = stripeSubscription.items.data.find(
          (item) => item.price.id === config.stripe.perClinicStaffPriceId
        );

        if (!staffItemPrice) {
          throw new Error('Per clinic staff item not found.');
        }
        // if new role is updated, subscription will hold high role amount
        await stripe.subscriptionItems.update(staffItemPrice.id, {
          quantity: rnCount,
        });
      }
    }

    const practitionerItem = stripeSubscription.items.data.find((item) => item.price.id === priceId);

    if (!practitionerItem) {
      throw new Error('Practitioner add-on item not found.');
    }

    const updateResult = await stripe.subscriptionItems.update(practitionerItem.id, {
      quantity: newPractitionerCount,
    });
  } else {
    console.log("In second half of billing month — don't update now, defer to next billing cycle.");
  }
};

const updateSubscriptionForPrescriber = async ({ tenatId, userId }) => {
  // Step 1: Update Stripe only if you're in the first half of *this* billing cycle
  /////check practice subscribe date
  const masterDB = initializeModels(sequelize, true);
  const db = getModels(tenatId);

  const subscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: { where: { practiceId: tenatId, isActive: true } },
  });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Subscription'));
  }

  ///// check if today date is within 15 days of subscription date and first staff added
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const today = new Date();
  const practiceCreationDate = new Date(subscription.createdAt);
  const subscriptionId = subscription.subscriptionId;

  // Step 1: Figure out how many full billing cycles have passed
  const daysSinceStart = Math.floor((today - practiceCreationDate) / MS_PER_DAY);
  const billingCycleIndex = Math.floor(daysSinceStart / 30);

  // Step 2: Get current billing cycle start and end
  const currentBillingStart = new Date(practiceCreationDate);
  currentBillingStart.setDate(practiceCreationDate.getDate() + billingCycleIndex * 30);

  const currentBillingEnd = new Date(currentBillingStart);
  currentBillingEnd.setDate(currentBillingStart.getDate() + 30); // End = start + 30 days

  // Step 3: Calculate first and second half
  const firstHalfStart = new Date(currentBillingStart);
  firstHalfStart.setDate(firstHalfStart.getDate() + 1); // +1 day

  const firstHalfEnd = new Date(firstHalfStart);
  firstHalfEnd.setDate(firstHalfStart.getDate() + 14); // ends at +15th day

  const isInFirstHalfOfCycle = today <= firstHalfEnd;
  let newPrescriberCount = subscription?.prescriberCount;
  newPrescriberCount = newPrescriberCount + 1;

  if (isInFirstHalfOfCycle) {
    // Step 1: Get previous month from subscription start
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    const prescriberItem = stripeSubscription.items.data.find(
      (item) => item.price.id === config.stripe.perPrescriberPriceId
    );

    if (!prescriberItem) {
      throw new Error('Prescriber add-on item not found.');
    }

    ////////////////////////////update for prescriber////////////////////////////
    const updatePrescriberResult = await stripe.subscriptionItems.update(prescriberItem.id, {
      quantity: newPrescriberCount,
    });
  } else {
    console.log("In second half of billing month — don't update now, defer to next billing cycle.");
  }
};

const updateTrialSubscription = async ({ tenatId, userId, roleIds, existingStaff }) => {
  const masterDB = initializeModels(sequelize, true);
  const db = getModels(tenatId);

  // Step 1: Get previous month from subscription start
  const trialsubscription = await dbService.getOne({
    model: masterDB.TrialSubscription,
    filter: { where: { practiceId: tenatId } },
  });

  const rnRole = await db.Role.findOne({ where: { code: 'rn' } });

  const isNotRn = !(roleIds.length === 1 && roleIds[0] === rnRole?.id);

  let practitionerCount = trialsubscription?.practitionerCount;
  let rnCount = trialsubscription?.rnCount;
  let prescriberCount = trialsubscription?.prescriberCount;
  let cost = trialsubscription?.cost;

  const userRoles = await dbService.getAll({
    model: db.UserRole,
    filter: {
      where: { userId: existingStaff?.user?.id },
      attributes: ['roleId'],
    },
  });
  const existingRoleIds = userRoles?.map((role) => role?.roleId);
  const isRnRoleExists = existingRoleIds.some((role) => role === rnRole?.id);

  if (isRnRoleExists) {
    if (!isNotRn) {
      practitionerCount = practitionerCount - 1;
      rnCount = rnCount + 1;
      cost = parseFloat(cost) - 49.0;
      cost = parseFloat(cost) + 25.0;
    } else {
      practitionerCount = practitionerCount + 1;
      rnCount = rnCount - 1;
      cost = parseFloat(cost) + 49.0;
      cost = parseFloat(cost) - 25.0;
    }
  }
  // throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('DD')); /*This line was stopping server*/
};

const updateTrialSubscriptionForPrescriber = async ({ tenatId, userId }) => {
  /////check practice subscribe date
  const masterDB = initializeModels(sequelize, true);
  const db = getModels(tenatId);

  const trialSubscription = await dbService.getOne({
    model: masterDB.TrialSubscription,
    filter: { where: { practiceId: tenatId } },
  });

  if (!trialSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Trial Subscription'));
  }

  const prescriberCount = trialSubscription?.prescriberCount + 1;
  const cost = parseFloat(trialSubscription?.cost) + 37.99;

  const updatePrams = { prescriberCount, cost };

  await dbService.updateById({
    model: masterDB.TrialSubscription,
    reqParams: { id: trialSubscription.id, ...updatePrams },
  });
};

module.exports = {
  updateSubscription,
  updateSubscriptionForPrescriber,
  updateTrialSubscription,
  updateTrialSubscriptionForPrescriber,
};
