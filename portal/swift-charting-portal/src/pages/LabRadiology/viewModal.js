import React from 'react';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import logo from 'src/assets/images/logo.png';
import PatientInfo from '../Patient/components/patientInfo';
import moment from 'moment';
import { dateFormats } from 'src/lib/constants';

const fieldMappings = {
  MSH: ["Field Separator", "Encoding Characters", "Sending Application", "Sending Facility", "Receiving Application", "Receiving Facility", "Date/Time of Message", "Security", "Message Type", "Message Control ID", "Processing ID", "Version ID"],
  PV1: [
    "Field Name", "Set ID", "Patient Class", "Assigned Patient Location", "Admission Type", 
    "Preadmit Number", "Prior Patient Location", "Attending Doctor", "Referring Doctor", 
    "Consulting Doctor", "Hospital Service", "Temporary Location", "Preadmit Test Indicator", 
    "Readmission Indicator", "Admit Source", "Ambulatory Status", "VIP Indicator", 
    "Admitting Doctor", "Patient Type", "Visit Number", "Financial Class", "Charge Price Indicator", 
    "Courtesy Code", "Credit Rating", "Contract Code", "Contract Effective Date", 
    "Contract Amount", "Contract Period", "Interest Code", "Transfer to Bad Debt Code", 
    "Transfer to Bad Debt Date", "Bad Debt Agency Code", "Bad Debt Transfer Amount", 
    "Bad Debt Recovery Amount", "Delete Account Indicator", "Delete Account Date", 
    "Discharge Disposition", "Discharged to Location", "Diet Type", "Servicing Facility", 
    "Bed Status", "Account Status", "Pending Location", "Prior Temporary Location", 
    "Admit Date/Time", "Discharge Date/Time", "Current Patient Balance", "Total Charges", 
    "Total Adjustments", "Total Payments", "Alternate Visit ID", "Visit Indicator", 
    "Other Healthcare Provider"
  ],
  PID: ["ghgh","Set ID", "Patient ID", "Patient Identifier List", "Alternate Patient ID", "Patient Name", "Mother's Maiden Name", "Date/Time of Birth", "Administrative Sex", "Patient Alias", "Race", "Patient Address", "County Code", "Phone Number - Home", "Phone Number - Business", "Primary Language", "Marital Status", "Religion", "Patient Account Number", "SSN Number - Patient", "Driver's License Number - Patient", "Mother's Identifier", "Ethnic Group", "Birth Place", "Multiple Birth Indicator", "Birth Order", "Citizenship", "Veterans Military Status", "Nationality", "Patient Death Date and Time", "Patient Death Indicator"],
  ORC: ["field name","Order Control", "Placer Order Number", "Filler Order Number", "Placer Group Number", "Order Status", "Response Flag", "Quantity/Timing", "Parent", "Date/Time of Transaction", "Entered By", "Verified By", "Ordering Provider", "Enterer's Location", "Call Back Phone Number", "Order Effective Date/Time", "Order Control Code Reason", "Entering Organization", "Entering Device", "Action By"],
  OBR: ["fieldNme","Set ID", "Placer Order Number", "Filler Order Number", "Universal Service ID", "Priority", "Requested Date/Time", "Observation Date/Time", "Observation End Date/Time", "Collection Volume", "Collector Identifier", "Specimen Action Code", "Danger Code", "Relevant Clinical Info", "Specimen Received Date/Time", "Specimen Source", "Ordering Provider", "Order Callback Phone Number", "Placer Field 1", "Placer Field 2", "Filler Field 1", "Filler Field 2", "Result Status Change Date/Time", "Charge to Practice", "Diagnostic Serv Sect ID", "Result Status", "Parent Result", "Quantity/Timing", "Result Copies To", "Parent", "Transportation Mode", "Reason for Study", "Principal Result Interpreter", "Assistant Result Interpreter", "Technician", "Transcriptionist", "Scheduled Date/Time", "Number of Sample Containers", "Transport Arranged", "Escort Required", "Planned Patient Transport Comment", "Procedure Code", "Procedure Code Modifier", "Placer Supplemental Service Info", "Filler Supplemental Service Info", "Medically Necessary Duplicate Procedure Reason", "Result Handling", "Parent Universal Service ID"],
  OBX: ["fieldName","Set ID", "Value Type", "Observation Identifier", "Observation Sub-ID", "Observation Value", "Units", "References Range", "Abnormal Flags", "Probability", "Nature of Abnormal Test", "Observation Result Status", "Date Last Observation Normal Value", "User Defined Access Checks", "Date/Time of the Observation", "Producer's ID", "Responsible Observer", "Observation Method", "Equipment Instance Identifier", "Date/Time of the Analysis"],
};

