const User = require('./user.model');
const Token = require('./token.model');
const Practice = require('./practice.model');
const PracticeLocation = require('./practiceLocation.model');
const PracticeSetting = require('./practiceSetting.model');
const GlobalCategoryType = require('./globalTypeCategory.model');
const GlobalType = require('./globalType.model');
const PremissionModule = require('./permissionModule.model');
const Role = require('./role.model');
const DatabaseConfig = require('./databaseConfig.model');
const Patient = require('./patient.model');
const Staff = require('./staff.model');
const Allergies = require('./allergies.model');
const Chat = require('./chat.model');
const Message = require('./message.model');
const AllergiesReactions = require('./allergiesReactions.model');
const File = require('./file.model');
const defineAssociations = require('./associations');
const defineAdminAssociations = require('./adminAssociation');
const Diagnosis = require('./diagnosis.model');
const DiagnosisProblem = require('./diagnosisProblem.model');
const DiagnosisIcd = require('./diagnosisIcd.model');
const Insurance = require('./insurance.model');
const FamilyHistory = require('./familyHistory.model');
const SocialHistory = require('./socialHistory.model');
const Vitals = require('./vitals.model');
const MedicalHistory = require('./medicalHistory.model');
const PatientDocument = require('./patientDocument.model');
const PatientMedication = require('./patientMedication.model');
const MedicineData = require('./medicineData.model');
const EmergencyContact = require('./emergencyContact.model');
const Appointment = require('./appointment.model');
const GenericDrug = require('./genericDrug.model');
const BrandNameDrug = require('./brandNameDrug.model');
const RecurringSetting = require('./recurringSetting.model');
const CronLog = require('./cronLog.model');
const MeetConfig = require('./meetConfig.model');
const AppointmentPatient = require('./appointmentPatient.model');
const LabsRadiology = require('./labsRadiology.model');
const Form = require('./form.model');
const LinkedConsentForm = require('./linkedConsentForm.model');
const PatientForm = require('./patientForm.model');
const PatientFormSubmission = require('./patientFormSubmission.model');
const LinkedConsentFormPatient = require('./linkedConsentFormPatient.model');
const FaxContact = require('./faxContact.model');
const FaxHistory = require('./faxHistory.model');
const AllPatientHistory = require('./allPatientHistory.model');
const LaboratoryTest = require('./laboratoryTest.model');
const TestingLab = require('./testingLab.model');
const LabRadiologyLaboratoryTest = require('./labsRadiologoLaboratoryTest.model');
const PatientMedicationHistory = require('./patientMedicationHisotry.model');
const PatientMedicationItems = require('./patientMedicationItems.model');
const PatientMedicationDiagnosis = require('./patientMedicationDiagnosis.model');
const PatientMedicationItemsHistory = require('./patientMedicationItemsHistory.model');
const PatientMedicationDiagnosisHistory = require('./patientMedicationDiagnosisHistory.model');
const EmailTemplate = require('./emailTemplate.model');
const FormEncounterTypes = require('./formEncounterTypes.model');
const PatientEncounters = require('./patientEncounters.model');
const PatientEncounterForm = require('./patientEncounterForm.model');
const PatientEncounterBilling = require('./patientEncounterBilling.model');
const PatientEncounterClaims = require('./patientEncounterClaims.model');
const PatientEncounterBillingIcdCode = require('./patientEncounterBillingIcdCode.model');
const PatientEncounterBillingSnomedCtCode = require('./patientEncounterBillingSnomedCtCode.model');
const PatientEncounterBillingProcedureCode = require('./patientEncounterBillingProcedureCode.model');
const ProcedureCode = require('./procedureCode.model');
const DiagnosisSnomedCt = require('./diagnosisSnomedCt.model');
const TreatmentPlan = require('./treatmentPlan.model');
const TreatmentPlanDiagnosis = require('./treatmentPlanDiagnosis.model');
const AdminEmailComposed = require('./adminEmailComposed.model');
const IcdProblem = require('./icdProblem.model');
const ProblemBehavior = require('./problemBehavior.model');
const BehaviorGoal = require('./behaviorGoal.model');
const GoalObjective = require('./goalObjective.model');
const ObjectiveIntervention = require('./objectiveIntervention.model');
const TreatmentPlanProblem = require('./treatmentPlanProblem.model');
const TreatmentPlanBehavior = require('./treatmentPlanBehavior.model');
const TreatmentPlanGoal = require('./treatmentPlanGoal.model');
const TreatmentPlanObjective = require('./treatmentPlanObjective.model');
const TreatmentPlanIntervention = require('./treatmentPlanIntervention.model');
const UserRole = require('./userRole.model');
const LabReport = require('./labReport.model');
const AppointmentForm = require('./appointmentForm.model');
const Module = require('./module.model');
const RoleAndModule = require('./roleAndModule.model');
const RoleAndPermissions = require('./roleAndPermission.model');
const PermissionModule = require('./permissionModule.model');
const Notification = require('./notification.model');
const UserDevice = require('./userDevice.model');
const MedicationSchedule = require('./medicationSchedule.model');
const PatientMedicationItemMARLog = require('./patientMedicationItemMARLog.model');
const StaffLocation = require('./staffLocation.model');
const StaffBookingSetting = require('./staffBookingSetting.model');
const CalendarSchedule = require('./calendarSchedule.model');
const CalendarScheduleRecurringSetting = require('./calendarScheduleRecurringSetting.model');
const ZoomSession = require('./zoomSession.model');
const ZoomSessionInvite = require('./zoomSessionInvite.model');
const MdToolbox = require('./mdToolbox.model');
const PayerList = require('./masterOfficeallyPayerList.model');
const MdToolboxConfig = require('./mdToolboxConfig.model');
const OfficeallyConfig = require('./officeallyConfig.model');
const EligibilityCheckHistory = require('./eligibilityCheckHistory.model');
const AppointmentNotes = require('./appointmentNotes.model');

