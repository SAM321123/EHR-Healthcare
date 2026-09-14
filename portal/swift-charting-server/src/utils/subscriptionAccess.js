const { errorMessages } = require('../config/error');
const { roles } = require('../config/roles');

const isPracticeAdmin = (user) =>
  user?.roles?.some((role) => [roles.CLINIC_ADMIN, roles.SUPER_ADMIN].includes(role.code));

const getPracticeAccessStatus = async ({ masterDB, practiceId, user }) => {
  if (!practiceId) {
    return { allowed: true };
  }

  const today = new Date();
  const isAdmin = isPracticeAdmin(user);
  const subscription = await masterDB.Subscription.findOne({
    where: { practiceId },
  });

  if (subscription?.endDate && today > new Date(subscription.endDate) && subscription?.isCancel) {
    return {
      allowed: isAdmin,
      message: errorMessages.SUBSSCRIPTION_CANCELED,
    };
  }

  if (!subscription || !subscription?.isActive) {
    const trialSubscription = await masterDB.TrialSubscription.findOne({
      where: { practiceId },
    });

    if (!trialSubscription) {
      return {
        allowed: isAdmin,
        message: errorMessages.SUBSCRIPTION_INACTIVE,
      };
    }

    const isTrialPeriodOver =
      trialSubscription?.endDate && today > new Date(trialSubscription.endDate);

    if (isTrialPeriodOver) {
      return {
        allowed: isAdmin,
        message: errorMessages.FREE_TRIAL_ENDED,
      };
    }
  }

  return { allowed: true };
};

module.exports = {
  getPracticeAccessStatus,
};
