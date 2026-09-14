const { getModels } = require('../utils/connection');
const { sendEmail } = require('./email.service');
const dbService = require('./db.service');
const faxHistoryService = require('./faxHistory.service');
const { getPracticeSettingsConfig } = require('./practiceSetting.service');
const { createPatientMedicationPDF, generateHTMLTemplate } = require('./pdfService/patientLabRadiologyRequestPdf.service');
const { createPatientReportPDF, generateReportHTMLTemplate } = require('./pdfService/patientLabRadiologyReportPdf.service');
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
    as: 'provider'
  },
  { model: db.TestingLab, 
    as: 'testingLabs' 
  },
  { model: db.PracticeLocation, 
    as: 'sendingFacility' 
  },
  { model: db.DiagnosisIcd, 
    as: 'diagnosisIcd', 
    include: [
        {
          model: db.DiagnosisProblem,
          as: 'diagnosisProblem',
        },
      ],
  },
  { model: db.GlobalType, 
    as: 'payerInfo' 
  },
  { model: db.LaboratoryTest, 
    as: 'laboratoryTests' 
  },
];


const createPatientLabRequestEmailTemplate = async({patientLabRadiologyData,practiceSetting,template})=>{
    const emailContent = await generateHTMLTemplate({patientLabRadiologyData,isEmail:true, practiceSetting,template});
    return emailContent;
}
const createPatientLabReportEmailTemplate = async({patientLabRadiologyData,resultData, practiceSetting,template})=>{
    const emailContent = await generateReportHTMLTemplate({patientLabRadiologyData, resultData, isEmail:true, practiceSetting,template});
    return emailContent;
}
const sharePatientLabRadiology = async (labRadiologyId, shareBody, { tenantId }) => {
  const db = getModels(tenantId);
  const { sharedWith, faxType, faxContactId,shareOn,faxEmail, share } = shareBody;

  const patientLabRadiologyData = await dbService.getOne({
    model: db.LabsRadiology,
    filter: { where: { id: labRadiologyId } },
    include: includeOptions(db),
  });

  const practiceSetting = await getPracticeSettingsConfig({ tenantId });

  const doc = await dbService.updateById({
    model: db.LabsRadiology,
    reqParams: { id: labRadiologyId, sharedWith },
  });
  if(share === 'labRequest' || share === 'both'){
      const emailContent =await createPatientLabRequestEmailTemplate({practiceSetting,patientLabRadiologyData,template:shareMedicationTemplate});
      const pdfContent = await createPatientMedicationPDF({patientLabRadiologyData,practiceSetting})
      if (sharedWith === 'other' ) {
    
        if(['fax_only','fax_email'].includes(shareOn)){
          await faxHistoryService.createFaxHistory({ labRadiologyId, faxType, faxContactId }, {  tenantId,pdfContent });
        }
        if(['email_only','fax_email'].includes(shareOn)){
          await dbService.updateById({model:db.FaxContact,reqParams:{id:faxContactId,email:faxEmail}})
          await sendEmail({uuid: tenantId, to:faxEmail,subject:'Lab Request',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
            filename: pdfContent.filename,
            content: pdfContent.pdfBufferData
        }]});
        }
      }else{
      await sendEmail({uuid: tenantId,to:patientLabRadiologyData?.patient?.email,subject:'Lab Request',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
        filename: pdfContent.filename,
        content: pdfContent.pdfBufferData
    }]});
      }
  }
  if(share === 'labResult' || share === 'both'){

    const result = await dbService.getOne({
        model: db.LabReport,
        filter: { where: { labRadiologyId: patientLabRadiologyData?.id } },
      });
    
    const resultData = result?.labResult
      
    const emailContent =await createPatientLabReportEmailTemplate({practiceSetting,patientLabRadiologyData,resultData, template:shareMedicationTemplate});
    const pdfContent = await createPatientReportPDF({patientLabRadiologyData,resultData,practiceSetting})
    if (sharedWith === 'other' ) {
  
      if(['fax_only','fax_email'].includes(shareOn)){
        await faxHistoryService.createFaxHistory({ labRadiologyId, faxType, faxContactId }, {  tenantId,pdfContent });
      }
      if(['email_only','fax_email'].includes(shareOn)){
        await dbService.updateById({model:db.FaxContact,reqParams:{id:faxContactId,email:faxEmail}})
        await sendEmail({uuid: tenantId,to:faxEmail,subject:'Lab Report',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
          filename: pdfContent.filename,
          content: pdfContent.pdfBufferData
      }]});
      }
    }else{
    await sendEmail({uuid: tenantId,to:patientLabRadiologyData?.patient?.email,subject:'Lab Report',html:emailContent.template,attachments:[...(emailContent?.attachments||[]),{
      filename: pdfContent.filename,
      content: pdfContent.pdfBufferData
  }]});
    }
}
  
  return doc;
};

const getPatientMedicationById = async(patientMedicationId,{tenantId})=>{
    const db = getModels(tenantId);
    const result = await dbService.getOneById({ model: db.PatientMedication, id: patientMedicationId,include:includeOptions(db),order: [
      [ {model:db.PatientMedicationHistory,as:'patientMedicationHistory'}, 'id', 'DESC' ], 
      [ {model:db.PatientMedicationItems,as:'items'}, 'id', 'ASC' ], 
    ]});
    return result;

}
module.exports = {
  sharePatientLabRadiology,
  getPatientMedicationById,
};
