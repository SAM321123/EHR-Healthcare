const dbService = require('./db.service');
const { genralStatus, capitalize, getFormType, isSignatureRequired } = require('../utils');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');
const ApiError = require('../utils/ApiError');
const { roles } = require("../config/roles");
const  patientFormService  = require('./patientForm.service');
const httpStatus = require('http-status');

// const createPatientFormSubmission = async (patientFormSubmissionBody, { tenantId }) => {
//   const db = getModels(tenantId);
//   const { patientFormId, response, isPosted, submittedBy, submittedByRole, signature } = patientFormSubmissionBody || {};
//   let status = isPosted ? genralStatus.COMPLETE : genralStatus.PARTIAL;
//   let submissionId;
//   let updatedResponse = { status, response, partialResponse: null };
//   let hasLinkedForm = false;
//   let hasParentForm = false;
//   let isConsentForm = false;
//   let isQuestionnaireForm = false;
//   const patientFormData = await dbService.getOneById({
//     model: db.PatientForm,
//     id: patientFormId,
//     include: [
//       { model: db.PatientFormSubmission, as: 'patientFormSubmission' },
//       { model: db.PatientForm, as: 'linkedPatientForms' },
//       { model: db.Patient, as: 'patient' },
//       { model: db.Staff, as: 'practitioner' },
//     ],
//   });

//   if (patientFormData?.patientId !== submittedBy || submittedByRole !== roles.PATIENT) {
//     throw new ApiError(errorMessages.NOT_AUTHORIZED);
//   }

//   const { patientFormSubmission: patientFormSubmissionOld, linkedPatientForms } = patientFormData || {};
//   const { formTypeCode } = patientFormData.formData;
//   // console.log('linked form linked ', linkedPatientForms?.length)
//   if(formTypeCode === 'FT_QUESTIONNAIRES'){
//     isQuestionnaireForm = true;  
//   }

//   if(formTypeCode === 'FT_CONSENT_FORMS'){
//     isConsentForm = true;
//   }

//   if(isQuestionnaireForm){
//     hasLinkedForm = linkedPatientForms?.length>0;
//     if(hasLinkedForm){
//       const allLinkedFormsComplete = linkedPatientForms.every(linkForm => linkForm?.status === 'Complete');
      
//     }


//   }

//   if(isConsentForm){
//     hasParentForm = parentFormData?.isLinkedForm; 
//   }
  
 

//   const handleLinkedForms = async () => {
//     if (!patientFormData?.isLinkedForm || status !== genralStatus.COMPLETE) return null;

//     const linkedFormParentForm = await dbService.getOneById({
//       model: db.PatientForm,
//       id: patientFormId,
//       include: [
//         {
//           model: db.PatientForm, as: 'questionnaires',
//           include: [
//             { model: db.PatientForm, as: 'linkedPatientForms' },
//             { model: db.PatientFormSubmission, as: 'patientFormSubmission' },
//           ],
//         },
//       ],
//     });
//     console.log('-------------------------------- linked parent form ------------>', linkedFormParentForm, linkedFormParentForm?.questionnaires[0])
//     const parentFormData = linkedFormParentForm?.questionnaires[0];
//     const parentSubmissionFormData = parentFormData?.patientFormSubmission;
//     const parentLinkedForms = parentFormData?.linkedPatientForms || [];
    
//     const allLinkedFormsComplete = parentLinkedForms
//       .filter(linkForm => linkForm.id !== patientFormId)
//       .every(linkForm => linkForm?.status === 'Complete');
//     console.log('all lonked forms complere---------------------------------->', allLinkedFormsComplete)
//     return {
//       updateParent: allLinkedFormsComplete,
//       parentFormData,
//       parentSubmissionFormData,
//     };
//   };

//   let updateHasPractitionerSignaturePending = false;

//   if (formTypeCode === 'FT_CONSENT_FORMS' && status === genralStatus.COMPLETE) {
//     if (isSignatureRequired(patientFormData, submittedByRole) && !signature) {
//       throw new ApiError(errorMessages.SIGNATURE_REQUIRED);
//     }
//     updateHasPractitionerSignaturePending = patientFormData?.formData?.enablePractitionerSignature;
//   }

//   if (signature) {
//     updatedResponse.patientSignature = { signature, date: new Date() };
//   }

