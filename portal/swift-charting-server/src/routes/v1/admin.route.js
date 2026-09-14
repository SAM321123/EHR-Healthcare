const express = require('express');
const adminPortalController = require('../../controllers/adminPortal.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { practiceValidation, emailTemplateValidation } = require('../../validations');

const router = express.Router();

router
  .route('/practice')
  .post(auth(AUTH_MODULE.admin, { action: AUTH_ACTION.create }), adminPortalController.createPractice)
  .get(auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }), adminPortalController.getPractices);

router
  .route('/practice/:practiceId')
  .put(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.update }),
    // validate(practiceValidation.updatePractice),
    adminPortalController.updatePracticeById
  )
  .get(auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }), adminPortalController.getPracticeById);

router
  .route('/practice/upload/:practiceId')
  .post(auth(AUTH_MODULE.admin, { action: AUTH_ACTION.create }), adminPortalController.uploadPracticeLogo);

router
  .route('/clinic-login-audit')
  .get(auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }), adminPortalController.getClinicLoginLogs);

router
  .route('/clinic-staff')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getClinicStaff
  );
router
  .route('/clinic-staff-csv')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getClinicStaffCSV
  );

  router
  .route('/clinic-appointment')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getClinicAppointment
  );
   router
  .route('/clinicwise-staff')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getCliniwiseStaff
  );
  router
  .route('/email-logs')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getClinicEmailLogs
  );

router
  .route('/cron-logs')
  .get(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.read }),
    adminPortalController.getClinicCronLogs
  );

router
  .route('/email-template')
  .post(
    auth(AUTH_MODULE.admin, { action: AUTH_ACTION.create }),
    validate(emailTemplateValidation.createAdminEmailTemplate),
    adminPortalController.createEmailTemplate
  )
  .get(
    auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.read }),
    validate(emailTemplateValidation.getEmailTemplates),
    adminPortalController.getEmailTemplates
  );
router
  .route('/email-template/:templateId')
  .put(
    auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.update }),
    validate(emailTemplateValidation.updateAdminEmailTemplate),
    adminPortalController.updateEmailTemplate
  );
module.exports = router;
