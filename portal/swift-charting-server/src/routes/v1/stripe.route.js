const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { stripeValidation } = require('../../validations');
const { stripeController } = require('../../controllers');

const router = express.Router();

router.route('/create-intent').post(auth(), validate(stripeValidation.createPaymentIntent), stripeController.createPaymentIntent);

module.exports = router;