const TreatmentPlanTemplate = require('./treatmentPlanTemplate.model');
const TreatmentPlanTemplateDiagnosis = require('./treatmentPlanTemplateDiagnosis.model');
const TreatmentPlanTemplateProblem = require('./treatmentPlanTemplateProblem.model');
const TreatmentPlanTemplateBehavior = require('./treatmentPlanTemplateBehavior.model');
const TreatmentPlanTemplateGoal = require('./treatmentPlanTemplateGoal.model');
const TreatmentPlanTemplateObjective = require('./treatmentPlanTemplateObjective.model');
const TreatmentPlanTemplateIntervention = require('./treatmentPlanTemplateIntervention.model');
const Homework = require('./homework.model');
const ClinicAdmin = require('./clinicAdmins');
const PaymentLogs = require('./paymentLogs.model');
const ClaimFileLogs = require('./claimFileLogs.model');
const Invoice = require('./invoice.model');
const ReSubmitClaimEncounterBillingLog = require('./reSubmitClaimEncounterBillingLog.model');
const Temp = require('./temp.model');
const Code = require('./verifyCode.model');
const VerifyCode = require('./emailVerifyCode.model');

const Subscription = require('./subscription.model');
const SubscriptionHistory = require('./subscriptionHistory.model');
const SubscriptionPayment = require('./subscriptionPayment.model');

const StripeEvent = require('./stripeEvent.model');
const TrialSubscription = require('./trialSubscription.model');
const LoginLogs = require('./loginLogs.model');
const ClinicStaff = require('./clinicStaff.model');
const EmailAudit = require('./emailAudit.model');
const AdminEmailTemplate = require('./adminEmailTemplate.model');
const EncounterNote = require('./encounterNote.model');
const EmailCampaignTemplate = require('./emailCampaignTemplate.model');
const EmailCampaignComposeMail = require('./emailCampaignComposeMail.model');
const ProspectRegistration = require('./prospectRegisteration.model');  
const FormLinkProspect = require('./formLink.prospect.model');
const OutOfOfficeSchedule = require('./outOfOfficeSchedule.model');

