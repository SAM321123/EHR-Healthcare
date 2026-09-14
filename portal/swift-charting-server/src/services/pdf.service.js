const patientFormPDFService = require('./pdfService/patientFormPdf.service');
const patientMedicationPDFService = require('./pdfService/patientMedicationPdf.service');
const patientMedicationMARLogPDFService = require('./pdfService/patientEMARLogPdf.service');
const patientencounterservice = require('./pdfService/patientencounter.service');
const patientAllMedicationsMARLogPDFService = require('./pdfService/patientAllEMARLogPdf.service');
const patientInvoicePDFService = require('./pdfService/patientInvoicePdf.service');

module.exports = {
  patientFormPDFService,
  patientMedicationPDFService,
  patientMedicationMARLogPDFService,
  patientencounterservice,
  patientAllMedicationsMARLogPDFService,
  patientInvoicePDFService,
};
