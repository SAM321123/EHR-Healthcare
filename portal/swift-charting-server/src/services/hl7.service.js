const hl7 = require('simple-hl7');
const hl7Parser = require('hl7-parser');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const moment = require('moment');
const { getAddress } = require('../utils');
// const {validateHl7Message} = require('./hl7Validator.service') 

// Function to convert a normal message to HL7 format
const convertToHl7 = async (req, data) => {
  try {
    const { clinicUuid } = req;
    const db = getModels(clinicUuid);

    const {
      sendingApplication,
      sendingFacility,
      sendingFacilityData,
      receivingApplication = '',
      receivingFacility = '',
      hl7VersionCode,
      patientId = '',
      providerId ='',
      priority='',
      requiredTestingTime='',
      diagnosisIcdId='',
      barCode='',
      specimenTypeCode='',
      siteOfCollection='',
      collectionDateTime='',
      specimenQuantity='',
      specimenVolume='',
      clinicalInfo='',
      suspectedCondition='',
      fastingCode='',
      patientPrepIns='',
      sensitiveInsTime='',
      // processById='',
      orderId='',
      allergies='',
      medicalHistory='',
      laboratoryTestIds=[],
      otherLaboratoryTest=[],
      payer='',
      } = data;

    const formatName = (lastName, middleName, firstName) => {
      if (middleName) {
        return `${lastName}^${middleName}^${firstName}`;
      } else {
        return `${lastName}^${firstName}`;
      }
    };

    // message header
    const security = '';
    const messageControlId = '';
    const processId = '';
    const msg = new hl7.Message(
      sendingApplication || '',
      sendingFacility,
      receivingApplication,
      receivingFacility,
      // new Date(),
      moment().format('YYYYMMDDHHmmss'),
      security,
      'ORM^O01',
      messageControlId,
      processId,
      hl7VersionCode,
    );

    // fac facility information
    const sendingFacilityName = sendingFacilityData?.name;
    const sendingFacilityAddress = getAddress(sendingFacilityData);
    const sendingFacilityPhone = sendingFacilityData?.phoneNo;
    const sendingFacilityFax = sendingFacilityData?.faxNo;
    const sendingFacilityContactPerson = sendingFacilityData?.contactPersonNo;
    const sendingFacilityContactPersonName = sendingFacilityData?.contactPersonName;
    const sendingFacilityContactPersonEmail = sendingFacilityData?.contactPersonEmail;
    msg.addSegment('FAC',
      '1', 
      sendingFacilityName || '', 
      sendingFacilityAddress || '', 
      sendingFacilityPhone || '', 
      sendingFacilityFax || '', 
      sendingFacilityContactPerson || '',
      sendingFacilityContactPersonName || '',
      sendingFacilityContactPersonEmail || '',
    );


    // patient information
    let sqId = '1';
    let pIList ='';
    let alternatePatientId ='';    
    let patientName = '';
    let maidenName = '';
    let patientDob = '';
    let patientGender = '';
    let patientAlias ='';
    let race = '';
    let patientAddress ='';
    let countryCode ='';
    let patientPhone ='';
    let patientBusinessPhone = '';
    let primaryLanguage = '';
    let patientMaritalStatus='';
    let patientReligion='';
    let patientAccountNo = '';
    let patientSSNumber = '';
    let patientDL = '';

    if (patientId) {
      const patient = await dbService.getOneById({
        model: db.Patient,
        id: patientId,
      });

      const genderFormat = patient?.sexAtBirthCode?.lastIndexOf('_') || '';
      const genderSubstring = patient?.sexAtBirthCode?.slice(genderFormat + 1) || '';

      if (patient) {
        patientName = formatName(patient?.lastName, patient?.middleName, patient?.firstName)
        patientDob = moment(patient?.dob).format('YYYYMMDDHHmmss');
        patientGender = genderSubstring?.charAt(0)?.toUpperCase() || '';
        patientAddress = patient?.address?.description;
        patientPhone = patient?.phone;
        patientMaritalStatus = patient?.maritalStatusCode;
        patientReligion = patient?.religion;
        race = patient?.raceCode;
        patientBusinessPhone = patient?.workPhone;
      } else {
        console.warn(`Patient with ID ${patientId} not found.`);
      }
    }
    msg.addSegment('PID', 
      sqId || '', 
      patientId || '', 
      pIList || '', 
      alternatePatientId || '', 
      patientName||'', 
      maidenName||'', 
      patientDob||'', 
      patientGender||'', 
      patientAlias||'', 
      race||'',
      patientAddress||'', 
      countryCode||'', 
      patientPhone||'', 
      patientBusinessPhone||'',
      primaryLanguage|| '',
      patientMaritalStatus||'', 
      patientReligion||'', 
      patientAccountNo||'',
      patientSSNumber||'',
      patientDL|| ''
    );

    
    // patient visit
    // const patientClass = '';
    // const referringDoctor='';
    // const visitNumber='';
    // const financialClass=''; 
    // msg.addSegment('PV1', 
    //   patientClass||'', 
    //   referringDoctor||'', 
    //   visitNumber||'', 
    //   financialClass||''
    // );
    
    // provider info
    let providerName ='';
    let providerInfo ='';
    if (providerId) {
      const provider = await dbService.getOneById({
        model: db.Staff,
        id: providerId,
      });
      if (provider) {
        providerName = formatName(provider?.lastName, provider?.middleName, provider?.firstName)
        providerInfo = `${provider?.titleCode}^${providerName}^${provider?.npiNo || ''}`;
      } else {
        console.warn(`Provider with ID ${providerId} not found.`);
      }
    }
 
    // process by info
    let processByName = '';
    // if(processById) {
    //   const processBy = await dbService.getOneById({
    //     model: db.Staff,
    //     id: processById,
    //   })
    //   if(processBy) {
    //     processByName = formatName(processBy?.lastName, processBy?.middleName, processBy?.firstName);
    //   } else{
    //     console.warn(`Processor with ID ${processById} not found.`);
    //   }
    // }

    //ORC segment
    msg.addSegment('ORC', 
      'NW', // New Order 
      orderId, // unique order Id
      '', // filler's unique order number
      '', // placeGroup number
      '', // orderStatus
      '', // response Flag
      priority||'', // routine order/ urgent
      '', // parent order
      moment().format('YYYYMMDDHHmmss'), // dateTimeTransaction
      providerInfo || '',// providerName||'', // enter by
      '', // verified by
      '',// processByName||'', // order process by
      '', 
      '', 
      '', 
      '', 
      '', 
      '', 
      ''
    );
    let fasting;
    if(fastingCode == 1){
      fasting = 'Yes';
    }
    if(fastingCode == 2){
      fasting = 'No';
    }
    if(fastingCode == 3){
      fasting = 'Unknown';
      }

    // const collectorComment = `${sensitiveInsTime || ''}^fasting: ${fasting || ''}^${patientPrepIns || ''}`

    //lab test
    let laboratoryTest = []
    if(laboratoryTestIds && laboratoryTestIds.length){
      laboratoryTest = await Promise.all(
        laboratoryTestIds?.map(async (data) => {
          const id = data?.id ? data?.id : data;
          const testData = await dbService.getOneById({
            model: db.LaboratoryTest,
            id: id,
          });
          return `${testData?.cptCode}^${testData?.name}`;
        })
      );
    } 

    let suspectedConditionData;
    if(suspectedCondition){
      const suspectedConditionNames = suspectedCondition?.map((data) => {
        if (typeof data === 'object' && data !== null) {
          return data.name;
        }
        return data;
      }); 

      suspectedConditionData = `Differential Diagnoses or Suspected Condition: ${suspectedConditionNames.join('~')}` 
    }

    // let relevantClinicalInformation='';
    // if (suspectedCondition) {
    //   const suspectedConditionNames = suspectedCondition?.map((data) => {
    //     if (typeof data === 'object' && data !== null) {
    //       return data.name;
    //     }
    //     return data;
    //   });
      
      
      // Check if suspectedConditionNames is defined and has elements
    //   if (suspectedConditionNames && suspectedConditionNames.length > 0) {
    //     // Join the elements with ', ' and prepend 'suspected condition: '
    //     relevantClinicalInformation = `suspected condition: ${suspectedConditionNames.join(', ')}`;
    //     console.log(relevantClinicalInformation); // Output the formatted string
    //   }
    // }
    
    // if (Array.isArray(medicalHistory) && medicalHistory.length > 0) {
    //   if (relevantClinicalInformation) {
    //     // Append medical history information if relevantClinicalInformation is not empty
    //     relevantClinicalInformation += `^Patient has a history of ${medicalHistory.join(', ')}`;
    //   } else {
    //     // If relevantClinicalInformation is empty, directly assign medical history information
    //     relevantClinicalInformation = `Patient has a history of ${medicalHistory.join(', ')}`;
    //   }
    // }

    // diagnosis data
    let diagnosis
    if(diagnosisIcdId){
      diagnosis = await dbService.getOneById({
        model: db.DiagnosisIcd,
        id: diagnosisIcdId, 
      })
    }
    //   if(relevantClinicalInformation){
    //     relevantClinicalInformation += `^Diagnosis: ${diagnosis?.description}^${diagnosis?.name}`;
    //   } else{
    //     relevantClinicalInformation = `Diagnosis: ${diagnosis?.description}^${diagnosis?.name}`;
    //   }
    // }

    // if(relevantClinicalInformation){
    //   relevantClinicalInformation += `^${collectorComment}`;
    // } else{
    //   relevantClinicalInformation = `${collectorComment}`;
    // }

    const payerData =  await dbService.getOne({model:db.GlobalType, filter: {where: {code: payer}}});
    //IN1
    msg.addSegment('IN1',
     1 || '', // 1
     '', // Insurance Company Code
     payerData?.name || '', // Insurance Company Name
     '', // Insurance Plan ID
     '', // Insurance Plan Name
     '', //Patient ID
     '', //Patient Name
     '', //Patient Address
     '', //Insurance Type
    )

    //DG1
    msg.addSegment('DG1',
      '1', // set Id,
      diagnosis?.name || '', // Diagnosis Coding Method
      '', // Diagnosis Code
      diagnosis?.description || '', // Diagnosis Description
      '', // Diagnosis Date/Time
      '', // Diagnosis Type
      '', // Major Diagnostic Category
      '', // Diagnostic Related Group
      '', // DRG Approval Indicator
      '', // Diagnosis Priority
      '', // Diagnosing Clinician
      '', // Diagnosis Classification
      '', // Confidentiality Code
    )
    
    const principalResultInterpreter = [
      fastingCode && `Fasting: ${fastingCode}`,
      siteOfCollection && `Site of Collection: ${siteOfCollection}`,
      patientPrepIns && `Patient preparation instructions: ${patientPrepIns}`,
      sensitiveInsTime && `Time-sensitive instructions: ${sensitiveInsTime}`
    ]
    .filter(Boolean) 
    .join(', ');

    const specimenTypes = Array.isArray(specimenTypeCode) ? specimenTypeCode.join(',') : specimenTypeCode || '';

    //OBR
    if(laboratoryTest && laboratoryTest?.length> 0){
      let testIndex = 0;
      laboratoryTest?.map((labTest, index) => {
        testIndex = testIndex + 1;
        msg.addSegment('OBR',
          testIndex,// index+1, // Set ID - OBR
          orderId, // Placer Order Number
          '', // Filler Order Number
          labTest ||'' , // Universal Service Identifier (test name)
          priority||'', // Priority
          moment().format('YYYYMMDDHHmmss') || '', // Requested Date/Time // before collection date time
          collectionDateTime ? moment(collectionDateTime).format('YYYYMMDDHHmmss') : '',// Observation Date/Time // before require testing time
          '', // Observation End Date/Time
          specimenVolume ?`${specimenVolume}^ml` : '', // Collection Volume
          providerInfo || '', // providerName||'', // Collector Identifier
          '', // Specimen Action Code
          '', // Danger Code
          '',  // clinicalInfo||'', // Relevant Clinical Info
          '', // Specimen Received Date/Time
          specimenTypes ||'', // Specimen Source
          providerInfo || '',// providerName||'', // Ordering Provider
          '', // Order Callback Phone Number
          '', // Placer Field 1
          '', // Placer Field 2
          '', // Filler Field 1
          '', // Filler Field 2
          '', // Results Rpt/Status Chng - Date/Time
          '', // Charge to Practice
          '', // diagnosis?.name||'', // Diagnostic Serv Sect ID
          '', // Result Status
          '', // Parent Result
          requiredTestingTime ||'',// specimenQuantity||'', // Quantity/Timing
          '',// processByName||'', // Result Copies To
          '', // Parent
          '', // Transportation Mode
          clinicalInfo||'', // Reason for Study
          principalResultInterpreter || '', // Principal Result Interpreter
          '', // Assistant Result Interpreter
          '', // Technician
          '', // Transcriptionist
          '', // Scheduled Date/Time
          specimenQuantity ||'', // Number of Sample Containers
          '', // Transport Arrangement Responsibility
          '', // Transport Arranged
          '', // Escort Required
          '', // Planned Patient Transport Comment
          '', // Procedure Code
          '', // Procedure Code Modifier
          '', // Placer Supplemental Service Information
          '', // Filler Supplemental Service Information
          '', // Medically Necessary Duplicate Procedure Reason
          '', // Result Handling
          '', // Parent Universal Service Identifier
        );
      })
      // if other lab tests are present 
      if(otherLaboratoryTest?.length > 0) {
        otherLaboratoryTest?.map((labTest, index) => {
          testIndex = testIndex + 1;
          msg.addSegment('OBR',
            testIndex,// index+1, // Set ID - OBR
            orderId, // Placer Order Number
            '', // Filler Order Number
            labTest ||'' , // Universal Service Identifier (test name)
            priority||'', // Priority
            moment().format('YYYYMMDDHHmmss') || '', // Requested Date/Time // before collection date time
            collectionDateTime ? moment(collectionDateTime).format('YYYYMMDDHHmmss') : '',// Observation Date/Time // before require testing time
            '', // Observation End Date/Time
            specimenVolume ?`${specimenVolume}^ml` : '', // Collection Volume
            providerInfo || '', // providerName||'', // Collector Identifier
            '', // Specimen Action Code
            '', // Danger Code
            '',  // clinicalInfo||'', // Relevant Clinical Info
            '', // Specimen Received Date/Time
            specimenTypes ||'', // Specimen Source
            providerInfo || '',// providerName||'', // Ordering Provider
            '', // Order Callback Phone Number
            '', // Placer Field 1
            '', // Placer Field 2
            '', // Filler Field 1
            '', // Filler Field 2
            '', // Results Rpt/Status Chng - Date/Time
            '', // Charge to Practice
            '', // diagnosis?.name||'', // Diagnostic Serv Sect ID
            '', // Result Status
            '', // Parent Result
            requiredTestingTime ||'',// specimenQuantity||'', // Quantity/Timing
            '',// processByName||'', // Result Copies To
            '', // Parent
            '', // Transportation Mode
            clinicalInfo||'', // Reason for Study
            principalResultInterpreter || '', // Principal Result Interpreter
            '', // Assistant Result Interpreter
            '', // Technician
            '', // Transcriptionist
            '', // Scheduled Date/Time
            specimenQuantity ||'', // Number of Sample Containers
            '', // Transport Arrangement Responsibility
            '', // Transport Arranged
            '', // Escort Required
            '', // Planned Patient Transport Comment
            '', // Procedure Code
            '', // Procedure Code Modifier
            '', // Placer Supplemental Service Information
            '', // Filler Supplemental Service Information
            '', // Medically Necessary Duplicate Procedure Reason
            '', // Result Handling
            '', // Parent Universal Service Identifier
          );
        })
        
      } 
    } else{
      let testIndex = 0;
      if(otherLaboratoryTest?.length > 0) {
        otherLaboratoryTest?.map((labTest, index) => {
          testIndex = testIndex + 1;
          msg.addSegment('OBR',
            testIndex,// index+1, // Set ID - OBR
            orderId, // Placer Order Number
            '', // Filler Order Number
            labTest ||'' , // Universal Service Identifier (test name)
            priority||'', // Priority
            moment().format('YYYYMMDDHHmmss') || '', // Requested Date/Time // before collection date time
            collectionDateTime ? moment(collectionDateTime).format('YYYYMMDDHHmmss') : '',// Observation Date/Time // before require testing time
            '', // Observation End Date/Time
            specimenVolume ?`${specimenVolume}^ml` : '', // Collection Volume
            providerInfo || '', // providerName||'', // Collector Identifier
            '', // Specimen Action Code
            '', // Danger Code
            '',  // clinicalInfo||'', // Relevant Clinical Info
            '', // Specimen Received Date/Time
            specimenTypes ||'', // Specimen Source
            providerInfo || '',// providerName||'', // Ordering Provider
            '', // Order Callback Phone Number
            '', // Placer Field 1
            '', // Placer Field 2
            '', // Filler Field 1
            '', // Filler Field 2
            '', // Results Rpt/Status Chng - Date/Time
            '', // Charge to Practice
            '', // diagnosis?.name||'', // Diagnostic Serv Sect ID
            '', // Result Status
            '', // Parent Result
            requiredTestingTime ||'',// specimenQuantity||'', // Quantity/Timing
            '',// processByName||'', // Result Copies To
            '', // Parent
            '', // Transportation Mode
            clinicalInfo||'', // Reason for Study
            principalResultInterpreter || '', // Principal Result Interpreter
            '', // Assistant Result Interpreter
            '', // Technician
            '', // Transcriptionist
            '', // Scheduled Date/Time
            specimenQuantity ||'', // Number of Sample Containers
            '', // Transport Arrangement Responsibility
            '', // Transport Arranged
            '', // Escort Required
            '', // Planned Patient Transport Comment
            '', // Procedure Code
            '', // Procedure Code Modifier
            '', // Placer Supplemental Service Information
            '', // Filler Supplemental Service Information
            '', // Medically Necessary Duplicate Procedure Reason
            '', // Result Handling
            '', // Parent Universal Service Identifier
          );
        })
      } 
    }

  //ZDL
  msg.addSegment('ZDX',
    '',   //Diagnosis Code
    '',   //Diagnosis Description
    '',   //Diagnosis Date/Time
    '',   //Diagnosis Priority
    '',  //Diagnosis Type
    '',   //Diagnosis Category
    '',   //Related Problem ID
    '',   //Diagnosis Provider
    '',   //Diagnosis Status
    '',   //Onset Date
    '',   //Diagnosis Comments
    '',   //Diagnosis Certainty
    '',   //Diagnosis Stage
    '',   //Diagnosis Outcome 
    suspectedConditionData || '',   //Differential Diagnoses or Suspected Conditions
    '',   //Related Encounter ID
  )

  //AL1
  allergies!=='' && allergies?.map((allergy, index) => {
    msg.addSegment('AL1',
    index +1,   //Set ID 
    '',  //Allergy Type
    allergy || '',  //Allergy Code/Mnemonic/Description
    '',  //Allergy Severity
    '',  //Allergy Reaction
    )
  })


  //ZMH
  medicalHistory!=='' && medicalHistory?.map((data) => {
    msg.addSegment('ZMH',
      '',//Medical History ID
    `Patient has history of ${data}` || '',//Medical History Description
      '',//Onset Date/Time
      '',//Resolution Date/Time
      '',//Status
      '',//Severity
      '',//Provider ID
      '',//Location
      '',//Treatment Description
      '',//Notes
      '',//Related Diagnosis Code
      '',//Prognosis
      '',//Risk Factors
      '',//Relevant Family History
      '',//Medical History Category
    )
  })

    // const parser = new hl7.Parser();
    let lines;
    let resultString="";
    if(msg){
      lines=msg?.toString()?.split('\n');
    }

    if(lines){
      for (const line of lines) {
        resultString = resultString+line+'\r';
      }
    }

    // Function to recursively flatten nested arrays
    function flattenArray(array) {
      return Array.isArray(array)
        ? array.reduce((acc, val) => acc.concat(flattenArray(val)), [])
        : [array];
    }
    // Function to format the parsed message into a readable format
    function getReadableMessage(parsedMessage) {
      const readableMessage = {};
      Object.keys(parsedMessage.raw).forEach(segmentName => {
        const segments = parsedMessage.raw[segmentName];
        readableMessage[segmentName] = segments.map(segment => flattenArray(segment));
      });
      return readableMessage;
    }
    const parsedMessage = hl7Parser.parse(resultString);
    const readableMessage = getReadableMessage(parsedMessage);

    function extractValues(segment) {
      let values = [];
    
      segment.forEach(item => {
        if (Array.isArray(item)) {
          if (item.length === 1 && Array.isArray(item[0])) {
            values.push(item[0].join(' '));
          } else {
            values = values.concat(extractValues(item));
          }
        } else if (typeof item === 'string') {
          values.push(item);
        }
      });
    
      return values;
    }
    function processData(data) {
      let result = {};
    
      Object.keys(data).forEach(segmentName => {
        const segmentData = data[segmentName];
        if (Array.isArray(segmentData) && segmentData.length > 0) {
          const segmentValues = segmentData.map(seg => extractValues(seg[0]?.segment || []));
          result[segmentName] = segmentValues;
        }
      });
    
      return result;
    }

    const labRequest = processData(readableMessage);
    // const parsedMessage = hl7Parser.parse(msg.toString());
    /*
    Parse any HL7 message string, could be from File, TCP Socket, Web Service.
    */
    // const msgP = parser.parse(msg);
    // console.log(' pars', msgP)
    // return {hl7Raw: msg.toString().split('\r').join('\r\n'), hl7Parse: parsedMessage}; 
    return {hl7Raw: msg.toString().split('\r').join('\r\n'), hl7Parse: labRequest}; 
    // const hl7Message = msg.toString();

  } catch (error) {
    console.error('Error converting to HL7:', error);
    throw new Error('Failed to convert to HL7 format');
  }
};

module.exports = {
  convertToHl7
};