const initializeModels = (sequelize, master = false) => {
  let db;
  if (master) {
    db = {
      Role: Role(sequelize),
      Token: Token(sequelize),
      User: User(sequelize),
      UserRole: UserRole(sequelize),
      DatabaseConfig: DatabaseConfig(sequelize),
      Practice: Practice(sequelize),
      ClinicAdmin: ClinicAdmin(sequelize),
      Form: Form(sequelize),
      GlobalCategoryType: GlobalCategoryType(sequelize),
      GlobalType: GlobalType(sequelize),
      Temp: Temp(sequelize),
      Code: Code(sequelize),
      Subscription: Subscription(sequelize),
      SubscriptionHistory: SubscriptionHistory(sequelize),
      SubscriptionPayment: SubscriptionPayment(sequelize),
      StripeEvent: StripeEvent(sequelize),
      TrialSubscription: TrialSubscription(sequelize),
      LoginLogs: LoginLogs(sequelize),
      ClinicStaff: ClinicStaff(sequelize),
      EmailAudit: EmailAudit(sequelize),
      AdminEmailTemplate: AdminEmailTemplate(sequelize),
      AdminEmailComposed: AdminEmailComposed(sequelize),
    };
    defineAdminAssociations(db);
  } else {
    db = {
      Role: Role(sequelize),
      Token: Token(sequelize),
      User: User(sequelize),
      PracticeLocation: PracticeLocation(sequelize),
      PracticeSetting: PracticeSetting(sequelize),
      PremissionModule: PremissionModule(sequelize),
      Patient: Patient(sequelize),
      PatientDocument: PatientDocument(sequelize),
      Diagnosis: Diagnosis(sequelize),
      DiagnosisProblem: DiagnosisProblem(sequelize),
      DiagnosisIcd: DiagnosisIcd(sequelize),
      Insurance: Insurance(sequelize),
      Staff: Staff(sequelize),
      Practice: Practice(sequelize),
      GlobalCategoryType: GlobalCategoryType(sequelize),
      GlobalType: GlobalType(sequelize),
      DatabaseConfig: DatabaseConfig(sequelize),
      Allergies: Allergies(sequelize),
      Chat: Chat(sequelize),
      Message: Message(sequelize),
      AllergiesReactions: AllergiesReactions(sequelize),
      File: File(sequelize),
      FamilyHistory: FamilyHistory(sequelize),
      SocialHistory: SocialHistory(sequelize),
      MedicalHistory: MedicalHistory(sequelize),
      Vitals: Vitals(sequelize),
      PatientMedication: PatientMedication(sequelize),
      MedicineData: MedicineData(sequelize),
      EmergencyContact: EmergencyContact(sequelize),
      Appointment: Appointment(sequelize),
      MedicineData: MedicineData(sequelize),
      GenericDrug: GenericDrug(sequelize),
      BrandNameDrug: BrandNameDrug(sequelize),
      RecurringSetting: RecurringSetting(sequelize),
      CronLog: CronLog(sequelize),
      MeetConfig: MeetConfig(sequelize),
      AppointmentPatient: AppointmentPatient(sequelize),
      Form: Form(sequelize),
      LinkedConsentForm: LinkedConsentForm(sequelize),
      PatientForm: PatientForm(sequelize),
      LinkedConsentFormPatient: LinkedConsentFormPatient(sequelize),
      PatientFormSubmission: PatientFormSubmission(sequelize),
      FaxContact: FaxContact(sequelize),
      FaxHistory: FaxHistory(sequelize),
      AllPatientHistory: AllPatientHistory(sequelize),
      LabsRadiology: LabsRadiology(sequelize),
      LaboratoryTest: LaboratoryTest(sequelize),
      TestingLab: TestingLab(sequelize),
      LabRadiologyLaboratoryTest: LabRadiologyLaboratoryTest(sequelize),
      PatientMedicationHistory: PatientMedicationHistory(sequelize),
      PatientMedicationItems: PatientMedicationItems(sequelize),
      PatientMedicationDiagnosis: PatientMedicationDiagnosis(sequelize),
      PatientMedicationItemsHistory: PatientMedicationItemsHistory(sequelize),
      PatientMedicationDiagnosisHistory: PatientMedicationDiagnosisHistory(sequelize),
      EmailTemplate: EmailTemplate(sequelize),
      FormEncounterTypes: FormEncounterTypes(sequelize),
      PatientEncounters: PatientEncounters(sequelize),
      PatientEncounterForm: PatientEncounterForm(sequelize),
      PatientEncounterBilling: PatientEncounterBilling(sequelize),
      PatientEncounterBillingIcdCode: PatientEncounterBillingIcdCode(sequelize),
      PatientEncounterBillingSnomedCtCode: PatientEncounterBillingSnomedCtCode(sequelize),
      PatientEncounterBillingProcedureCode: PatientEncounterBillingProcedureCode(sequelize),
      ProcedureCode: ProcedureCode(sequelize),
      DiagnosisSnomedCt: DiagnosisSnomedCt(sequelize),
      TreatmentPlan: TreatmentPlan(sequelize),
      TreatmentPlanDiagnosis: TreatmentPlanDiagnosis(sequelize),
      IcdProblem: IcdProblem(sequelize),
      ProblemBehavior: ProblemBehavior(sequelize),
      BehaviorGoal: BehaviorGoal(sequelize),
      GoalObjective: GoalObjective(sequelize),
      TreatmentPlanProblem: TreatmentPlanProblem(sequelize),
      TreatmentPlanBehavior: TreatmentPlanBehavior(sequelize),
      ObjectiveIntervention: ObjectiveIntervention(sequelize),
      TreatmentPlanGoal: TreatmentPlanGoal(sequelize),
      TreatmentPlanObjective: TreatmentPlanObjective(sequelize),
      TreatmentPlanIntervention: TreatmentPlanIntervention(sequelize),
      UserRole: UserRole(sequelize),
      LabReport: LabReport(sequelize),
      AppointmentForm: AppointmentForm(sequelize),
      Module: Module(sequelize),
      RoleAndModule: RoleAndModule(sequelize),
      RoleAndPermissions: RoleAndPermissions(sequelize),
      PermissionModule: PermissionModule(sequelize),
      Notification: Notification(sequelize),
      UserDevice: UserDevice(sequelize),
      MedicationSchedule: MedicationSchedule(sequelize),
      PatientMedicationItemMARLog: PatientMedicationItemMARLog(sequelize),
      StaffLocation: StaffLocation(sequelize),
      StaffBookingSetting: StaffBookingSetting(sequelize),
      CalendarSchedule: CalendarSchedule(sequelize),
      CalendarScheduleRecurringSetting: CalendarScheduleRecurringSetting(sequelize),
      ZoomSession: ZoomSession(sequelize),
      ZoomSessionInvite: ZoomSessionInvite(sequelize),
      MdToolbox: MdToolbox(sequelize),
      MdToolboxConfig: MdToolboxConfig(sequelize),
      PayerList: PayerList(sequelize),
      OfficeallyConfig: OfficeallyConfig(sequelize),
      EligibilityCheckHistory: EligibilityCheckHistory(sequelize),
      AppointmentNotes: AppointmentNotes(sequelize),
      TreatmentPlanTemplate: TreatmentPlanTemplate(sequelize),
      TreatmentPlanTemplateDiagnosis: TreatmentPlanTemplateDiagnosis(sequelize),
      TreatmentPlanTemplateProblem: TreatmentPlanTemplateProblem(sequelize),
      TreatmentPlanTemplateBehavior: TreatmentPlanTemplateBehavior(sequelize),
      TreatmentPlanTemplateGoal: TreatmentPlanTemplateGoal(sequelize),
      TreatmentPlanTemplateObjective: TreatmentPlanTemplateObjective(sequelize),
      TreatmentPlanTemplateIntervention: TreatmentPlanTemplateIntervention(sequelize),
      Homework: Homework(sequelize),
      PaymentLogs: PaymentLogs(sequelize),
      PatientEncounterClaims: PatientEncounterClaims(sequelize),
      ClaimFileLogs: ClaimFileLogs(sequelize),
      Invoice: Invoice(sequelize),
      ReSubmitClaimEncounterBillingLog: ReSubmitClaimEncounterBillingLog(sequelize),
      VerifyCode: VerifyCode(sequelize),
      LoginLogs: LoginLogs(sequelize),
      EmailAudit: EmailAudit(sequelize),
      EncounterNote: EncounterNote(sequelize),
      EmailCampaignTemplate: EmailCampaignTemplate(sequelize),
      ProspectRegistration: ProspectRegistration(sequelize),
      EmailCampaignComposeMail: EmailCampaignComposeMail(sequelize),
      FormLinkProspect: FormLinkProspect(sequelize),
      OutOfOfficeSchedule: OutOfOfficeSchedule(sequelize),
      // ... initialize other models
    };
    defineAssociations(db);
  }
  // const db = {
  //   Role: Role(sequelize),
  //   Token: Token(sequelize),
  //   User: User(sequelize),
  //   PracticeLocation: PracticeLocation(sequelize),
  //   PracticeSetting: PracticeSetting(sequelize),
  //   PremissionModule: PremissionModule(sequelize),
  //   Patient: Patient(sequelize),
  //   PatientDocument: PatientDocument(sequelize),
  //   Diagnosis: Diagnosis(sequelize),
  //   DiagnosisProblem: DiagnosisProblem(sequelize),
  //   DiagnosisIcd: DiagnosisIcd(sequelize),
  //   Insurance: Insurance(sequelize),
  //   Staff: Staff(sequelize),
  //   Practice: Practice(sequelize),
  //   GlobalCategoryType: GlobalCategoryType(sequelize),
  //   GlobalType: GlobalType(sequelize),
  //   DatabaseConfig: DatabaseConfig(sequelize),
  //   Allergies: Allergies(sequelize),
  //   Chat: Chat(sequelize),
  //   Message: Message(sequelize),
  //   AllergiesReactions: AllergiesReactions(sequelize),
  //   File: File(sequelize),
  //   FamilyHistory: FamilyHistory(sequelize),
  //   SocialHistory: SocialHistory(sequelize),
  //   MedicalHistory: MedicalHistory(sequelize),
  //   Vitals: Vitals(sequelize),
  //   PatientMedication: PatientMedication(sequelize),
  //   MedicineData: MedicineData(sequelize),
  //   EmergencyContact: EmergencyContact(sequelize),
  //   Appointment: Appointment(sequelize),
  //   MedicineData: MedicineData(sequelize),
  //   GenericDrug: GenericDrug(sequelize),
  //   BrandNameDrug: BrandNameDrug(sequelize),
  //   RecurringSetting:RecurringSetting(sequelize),
  //   CronLog:CronLog(sequelize),
  //   MeetConfig:MeetConfig(sequelize),
  //   AppointmentPatient:AppointmentPatient(sequelize),
  //   Form:Form(sequelize),
  //   LinkedConsentForm:LinkedConsentForm(sequelize),
  //   PatientForm:PatientForm(sequelize),
  //   LinkedConsentFormPatient:LinkedConsentFormPatient(sequelize),
  //   PatientFormSubmission:PatientFormSubmission(sequelize),
  //   FaxContact:FaxContact(sequelize),
  //   FaxHistory:FaxHistory(sequelize),
  //   AllPatientHistory:AllPatientHistory(sequelize),
  //   LabsRadiology: LabsRadiology(sequelize),
  //   LaboratoryTest:LaboratoryTest(sequelize),
  //   TestingLab:TestingLab(sequelize),
  //   LabRadiologyLaboratoryTest:LabRadiologyLaboratoryTest(sequelize),
  //   PatientMedicationHistory:PatientMedicationHistory(sequelize),
  //   PatientMedicationItems:PatientMedicationItems(sequelize),
  //   PatientMedicationDiagnosis:PatientMedicationDiagnosis(sequelize),
  //   PatientMedicationItemsHistory:PatientMedicationItemsHistory(sequelize),
  //   PatientMedicationDiagnosisHistory:PatientMedicationDiagnosisHistory(sequelize),
  //   EmailTemplate: EmailTemplate(sequelize),
  //   FormEncounterTypes:FormEncounterTypes(sequelize),
  //   PatientEncounters:PatientEncounters(sequelize),
  //   PatientEncounterForm:PatientEncounterForm(sequelize),
  //   PatientEncounterBilling:PatientEncounterBilling(sequelize),
  //   PatientEncounterBillingIcdCode:PatientEncounterBillingIcdCode(sequelize),
  //   PatientEncounterBillingSnomedCtCode:PatientEncounterBillingSnomedCtCode(sequelize),
  //   PatientEncounterBillingProcedureCode:PatientEncounterBillingProcedureCode(sequelize),
  //   ProcedureCode:ProcedureCode(sequelize),
  //   DiagnosisSnomedCt:DiagnosisSnomedCt(sequelize),
  //   TreatmentPlan: TreatmentPlan(sequelize),
  //   TreatmentPlanDiagnosis: TreatmentPlanDiagnosis(sequelize),
  //   IcdProblem :IcdProblem(sequelize),
  //   ProblemBehavior : ProblemBehavior(sequelize),
  //   BehaviorGoal : BehaviorGoal(sequelize),
  //   GoalObjective :GoalObjective(sequelize),
  //   TreatmentPlanProblem:TreatmentPlanProblem(sequelize),
  //   TreatmentPlanBehavior:TreatmentPlanBehavior(sequelize),
  //   ObjectiveIntervention: ObjectiveIntervention(sequelize),
  //   TreatmentPlanGoal:TreatmentPlanGoal(sequelize),
  //   TreatmentPlanObjective:TreatmentPlanObjective(sequelize),
  //   TreatmentPlanIntervention:TreatmentPlanIntervention(sequelize),
  //   UserRole:UserRole(sequelize),
  //   LabReport:LabReport(sequelize),
  //   AppointmentForm: AppointmentForm(sequelize),
  //   Module: Module(sequelize),
  //   RoleAndModule: RoleAndModule(sequelize),
  //   RoleAndPermissions: RoleAndPermissions(sequelize),
  //   PermissionModule: PermissionModule(sequelize),
  //   Notification:Notification(sequelize),
  //   UserDevice:UserDevice(sequelize),
  //   MedicationSchedule: MedicationSchedule(sequelize),
  //   PatientMedicationItemMARLog:PatientMedicationItemMARLog(sequelize),
  //   StaffLocation: StaffLocation(sequelize),
  //   StaffBookingSetting:StaffBookingSetting(sequelize),
  //   CalendarSchedule:CalendarSchedule(sequelize),
  //   CalendarScheduleRecurringSetting:CalendarScheduleRecurringSetting(sequelize),
  //   ZoomSession:ZoomSession(sequelize),
  //   ZoomSessionInvite:ZoomSessionInvite(sequelize),
  //   MdToolbox:MdToolbox(sequelize),
  //   MdToolboxConfig: MdToolboxConfig(sequelize),
  //   PayerList:PayerList(sequelize),
  //   OfficeallyConfig: OfficeallyConfig(sequelize),
  //   EligibilityCheckHistory: EligibilityCheckHistory(sequelize),
  //   AppointmentNotes: AppointmentNotes(sequelize),
  //   TreatmentPlanTemplate :TreatmentPlanTemplate(sequelize),
  //   TreatmentPlanTemplateDiagnosis : TreatmentPlanTemplateDiagnosis(sequelize),
  //   TreatmentPlanTemplateProblem :  TreatmentPlanTemplateProblem(sequelize),
  //   TreatmentPlanTemplateBehavior : TreatmentPlanTemplateBehavior(sequelize),
  //   TreatmentPlanTemplateGoal     : TreatmentPlanTemplateGoal(sequelize),
  //   TreatmentPlanTemplateObjective :  TreatmentPlanTemplateObjective(sequelize),
  //   TreatmentPlanTemplateIntervention : TreatmentPlanTemplateIntervention(sequelize),
  //   // ... initialize other models
  // };
  // Invoke the defineAssociations function
  // defineAssociations(db);

  return db;
};

module.exports = {
  initializeModels,
};
