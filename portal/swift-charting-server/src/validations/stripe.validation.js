const Joi = require("joi");

const createPaymentIntent = {
    body: Joi.object().keys({
      paymentMethodId: Joi.string().required(),  // New field for Stripe payment method ID
      amount: Joi.number().integer().required(),  // Amount in cents
      customerEmail: Joi.string().email().required(),  // Valid email address
      orderDescription: Joi.string().allow(''),  // Optional order description
      saveCard: Joi.boolean(),  // Optional field to indicate if the card should be saved
      customerName:Joi.string(),
    }),
  };
  
  module.exports={
    createPaymentIntent,
  }