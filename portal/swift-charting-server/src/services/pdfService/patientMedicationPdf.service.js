const httpStatus = require('http-status');
const { errorMessages } = require('../../config/error');
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex } = require('../../utils');
const ApiError = require('../../utils/ApiError');
const { formatDate, dateFormatter, getDateDiff } = require('../../utils/dateUtility');
const { createPDF, createDocumentHeading } = require('../../utils/pdfUtility/pdfUtility');
const config = require('../../config/config');
const { shareMedicationTemplate, medicationPDFTemplate } = require('../../config/defaultTemplates');
const { frequencyCodeType, directionCodeType, routeCodeType } = require('../../utils/constant');

const generateHTMLTemplate = async ({ patientMedicationData, practiceSetting, isEmail = false }) => {
  let { practiceSetting: practice } = practiceSetting || {};
  const logoBase64 = practiceSetting?.logoConfigs?.practiceLogoAttechment?.content || '';
  const practiceLogo = practice?.dataValues?.logo || practice?.logo || {};
  const logoMimeType =
    practiceLogo?.mimetype || practiceLogo?.imageType || practiceSetting?.logoConfigs?.practiceLogoAttechment?.type || '';
  const logoName = practiceLogo?.name || '';

  const { patient, prescriber } = patientMedicationData || {};
  const patientName = `${patient?.title?.name || ''} ${getFullName(patient)}`;
  const patientEmail = patient?.email;
  const patientAge = getDateDiff(patient?.dob, new Date(), { unit: 'years' }) || 'N/A';
  const patientContact = getPatientPhone(patient);
  const patientAddress = patient?.address?.description || 'N/A';
  const patientDob =
    formatDate(patient?.dob, { timezone: patient?.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
  const patientGender = getPatientSex(patient);
  const patientDiagnosis = patient?.problems?.map((item) => item?.problem?.name).join(', ') || 'N/A';
  const patientAllergies = patient?.allergies?.map((item) => item.allergy).join(', ') || 'N/A';

  const prescriberName = `${getFullName(prescriber)}`;
  const prescriberContact = prescriber?.phone || 'N/A';
  const prescriberEmail = prescriber?.email || 'N/A';
  const prescribedDate =
    formatDate(patientMedicationData.createdAt, {
      timezone: patient?.timezone,
      format: dateFormatter.MMDDYYYY_WITH_SLASHES,
    }) || 'N/A';
  const prescriberSignature = patientMedicationData?.signature
    ? isEmail
      ? `<div class="singature-wrapper"><img src="cid:signature_image"/></div>`
      : `<div class="singature-wrapper"><img style="widht:100px;height:100px;object-fit:contain" src="${patientMedicationData.signature}"/></div>`
    : 'N/A';
  const prescriptionId = `#swift-charting-${patientMedicationData?.id}` || 'N/A';
  const { html: headingHtml, attachments: headingAttachments } = createDocumentHeading({
    practice,
    practiceSetting,
    logoBase64,
    logoMimeType,
    logoName,
    isEmail,
  });
  const attachments = [...headingAttachments];

  if (patientMedicationData?.signature) {
    attachments.push({
      filename: 'signature_image.png',
      content: patientMedicationData.signature.replace(/^data:image\/\w+;base64,/, ''),
      cid: 'signature_image', // same cid value as in the html img src,
      type: 'image/png',
      disposition: 'inline',
      encoding: 'base64',
    });
  }
  const clientURL = config.clientURL;
  // Template parts
  const templateHead = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <style>
        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            color: #333;
        }
            .mainTitle{
            font-size:30px !important;
            }
        .header {
            font-size: 28px;
            color: #337AB7;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .button {
            background-color: #337AB7;
            color: white;
            padding: 10px 20px;
            border: none;
            cursor: pointer;
            float: right;
            margin-top: -40px;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #285a8b;
        }
        .tabs {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .tab {
            flex: 1;
            text-align: center;
            padding: 10px 0;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s, border-bottom 0.3s;
        }
        .tab.active {
            color: #337AB7;
            border-bottom: 4px solid #337AB7;
        }
        .info-container {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .info-container .info-block {
            width: 48%;
            margin-bottom: 10px;
        }
        .info-container .info-block p {
            margin: 5px 0;
            line-height: 1.5;
        }
        .info-container .info-block strong {
            display: block;
            color: #337AB7;
            font-weight: 500;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px;
            color: #337AB7;
        }
        .horizontal-bar {
            width: 50%;
            height: 8px;
            background-color: #337AB7;
            margin: 20px 0;
        }
        .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .medication-table th, .medication-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */
        }

        .medication-table th:nth-child(1), .medication-table td:nth-child(1) {
            width: 10%; 
        }

        .medication-table th:nth-child(2), .medication-table td:nth-child(2) {
            width: 25%; 
        }

        .medication-table th:nth-child(3), .medication-table td:nth-child(3) {
            width: 50%; 
        }
        .medication-table th:nth-child(4), .medication-table td:nth-child(4) {
            width: 15%; 
        }

        .medication-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        .medication-table th {
            background-color: #337AB7;
            color: white;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            text-decoration: none;
            font-weight: bold;
        }
        .signature-line {
            width: 200px;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .addIns{
            word-break: break-all !important;
            }
            .singature-wrapper{
            margin-bottom:20px !important;
            }
    </style>
</head>`;

  const templateBody = `<body>
    <div class="container">
        <div class="header mainTitle">E-Prescription</div>
        <div id="pdf" class="tab-content">
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Prescription No.</strong>[prescriptionId]</p>
                    </div>
                     <div class="info-block">
                      <p><strong>Prescription Date</strong>[prescribedDate]</p>
                      </div>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Patient Information</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Name</strong>[patientName]</p>
                    <p><strong>Phone Number</strong>[patientContact]</p>
                    <p><strong>Email</strong>[patientEmail]</p>
                    <p><strong>Address</strong>[patientAddress]</p>
                    <p><strong>Allergies</strong>[patientAllergies]</p>
                </div>
                <div class="info-block">
                    <p><strong>Age</strong>[patientAge]</p>
                    <p><strong>Date of Birth</strong>[patientDob]</p>
                    <p><strong>Gender</strong>[patientGender]</p>
                    <p><strong>Notable Health Condition</strong>[patientDiagnosis]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">List of Prescribed Medications</div>
            <table class="medication-table">
                <tr>
                    <th>Status</th>
                    <th>Medication Name</th>
                    <th>Instructions</th>
                    <th>Start On</th>
                </tr>`;

  // Generate rows for medication table dynamically
  let templateTable = '';
  patientMedicationData.items.forEach((item) => {
    templateTable += `
        <tr>
            <td>${item?.medicineStatus?.name}</td>
            <td>${item?.genericDrug} (${item?.brandNameDrug})</td>
            <td><p>${item?.amount} ${item?.unit?.name} (${item?.doseForm?.name}), 
            ${item?.route?.code === routeCodeType.OTHER ? item?.routeOther : item?.route?.name}, 
            ${item?.frequency?.code === frequencyCodeType.OTHER ? item?.frequencyOther : item?.frequency?.name},
            ${item?.direction?.code === directionCodeType.OTHER ? item?.directionOther : item?.direction?.name}
            ${item?.durationAmount ? `<br><strong>Duration:</strong> ${item?.durationAmount} ${item?.duration?.name}` : ''}
            ${item?.quantity ? `<br><strong>Quantity:</strong> ${item?.quantity}` : ''}
            ${item?.refill ? `<br><strong>Refill:</strong> ${item?.refill}` : ''}
            ${item?.refillDate ? `<br><strong>Refill date:</strong> ${formatDate(item?.refillDate, {
                timezone: patient.timezone,
                format: dateFormatter.MMDDYYYY_WITH_SLASHES,
                })}` : ''}
            ${(item?.diagnoses?.length > 0 || item?.diagnosesOther?.length > 0) 
                ? `<br><strong>Purpose:</strong> ` + 
                [...(item?.diagnoses || []).map(diagnosis =>`${diagnosis?.icd?.name} ${diagnosis?.icd?.description ? `(${diagnosis?.icd?.description})` : ''}`),
                ...(item?.diagnosesOther || [])].join(', ')
                : ''}
            ${item?.additionalInstruction ? `<br><strong>Additional Ins. :</strong> ${item?.additionalInstruction}` : ''}
            ${item?.allergiesWarnings ? `<br><strong>Allergies/Warnings :</strong> ${item?.allergiesWarnings}` : ''}
            ${item?.patientSpecificInstructions ? `<br><strong>Patient Specific Ins. :</strong> ${item?.patientSpecificInstructions}` : ''}
            </p>
            </td>
            <td>${formatDate(item?.startDate, {
              timezone: patient.timezone,
              format: dateFormatter.MMDDYYYY_WITH_SLASHES,
            })}</td>
        </tr>`;
  });

  const templateFooter = `</table>
  
<div class="section-title">Prescriber Details</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Prescriber Name</strong>[prescriberName]</p>
                    <p><strong>Prescriber Phone Number</strong>[prescriberContact]</p>
                    <p><strong>Prescriber NPI Number</strong>N/A</p>                
                </div>
                <div class="info-block">
                 <p><strong>Prescriber Email</strong>[prescriberEmail]</p>
                    <p><strong>Date</strong>[prescribedDate]</p>
                    <p><strong>Prescriber Signature</strong></p>
                     <div class="signature-line">[prescriberSignature]</div>
                </div>
            </div>
            <div class="footer">
                <p>Please follow the instructions provided and contact us if you have any questions or concerns.</p>
                <p>For more details, visit our website:</p>
                <p><a href="[clientURL]">[clientURL]</a></p>
            </div>
            <div class="footer">
                <p>&copy; 2024 [practiceName]. All rights reserved.</p>
                <p><a href="[clientURL]">Visit our website</a></p>
            </div>
        </div>
        <div id="form" class="tab-content" style="display: none;">
            <!-- Form preview content goes here -->
        </div>
    </div>
   </body>
</html>`;

// Combine all parts into final HTML content
const pdfHeader =
`<div style="margin-bottom:50px">${headingHtml}</div>` 
const finalHTML = templateHead + pdfHeader+ templateBody + templateTable + templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{patientName,patientEmail,patientAge,patientContact,patientAddress,patientDiagnosis,patientAllergies,patientDob,prescriberName,prescribedDate,prescriberContact,prescriberEmail,prescriptionId,clientURL,prescriberSignature,patientGender}});
    return {template:decodeHtml(_template),attachments}
  };

const createPatientMedicationPDF = async ({ patientMedicationData, patient, practiceSetting }) => {
  // const {patient} = patientDetails || {};
  const patientName = getFullName(patient || {});
  const filename = `${patientName}-Prescription-${formatDate(new Date(), {
    timezone: patient?.timezone,
    format: dateFormatter.MMDDYYYY_WITH_SLASHES,
  })}.pdf`;
  const pdfTemplateContent = await generateHTMLTemplate({
    patientMedicationData,
    practiceSetting,
    template: medicationPDFTemplate,
  });
  const pdfBufferData = await createPDF({
    template: pdfTemplateContent.template,
    filename,
  });
  return { pdfBufferData, filename };
};

module.exports = {
  createPatientMedicationPDF,
  generateHTMLTemplate,
};
