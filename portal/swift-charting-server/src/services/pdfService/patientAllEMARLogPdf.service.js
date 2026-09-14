const httpStatus = require("http-status");
const { errorMessages } = require("../../config/error");
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex, getAddress } = require("../../utils");
const ApiError = require("../../utils/ApiError");
const { formatDate, dateFormatter, getDateDiff } = require("../../utils/dateUtility");
const { createPDF, createDocumentHeading } = require("../../utils/pdfUtility/pdfUtility");
const config = require("../../config/config");
const { shareMedicationTemplate, medicationPDFTemplate } = require("../../config/defaultTemplates");
const { frequencyCodeType, directionCodeType, routeCodeType } = require("../../utils/constant");


const generateReportHTMLTemplate = async ({ medicationData,patientData,practiceSetting,isEmail=false }) => {
    let {practiceSetting:practice}=  practiceSetting ||{};

    const {medication, updatedAt, medicineStatus, diagnoses,discontinueDate } = medicationData || {};
    const {prescriber} = medication || {};
    const patient = patientData;
    const patientId = patient?.id;
    
    let patientName = '';
    if(patient?.title){
        patientName = `${patient?.title?.name} `
    } 
    patientName += `${getFullName(patient)}`  
    const patientEmail = patient?.email;
    const patientAge = getDateDiff(patient?.dob,new Date(),{unit:'years'});
    const patientContact = getPatientPhone(patient);
    const patientAddress = patient?.address?.description;
    const patientDob= formatDate(patient?.dob,{timezone:patient?.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
    const patientGender = getPatientSex(patient);
    const patientDiagnosisData = patient?.problems?.map(item=>item?.problem?.name).join(', ') || 'N/A';
    const patientAllergies = patient?.allergies?.map(item=>item.name).join(', ') || 'N/A';
    

    
    

    const { html: headingHtml, attachments: headingAttachments } = createDocumentHeading({
        practice,
        practiceSetting,
        isEmail,
    });
    const attachments = [...headingAttachments];
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
            width: 20%; 
        }

        .medication-table th:nth-child(2), .medication-table td:nth-child(2) {
            width: 15%; 
        }

        .medication-table th:nth-child(3), .medication-table td:nth-child(3) {
            width: 65%; 
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
    .info-container {
        border: 1px solid #ddd;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
    }

    /* For small screens */
    @media screen and (max-width: 600px) {
        .medication-table {
            display: block;
            overflow-x: auto; /* Adds horizontal scrolling for tables on small screens */
            white-space: nowrap; /* Prevents text wrapping, enabling horizontal scroll */
        }

        .medication-table th, .medication-table td {
            padding: 10px;
            font-size: 14px; /* Smaller font size for better fit on small screens */
        }
    }
    </style>
    </head>`;
    
        const templateBody = `<body>
        <div class="container">
            <div class="mainTitle">EMAR Report</div>
    
            <div style="display: flex; justify-content: space-between;">  
                <div style="flex: 1; margin-right: 20px;">
                    <p><strong>Patient Name:</strong> ${patientName}</p>
                    <p><strong>Patient Dob:</strong> ${patientDob}</p>
                    <p><strong>Patient Email:</strong> ${patientEmail}</p>
                    ${patientGender && patientGender !== 'N/A' ? `<p><strong>Patient Gender:</strong> ${patientGender}</p>` : ''}  
                </div>
                <div style="flex: 1;">
                    <p><strong>Patient ID:</strong> ${patientId}</p>
                    ${patientAge ? `<p><strong>Patient Age:</strong> ${patientAge}</p>` : ''}               
                    ${patientContact && patientContact !== 'N/A' ? `<p><strong>Patient Contact:</strong> ${patientContact}</p>` : ''} 
                    ${patientAddress ? `<p><strong>Patient Address:</strong> ${patientAddress}</p>` : ''}                 
                </div>
            </div>
    
            <div class="horizontal-bar"></div>
            <div class="section-title">Medication Records:</div>`;
    
        let medicationSections = '';
    
        if (Array.isArray(medicationData)) {
            medicationData?.forEach(medication => {
                const {prescriber} = medication;
                const {titleCode, otherTitle, firstName, middleName, last} = prescriber

                let providerName = '';
                if(prescriber?.title){
                    providerName = `${prescriber?.title?.name} `
                }
                providerName +=`${getFullName(prescriber)}`

                const providerContact =prescriber?.phone;
                const providerEmail = prescriber?.email;
                const prescriberNPI = prescriber?.npiNo;

                const prescriptionDate = formatDate(medication?.prescriptionDate,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
                const { items } = medication;

                if(Array.isArray(items)){
                    items?.forEach(item => {
                    
                        if(item?.marLogs?.length > 0){
                            const { genericDrug,brandNameDrug, amount, unitCode, prescriber, startDate, medicineStatusCode, marLogs } = item || {};
                
                            const medicationName = `${genericDrug} ${brandNameDrug} ${amount} ${unitCode}`;
                            const medicationStartDate = formatDate(startDate, { timezone: patient.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
                            const isDiscontinueDate = medicineStatusCode === 'medication_status_discontinued' && formatDate(discontinueDate, { timezone: patient.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES });
                
                            let marLogRows = '';
                            if (Array.isArray(marLogs)) {
                                marLogs?.forEach(log => {
                                    const logData = log.dataValues;
                                    const formattedDate = formatDate(logData.date, { timezone: patient.timezone, format: dateFormatter.MMDDYYYYhhmmA }) || 'N/A';
                                    const clinicianName = `${logData.clinician?.title?.name || ''} ${getFullName(logData.clinician)}`;
                                    marLogRows += `
                                    <tr>
                                    <td>${formattedDate}</td>
                                    <td>${logData.action?.name}</td>
                                    <td><p>${clinicianName ? `<strong>Clinician:</strong> ${clinicianName}` : ''}
                                        ${logData?.clinicianInitial ? `<br><strong>Clinician Initial:</strong> ${logData?.clinicianInitial}`: ''}
                                        ${logData?.givenByCaregiver ? `<br><strong>Given By Caregiver:</strong> Yes` : '<br><strong>Given By Caregiver:</strong> No'}
                                        ${logData?.refusedReason ? `<br><strong>Refused Reason:</strong> ${logData?.refusedReason}` : ''}
                                        ${logData?.comment ? `<br><strong>Comment:</strong> ${logData?.comment}` : ''}</p>
                                    </td>
                                    </tr>
                                    `;
                                });
                            }

                            medicationSections += `
                            <div class="info-container">
                                <div style="display: flex; justify-content: space-between;">  
                                    <div style="flex: 1; margin-right: 20px;">
                                        <p><strong>Medication Name:</strong> ${medicationName}</p>
                                        <p><strong>Start Date:</strong> ${medicationStartDate}</p>
                                        ${isDiscontinueDate ? `<p><strong>Discontinue Date:</strong> ${isDiscontinueDate}</p>` : ''}
                                    </div>
                                </div>
    
                                <table class="medication-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Action</th>
                                            <th>Information</th>
                                        </tr>
                                    </thead>
                                    <tbody>${marLogRows}</tbody>
                                </table>
    
                                <div class="section-title">Prescriber Details</div>
                                <div style="display: flex; justify-content: space-between;">
                                    <div style="flex: 1; margin-right: 20px;">
                                        <p><strong>Prescriber Name:</strong> ${providerName}</p>
                                        ${providerContact ? `<p><strong>Prescriber Phone Number:</strong> ${providerContact}</p>` : ''}  
                                        ${prescriberNPI ? `<p><strong>Prescriber NPI Number:</strong> ${prescriberNPI}</p>` : ''}               
                                        <p><strong>Prescription Date:</strong> ${prescriptionDate}</p>
                                    </div>
                                    <div style="flex: 1;">
                                        <p><strong>Prescriber Email:</strong> ${providerEmail}</p>
                                        <div class="signature-line">
                                            ${isEmail ? `<img src="cid:signature_image"/>` : `<img style="width:100px;height:100px;object-fit:contain" src="${medication?.signature}"/>`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="horizontal-bar"></div>`;
                        }
            
                    })
                    }
                });
                
            }
    
        const templateFooter = `
            <div class="footer">
                <p>Please follow the instructions provided and contact us if you have any questions or concerns.</p>
                <p>For more details, visit our website:</p>
                <p><a href="${config.clientURL}">${config.clientURL}</a></p>
            </div>
            <div class="footer">
                <p>&copy; 2024 ${practice.name}. All rights reserved.</p>
                <p><a href="${config.clientURL}">Visit our website</a></p>
            </div>
        </body>
    </html>`;

// Combine all parts into final HTML content
const pdfHeader =
`<div style="margin-bottom:50px">${headingHtml}</div>` 
const finalHTML = templateHead + pdfHeader + templateBody + medicationSections +  templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{patientId,patientName,patientEmail,patientAge,patientContact,
    patientAddress,patientDiagnosisData,
    patientAllergies,patientDob,clientURL,patientGender,
}});
    return {template:decodeHtml(_template),attachments}
  };

const createPatientAllMedicationsMARLogPDF =async ({medicationData,practiceSetting, patientData})=> {
    const patientName = getFullName(patientData || {});
    const filename =`${patientName}-All-EMAR-Log-${formatDate(new Date(), { timezone:patientData?.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES })}.pdf`
    const pdfTemplateContent = await generateReportHTMLTemplate({medicationData, patientData,practiceSetting,template:medicationPDFTemplate});
    const pdfBufferData = await createPDF({
        template: pdfTemplateContent.template,
        filename,
      });

    return {pdfBufferData,filename}
}

module.exports={
    createPatientAllMedicationsMARLogPDF,
    generateReportHTMLTemplate,
}
