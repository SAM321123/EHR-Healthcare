const httpStatus = require('http-status');
const { errorMessages } = require('../../config/error');
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex, getAddress } = require('../../utils');
const ApiError = require('../../utils/ApiError');
const { formatDate, dateFormatter, getDateDiff } = require('../../utils/dateUtility');
const { createPDF, createPDFHeading } = require('../../utils/pdfUtility/pdfUtility');
const config = require('../../config/config');
const { shareMedicationTemplate, medicationPDFTemplate } = require('../../config/defaultTemplates');
const { frequencyCodeType, directionCodeType, routeCodeType } = require('../../utils/constant');

const generateReportHTMLTemplate = async ({ patientMedicationItemData, practiceSetting, patientAllergy, patientVitals, patientLabOrder, patientDiagnosis,patientMedication, patientFormPDFTemplate,  isEmail = false }) => {
  let { practiceSetting: practice } = practiceSetting || {};
  // const {medication, marLogs, genericDrug, brandNameDrug, amount, unitCode, startDate, medicineStatusCode, updatedAt, medicineStatus, diagnoses,discontinueDate } = patientMedicationItemData || {};
  const { patient,assignedTo } = patientMedicationItemData || {};
  const patientId = patient?.id;
  let patientName = '';
  if (patient?.title) {
    patientName = `${patient?.title?.name} `;
  }
  patientName += `${getFullName(patient)}`;
  const patientEmail = patient?.email;
  const patientAge = getDateDiff(patient?.dob, new Date(), { unit: 'years' });
  const patientContact = getPatientPhone(patient);
  const patientAddress = patient?.address?.description;
  const patientDob =
    formatDate(patient?.dob, { timezone: patient?.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
  const patientGender = getPatientSex(patient);
  const attachments=[ {
    // filename: 'signature_image.png',
    // content: patientLabRadiologyData.signature.replace(/^data:image\/\w+;base64,/, ''),
    // cid: 'signature_image', // same cid value as in the html img src,
    // type: 'image/png',
    // disposition: 'inline',
    // encoding: 'base64',
}]
    // Prescriber Details
    let providerName = '';
    if(assignedTo?.title){
        providerName = `${assignedTo?.title?.name} `
    }
    providerName +=`${getFullName(assignedTo)}`
    const providerContact =assignedTo?.phone;
    const providerEmail = assignedTo?.email;
    const prescriberNPI = assignedTo?.npiNo;
    const providerSignature = patientMedicationItemData?.signature 
    ? `<div class="signature-wrapper"><img style="width:100px; height:100px; object-fit:contain" src="${patientMedicationItemData.signature}"/></div>` 
    : '';
    const prescriptionDate = formatDate(patientMedicationItemData?.createdAt,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
    const encountersType = patientMedicationItemData?.encounterType?.name;
    const billingType = patientMedicationItemData?.billingType?.name;
    const appointmentDateTime = formatDate(patientMedicationItemData?.startDate,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYYhhmmA}) || 'N/A';
  const clientURL = config.clientURL;

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
        .allergy-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .allergy-table th, .allergy-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */

        }
       .allergy-table th:nth-child(1), .allergy-table td:nth-child(1) {
            width: 25%; 
        }

        .allergy-table th:nth-child(2), .allergy-table td:nth-child(2) {
            width: 15%; 
        }

        .allergy-table th:nth-child(3), .allergy-table td:nth-child(3) {
            width: 45%; 
        }
        .allergy-table th:nth-child(4), .allergy-table td:nth-child(4) {
            width: 15%; 
        }

        .allergy-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .allergy-table th {
            background-color: #337AB7;
            color: white;
        }
        .vital-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .vital-table th, .vital-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */
        }
       .vital-table th:nth-child(1), .vital-table td:nth-child(1) {
            width: 15%; 
        }

        .vital-table th:nth-child(2), .vital-table td:nth-child(2) {
            width: 20%; 
        }

        .vital-table th:nth-child(3), .vital-table td:nth-child(3) {
            width: 10%; 
        }
        .vital-table th:nth-child(4), .vital-table td:nth-child(4) {
            width: 13%; 
        }
        .vital-table th:nth-child(5), .vital-table td:nth-child(5) {
            width: 17%; 
        }
        .vital-table th:nth-child(6), .vital-table td:nth-child(6) {
            width: 10%; 
        }
        .vital-table th:nth-child(7), .vital-table td:nth-child(7) {
            width: 15%; 
        }

        .vital-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .vital-table th {
            background-color: #337AB7;
            color: white;
        }

        .laborder-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .laborder-table th, .laborder-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */

        }
       .laborder-table th:nth-child(1), .laborder-table td:nth-child(1) {
            width: 15%; 
        }

        .laborder-table th:nth-child(2), .laborder-table td:nth-child(2) {
            width: 15%; 
        }

        .laborder-table th:nth-child(3), .laborder-table td:nth-child(3) {
            width: 55%; 
        }
        .laborder-table th:nth-child(4), .laborder-table td:nth-child(4) {
            width: 15%; 
        }

        .laborder-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .laborder-table th {
            background-color: #337AB7;
            color: white;
        }
        .diagnosis-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .diagnosis-table th, .diagnosis-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            word-break: break-word; /* Ensures content wraps inside the cells */

        }
       .diagnosis-table th:nth-child(1), .diagnosis-table td:nth-child(1) {
            width: 15%; 
        }

        .diagnosis-table th:nth-child(2), .diagnosis-table td:nth-child(2) {
            width: 35%; 
        }

        .diagnosis-table th:nth-child(3), .diagnosis-table td:nth-child(3) {
            width: 35%; 
        }
        .diagnosis-table th:nth-child(4), .diagnosis-table td:nth-child(4) {
            width: 15%; 
        }

        .diagnosis-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .diagnosis-table th {
            background-color: #337AB7;
            color: white;
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
            width: 40%; 
        }

        .medication-table th:nth-child(2), .medication-table td:nth-child(2) {
            width: 35%; 
        }

        .medication-table th:nth-child(3), .medication-table td:nth-child(3) {
            width: 25%; 
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
        <div class="header mainTitle">Encounters</div>
            <div style="display: flex; justify-content: space-between;">  
                <div style="flex: 1; margin-right: 20px;">
                    <p><strong>Encounter No:</strong> #swift-charting-[patientId]</p>
                    <p><strong>Encounters Type:</strong> [encountersType]</p>
                    ${patientGender && patientGender!=='N/A' ? `<p><strong>Patient Gender:</strong> [patientGender]</p>` : ''}  
                </div>
                    <div style="flex: 1;">
                    <p><strong>Billing Type:</strong> [billingType]</p>   
                    <p><strong>Encounter Date & Time:</strong> [appointmentDateTime]</p>              
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Patient Information</div>
            <div style="display: flex; justify-content: space-between;">  
                <div style="flex: 1; margin-right: 20px;">
                    <p><strong>Patient Name:</strong> [patientName]</p>
                    <p><strong>Patient Dob:</strong> [patientDob]</p>
                    <p><strong>Patient Email:</strong> [patientEmail]</p>
                    ${patientGender && patientGender!=='N/A' ? `<p><strong>Patient Gender:</strong> [patientGender]</p>` : ''}  
                </div>
                    <div style="flex: 1;">
                    ${patientAge ? `<p><strong>Patient Age:</strong> [patientAge]</p>` : ''}               
                    ${patientContact && patientContact!=='N/A' ? `<p><strong>Patient Contact:</strong> [patientContact]</p>` : ''} 
                    ${patientAddress ? `<p><strong>Patient Address:</strong> [patientAddress]</p>` : ''}                 
                </div>
            </div>

            <div class="horizontal-bar"></div>
            `
            let allergyTable = '';
            if (patientAllergy && patientAllergy.length > 0) {
                allergyTable +=  `
                <div class="section-title">Allergies</div>
                    <table class="allergy-table">
                    <tr>
                        <th>Allergent</th>
                        <th>Severity</th>
                        <th>Reaction</th>
                        <th>Date Onset</th>
                    </tr>`
                patientAllergy?.forEach(item => {
                    allergyTable += `
                    <tr>
                        <td>${item?.allergy || 'N/A'}</td>
                        <td>${item?.severities?.name || 'N/A'}</td>
                        <td>${item?.reactions?.length > 0 ? item?.reactions?.map(reaction => reaction?.name).join(', ') : 'N/A'}</td>
                        <td>${formatDate(item?.dateOfOnSet,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A'} </td>
                    </tr>`;
                });
                allergyTable += `</table>`;
            }
            let vitalsTable = ''
            if(patientVitals && patientVitals.length > 0){
                vitalsTable +=  `
                <div class="section-title">Vitals</div>
                    <table class="vital-table">
                    <tr>
                        <th>Blood Pressure</th>
                        <th>Respiratory Rate</th>
                        <th>Temp.</th>
                        <th>Height</th>
                        <th>Weight</th>
                        <th>BMI</th>
                        <th>Recorded</th>
                    </tr>`;
                patientVitals?.forEach(item => {
                    vitalsTable += `
                    <tr>
                        <td>${(item?.bloodPressure) ? item?.bloodPressure + 'mm/Hg' : 'N/A'}</td>
                        <td>${(item?.respiratoryRate) ? item?.respiratoryRate + 'rpm' : 'N/A'}</td>
                        <td>${item?.tempreature ? `${item.tempreature} °F` : 'N/A'}</td>
                        <td>${(item?.ft && item?.in) ? item.ft + ' ft ' + item.in + ' in' : 'N/A'}</td>
                        <td>${(item?.lsb && item?.oz) ? item.lsb + ' lbs ' + item.oz + ' oz' : 'N/A'}</td>
                        <td>${item?.bmi || 'N/A'}</td>
                        <td>${formatDate(item?.recordDateTime,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYYhhmmA}) || 'N/A'} </td>
                    </tr>`;
                });
                vitalsTable += '</table>';
            }
            let labOrderTable = '';
            if(patientLabOrder && patientLabOrder.length > 0){
                labOrderTable += `<div class="section-title">Lab Orders</div>
                    <table class="laborder-table">
                    <tr>
                        <th>Order Id</th>
                        <th>Status</th>
                        <th>Lab Test</th>
                        <th>Order Date</th>
                    </tr>`;
                patientLabOrder?.forEach(item => {
                    labOrderTable += `
                    <tr>
                        <td>${item?.id || 'N/A'}</td>
                        <td>${(item?.status?.name) ? item?.status?.name : 'N/A'}</td>
                        <td>${(item?.laboratoryTests?.length > 0 || item?.otherLaboratoryTest?.length > 0) 
                            ? [...(item?.laboratoryTests || []).map(labTest =>`${labTest?.name}`),
                            ...(item?.otherLaboratoryTest || [])].join(', ')
                            : 'N/A'}</td>
                        <td>${formatDate(item?.createdAt,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYYhhmmA}) || 'N/A'} </td>

                    </tr>`;
                });
                labOrderTable += '</table>';
            }

            let diagnosisTable = '';
            if(patientDiagnosis && patientDiagnosis.length > 0 ) {
                diagnosisTable += `<div class="section-title">Diagnosis</div>
                    <table class="diagnosis-table">
                    <tr>
                        <th>Diagnosis</th>
                        <th>Diagnosis Description</th>
                        <th>ICD10</th>
                        <th>Type</th>
                    </tr>`;
                patientDiagnosis?.forEach(item => {
                    diagnosisTable += `
                    <tr>
                        <td>${(item?.problem?.name) ? item?.problem?.name : 'N/A'}</td>
                        <td>${(item?.problem?.description) ? item?.problem?.description : 'N/A'}</td>
                        <td>${(item?.ICD?.name) ? item?.ICD?.name +'('+ item?.ICD?.description + ')' : 'N/A'}</td>
                        <td>${(item?.type?.name) ? item?.type?.name : 'N/A'}</td>
                    </tr>`;
                });
                diagnosisTable += '</table>';
            }
            let medicationTable = '';
            if(patientMedication && patientMedication.length > 0){
                medicationTable += `<div class="section-title">Medication</div>
                    <table class="medication-table">
                    <tr>
                        <th>Medication Name</th>
                        <th>Prescriber</th>
                        <th>Created on</th>
                    </tr>`;
                patientMedication?.forEach(item => {
                    const medicationDetails = item?.items?.map(item=>item?.genericDrug).join(', ') || 'N/A';
                    const prescriberFullName = `${getFullName(item?.prescriber)}`;
                    medicationTable += `
                    <tr>
                        <td>${medicationDetails}</td>
                        <td>${prescriberFullName}</td>
                        <td>${formatDate(item?.createdAt,{timezone:assignedTo.timezone,format:dateFormatter.MMDDYYYYhhmmA}) || 'N/A'} </td>
                    </tr>`;
                });
                medicationTable += '</table>';
            }
            let medicationShopForm = ''; 
            const emptyTagPattern = /<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;
            if(patientMedicationItemData?.soapForm){
                if(patientMedicationItemData?.soapForm?.subjective){
                    medicationShopForm += `<div class="section-title">Subjective Note</div>`
                    medicationShopForm += (patientMedicationItemData?.soapForm?.subjective).replace(emptyTagPattern, '').trim();
                }

                if(patientMedicationItemData?.soapForm?.objective){
                    medicationShopForm += `<div class="section-title">Objective Note</div>`
                    medicationShopForm += (patientMedicationItemData?.soapForm?.objective).replace(emptyTagPattern, '').trim();
                }

                if(patientMedicationItemData?.soapForm?.assessment){
                    medicationShopForm += `<div class="section-title">Assessment Note</div>`
                    medicationShopForm += (patientMedicationItemData?.soapForm?.assessment).replace(emptyTagPattern, '').trim();
                }

                if(patientMedicationItemData?.soapForm?.plan){
                    medicationShopForm += `<div class="section-title">Plan Note</div>`
                    medicationShopForm += (patientMedicationItemData?.soapForm?.plan).replace(emptyTagPattern, '').trim();
                }
            }

const templateFooter = `
            
            <div class="horizontal-bar"></div>  

            <div class="section-title">Provider Details</div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="flex: 1; margin-right: 20px;">
                        <p><strong>Name:</strong> [providerName]</p>
                        ${providerContact ? `<p><strong>Phone Number:</strong> [providerContact]</p>` : ''}  
                        ${prescriberNPI ? `<p><strong>NPI Number:</strong> [prescriberNPI]</p>` : ''} 
                        <p><strong>Signature</strong></p>
                        <div class="signature-line">[providerSignature]</div>              
                    </div>
                    <div style="flex: 1;">
                        <p><strong>Email:</strong> [providerEmail]</p>
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

const pdfHeader =
`<div style="margin-bottom:50px">${createPDFHeading({ practice, practiceSetting })}</div>` 
const finalHTML = templateHead + pdfHeader+ templateBody + allergyTable + vitalsTable + labOrderTable + diagnosisTable + medicationTable 
    + medicationShopForm + patientFormPDFTemplate +templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{patientId,patientName,patientDob,patientEmail,patientAge,patientContact,
    providerName,providerContact,prescriberNPI,providerEmail,providerSignature,prescriptionDate,patientAddress,
    encountersType,billingType,appointmentDateTime
}});
    return {template:decodeHtml(_template),attachments}  
};

const createPatientEncounterLogPDF = async ({
  patientMedicationItemData,
  practiceSetting,
  patientAllergy,
  patientLabOrder,
  patientVitals,
  patientDiagnosis,
  patientMedication,
  patientFormPDFTemplate,
}) => {
  const { patient } = patientMedicationItemData || {};
  const patientName = getFullName(patient || {});
  const filename = `${patientName}-Encounter-${formatDate(new Date(), {
    timezone: patient?.timezone,
    format: dateFormatter.MMDDYYYY_WITH_SLASHES,
  })}.pdf`;
  const pdfTemplateContent = await generateReportHTMLTemplate({
    patientMedicationItemData,
    practiceSetting,
    patientAllergy,
    patientVitals,
    patientLabOrder,
    patientDiagnosis,
    patientMedication,
    patientFormPDFTemplate,
    template: medicationPDFTemplate,
  });
  const pdfBufferData = await createPDF({
      template: pdfTemplateContent.template,
      filename,
    });
  return {pdfBufferData,filename}
};

module.exports = {
  createPatientEncounterLogPDF,
};
