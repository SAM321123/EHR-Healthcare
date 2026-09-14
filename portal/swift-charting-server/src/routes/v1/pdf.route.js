const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { pdfController } = require('../../controllers');
const { pdfValidation } = require('../../validations');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();

router
  .route('/patientForm/:patientFormId')
  .get(validate(pdfValidation.downloadPatientFormPDF), pdfController.createPatientFormPDF);

  router
  .route('/patientMedication/:patientMedicationId')
  .get( validate(pdfValidation.downloadPatientMedicationPDF),pdfController.createPatientMedicationPDF);

router         
  .route('/patient-medication-item-mar-log/:patientMedicationItemId')
  .get(validate(pdfValidation.downloadPatientMedicationMARLogPdf),pdfController.createPatientMedicationMARLogPDF);

router
  .route('/patientEncounter/:patientEncounterId')
  .get(validate(pdfValidation.downloadPatientEncounterPDF),pdfController.createPatientEncounterPDF);


/////////////////////////////INITIAL CODE///////////////////////////////////////////////////////
// router
//   .route('/patientForm/:patientFormId')
  // .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientFormPDF), pdfController.createPatientFormPDF);

//   router
//   .route('/patientMedication/:patientMedicationId')
//   .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientMedicationPDF), pdfController.createPatientMedicationPDF);

// router         
//   .route('/patient-medication-item-mar-log/:patientMedicationItemId')
//   .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientMedicationMARLogPdf), pdfController.createPatientMedicationMARLogPDF);

// router
//   .route('/patientEncounter/:patientEncounterId')
//   .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientEncounterPDF), pdfController.createPatientEncounterPDF);
///////////////////////////////////////////////////////////////////////////////////////////











// router
//   .route('/patientAllMedication/:patientId')
//   .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientAllMedicationPDF), pdfController.createPatientAllMedicationPDF);

  module.exports = router;

  router         
    .route('/patient-medication-items-mar-log/:patientId/:medicationId')
    .get( validate(pdfValidation.downloadPatientMedicationsMARLogPdf), pdfController.createPatientAllMedicationsMARLogPDF);

/////////////////INVOICE///////////////////////
router
.route('/patientInvoice/:patientInvoiceId')
.get( 
  validate(pdfValidation.downloadPatientInvoicePDF),
  pdfController.createPatientInvoicePDF);

////////////INITIAL CODE///////////  
// router         
//   .route('/patient-medication-items-mar-log/:patientId/:medicationId')
//   .get(auth(AUTH_MODULE.downloadPatientFormPdf, { action: AUTH_ACTION.create }), validate(pdfValidation.downloadPatientMedicationsMARLogPdf), pdfController.createPatientAllMedicationsMARLogPDF);
module.exports = router;
