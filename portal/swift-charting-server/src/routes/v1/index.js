const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const practiceRoute = require('./practice.route');
const roleRoute = require('./role.route');
const practiceLocationRoute = require('./practiceLocation.route');
const globalTypeCategoryRoute = require('./globalTypeCategory.route');
const globalTypeRoute = require('./globalType.route');
const patientRoute = require('./patient.route');
const allergiesRoute = require('./allergies.route');
const chatsRoute = require('./chats.route');
const uploadRoute = require('./upload.route');
const downloadRoute = require('./download.route');
const diagnosisRoute = require('./diagnosis.route');
const diagnosisIcdRoute = require('./diagnosisIcd.route');
const diagnosisProblemRoute = require('./diagnosisProblem.route');
const insuranceRoute = require('./insurance.route');
const familyHistoryRoute = require('./familyHistory.route');
const socialHistoryRoute = require('./socialHistory.route');
const medicalHistoryRoute = require('./medicalHistory.route');
const vitalsRoute = require('./vitals.route');
const patientDocumentRoute = require('./patientDocument.route');
const patientMedication = require('./patientMedication.route');
const emergencyContactRoute = require('./emergencyContact.route');
const appointmentRoute = require('./appointment.route');
const genericDrugRoute = require('./genericDrug.route');
const brandNameDrugRoute = require('./brandNameDrug.route');
const staffRoute = require('./staff.route');
const meetConfigRoute = require('./meetConfig.route');
const labsRadiologyRoute = require('./labsRadiology.route');
const formRoute = require('./form.route');
const patientFormRoute = require('./patientForm.route');
const pdfRoute = require('./pdf.route');
const faxContactRoute = require('./faxContact.route');
const faxHistoryRoute = require('./faxHistory.route');
const patientFormSubmissionRoute = require('./patientFormSubmission.route');
const allPatientHistoryRoute = require('./allPatientHistory.route');
const laboratoryTestRoute = require('./laboratoryTest.route');
const testingLabRoute = require('./testingLab.route');
const patientMedicationHistory = require('./patientMedicationHistory.route');
const emailTemplateRoute = require('./emailTemplate.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const hl7Route = require('./hl7.route');
const encountersRoute = require('./encounters.route');
const diagnosisSnomedRoute = require('./diagnosisSnomed.route');
const procedureCodeRoute = require('./procedureCode.route'); 
const encountersBillingRoute = require('./encounterBilling.route');
const encountersClaimBillingRoute = require('./encounterClaimBilling.route');

const treatmentPlanRoute = require('./treatmentPlan.route');
const icdProblem = require('./icdProblem.route');
const problemBehavior = require('./problemBehavior.route');
const behaviorGoal = require('./behaviorGoal.route');
const goalObjective = require('./goalObjective.route');
const objectiveIntervention = require('./objectiveIntervention.route')
const labReportRoute = require('./labReport.route');
const practiceSettingsRoute = require('./practiceSetting.route');
const moduleRoute = require('./module.route');
const roleAndModulesRoute = require('./roleAndModules.route'); 
const roleAndPermissionsRoute = require('./roleAndPermissions.route');
const userDeviceRoute = require('./userDevice.route');
const notificationRoute = require('./notification.route');
const formLibraryRoute = require('./formLibrary.route');
const stripeRoute = require('./stripe.route');
const medicationScheduleRoute = require('./medicationSchedule.route');
const marRoute = require('./marDetails.route');
const patientMedicationItemsRoute = require('./patientMedicationItems.route');
const patientMedicationItemMARLog = require('./patientMedicationItemMARLog.route');

const staffLocation = require('./staffLocation.route');
const staffBookingSetting = require('./staffBookingSetting.route');
const calendarScheduleRoute = require('./calendarSchedule.route');
const zoomSessionRoute = require('./zoomSession.route');
const mdToolboxRoute = require('./mdToolbox.route');
const mdToolboxConfigRoute = require('./mdToolboxConfig.route');
const officeAllyRoute = require('./officeAlly.route');
const officeAllyConfigRoute = require('./officeAllyConfig.route');
const analyticsAndReportingRoute = require('./analyticsReporting.route');
const appointmentNotesRoute = require('./appointmentNotes.route');
const treatmentPlanTemplateRoute = require('./treatmentPlanTemplate.route');
const homework = require('./homework.route');
const adminRoute = require('./admin.route');
const claimsRoute = require('./claims.route');
const invoiceRoute = require('./invoice.route');
const clinicRoute = require('./clinic.route');
const loginLogsRoute = require('./loginLogs.route');
const blockedUserRoute = require('./blockedUser.route');
const emailLogsRoute = require('./emailLogs.route');
const encounterNote = require('./encounterNote.route');
const emailCampaignTemplate = require('./emailCampaignTemplate.route');
const emailCampaignComposeMail = require('./emailCampaignComposeMail.route');
const prospectRegistrationRoute = require('./prospectRegister.route');
const formLinkProspectController = require('./formLink.prospect.model');
const outOfOfficeScheduleRoute = require('./outOfOfficeSchedule.route');
const onlineBookingRegistrationRoute = require('./onlineBookingRegistration.route');



// const emailLogsRoute = require('./emailLogs.route')
const emailComposedRoute = require('./emailComposed.route')

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/practice',
    route: practiceRoute,
  },
  {
    path: '/role',
    route: roleRoute,
  },
  {
    path: '/practice-location',
    route: practiceLocationRoute,
  },
   {
    path: '/form-link-prospect',
    route: formLinkProspectController,
  },
  {
    path: '/global-type-category',
    route: globalTypeCategoryRoute,
  },
  {
    path: '/global-type',
    route: globalTypeRoute,
  },
  {
    path: '/patient',
    route: patientRoute,
  },
  {
    path: '/patient-document',
    route: patientDocumentRoute,
  },
  {
    path: '/diagnosis',
    route: diagnosisRoute,
  },
  {
    path: '/allergies',
    route: allergiesRoute,
  },
  {
    path: '/chats',
    route: chatsRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
  {
    path: '/download',
    route: downloadRoute,
  },
  {
    path: '/diagnosisIcd',
    route: diagnosisIcdRoute,
  },
  {
    path: '/diagnosisProblem',
    route: diagnosisProblemRoute,
  },
  {
    path: '/insurance',
    route: insuranceRoute,
  },
  {
    path: '/familyHistory',
    route: familyHistoryRoute,
  },
  {
    path: '/socialHistory',
    route: socialHistoryRoute,
  },
  {
    path: '/medicalHistory',
    route: medicalHistoryRoute,
  },
  {
    path: '/vitals',
    route: vitalsRoute,
  },
  {
    path: '/patient-medication',
    route: patientMedication,
  },
  {
    path: '/emergency-contact',
    route: emergencyContactRoute,
  },
  {
    path: '/appointment',
    route: appointmentRoute,
  },
  {
    path: '/generic-drug',
    route: genericDrugRoute,
  },
  {
    path: '/brand-name-drug',
    route: brandNameDrugRoute,
  },
  {
    path: '/staff',
    route: staffRoute,
  },
  {
    path: '/meet-config',
    route: meetConfigRoute,
  },
  {
    path: '/labs-radiology',
    route: labsRadiologyRoute,
  },
  {
    path: '/hl7',
    route: hl7Route,
  },
  {
    path: '/form',
    route: formRoute,
  },
  {
    path: '/patient-form',
    route: patientFormRoute,
  },
  {
    path: '/pdf',
    route: pdfRoute,
  },
  {
    path: '/fax-contact',
    route: faxContactRoute,
  },
  {
    path: '/fax-history',
    route: faxHistoryRoute,
  },
  {
    path: '/patient-form-submission',
    route: patientFormSubmissionRoute,
  },
  {
    path: '/all-patient-history',
    route: allPatientHistoryRoute,
  },
  {
    path: '/laboratory-test',
    route: laboratoryTestRoute,
  },
  {
    path: '/testing-lab',
    route: testingLabRoute,
  },
  {
    path: '/patient-medication-history',
    route: patientMedicationHistory,
  },
  {
    path: '/email-templates',
    route: emailTemplateRoute,
  },
  {
    path: '/email-composed',
    route: emailComposedRoute,
  },
  {
    path: '/patient-encounter',
    route: encountersRoute,
  },
  {
    path: '/patient-encounter-billing',
    route: encountersBillingRoute,
  },
  {
    path: '/patient-encounter-claim-billing',
    route: encountersClaimBillingRoute,
  },
  {
    path: '/diagnosisSnomed',
    route: diagnosisSnomedRoute,    
  },
  {
    path: '/procedureCode',
    route: procedureCodeRoute,
  },
  {
    path: '/treatment-plan',
    route: treatmentPlanRoute,
  },
  {
    path: '/icd-problem',
    route: icdProblem,
  },
  {
    path: '/problem-behavior',
    route: problemBehavior,
  },
  {
    path: '/behavior-goal',
    route: behaviorGoal,
  },
  {
    path: '/goal-objective',
    route: goalObjective,
  },
  {
    path: '/objective-intervention',
    route: objectiveIntervention,
  },
  {
    path: '/lab-report',
    route: labReportRoute,
  },
  {
    path: '/practice-settings',
    route: practiceSettingsRoute,
  },
  {
    path: '/module',
    route: moduleRoute,
  },
  {   
    path: '/roleAndModules',
    route: roleAndModulesRoute,
  },
  {   
    path: '/roleAndPermissions',
    route: roleAndPermissionsRoute,
  },
  {
    path: '/user-device',
    route: userDeviceRoute,
  },
  {
    path: '/notification',
    route: notificationRoute,
  },
  {
     path: '/form-library',
    route: formLibraryRoute,
  },
  {
    path: '/stripe-payment',
    route: stripeRoute,
  },
  {
    path: '/medication-schedule',
    route: medicationScheduleRoute,
  },
  // {
  //   path: '/mar',
  //   route: marRoute,
  // },
  {
    path: '/prospect-registration',
    route: prospectRegistrationRoute,
  }
  ,
  {
    path: '/patient-medication-items',
    route: patientMedicationItemsRoute,
  },
  {
    path: '/patient-medication-item-mar-log',
    route: patientMedicationItemMARLog,
  },
  {
    path: '/staff-location',
    route: staffLocation,
  },
  {
    path: '/staff-booking-setting',
    route: staffBookingSetting,
  },
  {
    path: '/calendar-schedule',
    route: calendarScheduleRoute,
  },
  {
    path:'/zoom-session',
    route:zoomSessionRoute,
  },
  {
    path:'/md-toolbox/patient-upload',
    route: mdToolboxRoute,
  },
  {
    path:'/md-toolbox-config',
    route: mdToolboxConfigRoute,
  },
  {
    path:'/office-ally',
    route: officeAllyRoute,
  },
  {
    path:'/office-ally-config',
    route: officeAllyConfigRoute,
  },
  {
    path:'/analytics-and-reporting',
    route: analyticsAndReportingRoute,
  },
  { 
    path:'/appointment-notes',
    route: appointmentNotesRoute,
  },
  {
    path: '/treatment-plan-template',
    route: treatmentPlanTemplateRoute,
  },
  {
    path: '/homework',
    route: homework,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/claims',
    route: claimsRoute,
  },
  {
    path: '/invoice',
    route: invoiceRoute,
  },
  {
    path: '/clinic',
    route: clinicRoute,
  },
  {
    path: '/login-logs',
    route: loginLogsRoute,
  },
  {
    path: '/blocked-user',
    route: blockedUserRoute,
  },
  {
    path: '/email-logs',
    route: emailLogsRoute,
  },
  {
    path: '/encounter-note',
    route: encounterNote,
  },
   {
    path: '/email-campaign-template',
    route: emailCampaignTemplate,
  },
   {
    path: '/compose-mail',
    route: emailCampaignComposeMail,
  },
  {
    path: '/oof-schedule',
    route: outOfOfficeScheduleRoute,
  },
  {
    path: '/online-booking-registration',
    route: onlineBookingRegistrationRoute,
  },
];



const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