//   if (formTypeCode === 'FT_QUESTIONNAIRES') {
//     const allLinkedFormsComplete = linkedPatientForms.every(linkForm => linkForm?.status === 'Complete');
//     status = allLinkedFormsComplete ? status : genralStatus.PARTIAL;
    
//     if (status === genralStatus.COMPLETE && allLinkedFormsComplete) {
//       updateHasPractitionerSignaturePending = linkedPatientForms.some(linkForm =>  linkForm?.formData?.enablePractitionerSignature);
//     }

//     updatedResponse = allLinkedFormsComplete
//       ? { patientFormId: patientFormData?.id, status, response, partialResponse: null }
//       : { patientFormId: patientFormData?.id, status: genralStatus.PARTIAL, response: null, partialResponse: response };
//   }
//   let updateParent;
//   let parentFormData;
//   let parentSubmissionFormData;

//   if(status === genralStatus?.COMPLETE){
//     parentData = await handleLinkedForms();
//     updateParent = parentData?.updateParent;
//     parentFormData = parentData?.parentFormData;
//     parentSubmissionFormData = parentData?.parentSubmissionFormData;
//   } 

//   if (patientFormSubmissionOld) {
//     if (patientFormSubmissionOld?.response) throw new ApiError(errorMessages.ALREADY_SUBMITTED);
    
//     const updatePayload = isPosted
//       ? updatedResponse
//       : { patientFormId: patientFormData?.id, status, partialResponse: response, response: null };

//     await dbService.updateById({
//       model: db.PatientFormSubmission,
//       reqParams: { id: patientFormSubmissionOld?.id, ...updatePayload },
//     });

//     if (updateParent) {
//       await dbService.updateById({
//         model: db.PatientFormSubmission,
//         reqParams: {
//           id: parentFormData?.patientFormSubmissionId,
//           response: parentSubmissionFormData?.partialResponse,
//           partialResponse: null,
//           status: parentSubmissionFormData?.partialResponse ? genralStatus.COMPLETE : genralStatus.PARTIAL,
//         },
//       });
//     }
//   } else {
//     const createPayload = isPosted
//       ? updatedResponse
//       : { patientFormId: patientFormData?.id, status, partialResponse: response, response: null };
    
//     const patientFormSubmission = await dbService.createOne({
//       model: db.PatientFormSubmission,
//       reqParams: createPayload,
//     });

//     submissionId = patientFormSubmission?.id;
//   }

//   await dbService.updateById({
//     model: db.PatientForm,
//     reqParams: { id: patientFormId, patientFormSubmissionId: submissionId, status, hasPendingPractitionerSignature: updateHasPractitionerSignaturePending },
//   });

//   if (updateParent) {
//     await dbService.updateById({
//       model: db.PatientForm,
//       reqParams: { id: parentFormData?.id, status: parentSubmissionFormData?.response ? genralStatus.COMPLETE : genralStatus.PARTIAL, hasPendingPractitionerSignature: updateHasPractitionerSignaturePending },
//     });
//   }

//   return 'Created';
// };

