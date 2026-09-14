const catchAsync = require('../utils/catchAsync');
const { pdfService, patientMedicationService, patientFormService, emarService, encounterService, patientInvoiceService} = require('../services');
const { setPDFDownloadHeaders } = require('../utils/pdfUtility/pdfUtility');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');

const createPatientFormPDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false } = req.query || {};
    const { patientFormId } = req.params || {};
    const uuid = req.clinicUuid;
 
    // Fetch patient form data
    const patientFormData = await patientFormService.getPatientFormById(patientFormId, { tenantId: uuid });
    if (!patientFormData) {
      return res.status(404).json({ message: "Patient form not found" });
    }
 
    // Fetch practice settings
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    if (!practiceSetting) {
      return res.status(500).json({ message: "Practice settings configuration not found" });
    }
 
    // Generate the PDF
    const buffer = await pdfService.patientFormPDFService.createPatientFormPDF({ patientFormData, practiceSetting });
    const { filename } = buffer || {};
    let { pdfBufferData } = buffer || {};
 
    // Set headers for the response
    setPDFDownloadHeaders(res, filename);
 
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
 
    // Send the PDF response
    res.status(200).end(pdfBufferData);
  } catch (error) {
    console.error("Error generating patient form PDF:", error);
 
    // Handle the error with a 500 response
    res.status(500).json({ message: "Failed to generate patient form PDF", error: error.message });
  }
});
 
const createPatientMedicationPDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false } = req.query || {};
    const { patientMedicationId } = req.params || {};
    const uuid = req.clinicUuid;
 
    if (!patientMedicationId) {
      throw new Error('Patient medication ID is required.');
    }
 
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    if (!practiceSetting) {
      throw new Error('Failed to retrieve practice settings configuration.');
    }
 
    const patientMedicationData = await patientMedicationService.getPatientMedicationById(
      patientMedicationId,
      { tenantId: uuid }
    );
    if (!patientMedicationData) {
      throw new Error('Failed to retrieve patient medication data.');
    }
    const {patient }= patientMedicationData || {};

    const buffer = await pdfService.patientMedicationPDFService.createPatientMedicationPDF({
      patientMedicationData,
      patient,
      practiceSetting,
    });
    if (!buffer || !buffer.filename || !buffer.pdfBufferData) {
      throw new Error('Failed to generate the PDF.');
    }
 
    const { filename } = buffer;
    let { pdfBufferData } = buffer;
 
    setPDFDownloadHeaders(res, filename);
 
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
 
    res.status(200).end(pdfBufferData);
  } catch (error) {
    console.error('Error in createPatientMedicationPDF:', error.message || error);
    res.status(500).json({ message: 'An error occurred while generating the PDF.', error: error.message || error });
  }
});
 
const createPatientMedicationMARLogPDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false } = req.query || {};
    const {patientMedicationItemId} = req.params || {}
    const uuid = req.clinicUuid;
    const practiceSetting = await getPracticeSettingsConfig({tenantId:uuid})
    const patientMedicationItemData =await  emarService.getPatientMedicationItemById(patientMedicationItemId,{tenantId:uuid});
    const buffer = await pdfService.patientMedicationMARLogPDFService.createPatientMedicationMARLogPDF({patientMedicationItemData,practiceSetting});
    const { filename } = buffer || {};
    let { pdfBufferData } = buffer || {};
    setPDFDownloadHeaders(res, filename);
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
    res.status(200).end(pdfBufferData);
  } catch (error) {
  console.error("Error generating MAR Log PDF:", error);

  // Handle errors gracefully
  res.status(500).json({ message: "Failed to generate MAR Log PDF", error: error.message });
}
});
 
const createPatientEncounterPDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false, subscribeSocket } = req.query || {};
    const { patientEncounterId } = req.params || {};
    const uuid = req.clinicUuid;
 
    let patientAllergy = [];
    let patientVitals = [];
    let patientLabOrder = [];
    let patientDiagnosis = [];
    let patientMedication = [];
 
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    if (!practiceSetting) {
      return res.status(500).json({ message: "Practice settings configuration not found" });
    }
 
    let patientMedicationItemData = await encounterService.getPatientEncounterItemById(patientEncounterId, { tenantId: uuid });
    if (!patientMedicationItemData) {
      return res.status(404).json({ message: "Patient encounter not found" });
    }
 
    if (patientMedicationItemData?.selectedForms?.staticForms?.allergies) {
      patientAllergy = await encounterService.getPatientAllergies(patientMedicationItemData?.patientId, subscribeSocket, { tenantId: uuid });
    }
 
    if (patientMedicationItemData?.selectedForms?.staticForms?.vitals) {
      patientVitals = await encounterService.getPatientVitals(patientMedicationItemData?.patientId, subscribeSocket, { tenantId: uuid });
    }
 
    if (patientMedicationItemData?.selectedForms?.staticForms?.labOrders) {
      patientLabOrder = await encounterService.getPatientLabOrder(patientMedicationItemData?.patientId, subscribeSocket, { tenantId: uuid });
    }
 
    if (patientMedicationItemData?.selectedForms?.staticForms?.diagnosis) {
      patientDiagnosis = await encounterService.getPatientDiagnosis(patientMedicationItemData?.patientId, subscribeSocket, { tenantId: uuid });
    }
 
    if (patientMedicationItemData?.selectedForms?.staticForms?.medication) {
      patientMedication = await encounterService.getPatientMedication(patientMedicationItemData?.patientId, subscribeSocket, { tenantId: uuid });
    }
 
    // Generate patient form PDF template if forms exist
    let patientFormPDFTemplate = '';
    if (patientMedicationItemData?.patientEncounterForms) {
      const pdfTemplates = await Promise.all(
        patientMedicationItemData.patientEncounterForms.map(async (form) => {
          let patientResponse = form?.responses;
          const patientFormData = {
            formData: form?.formData,
            patientFormSubmission: { response: patientResponse },
            patient: patientMedicationItemData?.patient,
          };
          const linkedConsentForms = [];
          const timezone = [];
          const practice = [];
          const onNewPage = false;
 
          return await pdfService.patientFormPDFService.createPatientFormPDFTemplate({
            patientForm: patientFormData,
            linkedConsentForms,
            timezone,
            practice,
            onNewPage,
          });
        })
      );
      patientFormPDFTemplate = pdfTemplates.join('');
    }
 
    // Create the PDF
    const buffer = await pdfService.patientencounterservice.createPatientEncounterLogPDF({
      patientMedicationItemData,
      practiceSetting,
      patientAllergy,
      patientLabOrder,
      patientVitals,
      patientDiagnosis,
      patientMedication,
      patientFormPDFTemplate,
    });
 
    const { filename } = buffer || {};
    let { pdfBufferData } = buffer || {};
 
    setPDFDownloadHeaders(res, filename);
 
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
 
    // Send the PDF response
    res.status(200).end(pdfBufferData);
  } catch (error) {
    console.error("Error generating patient encounter PDF:", error);
 
    // Handle errors gracefully
    res.status(500).json({ message: "Failed to generate patient encounter PDF", error: error.message });
  }
});

const createPatientAllMedicationsMARLogPDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false } = req.query || {};
    const uuid = req.clinicUuid;
 
    const { patientId, medicationId } = req.params || {};
    let medicationData;
 
    if (!medicationId) {
      medicationData = await emarService.getPatientMedications(patientId, { tenantId: uuid });
      if (!medicationData || medicationData.length === 0) {
        return res.status(404).json({ message: "No medications found for the patient" });
      }
    } else {
      medicationData = await emarService.getPatientMedicationById(medicationId, { tenantId: uuid });
      if (!medicationData) {
        return res.status(404).json({ message: "Medication not found" });
      }
    }
 
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    if (!practiceSetting) {
      return res.status(500).json({ message: "Practice settings configuration not found" });
    }
 
    const patientData = await emarService.getPatientById(patientId, { tenantId: uuid });
    if (!patientData) {
      return res.status(404).json({ message: "Patient not found" });
    }
 
    const buffer = await pdfService.patientAllMedicationsMARLogPDFService.createPatientAllMedicationsMARLogPDF({
      medicationData,
      practiceSetting,
      patientData,
    });
 
    const { filename } = buffer || {};
    let { pdfBufferData } = buffer || {};
 
    setPDFDownloadHeaders(res, filename);
 
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
 
    res.status(200).end(pdfBufferData);
  } catch (error) {
    console.error("Error generating MAR Log PDF:", error);
 
    // Handle errors gracefully
    res.status(500).json({ message: "Failed to generate MAR Log PDF", error: error.message });
  }
});

const createPatientInvoicePDF = catchAsync(async (req, res) => {
  try {
    const { stringBuffer = false } = req.query || {};
    const { patientInvoiceId } = req.params || {};
    const uuid = req.clinicUuid;
 
    if (!patientInvoiceId) {
      throw new Error('Patient invoice ID is required.');
    }
 
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    if (!practiceSetting) {
      throw new Error('Failed to retrieve practice settings configuration.');
    }
 
    const patientInvoiceData = await patientInvoiceService.getPatientInvoiceById(
      patientInvoiceId,
      { tenantId: uuid }
    );

    
    if (!patientInvoiceData) {
      throw new Error('Failed to retrieve patient invoice data.');
    }
    const { patient }= patientInvoiceData || {};
    
    const buffer = await pdfService.patientInvoicePDFService.createPatientInvoicePDF({
      patientInvoiceData,
      patient,
      practiceSetting,
    })

    if (!buffer || !buffer.filename || !buffer.pdfBufferData) {
      throw new Error('Failed to generate the PDF.');
    }
 
    const { filename } = buffer;
    let { pdfBufferData } = buffer;
 
    setPDFDownloadHeaders(res, filename);
 
    if (stringBuffer) {
      pdfBufferData = pdfBufferData.toString('base64');
    }
 
    res.status(200).end(pdfBufferData);
  } catch (error) {
    console.error('Error in createPatientInvoicePDF:', error.message || error);
    res.status(500).json({ message: 'An error occurred while generating the PDF.', error: error.message || error });
  }
});
 
module.exports = {
  createPatientFormPDF,
  createPatientMedicationPDF,
  createPatientMedicationMARLogPDF,
  createPatientEncounterPDF,
  createPatientAllMedicationsMARLogPDF,
  createPatientInvoicePDF,
};
 