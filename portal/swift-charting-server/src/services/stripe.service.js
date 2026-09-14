const Stripe = require('stripe');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const config = require('../config/config');
const stripe = Stripe(config.stripe.stripeSecretKey)

const createPaymentLog = ({response='',error='',status},{tenantId,user})=>{
    const db = getModels(tenantId);

}
const createPaymentIntent = async (body, { tenantId, user }) => {
    const { paymentMethodId, amount, customerEmail, orderDescription,customerName="N/A" } = body;
  
    const defaultAddress = {
      line1: "N/A",
      city: "N/A",
      state: "N/A",
      postal_code: "000000",
      country: "IN"
    };
    try {
      // Create a PaymentIntent using the provided paymentMethodId
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(amount * 100), // Amount is in cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true, // Automatically confirm the PaymentIntent after creation
        description: orderDescription, // Include the order description if needed
        receipt_email: customerEmail, // Customer's email to receive a receipt
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never', // Adjust based on your needs
        },
        shipping: {
          name: customerName,
          address: {
            line1: defaultAddress.line1, // Required
            city: defaultAddress.city, // Required
            state: defaultAddress.state, // Optional
            postal_code: defaultAddress.postal_code, // Required
            country: defaultAddress.country, // Required
          },
        },
      });
  
      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Payment failed:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
  };
const createCustomerAndSubscription = async ({ email, name, paymentMethodId, practitionerCount, prescriberCount, rnCount }) => {
  // 1. Create customer first
  const customer = await stripe.customers.create({
    email,
    name
  });

  // 2. Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  });

  // 3. Set as default payment method
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // 4. Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    // trial_period_days: 3,
    items: [
      { price: config.stripe.basePriceId, quantity: 1 }, // Use real price ID
      { price: config.stripe.perPractitionerPriceId, quantity: (practitionerCount-1) },
      { price: config.stripe.perClinicStaffPriceId, quantity: rnCount },
      { price: config.stripe.perPrescriberPriceId, quantity: prescriberCount },
    ],
    expand: ["latest_invoice.payment_intent"],
  });

  return {
    customerId: customer.id,
    subscriptionId: subscription.id,
    subscriptionItemId: subscription.items.data[1]?.id,
    paymentIntent: subscription.latest_invoice.payment_intent,
  };
};

const updateSubscriptionPlan = async ({ subscriptionId, practitionerPriceId, practitionerCount }) => {
  // 1. Get the subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 2. Find the subscription item for practitioner add-on
  const practitionerItem = subscription.items.data.find(
    (item) => item.price.id === practitionerPriceId
  );

  if (!practitionerItem) {
    throw new Error("Practitioner subscription item not found.");
  }

  // 3. Update the quantity
  const updatedItem = await stripe.subscriptionItems.update(practitionerItem.id, {
    quantity: practitionerCount - 1, // Subtracting base included practitioner
  });

  return {
    updatedItemId: updatedItem.id,
    newQuantity: updatedItem.quantity,
  };
};


const createSubscriptionInStripeAfterCancel = async ({ email, paymentMethodId, practitionerCount, rnCount, prescriberCount }) => {
  //1. First, check if a customer with this email already exists
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  let customer;

  if (existingCustomers.data.length > 0) {
    // Customer already exists
    customer = existingCustomers.data[0];
  } else {
    // Customer doesn't exist → create a new one
    customer = await stripe.customers.create({
      email,
    });
  }
  
  // 2. Check if customer has a canceled-but-still-running subscription
  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all", // we need canceled + active
    limit: 5,
  });

  const overlappingCancel = subs.data.find(
  (s) =>
    s.status === "trialing" &&
    s.cancel_at_period_end === true &&
    s.current_period_end * 1000 > Date.now() // still within paid period
  );

  if (overlappingCancel) {
    throw new Error(
      `This subscription is already canceled but still valid until ${new Date(
        overlappingCancel.current_period_end * 1000
      ).toLocaleDateString()}. Please wait until it fully ends before creating a new one.`
    );
  }


  // 3. Attach payment method if not already attached
  // const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  // if (pm.customer !== customer.id) {
  //   await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
  // }


  // 4. Set default payment method
  // await stripe.customers.update(customer.id, {
  //   invoice_settings: { default_payment_method: paymentMethodId },
  // });

  // 3. Always create or use a new PaymentMethod for this subscription

 // 2. Attach payment method to customer
  // await stripe.paymentMethods.attach(paymentMethodId, {
  //   customer: customer.id,
  // });

  // 3. Set as default payment method
  // await stripe.customers.update(customer.id, {
  //   invoice_settings: {
  //     default_payment_method: paymentMethodId,
  //   },
  // });
  // 5. Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    trial_period_days: 0,
    items: [
      { price: config.stripe.basePriceId, quantity: 1 }, // Use real price ID
      { price: config.stripe.perPractitionerPriceId, quantity: (practitionerCount-1) },
      { price: config.stripe.perClinicStaffPriceId, quantity: (rnCount) },
      { price: config.stripe.perPrescriberPriceId, quantity: (prescriberCount) },
    ],
    expand: ["latest_invoice.payment_intent"],
  });

  return {
    customerId: customer.id,
    subscriptionId: subscription.id,
    subscriptionItemId: subscription.items.data[1]?.id,
    paymentIntent: subscription.latest_invoice.payment_intent,
  };
};

module.exports={
    createPaymentIntent,
    createCustomerAndSubscription,
    updateSubscriptionPlan,
    createSubscriptionInStripeAfterCancel
}
