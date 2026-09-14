const dbService  = require("./db.service");
const { getModels } = require("../utils/connection");
const  formService  = require("./form.service");
const faxHistoryService = require("./faxHistory.service");
const { getPracticeSettingsConfig } = require("./practiceSetting.service");
const { getOrganizationLogo } = require("./emailTemplate.service");
const { getFullName, decodeHtml, getDynamicTemplate } = require("../utils");
const { sharedFormTemplate } = require("../config/defaultTemplates");
const { sendEmail } = require("./email.service");
const logger = require("../config/logger");
const config = require("../config/config");
const { UI_URLS } = require("../utils/constant");
const ApiError = require("../utils/ApiError");
const { createPatientFormPDF } = require("./pdfService/patientFormPdf.service");
const { encrypt } = require("../utils/encryption");

const PUBLIC_PATIENT_FORM_TYPES = new Set(['FT_QUESTIONNAIRES', 'FT_CONSENT_FORMS']);

const includeOptions = (db)=>[
  {model:db.Patient,as:'patient'},
  {model:db.Staff,as:'practitioner'},
  {model:db.PatientFormSubmission,as:'patientFormSubmission'},
  {model:db.User,as:'sharedBy'}, 
  // {model:db.Staff,as:'sharedBy'}, 
  {
  model: db.PatientForm,
  as: 'linkedPatientForms',
  include:[{
    model:db.Patient,as:'patient'},
    {model:db.Staff,as:'practitioner'},
    {model:db.PatientFormSubmission,as:'patientFormSubmission'},
    {model:db.User,as:'sharedBy'},
    // {model:db.Staff,as:'sharedBy'}
  ]
},];

const getPatientFormById = async (patientFormId,{tenantId})=>{
  const db = getModels(tenantId);
  const result = await dbService.getOneById({model:db.PatientForm,id:patientFormId,include:includeOptions(db)});
  return result;
}

const isPatientFormPubliclyAccessible = (patientForm) =>
  PUBLIC_PATIENT_FORM_TYPES.has(patientForm?.formData?.formTypeCode);

const getPublicPatientFormById = async (patientFormId, { tenantId }) => {
  const patientForm = await getPatientFormById(patientFormId, { tenantId });

  if (!isPatientFormPubliclyAccessible(patientForm)) {
    return null;
  }

  return patientForm;
};

const createPatientForm = async(patientFormBody,{user,tenantId})=>{
    const db = getModels(tenantId);
    const {id:userId} = user || {};
    const { formId } = patientFormBody || {};
    const formData = await formService.getFormById(formId,{tenantId});
    const createdLinkedConsentFormsId = [];
    const linkedConsentForms = await formData.getLinkedConsentForms({
        include: [{ model: db.GlobalType, as: 'formCategory' },
            { model: db.GlobalType, as: 'formType' },]
      });
    if(linkedConsentForms && linkedConsentForms.length){
        const linkedConsentFormsData = linkedConsentForms.map(item=>{
            return {
                ...patientFormBody,
                formData: item,
                isLinkedForm: true,
                formId: item.id,
            }
        })
       const createdLinkedConsentForms= await dbService.createBulk({model:db.PatientForm,reqParams:linkedConsentFormsData});
       createdLinkedConsentForms.forEach(item=>{
        createdLinkedConsentFormsId.push(item.id)
       })
    }
    Object.assign(patientFormBody, { formData,createdById:userId });
    const patientForm = await dbService.createOne({model:db.PatientForm,reqParams:patientFormBody});
    if(createdLinkedConsentFormsId.length){
        patientForm.setLinkedPatientForms(createdLinkedConsentFormsId)
    }
    return patientForm;
}


const sendEmailOnPatientFormShare = async ({uuid, patientForm, patient, sharedBy, practitioner,practiceSetting,addOnAttachment}) => {
    // try {
      const { email,id:patientId } = patient || {};
      const encryptedPatientId= encrypt(String(patientId));
      const { clientURL } = config;
      const patientName  = getFullName(patient) || '';
      let sharedByName = getFullName(sharedBy);
      let { name: practiceName = '' } = practiceSetting.practiceSetting || {};
      const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};


      const formURL = `${clientURL}/patient/detail/${encryptedPatientId}/${UI_URLS.patientForm}/Note%20Templates/${patientForm.id}`;
      const formName = patientForm?.formData?.name || '';

        let subject = `New Form Shared`;
        let template =sharedFormTemplate
        template = decodeHtml(template);
        if (!subject || !template) {
          throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, errorMessages.INVALID('template or subject'));
        }
        let practitionerName = getFullName(practitioner);
         const params = {
          clientURL,
          practitionerName,
          practiceName,
          patientName,
          formURL,
          formName,
          sharedByName,
          logo,
        };
        if (subject && template) {
          subject = getDynamicTemplate({ text: subject, params });
          template = getDynamicTemplate({ text: template, params });
        }
        sendEmail({uuid, to: email, subject, html: template , attachments: [practiceLogoAttechment,addOnAttachment]});
    // } catch (err) {
    //   logger.error(err);
    // }
  };

const shareNoteTemplate = async (patientFormId,shareBody,{user,tenantId}) => {
    const db = getModels(tenantId);
    const {sharedWith, faxType, faxContactId,shareOn,faxEmail} =shareBody; 
    const practiceSetting = await getPracticeSettingsConfig({tenantId})
    const patientFormData = await getPatientFormById(patientFormId,{tenantId});
    const doc = await dbService.updateById({model:db.PatientForm,reqParams:{id:patientFormId,sharedWith}});
  const pdfContent = await createPatientFormPDF({patientFormData,practiceSetting})
    if(sharedWith === 'other'){
        await faxHistoryService.createFaxHistory({patientFormId, faxType, faxContactId},{pdfContent,tenantId});
    }else{
        const patientFormData = await getPatientFormById(patientFormId,{tenantId});
        const {patient:patientData,sharedBy,practitioner:practitionerData} = patientFormData || {};
        await sendEmailOnPatientFormShare({
          uuid: tenantId,
          patientForm: patientFormData,
          patient: patientData,
          sharedBy,
          practitioner: practitionerData,
          practiceSetting,
          addOnAttachment :{
            filename: pdfContent.filename,
            content: pdfContent.pdfBufferData
        }
        });
    }
    return doc;
  };

  const updatePatientFormById = async (patientFormId, patientFormBody,{tenantId}) => {
    const db = getModels(tenantId);
    const form = await dbService.updateOne({
      model: db.PatientForm,
      updateParams: { ...patientFormBody },
      filter: {  where: {id: patientFormId} },
    });
    return form;
  };

module.exports={
    createPatientForm,
    shareNoteTemplate,
    getPatientFormById,
    getPublicPatientFormById,
    isPatientFormPubliclyAccessible,
    updatePatientFormById,
}