const ViewModal = ({ data, viewData }) => {
  const hl7RequestParsedData = viewData?.requestData?.raw;
  const hl7ResultParsedData = viewData?.resultData?.raw;

  const processHl7ResultData = (data) => {
    // Get the keys of the object
    const keys = Object.keys(data);
   
    // Check if there is at least one key and the data for the first key is an array with more than one item
    if (keys.length > 0 && Array.isArray(data['MSH']) && data['MSH'].length > 1) {
      // Modify the data to only keep the first item of the array for the first key
      data['MSH'] = [data['MSH'][1]];
    }
   
    return data;
  };
 
  const hl7ResultProcessData = processHl7ResultData(hl7ResultParsedData || {});


  const formatHL7Date = (dateString,{dateOnly}) => {
    const dateObject = moment(dateString, "YYYYMMDDHHmmss");
if(!dateObject.isValid()){
  return '';
}
 return dateObject.format(dateOnly? dateFormats.MMDDYYYY : dateFormats.MMDDYYYYhhmmA);
  };

  const extractFields = (segment, segmentName) => {
    const fieldNames = fieldMappings[segmentName] || [];
    let indexValue =1;
    if (segmentName === 'MSH') {
      indexValue = 2; // Start from the second field for MSH
    }
  
    return segment
     .slice(indexValue)
      .map((field, index) => {
        let value = field.join(' ')
        // console.log("🚀 ~ .map ~ field:", value,segmentName)
        const fieldName =  fieldNames[index + indexValue] || `Field ${index + indexValue + 1}`;
        if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('time')) {
          value = formatHL7Date(value,{dateOnly:!!(['PID'].includes(segmentName))});
        }
        return{
          name: fieldNames[index + indexValue] || `Field ${index + indexValue + 1}`,
          value: value || '',
      }})
      .filter(field => field.value.trim() !== '' && field.value.trim()!=='-- ::'); // Filter out empty fields
  };

    const renderSegment = (segmentName, segmentData) => {
      const fields = extractFields(segmentData[0]?.segment, segmentName);
      if (fields.length === 0) return null; // Skip rendering empty segments
      return (
        <Card
          key={segmentName}
          sx={{ mb: 2, borderRadius: 2, boxShadow: 3 }}
        >
          <CardHeader
            title={<Typography variant="h6" component="div">{segmentName}</Typography>}
            sx={{ backgroundColor: '#e3f5ff', fontWeight: 'bold' }}
          />
          <CardContent>
            {fields?.map((field, index) => {
              return (
                <p key={index}>
                  <strong>{field?.name}:</strong> {field?.value}
                </p>
              );
            })}
          </CardContent>
        </Card>
      );
  
    };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }} className='modal-content'>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        {logo && (
          <img
            style={{ width: '100%', maxWidth: 200, height: 'auto' }}
            src={logo}
            alt=""
            loading="lazy"
          />
        )}
      </div>
      <Card style={{ padding: '20px', marginBottom: '20px' }}>
        <PatientInfo wrapperStyle={{ flex: 1 }} customPatientId={data?.patientId} />
        {/* <Typography variant="h6" gutterBottom>HL7 Message Information</Typography> */}
        {viewData?.requestData && (
          <>
            <h2 style={{ color: 'green'}}>HL7 Request Message</h2>
            <p>
              {Object.keys(hl7RequestParsedData)?.map((segmentName) => (
                renderSegment(segmentName, hl7RequestParsedData[segmentName])
              ))}
            </p>
          </>
        )}
        {viewData?.resultData && (
          <>
            <h2 style={{ color: 'green'}}>HL7 Result Message</h2>
            <p>
              {console.log('jhsjhsds', hl7ResultParsedData, hl7ResultProcessData)}
             {Object.keys(hl7ResultProcessData)?.map((segmentName) => (
                renderSegment(segmentName, hl7ResultProcessData[segmentName])
              ))}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default ViewModal;