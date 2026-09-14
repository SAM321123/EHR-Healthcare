const httpStatus = require("http-status");
const { errorMessages } = require("../../config/error");
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex, getAddress } = require("../../utils");
const ApiError = require("../../utils/ApiError");
const { formatDate, dateFormatter, getDateDiff } = require("../../utils/dateUtility");
const { createPDF, createDocumentHeading } = require("../../utils/pdfUtility/pdfUtility");
const config = require("../../config/config");
const { shareMedicationTemplate, medicationPDFTemplate } = require("../../config/defaultTemplates");
const { frequencyCodeType, directionCodeType, routeCodeType } = require("../../utils/constant");


const generateReportHTMLTemplate = async ({ patientMedicationItemData,practiceSetting,resultData,isEmail=false }) => {
    let {practiceSetting:practice}=  practiceSetting ||{};
    const {medication, marLogs, genericDrug, brandNameDrug, amount, unitCode, startDate, medicineStatusCode, updatedAt, medicineStatus, diagnoses,diagnosesOther,discontinueDate  } = patientMedicationItemData || {};
    const {patient, prescriber} = medication || {};
    const patientId = patient?.id;
    
    let patientName = '';
    if(patient?.title){
        patientName = `${patient?.title?.name} `
    } 
    patientName += `${getFullName(patient)}`  
    // const patientName = `${patient?.title?.name} ${getFullName(patient)}`;
    const patientEmail = patient?.email;
    const patientAge = getDateDiff(patient?.dob,new Date(),{unit:'years'});
    const patientContact = getPatientPhone(patient);
    const patientAddress = patient?.address?.description;
    const patientDob= formatDate(patient?.dob,{timezone:patient?.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
    const patientGender = getPatientSex(patient);
    const patientDiagnosisData = patient?.problems?.map(item=>item?.problem?.name).join(', ') || 'N/A';
    const patientAllergies = patient?.allergies?.map(item=>item.name).join(', ') || 'N/A';
    
    
    let providerName = '';
    if(prescriber?.title){
        providerName = `${prescriber?.title?.name} `
    }
    providerName +=`${getFullName(prescriber)}`
    // const providerName = `${prescriber?.titleCode} ${getFullName(prescriber)}`;
    const providerContact =prescriber?.phone;
    const providerEmail = prescriber?.email;
    const prescriberNPI = prescriber?.npiNo;

    const prescriptionDate = formatDate(medication?.prescriptionDate,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';

    const medicationName = `${genericDrug} ${brandNameDrug} ${amount} ${unitCode}`
    const medicationStartDate = formatDate(startDate,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
    const medicationStatus = medicineStatus?.code;
    const isDiscontinueDate = medicationStatus ==='medication_status_discontinued' && formatDate(discontinueDate,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}); 
    // const orderDate = formatDate(patientLabRadiologyData.createdAt,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
    const providerSignature = medication?.signature
      ? isEmail
        ? `<div class="singature-wrapper"><img src="cid:signature_image"/></div>`
        : `<div class="singature-wrapper"><img style="widht:100px;height:100px;object-fit:contain" src="${medication?.signature}"/></div>`
      : 'N/A';
    // const orderId = `#swift-charting-${patientLabRadiologyData?.id}` || 'N/A';

    const { html: headingHtml, attachments: headingAttachments } = createDocumentHeading({
        practice,
        practiceSetting,
        isEmail,
    });
    const attachments = [...headingAttachments];
    if (medication?.signature) {
        attachments.push({
            filename: 'signature_image.png',
            content: medication.signature.replace(/^data:image\/\w+;base64,/, ''),
            cid: 'signature_image',
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
            padding: 20px;
            background-color: #f7f9fc;
            color: #333;
        }
        .mainTitle {
            font-size: 32px;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            text-align: left;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0 10px;
            color: #007bff;
            text-align: left;
        }
        .horizontal-bar {
            width: 100%;
            height: 2px;
            background-color: #007bff;
            margin-bottom: 20px;
        }
        .info-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .info-block {
            margin-bottom: 20px;
        }
        .info-block p {
            margin: 5px 0;
            line-height: 1.5;
        }
        .info-block strong {
            display: block;
            color: #007bff;
            font-weight: 600;
        }
         .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }

        .medication-table th, .medication-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */
        }

        .medication-table th:nth-child(1), .medication-table td:nth-child(1) {
            width: 15%; 
        }

        .medication-table th:nth-child(2), .medication-table td:nth-child(2) {
            width: 15%; 
        }

        .medication-table th:nth-child(3), .medication-table td:nth-child(3) {
            width: 70%; 
        }

        .medication-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .medication-table th {
            background-color: #007bff;
            color: white;
            text-transform: uppercase;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            text-decoration: none;
            font-weight: bold;
            color: #007bff;
        }
        .signature-line {
            width: 200px;
            margin: 10px auto;
            border-top: 1px solid #007bff;
        }
    </style>
</head>`

const templateBody = `<body>
    <div class="container">
        <div class="mainTitle">EMAR Report</div>

           <div style="display: flex; justify-content: space-between;">  
                <div style="flex: 1; margin-right: 20px;">
                    <p><strong>Patient Name:</strong> [patientName]</p>
                    <p><strong>Patient Dob:</strong> [patientDob]</p>
                    <p><strong>Patient Email:</strong> [patientEmail]</p>
                    ${patientGender && patientGender!=='N/A' ? `<p><strong>Patient Gender:</strong> [patientGender]</p>` : ''}  
                </div>
                    <div style="flex: 1;">
                    <p><strong>Patient ID:</strong> [patientId]</p>
                    ${patientAge ? `<p><strong>Patient Age:</strong> [patientAge]</p>` : ''}               
                    ${patientContact && patientContact!=='N/A' ? `<p><strong>Patient Contact:</strong> [patientContact]</p>` : ''} 
                    ${patientAddress ? `<p><strong>Patient Address:</strong> [patientAddress]</p>` : ''}                 
                </div>
            </div>

            <div class="horizontal-bar"></div>
            
            <div class="section-title">Medication Records:</div>
                <div style="display: flex; justify-content: space-between;">  
                    <div style="flex: 1; margin-right: 20px;">
                        <p><strong>Medication Name:</strong> [medicationName]</p>
                        <p><strong>Start Date:</strong> [medicationStartDate]</p>
                        ${isDiscontinueDate ? `<p><strong>Discontinue Date:</strong> [isDiscontinueDate]</p>`: ''}
                        ${(diagnoses?.length > 0 || diagnosesOther?.length > 0) 
                            ? `<p><strong>Diagnosis:</strong> ` + 
                              [
                                ...(diagnoses || []).map(diagnosis => 
                                  `${diagnosis?.icd?.name} ${diagnosis?.icd?.description ? `(${diagnosis?.icd?.description})` : ''}`
                                ),
                                ...(diagnosesOther || [])
                              ].join(', ') +
                              `</p>`
                            : ''
                        }
                    </div>
                </div>
                <table class="medication-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Information</th>
                        </tr>
                    </thead>`

let templateTable = '';

if (Array.isArray(marLogs)) {
    marLogs.forEach(item => {
        const logData = item?.dataValues; // Extract the dataValues from the Sequelize instance
        if (logData) {
            const formatedDate = formatDate(logData?.date,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
            const clinicianName = `${logData?.clinician?.title?.name || ''} ${getFullName(logData?.clinician)}`;
            templateTable += `
                <tr>
                    <td>${formatedDate}</td>
                    <td>${logData?.action?.name}</td>
                    <td><p>${clinicianName ? `<strong>Clinician:</strong> ${clinicianName}` : ''}
                    ${logData?.clinicianInitial ? `<br><strong>Clinician Initial:</strong> ${logData?.clinicianInitial}`: ''}
                    ${logData?.givenByCaregiver ? `<br><strong>Given By Caregiver:</strong> Yes` : '<br><strong>Given By Caregiver:</strong> No'}
                    ${logData?.refusedReason ? `<br><strong>Refused Reason:</strong> ${logData?.refusedReason}` : ''}
                    ${logData?.comment ? `<br><strong>Comment:</strong> ${logData?.comment}` : ''}</p>
                    </td>
                </tr>
            `;
        }
    });
} else {
    console.error("marLogs is not an array");
}

const templateFooter = `
            </table>
            </div>
            <div class="horizontal-bar"></div>  

            <div class="section-title">Prescriber Details</div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1; margin-right: 20px;">
                        <p><strong>Prescriber Name:</strong> [providerName]</p>
                        ${providerContact ? `<p><strong>Prescriber Phone Number:</strong> [providerContact]</p>` : ''}  
                        ${prescriberNPI ? `<p><strong>Prescriber NPI Number:</strong> [prescriberNPI]</p>` : ''}               
                        <p><strong>Prescription Date:</strong> [prescriptionDate]</p>
                    </div>
                    <div style="flex: 1;">
                        <p><strong>Prescriber Email:</strong> [providerEmail]</p>
                        <p><strong>Prescriber Signature</strong></p>
                        <div class="signature-line">[providerSignature]</div>
                    </div>
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
    </div>
   </body>
</html>`;

// Combine all parts into final HTML content
const pdfHeader =
`<div style="margin-bottom:50px">${headingHtml}</div>` 
const finalHTML = templateHead + pdfHeader+ templateBody + templateTable + templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{patientId,patientName,patientEmail,patientAge,patientContact,
    patientAddress,patientDiagnosisData,
    patientAllergies,patientDob,providerName,providerContact, prescriberNPI, providerSignature,
    prescriptionDate, medicationName, medicationStartDate, isDiscontinueDate,
    providerEmail,clientURL,patientGender,
}});
    return {template:decodeHtml(_template),attachments}
  };

const createPatientMedicationMARLogPDF =async ({patientMedicationItemData,resultData,practiceSetting})=> {
    const {medication} = patientMedicationItemData || {};
    const {patient} = medication || {};
    const patientName = getFullName(patient || {});
    const filename =`${patientName}-EMAR-Log-${formatDate(new Date(), { timezone:patient?.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES })}.pdf`
    const pdfTemplateContent = await generateReportHTMLTemplate({patientMedicationItemData,practiceSetting,resultData,template:medicationPDFTemplate});
    const pdfBufferData = await createPDF({
        template: pdfTemplateContent.template,
        filename,
      });
    return {pdfBufferData,filename}
}

module.exports={
    createPatientMedicationMARLogPDF,
    generateReportHTMLTemplate,
}