const createPatientFormSubmission = async (patientFormSubmissionBody, { tenantId, allowPublicAccess = false }) => {
  const db = getModels(tenantId);
  const { patientFormId, response, isPosted, submittedBy, submittedByRole, signature } = patientFormSubmissionBody || {};
  let status = isPosted ? genralStatus.COMPLETE : genralStatus.PARTIAL;
  let submissionId;
  let updatedResponse = { status, response, partialResponse: null };
  let hasLinkedForm = false;
  let hasParentForm = false;
  let isConsentForm = false;
  let isQuestionnaireForm = false;
  let practitionerSignaturePending = false;
  let updateParent = false;
  let parentFormData;
  let parentSubmissionFormData;
  let isParentStatusComplete = false;
  let isParentPractitionerSignature = false;
  
  const patientFormData = await dbService.getOneById({
    model: db.PatientForm,
    id: patientFormId,
    include: [
      { model: db.PatientFormSubmission, as: 'patientFormSubmission' },
      { model: db.PatientForm, as: 'linkedPatientForms' },
      { model: db.Patient, as: 'patient' },
      { model: db.Staff, as: 'practitioner' },
    ],
  });

  if (allowPublicAccess && !patientFormService.isPatientFormPubliclyAccessible(patientFormData)) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Patient form'));
  }
  
  if (patientFormData?.patientId !== submittedBy || submittedByRole !== roles.PATIENT) {
    throw new ApiError(errorMessages.NOT_AUTHORIZED);
  }
  
  const { patientFormSubmission: patientFormSubmissionOld, linkedPatientForms } = patientFormData || {};
  const { formTypeCode } = patientFormData.formData;
  
  if (patientFormSubmissionOld?.response && isPosted) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,errorMessages.ALREADY_SUBMITTED);
  
  if(formTypeCode === 'FT_QUESTIONNAIRES'){
    isQuestionnaireForm = true;  
  }
  const handleLinkedForms = async () => {
    if (!patientFormData?.isLinkedForm) return null;

    const linkedFormParentForm = await dbService.getOneById({
      model: db.PatientForm,
      id: patientFormId,
      include: [
        {
          model: db.PatientForm, as: 'questionnaires',
          include: [
            { model: db.PatientForm, as: 'linkedPatientForms' },
            { model: db.PatientFormSubmission, as: 'patientFormSubmission' },
          ],
        },
      ],
    });

    const parentFormData = linkedFormParentForm?.questionnaires[0];
    const parentSubmissionFormData = parentFormData?.patientFormSubmission;
    const parentLinkedForms = parentFormData?.linkedPatientForms || [];
    
    const allLinkedFormsComplete = parentLinkedForms
      .filter(linkForm => linkForm.id !== patientFormId)
      .every(linkForm => linkForm?.status === 'Complete');
   
    return {
      // updateParent: allLinkedFormsComplete,
      updateParent: true,
      parentFormData,
      parentSubmissionFormData,
    };
  };
  
  if(formTypeCode === 'FT_CONSENT_FORMS'){
    isConsentForm = true;
  }

  if(isQuestionnaireForm){
    let allLinkedFormsComplete = false;
    hasLinkedForm = linkedPatientForms?.length>0;
    if(hasLinkedForm){
      allLinkedFormsComplete = linkedPatientForms.every(linkForm => linkForm?.status === 'Complete');
    }
    if(hasLinkedForm){
      status = (allLinkedFormsComplete && isPosted) ? genralStatus?.COMPLETE : genralStatus?.PARTIAL;
    }
 
    practitionerSignaturePending = parentFormData?.hasPendingPractitionerSignature;
         
    updatedResponse = allLinkedFormsComplete
      ? { patientFormId: patientFormData?.id, status, response, partialResponse: null, hasPendingPractitionerSignature: patientFormData?.hasPendingPractitionerSignature }
      : { patientFormId: patientFormData?.id, status: hasLinkedForm ? genralStatus.PARTIAL: status, response: isPosted? response : null, partialResponse: isPosted? null : response };
  }

  if(isConsentForm){
    const parentData = await handleLinkedForms();
    hasParentForm = parentData?.parentFormData; 
    if(hasParentForm){
      updateParent = parentData?.updateParent;
      parentFormData = parentData?.parentFormData;
      parentSubmissionFormData = parentData?.parentSubmissionFormData;
      isParentStatusComplete = parentSubmissionFormData?.response && isPosted ? true: false;
    }
    if (isSignatureRequired(patientFormData, submittedByRole) && !signature) {
      throw new ApiError(errorMessages.SIGNATURE_REQUIRED);
    }
    practitionerSignaturePending =  status === genralStatus?.COMPLETE && (patientFormData?.formData?.enablePractitionerSignature || false);
    isParentPractitionerSignature = parentFormData?.hasPendingPractitionerSignature || practitionerSignaturePending    

    updatedResponse = isPosted
      ? { patientFormId: patientFormData?.id, status, response, partialResponse: null, hasPendingPractitionerSignature: practitionerSignaturePending }
      : { patientFormId: patientFormData?.id, status: genralStatus.PARTIAL, response: null, partialResponse: response, hasPendingPractitionerSignature: practitionerSignaturePending };
  }

  if (signature) {
    updatedResponse.patientSignature = { signature, date: new Date() };
  }
  if (patientFormSubmissionOld) {
    
    const updatePayload = isPosted
      ? updatedResponse
      : { patientFormId: patientFormData?.id, status, partialResponse: response, response: null };

    await dbService.updateById({
      model: db.PatientFormSubmission,
      reqParams: { id: patientFormSubmissionOld?.id, ...updatePayload },
    });

    if (updateParent) {
      await dbService.updateById({
        model: db.PatientFormSubmission,
        reqParams: {
          id: parentFormData?.patientFormSubmissionId,
          response: parentSubmissionFormData?.response,
          partialResponse: parentSubmissionFormData?.partialResponse,
          status: isParentStatusComplete ? genralStatus.COMPLETE : genralStatus.PARTIAL
        },
      });
    }
  } else {
    const createPayload = isPosted
      ? updatedResponse
      : { patientFormId: patientFormData?.id, status, partialResponse: response, response: null };
    
    const patientFormSubmission = await dbService.createOne({
      model: db.PatientFormSubmission,
      reqParams: createPayload,
    });

    submissionId = patientFormSubmission?.id;
  }

  await dbService.updateById({
    model: db.PatientForm,
    reqParams: { id: patientFormId, patientFormSubmissionId: submissionId, status, hasPendingPractitionerSignature: practitionerSignaturePending },
  });

  if (updateParent) {
    await dbService.updateById({
      model: db.PatientForm,
      reqParams: { id: parentFormData?.id, status: isParentStatusComplete ? genralStatus.COMPLETE : genralStatus.PARTIAL, hasPendingPractitionerSignature: isParentPractitionerSignature },
    });
  }

  return 'Created';
};

