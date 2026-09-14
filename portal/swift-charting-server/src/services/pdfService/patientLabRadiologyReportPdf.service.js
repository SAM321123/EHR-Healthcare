const httpStatus = require("http-status");
const { errorMessages } = require("../../config/error");
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex, getAddress } = require("../../utils");
const ApiError = require("../../utils/ApiError");
const { formatDate, dateFormatter, getDateDiff } = require("../../utils/dateUtility");
const { createPDF, createPDFHeading } = require("../../utils/pdfUtility/pdfUtility");
const config = require("../../config/config");
const { shareMedicationTemplate, medicationPDFTemplate } = require("../../config/defaultTemplates");
const { frequencyCodeType, directionCodeType, routeCodeType } = require("../../utils/constant");


const generateReportHTMLTemplate = async ({ patientLabRadiologyData,practiceSetting,resultData,isEmail=false }) => {
let {practiceSetting:practice}=  practiceSetting ||{};
const {patient,provider, testingLabs, diagnosisIcd, payerInfo, laboratoryTests } = patientLabRadiologyData || {};
const patientName = `${patient?.title?.name} ${getFullName(patient)}`;
const patientEmail = patient?.email;
const patientAge = getDateDiff(patient?.dob,new Date(),{unit:'years'}) || 'N/A';
const patientContact = getPatientPhone(patient);
const patientAddress = patient?.address?.description || 'N/A';
const patientDob= formatDate(patient.dob,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
const patientGender = getPatientSex(patient);
const patientDiagnosisData = patient?.problems?.map(item=>item?.problem?.name).join(', ') || 'N/A';
const patientAllergies = patient?.allergies?.map(item=>item.name).join(', ') || 'N/A';

const providerName = `${provider?.titleCode} ${getFullName(provider)}`;
const providerContact =provider?.phone || 'N/A';
const providerEmail = provider?.email || 'N/A';
const orderDate = formatDate(patientLabRadiologyData.createdAt,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
const providerSignature = isEmail ?`<div class="singature-wrapper"><img src="cid:signature_image"/></div>`  : `<div class="singature-wrapper"><img style="widht:100px;height:100px;object-fit:contain" src="${patientLabRadiologyData.signature}"/></div>`
const orderId = `#swift-charting-${patientLabRadiologyData?.id}` || 'N/A';
const testingLabName = testingLabs?.name;
const sendingApplication = patientLabRadiologyData?.sendingApplication;
const priority = patientLabRadiologyData?.priority;
const requiredTestingTime = patientLabRadiologyData?.requiredTestingTime;
const specimenTypeCode = patientLabRadiologyData?.specimenTypeCode;
const siteOfCollection = patientLabRadiologyData?.siteOfCollection;
const collectionDateTime = formatDate(patientLabRadiologyData?.collectionDateTime,{timezone:patient.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES}) || 'N/A';
const quantity = patientLabRadiologyData?.specimenQuantity;
const volume = patientLabRadiologyData?.specimenVolume;
const payerName = payerInfo?.name;
const allergies = patientLabRadiologyData?.allergies;
const medicalHistory = patientLabRadiologyData?.medicalHistory;
const diagnosis = diagnosisIcd?.diagnosisProblem?.name;
const relevantClinicalInfo = patientLabRadiologyData?.clinicalInfo;
const suspectedCondition = patientLabRadiologyData?.suspectedCondition?.map((condition) => condition?.id ? condition?.name : condition);
const obrSegments = resultData?.OBR || [];
const obxSegments = resultData?.OBX || [];
const mshSegments = resultData?.MSH || [];

const sendingFacility = mshSegments[0]?.[5];
const resultDateTimeString = obxSegments[0]?.[13];
const year = resultDateTimeString?.slice(0, 4);
const month = resultDateTimeString?.slice(4, 6);
const day = resultDateTimeString?.slice(6, 8);
const hours = resultDateTimeString?.slice(8, 10);
const minutes = resultDateTimeString?.slice(10, 12);
const formattedDate = `${month}/${day}/${year}`;
const formattedTime = `${hours}:${minutes}`;

const attachments=[ {
    filename: 'signature_image.png',
    content: patientLabRadiologyData.signature.replace(/^data:image\/\w+;base64,/, ''),
    cid: 'signature_image', // same cid value as in the html img src,
    type: 'image/png',
    disposition: 'inline',
    encoding: 'base64',
}]
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
        <div class="header mainTitle">Lab Report</div>
        <div id="pdf" class="tab-content">
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Order No.</strong>[orderId]</p>
                    <p><strong>Testing Lab</strong>[testingLabName]</p>
                    <p><strong>Sending Application</strong>[sendingApplication]</p>
                    </div>
                    <div class="info-block">
                      <p><strong>Order Date</strong>[orderDate]</p>
                      <p><strong>Report Date</strong>[formattedDate][formattedTime]</p>
                      <p><strong>Sending Facility</strong>[sendingFacility]</p>
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
                </div>
                <div class="info-block">
                    <p><strong>Age</strong>[patientAge]</p>
                    <p><strong>Date of Birth</strong>[patientDob]</p>
                    <p><strong>Gender</strong>[patientGender]</p>
                    <p><strong>Notable Health Condition</strong>[patientDiagnosisData]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Urgency</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Priority</strong>[priority]</p>
                </div>
                <div class="info-block">
                    <p><strong>Specific timing requirements for testing</strong>[requiredTestingTime]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Diagnosis</div>
            <div class="info-container">
                <div class="info-block">
                    <p>[diagnosis]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Specimen Details</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Specimen Type</strong>[specimenTypeCode]</p>
                    <p><strong>Site of Collection</strong>[siteOfCollection]</p>
                    <p><strong>Collection Date/Time</strong>[collectionDateTime]</p>
                </div>
                <div class="info-block">
                    <p><strong>Quantity</strong>[quantity]</p>
                    <p><strong>Volume</strong>[volume]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Clinical Indications/Reason for Test</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Relevant clinical information</strong>[relevantClinicalInfo]</p>
                    <p><strong>Differential diagnoses or suspected conditions</strong>[suspectedCondition]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Payer</div>
            <div class="info-container">
                <div class="info-block">
                    <p>[payerName]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Additional Information</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Allergies or contraindications relevant to the testing</strong>[allergies]</p>
                </div>
                  <div class="info-block">
                    <p><strong>Relevant medical history impacting testing</strong>[medicalHistory]</p>
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Test Orders</div>
            <table class="medication-table">
                <tr>
                    <th>Test Name</th>
                </tr>`;

// Generate rows for medication table dynamically
let templateTable = '';
laboratoryTests?.forEach(item => {
    templateTable += `
        <tr>
            <td>${item?.name}</td>
        </tr>`;
});

// Generating lab test HTML
const labTestsHTML = obrSegments?.map(test => {
    const relatedResults = obxSegments
      .filter(result => result[3].startsWith(test[4].split(' ')[0]))
      .map(result => `
        <tr>
          <td>${result[3]}</td>
          <td>${result[5]}</td>
          <td>${result[6]}</td>
          <td>${result[7]}</td>
          <td>${result[8]}</td>
        </tr>
      `).join('');
    
    return `
      <div>
        <h4>${test[4]}</h4>
        <table class="medication-table">
            <tr>
              <th>Test</th>
              <th>Result</th>
              <th>Units</th>
              <th>Reference Range</th>
              <th>Abnormal</th>
            </tr>
            ${relatedResults}
        </table>
      </div>
    `;
  }).join('');


const labTestSection = labTestsHTML && `<div class="horizontal-bar"></div>
     <div class="section-title">Test Report</div> ${labTestsHTML}`  

const templateFooter = `
</table>
  ${labTestSection}
<div class="section-title">Provider Details</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Provider Name</strong>[providerName]</p>
                    <p><strong>Provider Phone Number</strong>[providerContact]</p>
                    <p><strong>Provider NPI Number</strong>N/A</p>                
                </div>
                <div class="info-block">
                 <p><strong>Provider Email</strong>[providerEmail]</p>
                    <p><strong>Date</strong>[prescribedDate]</p>
                    <p><strong>Provider Signature</strong></p>
                     <div class="signature-line">[providerSignature]</div>
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
`<div style="margin-bottom:50px">${createPDFHeading({ practice, practiceSetting })}</div>` 
const finalHTML = templateHead + pdfHeader+ templateBody + templateTable + templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{patientName,patientEmail,patientAge,patientContact,
    patientAddress,patientDiagnosisData,
    patientAllergies,patientDob,providerName,orderDate,providerContact,
    providerEmail,orderId,clientURL,providerSignature,patientGender, testingLabName, sendingApplication,
    priority, requiredTestingTime,diagnosis,
    collectionDateTime, specimenTypeCode, quantity, volume,siteOfCollection,
    allergies, medicalHistory, relevantClinicalInfo, payerName, suspectedCondition,
    sendingFacility,formattedDate, formattedTime,

}});
    return {template:decodeHtml(_template),attachments}
  };

const createPatientReportPDF =async ({patientLabRadiologyData,resultData,practiceSetting})=> {
    const {patient} = patientLabRadiologyData || {};
    const patientName = getFullName(patient || {});
    const filename =`${patientName}-Lab-Report-${formatDate(new Date(), { timezone:patient?.timezone,format:dateFormatter.MMDDYYYY_WITH_SLASHES })}.pdf`
    const pdfTemplateContent = await generateReportHTMLTemplate({patientLabRadiologyData,practiceSetting,resultData,template:medicationPDFTemplate});
    const pdfBufferData = await createPDF({
        template: pdfTemplateContent.template,
        filename,
      });
    return {pdfBufferData,filename}
}

module.exports={
    createPatientReportPDF,
    generateReportHTMLTemplate,
}
