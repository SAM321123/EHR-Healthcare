const { sequelize } = require('../src/config/database');
const { errorMessages } = require('../src/config/error');
const { initializeModels } = require('../src/models');
const { raceCode } = require('./mastersData/raceCode');
const { allergyReactions } = require('./mastersData/allergyReactions');
const { allergySeverities } = require('./mastersData/allergySeverities');
const { appointmentType } = require('./mastersData/appointmentType');
const { diagnosisStatus } = require('./mastersData/diagnosisStatus');
const { diagnosisType } = require('./mastersData/diagnosisType');
const { directionData } = require('./mastersData/directionData');
const { doseData } = require('./mastersData/doseData');
const { durationData } = require('./mastersData/durationData');
const { familyCondition } = require('./mastersData/familyConditions');
const { familyRelation } = require('./mastersData/familyRelation');
const { formType } = require('./mastersData/formType');
const { frequencyData } = require('./mastersData/frequencyData');
const { genders } = require('./mastersData/genders');
const { gendersAtBirth } = require('./mastersData/gendersAtBirth');
const { insurancePolicyHolder } = require('./mastersData/insurancePolicyHolder');
const { maritalStatus } = require('./mastersData/maritalStatus');
const { namePrefixes } = require('./mastersData/namePrefixes');
const { pronouns } = require('./mastersData/pronouns');
const { routeData } = require('./mastersData/routeData');
const { sexualOrientation } = require('./mastersData/sexualOrientation');
const { statusCode } = require('./mastersData/statusCodes');
const { occupations } = require('./mastersData/occupations');
const { religions } = require('./mastersData/religions');
const { financialResponsibilityParty } = require('./mastersData/financialResponsibilityParty');
const { socialHistoryCode } = require('./mastersData/socialHistory');
const { unitData } = require('./mastersData/unitData');
const { contactMethods } = require('./mastersData/contactMethods');
const { appointmentStatus } = require('./mastersData/appointmentStatus');
const { appointmentCopay } = require('./mastersData/appointmentCopay');
const { formCategories } = require('./mastersData/formCategories');
const { hl7Versions } = require('./mastersData/hl7Versions');
const { specimenTypes } = require('./mastersData/specimenTypes');
const { doseFormData } = require('./mastersData/doseFormData');
const { emailType } = require('./mastersData/emailType');
const { encounterType } = require('./mastersData/encounterType');
const { soapNoteTemplates } = require('./mastersData/soapNoteTemplates');
const { emergencyContactRelation } = require('./mastersData/emergencyContactRelation');
const { billingType } = require('./mastersData/billingType');
const { billingStatus } = require('./mastersData/billingStatus');
const { treatmentPlanStatus } = require('./mastersData/treatmentPlan/treatmentPlanStatus');
const { permissions } = require('./mastersData/permissions');
const { patientDocumentTypeData } = require('./mastersData/patientDocumentType');
const { medicationActions } = require('./mastersData/medicationActions');
const { medicationStatusType } = require('./mastersData/medicationStatusType');
const { marLogAction } = require('./mastersData/marLogAction');
const {appointmentConfirmation} = require('./mastersData/appointmentConfirmation');
const {appointmentInterval} = require('./mastersData/appointmentInterval');
const {leadDays} = require('./mastersData/leadDays');
const {leadInterval} = require('./mastersData/leadInterval');
const {erxStatus} = require('./mastersData/erxStatus');
const {homeworkStatus} = require('./mastersData/homeworkStatus');
const {generalClaimStatus} = require('./mastersData/generalClaimStatus');
const {treatmentPlanLabels} = require('./mastersData/treatmentPlan/treatmentPlanLabel');
const { subscriptionCancelReason } = require('./mastersData/subscriptionCancelReason');




const mastersData = [
  ...appointmentType,
  ...genders,
  ...gendersAtBirth,
  ...namePrefixes,
  ...sexualOrientation,
  ...insurancePolicyHolder,
  ...pronouns,
  ...maritalStatus,
  ...allergyReactions,
  ...allergySeverities,
  ...diagnosisType,
  ...diagnosisStatus,
  ...familyRelation,
  ...familyCondition,
  ...statusCode,
  ...raceCode,
  ...occupations,
  ...religions,
  ...financialResponsibilityParty,
  ...socialHistoryCode,
  ...formType,
  ...formCategories,
  ...doseData,
  ...unitData,
  ...routeData,
  ...frequencyData,
  ...directionData,
  ...durationData,
  ...contactMethods,
  ...appointmentStatus,
  ...appointmentCopay,
  ...hl7Versions,
  ...specimenTypes,
  ...doseFormData,
  ...emailType,
  ...encounterType,
  ...soapNoteTemplates,
  ...emergencyContactRelation,
  ...billingType,
  ...billingStatus,
  ...treatmentPlanStatus,
  ...permissions,
  ...patientDocumentTypeData,
  ...medicationActions,
  ...medicationStatusType,
  ...marLogAction,
  ...appointmentConfirmation,
  ...appointmentInterval,
  ...leadDays,
  ...leadInterval,
  ...erxStatus,
  ...homeworkStatus,
  ...generalClaimStatus,
  ...treatmentPlanLabels,
  ...subscriptionCancelReason,
];

const createGlobalTypeFixtures = async () => {
  const masterDB = initializeModels(sequelize);
  try {
    for (const master of mastersData) {
      await masterDB.GlobalType.upsert({ ...master });
    }
  } catch (err) {
    if (err.message.indexOf(errorMessages.DUPLICATE_RECORD) < 0) {
      throw err;
    }
  }
};

module.exports = { createGlobalTypeFixtures, mastersData };
