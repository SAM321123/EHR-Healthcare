const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { analyticsReportingController } = require('../../controllers');

const router = express.Router();

router
.route('/get-ethnicity-count')
.get(
  auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
  analyticsReportingController.getEthnicityCount
);
router
.route('/get-gender-count')
  .get(
    auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getGenderCount
  );
router
  .route('/get-location-count')
    .get(
      auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
      analyticsReportingController.getLocationCount
    );
router
.route('/get-age-count')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getAgeCount
);
router
.route('/get-encounter-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getEncounterReport
);
router
.route('/get-medication-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getMedicationUtilizationReport
);
router
.route('/get-appointment-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getAppointmentReport
);
router
.route('/get-appointment-list-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getAppointmentListReport
);
router
.route('/get-diagnosis-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getDiagnosisReport
);
router
.route('/get-chronic-disease-list-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getChronicDieaseReport
);
router
.route('/get-lab-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getLabReportData
);
router
.route('/get-medication-administered')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getMedicationAdministerOnTime
);
router
.route('/get-medication-history')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getMedicationChanges
);

router
.route('/staff-perfomace/medication-error-rates')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getMedicationErrorRates
);

router
.route('/frequency-of-dose-adjustment')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getDoseFrequency
);

router
.route('/get-diagnosis-problem-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getDiagnosisProblemReport
);

router
.route('/get-old-new-patient-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getOldAndNewPatientReport
);

router
.route('/claim-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getClaimReport
);
router
.route('/claim-report-download')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.downloadClaimReport
);


router
.route('/medical-billing-encounter-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getMedicalBillingEncounterReport
);
router
.route('/procedure-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getProcedureReport
);

///////INVOICE REPORT//////////
router
.route('/invoice-report')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getInvoiceReport
);
router
.route('/patient-invoices')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getPatientInvoicesReport
);
router
.route('/patient-payments')
.get(auth(AUTH_MODULE.analyticsAndReporting, { action: AUTH_ACTION.read }),
    analyticsReportingController.getPatientPaymentReport
);


module.exports = router;
