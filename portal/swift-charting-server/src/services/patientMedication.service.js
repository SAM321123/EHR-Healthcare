const { getModels } = require('../utils/connection');
const { sendEmail } = require('./email.service');
const dbService = require('./db.service');
const faxHistoryService = require('./faxHistory.service');
const { getPracticeSettingsConfig } = require('./practiceSetting.service');
const { createPatientMedicationPDF, generateHTMLTemplate } = require('./pdfService/patientMedicationPdf.service');
const { shareMedicationTemplate } = require('../config/defaultTemplates');
const { Sequelize } = require('sequelize');

const includeOptions = (db) => [
  {
    model: db.Patient,
    as: 'patient',
    include:[{model:db.GlobalType,as:'title'},
      {model:db.GlobalType,as:'sexAtBirth'},
      { model: db.Allergies, as: 'allergies', required: false },{
      model: db.Diagnosis,
      as: 'problems',
      where: {
        isDeleted: false,
      },
      include: [
        {
          model: db.DiagnosisProblem,
          as: 'problem',
        },
      ],
      required: false,
    },],
  },
  {
    model: db.Staff,
    as: 'prescriber',
  },
  {
    model: db.PatientMedicationItems,
    as: 'items',
    include: [
      {
        model: db.GlobalType,
        as: 'doseForm',
      },
      {
        model: db.GlobalType,
        as: 'unit',
      },
      {
        model: db.GlobalType,
        as: 'route',
      },
      {
        model: db.GlobalType,
        as: 'frequency',
      },
      {
        model: db.GlobalType,
        as: 'duration',
      },
      {
        model: db.GlobalType,
        as: 'direction',
      },
      {
        model: db.GlobalType,
        as: 'medicineStatus',
      },
      {
        model: db.PatientMedicationDiagnosis,
        as: 'diagnoses',
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'icd',
          },
        ],
      },
    ],
  },
  {
    model: db.PatientMedicationHistory,
    as: 'patientMedicationHistory',
    include: [
      {
        model: db.Patient,
        as: 'patient',
      },
      {
        model: db.Staff,
        as: 'prescriber',
      },
      {
        model: db.Staff,
        as: 'prescribedBy',
      },
      {
        model: db.Staff,
        as: 'revisedBy',
      },
      {
        model: db.PatientMedicationItemsHistory,
        as: 'items',
        include: [
          {
            model: db.GlobalType,
            as: 'doseForm',
          },
          {
            model: db.GlobalType,
            as: 'unit',
          },
          {
            model: db.GlobalType,
            as: 'route',
          },
          {
            model: db.GlobalType,
            as: 'frequency',
          },
          {
            model: db.GlobalType,
            as: 'duration',
          },
          {
            model: db.GlobalType,
            as: 'direction',
          },
          {
            model: db.GlobalType,
            as: 'medicineStatus',
          },
          {
            model: db.PatientMedicationDiagnosisHistory,
            as: 'diagnoses',
            include: [
              {
                model: db.DiagnosisIcd,
                as: 'icd',
              },
            ],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']], // Order by createdAt in ascending order
  },
];


const createPatientMedicationEmailTemplate = async({patientMedicationData,practiceSetting,template})=>{
    const emailContent = await generateHTMLTemplate({patientMedicationData,isEmail:true, practiceSetting,template});
    return emailContent;
}
const sharePatientMedication = async (patientMedicationId, shareBody, { tenantId }) => {
  const db = getModels(tenantId);
  const { sharedWith, faxType, faxContactId,shareOn,faxEmail } = shareBody;

  const patientMedicationData = await dbService.getOne({
    model: db.PatientMedication,
    filter: { where: { id: patientMedicationId } },
    include: includeOptions(db),
  });
  const practiceSetting = await getPracticeSettingsConfig({ tenantId });

  const doc = await dbService.updateById({
    model: db.PatientMedication,
    reqParams: { id: patientMedicationId, sharedWith },
  });
  const emailContent =await createPatientMedicationEmailTemplate({practiceSetting,patientMedicationData,template:shareMedicationTemplate});
  const pdfContent = await createPatientMedicationPDF({patientMedicationData,practiceSetting});

  const sendPatientEmail = async (to) => {
    await sendEmail({
      uuid:tenantId,
      to,
      subject: "New Medication Shared",
      html: emailContent.template,
      attachments: [
        ...(emailContent?.attachments || []),
        { filename: pdfContent.filename, content: pdfContent.pdfBufferData },
      ],
    });
  };

  if (sharedWith === 'other' ) {

    if(['fax_only','fax_email'].includes(shareOn)){
      await faxHistoryService.createFaxHistory({ patientMedicationId, faxType, faxContactId }, {  tenantId,pdfContent });
    }
    if(['email_only','fax_email'].includes(shareOn)){
      await dbService.updateById({model:db.FaxContact,reqParams:{id:faxContactId,email:faxEmail}})
      await sendPatientEmail(faxEmail);
    }
  }else{
   if (patientMedicationData?.patient?.email) {
      await sendPatientEmail(patientMedicationData.patient.email);
    }
  }
  return doc;
};

const getPatientMedicationById = async(patientMedicationId,{tenantId})=>{
    const db = getModels(tenantId);
    const result = await dbService.getOneById({ model: db.PatientMedication, id: patientMedicationId,include:includeOptions(db),order: [
      // sort by the 'order' column in Gallery model, in descending order.
  
      [ {model:db.PatientMedicationHistory,as:'patientMedicationHistory'}, 'id', 'DESC' ], 
      [ {model:db.PatientMedicationItems,as:'items'}, 'id', 'ASC' ], 
    ]});
    return result;

}

const getPatientMedicationByPatientId = async(patientId,{tenantId})=>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({
    model: db.PatientMedication,
    where: { patientId },  // Use 'where' clause to filter by patientId
    include: includeOptions(db),
    order: [
      [{ model: db.PatientMedicationHistory, as: 'patientMedicationHistory' }, 'id', 'DESC'],
      [{ model: db.PatientMedicationItems, as: 'items' }, 'id', 'ASC'],
    ],
  });
  return result;
}

const getPatientDetails = async(patientId,{tenantId})=>{
  const db = getModels(tenantId);
  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  return patient;
}
module.exports = {
  sharePatientMedication,
  getPatientMedicationById,
  getPatientMedicationByPatientId,
  getPatientDetails,
};
