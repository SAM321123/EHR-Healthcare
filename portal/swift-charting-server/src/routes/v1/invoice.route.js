const express = require('express');
const invoiceController = require('../../controllers/invoice.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { invoiceValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.invoice, { action: AUTH_ACTION.create }),
    validate(invoiceValidation.createInvoice),
    invoiceController.createInvoice
  )
  .get(
    auth(AUTH_MODULE.invoice, { action: AUTH_ACTION.read }),
    validate(invoiceValidation.getInvoice),
    invoiceController.getInvoices
  );

router
  .route('/:invoiceId')
  .get(
    auth(AUTH_MODULE.invoice, { action: AUTH_ACTION.read }),
    validate(invoiceValidation.getInvoice),
    invoiceController.getInvoiceById
  )
  .put(
    auth(AUTH_MODULE.invoice, { action: AUTH_ACTION.update}),
    validate(invoiceValidation.updateInvoice),
    invoiceController.updateInvoice
  );


module.exports = router;
