const { getModels } = require('../utils/connection');
const { sendEmail } = require('./email.service');
const dbService = require('./db.service');
const faxHistoryService = require('./faxHistory.service');
const { getPracticeSettingsConfig } = require('./practiceSetting.service');
const { createPatientMedicationPDF, generateHTMLTemplate } = require('./pdfService/patientLabRadiologyRequestPdf.service');
const { shareMedicationTemplate } = require('../config/defaultTemplates');
const { Sequelize } = require('sequelize');

const includeOptions = (db) => [
  {
    model: db.PatientMedication,
    as: 'medication',
    include: [
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
          include: [
            {
              model: db.GlobalType,
              as: 'title',
            }
          ]
        },
    ]
  },
  {
    model: db.PatientMedicationItemMARLog,
    as: 'marLogs',
    include: [
      {
        model: db.Staff,
        as: 'clinician',
        include: [
          {
            model: db.GlobalType,
            as: 'title',
          }
        ]
      },
      {
        model: db.GlobalType,
        as: 'action'
      }
    ]
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
        include: [
          {
            model: db.DiagnosisProblem,
            as: 'diagnosisProblem' 
          }
        ]
      },
    ],
  },
];


const inscludeOptionsForAllMedications = (db) => [
  {
    model: db.PatientMedicationItems,
    as: 'items',
    include: [
      {
        model: db.PatientMedicationItemMARLog,
        as: 'marLogs',
        require: true,
        include: [
          {
            model: db.Staff,
            as: 'clinician',
            include: [
              {
                model: db.GlobalType,
                as: 'title',
              }
            ]
          },
          {
            model: db.GlobalType,
            as: 'action'
          }
        ]
      }
    ]
  },
  {
    model: db.Staff,
    as: 'prescriber',
  },
]

const sharePatientMarLog = async (marLogId, shareBody, { tenantId }) => {
  const db = getModels(tenantId);
  const { sharedWith, faxType, faxContactId,shareOn,faxEmail, share } = shareBody;

  const patientMARData = await dbService.getOne({
    model: db.PatientMedicationItemMARLog,
    filter: { where: { id: marLogId } },
    include: includeOptions(db),
  });

  const practiceSetting = await getPracticeSettingsConfig({ tenantId });

  const doc = await dbService.updateById({
    model: db.PatientMedicationItemMARLog,
    reqParams: { id: marLogId, sharedWith },
  });
    
  const emailContent =await createPatientMedicationMARLogEmailTemplate({practiceSetting,patientMARData,template:shareMedicationTemplate});
  const pdfContent = await createPatientMedicationPDF({patientMARData,practiceSetting})
  if (sharedWith === 'other' ) {  
    if(['fax_only','fax_email'].includes(shareOn)){
    await faxHistoryService.createFaxHistory({ marLogId, faxType, faxContactId }, {  tenantId,pdfContent });
    }
    if(['email_only','fax_email'].includes(shareOn)){
    await dbService.updateById({model:db.FaxContact,reqParams:{id:faxContactId,email:faxEmail}})
    await sendEmail({uuid:tenantId ,to:faxEmail,subject:'EMAR',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
        filename: pdfContent.filename,
        content: pdfContent.pdfBufferData
    }]});
    }
  }else{
    await sendEmail({uuid: tenantId,to:patientMARData?.patient?.email,subject:'EMAR',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
        filename: pdfContent.filename,
        content: pdfContent.pdfBufferData
    }]});
  }
  return doc;
};

const getPatientMedicationItemById = async(patientMedicationItemId,{tenantId})=>{
    const db = getModels(tenantId);
    const result = await dbService.getOneById({ 
        model: db.PatientMedicationItems, 
        id: patientMedicationItemId,
        include:includeOptions(db),
    });
    return result;

}

const getPatientMedications = async(patientId,{tenantId})=>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({ 
      model: db.PatientMedication, 
      filter: { where: {patientId}},
      otherOptions: { include:inscludeOptionsForAllMedications(db) },
  });
  return result;

}

const getPatientMedicationById = async(medicationId,{tenantId})=>{
  const db = getModels(tenantId);
  const result = await dbService.getAll({ 
      model: db.PatientMedication, 
      filter: { where: {id: medicationId}},
      otherOptions: { include:inscludeOptionsForAllMedications(db) },
  });
  return result;

}

const getPatientById = async(patientId, {tenantId}) => {
  const db = getModels(tenantId);
    const result = await dbService.getOneById({ 
        model: db.Patient, 
        id: patientId,
    });
    return result;
}

module.exports = {
  sharePatientMarLog,
  getPatientById,
  getPatientMedicationItemById,
  getPatientMedications,
  getPatientMedicationById,
};