const updatePatientFormSubmissionById = async (patientFormSubmissionId, patientFormSubmissionBody,{ tenantId } ) => {
  const { submittedBy, submittedByRole, signature } = patientFormSubmissionBody || {};
  const db = getModels(tenantId);


  const patientFormSubmission =   await dbService.getOneById({
    model: db.PatientFormSubmission,
    id: patientFormSubmissionId,
  });

  let practitionerSignature = patientFormSubmission?.practitionerSignature;
  let patientFormId = patientFormSubmission?.patientFormId;
  
  const patientForm = await dbService.getOneById({
    model: db.PatientForm,
    id: patientFormId,
    include: [
      {
        model: db.PatientForm, as: 'questionnaires',
        include: [
          { model: db.PatientForm, as: 'linkedPatientForms' },
          { model: db.PatientFormSubmission, as: 'patientFormSubmission' },
        ],
      },
    ],
  })
  let { formData , practitionerId, hasPendingPractitionerSignature} = patientForm ||{};
  
  if (!patientFormId) {
    throw new ApiError(errorMessages.NO_RECORD_FOUND);
  }

  if (submittedByRole === roles.PRACTITIONER && practitionerId != submittedBy) {
    throw new ApiError(errorMessages.NOT_AUTHORIZED);
  }

  const signatureExist = practitionerSignature && submittedByRole === roles.PRACTITIONER;

  if (signatureExist) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessages.ALREADY_SIGNED_BY(capitalize(submittedByRole)));
  }

  const isPractitionerSignatureEnabled = formData?.enablePractitionerSignature;
  if (!isPractitionerSignatureEnabled && submittedByRole === roles.PRACTITIONER) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessages.PRACTITIONER_SIGNATURE_NOT_ALLOWED);
  }

  if (submittedByRole === roles.PRACTITIONER) {
    practitionerSignature = signature;
    hasPendingPractitionerSignature = false;
  }
  const updatedSignatures = {
    ...(submittedByRole === roles.PRACTITIONER && signature && { practitionerSignature: { signature, date: new Date() } }),
  };

  const doc = await dbService.updateOne({
    model: db.PatientFormSubmission,
    updateParams: {
      ...updatedSignatures,
    },
    filter: { where: { id: patientFormSubmissionId } },
  });

  await patientFormService.updatePatientFormById(patientFormId, {hasPendingPractitionerSignature},{tenantId} );

  const parentPatientForm = patientForm?.questionnaires[0];
  if (parentPatientForm) {
    let { linkedPatientForms = [], patientFormSubmission: parentFormSubmission } = parentPatientForm || {};

    hasPendingPractitionerSignature = linkedPatientForms.some((item) => item.hasPendingPractitionerSignature === true);

    const isPending = linkedPatientForms.some((item) => item.status !== genralStatus.COMPLETE);
    const status = isPending || !parentFormSubmission ? genralStatus.PARTIAL : genralStatus.COMPLETE;

    await dbService.updateOne({
      model: db.PatientForm,
      updateParams: {
        hasPendingPractitionerSignature,
        status,
      },
      filter: { where: {id: parentPatientForm.id} },
    });
  }

  return doc;
};


module.exports = {
  createPatientFormSubmission,
  updatePatientFormSubmissionById,
};
