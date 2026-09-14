const httpStatus = require('http-status');
const { errorMessages } = require('../../config/error');
const { getFullName, getDynamicTemplate, decodeHtml, getPatientPhone, getPatientSex } = require('../../utils');
const ApiError = require('../../utils/ApiError');
const { formatDate, dateFormatter, getDateDiff } = require('../../utils/dateUtility');
const { createPDF, createPDFHeading } = require('../../utils/pdfUtility/pdfUtility');
const config = require('../../config/config');
const { shareMedicationTemplate, medicationPDFTemplate } = require('../../config/defaultTemplates');
const { frequencyCodeType, directionCodeType, routeCodeType } = require('../../utils/constant');

const generateHTMLTemplate = async ({ patientInvoiceData, practiceSetting, isEmail = false }) => {
    let { practiceSetting: practice } = practiceSetting || {};
    
    const { patient, prescriber } = patientInvoiceData || {};
    const patientName = `${patient?.title?.name || ''} ${getFullName(patient)}`;
    const patientEmail = patient?.email;
    const patientAge = getDateDiff(patient?.dob, new Date(), { unit: 'years' }) || 'N/A';
    const patientContact = getPatientPhone(patient);
    const patientAddress = patient?.address?.description || 'N/A';
    const patientDob =
    formatDate(patient?.dob, { timezone: patient?.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
    const patientGender = getPatientSex(patient);
    
    const encounterData = patientInvoiceData?.encounter;
    const billingData = patientInvoiceData?.encounter?.billing;
    const encounterType = encounterData?.encounterType?.name;
    const billingType = encounterData?.billingType?.name;     
    const encounterStart = formatDate(encounterData?.startDate, { timezone: patient?.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
    const encounterEnd =  formatDate(encounterData?.endDate, { timezone: patient?.timezone, format: dateFormatter.MMDDYYYY_WITH_SLASHES }) || 'N/A';
    const encounterAssignTo = `${getFullName(encounterData?.assignedTo)}`; 
    const duration = encounterData?.duration || 'N/A';
    let cardType = 'N/A'; 
    const cardLastDigit = billingData?.cardNo || 'N/A';
    const emptyText = '--------';
    const billingProvider = `${getFullName(billingData?.primaryProvider)}`;
    const referenceProviderName = getFullName(billingData?.referenceProvider);
    const billingReferenceProvider =
        typeof referenceProviderName === 'string' && referenceProviderName.trim()
        ? referenceProviderName
        : 'N/A';
    // const billingReferenceProvider = `${getFullName(billingData?.referenceProvider) || 'N/A'}`;
    const location = billingData?.location?.name || 'N/A';
    const subTotal = billingData?.subTotal || '0.00';
    const tip = billingData?.tip || '0.00';
    const previousBalance = billingData?.previousBalance || '0.00';
    const paymentCash = billingData?.cash || '0.00';
    const paymentCard = billingData?.cardAmount || '0.00';
    const prePaidCash = billingData?.prePaidCash || '0.00';
    const insuranceAmount = billingData?.insuranceSubmittedAmount || '0.00';
    const balance = patientInvoiceData?.due;
    const paymentType = patientInvoiceData?.paymentType;
    if(encounterData?.billingType?.cardType){
        cardType = encounterData?.billingType?.cardType === 'creditCard' 
        ? 'Credit Card'
        : 'Debit Card'
    }

    let invoicePaymentType;
    if(paymentType === 'payInvoiceInFull'){
        invoicePaymentType = 'Pay Invoice in Full';
    } else if(paymentType === 'partialPayment'){
        invoicePaymentType = 'Partial Payment';
    }else{
        invoicePaymentType = 'N/A';
    }

    const invoicePaymentMode = patientInvoiceData?.paymentMode;
    const invoicePaymentAmount = patientInvoiceData?.paymentAmount;

  const prescriberName = `${getFullName(prescriber)}`;
  const prescriberContact = prescriber?.phone || 'N/A';
  const prescriberEmail = prescriber?.email || 'N/A';
  const invoiceDate =
    formatDate(patientInvoiceData.createdAt, {
      timezone: patient?.timezone,
      format: dateFormatter.MMDDYYYY_WITH_SLASHES,
    }) || 'N/A';
//   const prescriberSignature = isEmail
//     ? `<div class="singature-wrapper"><img src="cid:signature_image"/></div>`
//     : `<div class="singature-wrapper"><img style="widht:100px;height:100px;object-fit:contain" src="${patientMedicationData.signature}"/></div>`;
  const invoiceId = `#swift-charting-${patientInvoiceData?.id}` || 'N/A';
  const due = patientInvoiceData?.due;
//   const attachments = [
//     {
//       filename: 'signature_image.png',
//       content: patientMedicationData.signature.replace(/^data:image\/\w+;base64,/, ''),
//       cid: 'signature_image', // same cid value as in the html img src,
//       type: 'image/png',
//       disposition: 'inline',
//       encoding: 'base64',
//     },
//   ];
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

        table th, table td {
            padding: 8px 10px;  /* Adjusted padding */
            text-align: left;
            border-bottom: 1px solid #ddd;
            font-size: 12px;  /* Smaller font size */
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
        <div class="header mainTitle">Invoice</div>
        <div id="pdf" class="tab-content">
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Invoice No.</strong>[invoiceId]</p>
                    </div>
                     <div class="info-block">
                      <p><strong>InvoiceDate Date</strong>[invoiceDate]</p>
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
                </div>
            </div>
            <div class="horizontal-bar"></div>
            <div class="section-title">Encounter Information</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Encounter Type</strong>[encounterType]</p>
                    <p><strong>Encounter Start</strong>[encounterStart]</p>
                    <p><strong>Encounter Assign To</strong>[encounterAssignTo]</p>
                </div>
                <div class="info-block">
                    <p><strong>Billing Type</strong>[billingType]</p>
                    <p><strong>Encounter End</strong>[encounterEnd]</p>
                    <p><strong>Duration</strong>[duration]</p>
                </div>
            </div>

            <div class="horizontal-bar"></div>
            <div class="section-title">Encounter Billing Information</div>
            <div class="info-container">
                <div class="info-block">
                    <p><strong>Billing Provider</strong>[billingProvider]</p>
                    <p><strong>Card Type</strong>[cardType]</p>
                    <p><strong>Card Last Digits</strong>[cardLastDigit]</p>
                </div>
                <div class="info-block">
                    <p><strong>Billing Reference Provider</strong>[billingReferenceProvider]</p>
                    <p><strong>Location</strong>[location]</p>
                </div>
            </div>

            <div class="horizontal-bar"></div>
            <div class="section-title">Encounter Procedure Codes</div>
            <table class="medication-table">
                <tr>
                    <th>Index</th>
                    <th>CPT Code</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Date Of Service</th>
                    <th>Volume</th>
                    <th>Disc Amt</th>
                    <th>Tax</th>
                    <th>Cost</th>
                    <th>Total</th>
                </tr>`;

  // Generate rows for medication table dynamically
  let templateTable = '';
  billingData?.encounterProcedureCodes.forEach((item, index) => {
    let totalTax = item?.addOnFields?.taxAmt;
    let totalDisc = item?.addOnFields?.discAmt;
    if(item?.addOnFields?.discPer){
        totalDisc = (item?.addOnFields?.discPer * item?.addOnFields?.price)/ 100  
    }
    if(item?.addOnFields?.discPer){
        totalTax = (item?.addOnFields?.taxPer * item?.addOnFields?.price)/100
    }
    templateTable += `
        <tr>
            <td>${index + 1}</td>
            <td>${item?.cptCode}</td>
            <td>${item?.name}</td>
            <td>${item?.description}</td>
            <td>${formatDate(item?.addOnFields?.dataValues?.serviceDa, {
              timezone: patient.timezone,
              format: dateFormatter.MMDDYYYY_WITH_SLASHES,
            })}</td>
            <td>${item?.addOnFields?.qty}</td>
            <td>$${totalDisc}</td>
            <td>$${totalTax}</td>
            <td>$${item?.addOnFields?.price}</td>
            <td>$${item?.addOnFields?.total}</td>
        </tr>`;
  });

  const templateFooter = `</table>
  
<div class="section-title">Charges Summary</div>
  -------------------------------------------------------------------------------------------------------------
  <div class='info-container'>
    <div class='info-block'>
        <p><strong>Charges</strong></p>
        <p>Subtotal : </p>
        <p>Tip : </p>
        <p>Previous Balance : </p>
    </div>
     <div class='info-block'>
        <p>[emptyText]</p>
        <p>$[subTotal]</p>
        <p>$[tip]</p>
        <p>$[previousBalance]</p>

    </div>
  </div>
  -------------------------------------------------------------------------------------------------------------
  <div class='info-container'>
  <div class='info-block'>
        <p><strong>Payments</strong></p>
        <p>Payment (Cash) : </p>
        <p>Payment (Card) : </p>
        <p>Prepaid Amount : </p>
        <p>Amount submited to insurance : </p>
    </div>
     <div class='info-block'>
        <p>[emptyText]</p>
        <p>$[paymentCash]</p>
        <p>$[paymentCard]</p>
        <p>$[prePaidCash]</p>
        <p>$[insuranceAmount]</p>
    </div>
  </div>
  -------------------------------------------------------------------------------------------------------------
  <div class='info-container'>
  <div class='info-block'>
        <p><strong>Invoice Payments</strong></p>
        <p>Invoice Payment Type : </p>
        <p>Invoice Payment Mode : </p>
        <p>Invoice Payment Amount : </p>
    </div>
     <div class='info-block'>
        <p>[emptyText]</p>
        <p>[invoicePaymentType]</p>
        <p>[invoicePaymentMode]</p>
        <p>$[invoicePaymentAmount]</p>
    </div>
  </div>
  -------------------------------------------------------------------------------------------------------------
  <div class='info-container'>
    <div class='info-block'>
        <p><strong>Balance : </strong></p>
    </div>
     <div class='info-block'>
        <p>$[balance]</p>
    </div>
  </div>
  -------------------------------------------------------------------------------------------------------------
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
const finalHTML = templateHead + pdfHeader+ templateBody + 
templateTable + 
templateFooter;
const _template = getDynamicTemplate({text:finalHTML,params:{
    patientName,patientEmail,patientAge,patientContact,patientAddress,patientDob,prescriberName,
    prescriberContact,prescriberEmail,clientURL,patientGender,
    invoiceDate, invoiceId, encounterType, billingType, encounterAssignTo, duration, encounterStart, encounterEnd,
    cardLastDigit, paymentCard, paymentCash, insuranceAmount, previousBalance, due, prePaidCash, tip, subTotal, cardType, balance,
    emptyText, invoicePaymentType, invoicePaymentMode, invoicePaymentAmount,
    billingProvider, billingReferenceProvider, location
}});
    return {template:decodeHtml(_template)}
  };

const createPatientInvoicePDF = async ({ patientInvoiceData, patient, practiceSetting }) => {
  // const {patient} = patientDetails || {};
  const patientName = getFullName(patient || {});
  const filename = `${patientName}-Invoice-${formatDate(new Date(), {
    timezone: patient?.timezone,
    format: dateFormatter.MMDDYYYY_WITH_SLASHES,
  })}.pdf`;
  const pdfTemplateContent = await generateHTMLTemplate({
    patientInvoiceData,
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
  createPatientInvoicePDF,
  generateHTMLTemplate,
};
