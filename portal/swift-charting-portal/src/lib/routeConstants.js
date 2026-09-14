export const UI_ROUTES = {
  dashboard: '/',
  login: 'login',
  signup: 'signup',
  resetpassword: 'reset-password',
  forgotpassword: 'forgot-password',
  generatepassword: 'generate-password',
  app: 'app',
  accounts: 'accounts',
  forms: '/forms',
  // messages: '/messages',
  formLink: '/prospect-registration',//added for prospect registration form link
  onlineBookingRegistration: '/online-booking-registration', // added for staff booking registration
  payment: 'payment',
  invoice: '/invoice',
  appointments: '/appointments',
  files: '/files',
  cards: '/cards',
  shared: '/shared',
  bookingForm: 'booking-form',
  bookingSlots: 'booking-slots',
  clinic: '/clinic',
  editClinicDetails: '/clinic/edit/:clinicId/:tabName',
  teams: 'teams',
  addTeams: 'add-teams',
  booking: '/booking',
  NOTFound: '404',
  masters: '/masters',
  addMaster: '/masters/add',
  editMaster: '/masters/edit',
  addTeam: 'dashboard/add-teams',
  bookingSetting: '/booking-setting',
  adminDashboard: '/dashboard',
  bookings: 'bookings',
  staff: '/staff',
  addStaff: '/staff/add',
  editStaff: '/staff/:staffId/edit',
  // fax: 'fax',
  // formBuilder: 'forms-builder',
  // viewForm: '/forms/:id',
  // order: 'order',
  // viewConsentForm: '/forms/:id/consent/:consentId',
  patientHome: '/home',
  graphTracking: '/tracking',
  fax: '/fax',
  formBuilder: '/forms-builder',
  order: '/order',
  // formLink: '/forms/link',
  patient: '/patient',
  addPatient: '/patient/add/demographic',
  editPatient: '/patient/detail/:patientId/demographic/edit',
  patientAllergies: '/patient/detail/:patientId/allergies',
  patientDocuments: '/patient/detail/:patientId/documents',
  patientDiagnosis: '/patient/detail/:patientId/diagnosis',
  patientSummary: '/patient/detail/:patientId/summary',
  patientInsurance: '/patient/detail/:patientId/insurance',
  patientHistory: '/patient/detail/:patientId/patient-history',
  patientVitals: '/patient/detail/:patientId/vitals',
  emergencyContact: '/patient/detail/:patientId/emergency-contact',
  appointment: '/patient/detail/:patientId/appointments',
  patientMedication: '/patient/detail/:patientId/medications',
  addPatientMedication: '/patient/detail/:patientId/medications/create',
  editPatientMedication:
    '/patient/detail/:patientId/medications/edit/:medicationId',
  patientLabRadiology: '/patient/detail/:patientId/lab-orders',
  // patientLabRadiologyResult: '/patient/detail/:patientId/lab-radiology-result',
  patientForms: '/patient/detail/:patientId/forms/',
  patientFormTab: '/patient/detail/:patientId/forms/:subTabName?',
  editPatientForm: '/patient/detail/:patientId/forms/:subTabName/:formId',
  patientEncounters: '/patient/detail/:patientId/encounters',
  addPatientEncounters: '/patient/detail/:patientId/encounters/create',
  editPatientEncounter:
    '/patient/detail/:patientId/encounters/edit/:encounterId',
  editPatientLinkedConsentForm:
    '/patient/detail/:patientId/forms/:subTabName/:formId/consent/:consentId',

  clinics: '/clinics',
  editClinicsDetails: '/clinics/edit/:clinicId/:tabName',
  patientPrescriptionForm:
    '/patient/edit/:id/:tabName/:subTabName/:patientPrescriptionId',
  createPatientPrescriptionForm: '/patient/edit/:id/:tabName/:subTabName/new',
  chat: '/Chat',
  userChat: '/Chat/:id',
  joinRoom: 'joinRoom',
  waitingroom: 'waitingroom/:appointmentId',
  endVideoCall: 'endVideoCall',
  prescription: '/prescription',
  viewPrescription: '/prescription/:prescriptionId',

  sharedForms: '/sharedForms',
  board: '/board',
  medInstruction: '/med-instruction',

  scheduling: '/scheduling',
  encounters: '/encounters',
  addEncounters: '/encounters/create',
  labRadiology: '/lab-orders',
  medicalBilling: '/medical-billing',
  analyticsAndReporting: '/analytics-and-reporting',
  messages: '/messages',
  alerts: '/alerts',
  tasks: '/tasks',
  systemSettings: '/system-settings',
  printForm: 'print-form/:formId',
  systemSettingsTab: '/system-settings/:subTabName?',
  patientTreatmentPlans: '/patient/detail/:patientId/treatment-plan',
  formLibrary: 'form-library/:formId',
  patientHomework: '/patient/detail/:patientId/homework',

  //
  clientHome: 'client',
  labRadiologyResult: '/lab-orders/lab-report/:labRadiologyId',
  labRequest: '/lab-orders/lab-request/:labRadiologyId',
  patientLabReport:
    '/patient/detail/:patientId/lab-orders/lab-report/:labRadiologyId',
  patientLabRequest:
    '/patient/detail/:patientId/lab-orders/lab-request/:labRadiologyId',

  ////////////////////////////PATIENT ROUTES///////////////////////////////////////////
  patientDashboard: '/patient-dashboard',
  patientBooking: '/patient-appointments',
  patientSharedForms: '/patient-form',
  viewForm: '/patient-form/:formId',
  viewSharedForm: '/shared/:formId',
  viewConsentForm: '/patient-form/:formId/consent/:consentId',
  patientMedicationData: '/patient-medications',
  patientAllergyData: '/patient-allergy',
  patientViewMedication: '/patient-medications/view/:medicationId',
  patientVitalsData: '/patient-vitals',
  patientLabRadiologyData: '/patient-labRadiology',
  patientLabRadiologyResultData:
    '/patient-labRadiology/lab-report/:labRadiologyId',
  patientMssages: '/patient-messages',
  singleChat: '/messages/:chatId/message',
  singlePatientChat: '/patient-messages/:chatId/message',

  patientLabRadiologyRequestData:
    '/patient-labRadiology/lab-request/:labRadiologyId',
  ////////////////////////////////////////////////////////////////////////////////////

  patientEmarData: '/patient/detail/:patientId/medications/emar/:medicationId?',
  patientMedicationSchedule:
    '/patient/detail/:patientId/medications/medicationSchedule/:medicationId?',
  bookingSettings: '/booking-settings',
  zoomSession: '/zoom-session/:sessionId',

  eligibilityCheckHistory:
    '/patient/detail/:patientId/eligibility-check-history',

  /////////////////SUPER ADMIN PORTAL///////////////////////////
  adminLogin: 'admin/login',
  loginActivity: '/login-activity',
  adminClinicStaff: '/clinic-staff',
  adminEmailCampaign: '/email-campaign',
  adminClinicStaffCSV: '/clinic-staff-csv',
  adminClinicAppointment: '/clinic-appointment',
  adminEmailLogs: '/email-logs',
  adminCronLogs: '/cron-logs',
  adminCompundMailById: '/email-composed/:id',
  /////////////////////////////////////////////////////////////

  ///////////////////PRACTICE REGISTERATION///////////////////
  practiceRegisteration: 'practice-registration',
  practiceRegisterationVerifyEmail: 'practice-registration/verify-email',
  ///////////////////////////////////////////////////////////

  ///////////EMIAL VERIFICATION/////////////////////
  emailVerification: 'login/verify-email',

  //////////////////MEMBERSHIP//////////////////////
  practiceMembership: 'practice-registration/practice-membership',

  ////////////////subscription//////////////////
  subscription: '/subscription',
  subscriptionInactive: 'subscription-inactive',
  subscriptionCancel: 'subscription-cancel',
  subscriptionTrialOver: 'subscription-trial-over',
  //////////////////////////////////////////////////////
};

export const navigateTo = (route) => `/${route}`;
