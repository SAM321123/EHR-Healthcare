const { initializeModels } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getModels } = require('../../utils/connection');
const dbService = require('../db.service');
const { Sequelize, Op } = require('sequelize');
const { sequelize } = require('../../config/database');
const moment = require('moment');
const Stripe = require('stripe');
const config = require('../../config/config');

const stripe = Stripe(config.stripe.stripeSecretKey)

const subscriptionUpdate = async ({ tenantId }) => {
    try {
        const masterDb = initializeModels(sequelize, true);
        const today = moment().utc();

        const yesterday = today.subtract(1, 'day').format('YYYY-MM-DD');

        const previousBillingSecondHalfEnd = new Date(today);
        const previousBillingSecondHalfStart = new Date(yesterday);
        previousBillingSecondHalfStart.setDate(previousBillingSecondHalfStart.getDate() - 16);
        const previousBillingStarted = new Date(previousBillingSecondHalfEnd);
        previousBillingStarted.setDate(previousBillingStarted.getDate() - 14);

        const startOfDay = new Date(`${yesterday}T00:00:00.000Z`);
        const endOfDay = new Date(`${yesterday}T23:59:59.999Z`);
        
        const subscriptions = await dbService.getAll({
            model: masterDb.Subscription,
            filter: {
                where: {
                    endDate: {
                    [Op.between]: [startOfDay, endOfDay]
                    }
                }
            }
        });

        if (!subscriptions?.length) {
            return;
        }

        // Use Promise.all to handle async operations in map
        await Promise.all(subscriptions?.map(async (subscription) => {
            const practiceId = subscription?.practiceId;
            const subscriptionId = subscription?.subscriptionId;
            if (!practiceId) return;

            const clinicDb = getModels(practiceId);

            // Find RN role
            const rnRole = await clinicDb.Role.findOne({ where: { code: 'rn' } });

            // Get new staff added in the previous billing cycle
            const newStaffAdded = await dbService.getAll({
                model: clinicDb.Staff,
                filter: {
                    where: {
                        createdAt: {
                            [Op.between]: [previousBillingSecondHalfStart, previousBillingSecondHalfEnd]
                        }
                    },
                },
                otherOptions: {
                    attributes: ['userId', 'id'],
                    include: [
                        {
                            model: clinicDb.User,
                            as: "user",
                            include: [{ model: clinicDb.Role, as: "roles" }]
                        }
                    ]
                }
            });

            // Get staff deactivated in the previous billing cycle
            const staffDeactivated = await dbService.getAll({
                model: clinicDb.Staff,
                filter: {
                    where: {
                        deactivatedDate: {
                            [Op.between]: [previousBillingStarted, previousBillingSecondHalfEnd]
                        }
                    },
                },
                otherOptions: {
                    attributes: ['userId', 'id'],
                    include: [
                        {
                            model: clinicDb.User,
                            as: "user",
                            include: [{ model: clinicDb.Role, as: "roles" }]
                        }
                    ]
                }
            });

            // Get staff unPrescriber in the previous billing cycle
            const staffUnPrescribe = await dbService.getAll({
                model: clinicDb.Staff,
                filter: {
                    where: {
                        isPrescriber: false,
                        prescribeDate: {
                            [Op.between]: [previousBillingStarted, previousBillingSecondHalfEnd]
                        }
                    },
                },
                otherOptions: {
                    attributes: ['userId', 'id'],
                    include: [
                        {
                            model: clinicDb.User,
                            as: "user",
                            include: [{ model: clinicDb.Role, as: "roles" }]
                        }
                    ]
                }
            });

            let rnCount = subscription?.rnCount || 0;
            let nonRnCount = Math.max((subscription?.practitionerCount - 1) || 0, 0);
            let rnDeactivatedCount = 0;
            let nonRnDeactivatedCount = 0;
            let prescriberCount = subscription?.prescriberCount || 0;
            const unPrescriberCount = staffUnPrescribe?.length;

            newStaffAdded?.map((staff) => {
                const roles = staff?.user?.roles || [];
                const isNotRn = roles.some(role => role?.id !== rnRole?.id);

                if (isNotRn) {
                    nonRnCount++;
                } else {
                    rnCount++;
                }
            });

            staffDeactivated?.map((staff)=> {
                const roles = staff?.user?.roles || [];
                const isNotRn = roles.some(role => role?.id !== rnRole?.id);
                
                if (isNotRn) {
                    nonRnDeactivatedCount++;
                } else {
                    rnDeactivatedCount++;
                }
            })

            const totalPractitionerCount = Math.max(nonRnCount - nonRnDeactivatedCount, 0);
            const totalRnCount = Math.max(rnCount - rnDeactivatedCount, 0);
            const totalPrescriberCount = Math.max(prescriberCount - unPrescriberCount, 0);


            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

            const practitionerItem = stripeSubscription.items.data.find(
                (item) => item.price.id === process.env.SUBSCRIPTION_PER_PRACTITIONER_PRICE_ID 
            );

            const rnItem = stripeSubscription.items.data.find(
                (item) => item.price.id === process.env.SUBSCRIPTION_PER_CLINIC_STAFF 
            );  

            const prescriberItem = stripeSubscription.items.data.find(
                (item) => item.price.id === process.env.SUBSCRIPTION_PER_PRESCRIBER
            );

            if (!practitionerItem || !rnItem || !prescriberItem) {
                throw new Error("Practitioner add-on item not found.");
            }

            // const updateForPractitionerResult = await stripe.subscriptionItems.update(practitionerItem.id, {
            //   quantity: totalPractitionerCount,
            // });
            // const updateForStaffResult = await stripe.subscriptionItems.update(rnItem.id, {
            //   quantity: totalRnCount,
            // });
            // const updateForPrescriberResult = await stripe.subscriptionItems.update(prescriberItem.id, {
            //     quantity: totalPrescriberCount,
            // });
            const results = await Promise.allSettled([
                stripe.subscriptionItems.update(practitionerItem.id, { quantity: totalPractitionerCount }),
                stripe.subscriptionItems.update(rnItem.id, { quantity: totalRnCount }),
                stripe.subscriptionItems.update(prescriberItem.id, { quantity: totalPrescriberCount })
            ]);
        }));

    } catch (err) {
        console.log('error while updating subscription', err);
    }
};


module.exports = {
    subscriptionUpdate
}
