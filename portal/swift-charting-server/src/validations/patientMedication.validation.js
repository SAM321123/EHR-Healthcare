const Joi = require('joi');

const createPatientMedication = {
  body: Joi.object({
    prescriberId: Joi.number().required(),
    prescriptionDate: Joi.date().required(),
    patientEncounterId: Joi.number(),
    items: Joi.array()
      .items(
        Joi.object({
          genericDrug: Joi.string().required(),
          brandNameDrug: Joi.string().required(),
          doseFormCode: Joi.string().required(),
          amount: Joi.string().required(),
          unitCode: Joi.string().required(),
          routeCode: Joi.string().required(),
          routeOther: Joi.string().allow(''),
          frequencyCode: Joi.string().required(),
          frequencyOther: Joi.string().allow(''),
          directionCode: Joi.string().required(),
          directionOther: Joi.string().allow(''),
          durationAmount: Joi.string().required(),
          durationCode: Joi.string().required(),
          diagnoses: Joi.array()
            .items(
              Joi.object({
                id: Joi.number(),
                name: Joi.string(),
                description: Joi.string().allow(''),
                diagnosisProblemId: Joi.number(),
                isDeleted: Joi.boolean(),
                isActive: Joi.boolean(),
                createdById: Joi.number().allow(null),
                updatedById: Joi.number().allow(null),
                createdAt: Joi.date(),
                updatedAt: Joi.date(),
              })
            ),
          diagnosesOther: Joi.array(),
          quantity: Joi.string().required(),
          refill: Joi.string().allow(''),
          refillDate: Joi.date().allow(''),
          medicineStatusCode: Joi.string().required(),
          medicineStatusReason:Joi.string().allow(''),
          startDate: Joi.date().required(),
          dispenseAsWritten: Joi.boolean(),
          substitutions: Joi.boolean(),
          additionalInstruction: Joi.string().allow(''),
          patientSpecificInstructions: Joi.string().allow(''),
          allergiesWarnings: Joi.string().allow(''),
          additionalInstruction: Joi.string().allow(''),
          reasonForChanges: Joi.string().allow('')
        })
      )
      .required(),
    patientId: Joi.number().required(),
    signature: Joi.string().required(),
    clinicalNotes: Joi.string().allow(''),
  }),
};

const getPaitentMedication = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    doseCode: Joi.string(),
    searchText: Joi.string(),
    dose: Joi.string(),
    unit: Joi.string(),
    route: Joi.string(),
    frequency: Joi.string(),
    duration: Joi.string(),
    direction: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    patientEncounterId: Joi.number(),
  }),
};

const getPatientMedicationById = {
  params: Joi.object().keys({
    patientMedicationId: Joi.string().required(),
  }),
};

const updatePatientMedication = {
  params: Joi.object().keys({
    patientMedicationId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      prescriberId: Joi.number(),
      prescriptionDate: Joi.date(),
      patientEncounterId: Joi.number(),
      items: Joi.array().items(
        Joi.object({
          id:Joi.number(),
          genericDrug: Joi.string().required(),
          brandNameDrug: Joi.string().required(),
          doseFormCode: Joi.string().required(),
          amount: Joi.number().required(),
          unitCode: Joi.string().required(),
          routeCode: Joi.string().required(),
          routeOther: Joi.string().allow(''),
          frequencyCode: Joi.string().required(),
          frequencyOther: Joi.string().allow(''),
          directionCode: Joi.string().required(),
          directionOther: Joi.string().allow(''),
          durationAmount: Joi.number().required(),
          durationCode: Joi.string().required(),
          diagnoses: Joi.array()
            .items(
              Joi.object({
                id: Joi.number(),
                name: Joi.string(),
                description: Joi.string().allow(''),
                diagnosisProblemId: Joi.number(),
                isDeleted: Joi.boolean(),
                isActive: Joi.boolean(),
                createdById: Joi.number().allow(null),
                updatedById: Joi.number().allow(null),
                createdAt: Joi.date(),
                updatedAt: Joi.date(),
              })
            ),
          diagnosesOther: Joi.array(),
          quantity: Joi.string().required(),
          refill: Joi.number().allow('').allow(null),
          refillDate:Joi.date().allow(null),
          medicineStatusCode: Joi.string().required(),
          medicineStatusReason:Joi.string().allow(''),
          startDate: Joi.date().required(),
          dispenseAsWritten: Joi.boolean(),
          substitutions: Joi.boolean(),
          additionalInstruction: Joi.string().allow(''),
          allergiesWarnings: Joi.string().allow(''),
          patientSpecificInstructions: Joi.string().allow(''),
          discontinueDate:Joi.date().allow(null),
          reasonForChanges: Joi.string().allow('')
        })
      ),
      patientId: Joi.number(),
      signature: Joi.string().required(),
      clinicalNotes: Joi.string().allow(''),
    })
    .min(1),
};

const sharePatientMedication = {
  params: Joi.object().keys({
    patientMedicationId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    sharedWith: Joi.string(),
    faxContactId: Joi.number().integer(),
    faxType: Joi.string(),
    shareOn: Joi.string(),
    faxEmail: Joi.string(),
  }),
};

module.exports = {
  createPatientMedication,
  getPaitentMedication,
  getPatientMedicationById,
  updatePatientMedication,
  sharePatientMedication,
};
