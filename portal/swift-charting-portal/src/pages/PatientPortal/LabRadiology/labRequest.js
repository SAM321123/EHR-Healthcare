import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Grid, Typography, Card, CircularProgress, CardActions, Divider, CardContent, TableCell, Table, TableHead, TableRow, TableBody } from '@mui/material';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import useCRUD from 'src/hooks/useCRUD';
import { LAB_REPORT, LABS_RADIOLOGY_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageHeader from 'src/components/PageHeader';
import logo from 'src/assets/images/logo.png';
import { dateFormats, getAddress } from 'src/lib/constants';
import { getDateDiff, getImageUrl } from 'src/lib/utils';
// import PatientInfo from '../Patient/components/patientInfo';
import Container from 'src/components/Container';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { capitalize } from 'lodash';

const LabRequest = ({ customLabRadiologyId, onClose, onRefresh = () => {} }) => {
  const { labRadiologyId } = useParams();
  const navigate = useNavigate();
  const printableAreaRef = useRef(null);
  const memoLabRadiologyId = useMemo(() => {
    if (labRadiologyId) {
      const decryptedId = decrypt(labRadiologyId);
      if (decryptedId) {
        return decryptedId;
      }
    }
    return customLabRadiologyId || '';
  }, [labRadiologyId, customLabRadiologyId]);

  const [
    labRequest,
    ,
    loading,
    callPatientLabRequestAPI,
  ] = useCRUD({
    id: `${LABS_RADIOLOGY_LIST}-${memoLabRadiologyId}`,
    url: `${API_URL.labsRadiology}/${memoLabRadiologyId}`,
    type: REQUEST_METHOD.get,
  });

  const [
    practiceSettingsData,
    ,
    practiceSettingsLoading,
    callPracticeSettingsAPI,
  ] = useCRUD({
    id: `CLINIC-INFO`,
    url: `${API_URL.practiceSetting}`,
    type: REQUEST_METHOD.get,
  });

  const practiceLogoSrc = useMemo(() => {
    const logoFileName = practiceSettingsData?.logo?.name || practiceSettingsData?.logo?.file;
    return logoFileName ? getImageUrl(logoFileName) : logo;
  }, [practiceSettingsData?.logo?.name, practiceSettingsData?.logo?.file]);

  useEffect(() => {
    if (memoLabRadiologyId) {
      callPatientLabRequestAPI();
      callPracticeSettingsAPI();
    }
  }, [memoLabRadiologyId]);


   const handlePrint = () => {
      window.print();
   }

  const hl7ParsedData = labRequest?.hl7Message;
  const mshSegments = hl7ParsedData?.MSH || [];
  const pidSegments = hl7ParsedData?.PID || [];
  const orcSegments = hl7ParsedData?.ORC || [];
  const obrSegments = hl7ParsedData?.OBR || [];
  const dgSegments = hl7ParsedData?.DG1 || [];
  const zdxSegments = hl7ParsedData?.ZDX || [];
  const in1Segments = hl7ParsedData?.IN1 || [];
  const zmhSegments = hl7ParsedData?.ZMH || [];
  const al1Segments = hl7ParsedData?.AL1 || []; 
  const facSegments = hl7ParsedData?.FAC || []; 

  const sendingApplication = mshSegments[0]?.[4];
  const sendingFacility = mshSegments[0]?.[5];
  const testingLab = mshSegments[0]?.[6];
  const requestDateTimeObject = moment(mshSegments[0]?.[8], "YYYYMMDDHHmmss");
  const requestDateTime = requestDateTimeObject.format(dateFormats.MMDDYYYYhhmmA);
  const patientName = pidSegments[0]?.[5];
  const patientPhone = pidSegments[0]?.[13];
  const patientAddress = pidSegments[0]?.[11];
  const gender = pidSegments[0]?.[8];
  const dobObject = moment(pidSegments[0]?.[7], 'YYYYMMDDHHmmss');
  const dob = dobObject.format(dateFormats.MMDDYYYY);
  const priority = orcSegments[0]?.[7];
  const physician = orcSegments[0]?.[10];
  const providerInfo = orcSegments[0]?.[10];
  // Split the string into an array
  let providerName;
  let npi;
  let providerTitle;
  if(providerInfo){
    const providerInfoArray = providerInfo?.split(" ");
    providerTitle = capitalize(providerInfoArray[0]); // dr
    npi = providerInfoArray[providerInfoArray.length - 1]; // 4554
    // Check if the NPI is a number and extract the provider name accordingly
    if (!isNaN(Number(npi))) {
      providerName = providerInfoArray.slice(1, -1).join(" ");
    } else {
      // If the last element is not a number, consider it part of the name
      providerName = providerInfoArray.slice(1).join(" ");
      npi = '';
    }

  }

  const sendingFacilityName = facSegments[0]?.[2];
  const sendingFacilityAddress = facSegments[0]?.[3];
  const sendingFacilityPhoneNumber = facSegments[0]?.[4];
  const sendingFacilityFaxNumber = facSegments[0]?.[5];
 

  // const orderProcessBy = orcSegments[0]?.[12]; 
  const specimenType = obrSegments[0]?.[15];
  const testingName = obrSegments[0]?.[4];
  const volume = obrSegments[0]?.[9];
  const quantity = obrSegments[0]?.[37];
  const testDateTimeObject = moment(obrSegments[0]?.[14], 'YYYYMMDDHHmmss');
  const resultDateTimeObject = moment(obrSegments[0]?.[22], 'YYYYMMDDHHmmss');
  const requireTestingTime = obrSegments[0]?.[27];
  const relevantClinicalInformation = obrSegments[0]?.[31];
  const testDateTime = testDateTimeObject.format('MMMM D, YYYY HH:mm:ss');
  const resultDateTime = resultDateTimeObject.format('MMMM D, YYYY HH:mm:ss');
  const diagnosisName = dgSegments[0]?.[2];
  const diagnosisDescription = dgSegments[0]?.[4];

  const suspectedConditionArray = zdxSegments[0]?.slice(15);
  const suspectedConditionString = suspectedConditionArray?.filter(Boolean).join(', ');
  const suspectedCondition = suspectedConditionString?.split(':').pop().trim();

  // const suspectedCondition = zdxSegments[0]?.[15];
  const payer = in1Segments[0]?.[3];
  const principalResultInterpreter = obrSegments[0]?.[32];
  let samplingDate;
  if (obrSegments[0]?.[7]) {
    const samplingDateObject = moment(obrSegments[0][7], 'YYYYMMDDHHmmss');
    samplingDate = samplingDateObject.format(dateFormats.MMDDYYYYhhmmA);
  }
  
  // Extract the part after "Site of Collection:"
const siteOfCollectionData = principalResultInterpreter?.split("Site of Collection:")[1]?.trim();

// If there are additional parts, you might want to split further by the next delimiter (e.g., comma)
const siteOfCollection = siteOfCollectionData ? siteOfCollectionData.split(",")[0].trim() : '';

  const obrSegmentArray = obrSegments.map((segment, index) => {
    const totalTest = segment?.[4];
    return (totalTest);
  });

  // const zmhData = zmhSegments?.map((segment, index) => {
  //   const medicalHistoryDescription = segment?.[2]; // ZMH-2: Medical History Description
  
  //   return (medicalHistoryDescription?.split(' ').pop());
  // });

  const zmhData = zmhSegments?.map((segment, index) => {
    const medicalHistoryDescription = segment?.[2]; // ZMH-2: Medical History Description
  
    const cleanedDescription = medicalHistoryDescription?.replace('Patient has history of', '').trim();
  
    return cleanedDescription;
  });
  const zmhSegmentData = zmhData?.join(',');

  const al1Data = al1Segments?.map((segment, index) => {
    const allergiesDescription = segment?.[3]; 
    return allergiesDescription;
  });

  const allergies = al1Data?.join(',');

  const labelStyle = {
    fontWeight: 'bold',
    display: 'inline',
  };

  const valueStyle = {
    display: 'inline',
    marginLeft: '5px',
  };

  const handleBack = () => {
    if(onClose){
      onClose()
      return;
    }
    navigate(-1);
  };
  const formatName = (name) => {
    const parts = name.split(' ').filter(part => part);
    if (parts.length >= 2) {
      const lastName = parts[0][0].toUpperCase() + parts[0].slice(1).toLowerCase();
      const firstName = parts[parts.length - 1][0].toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase();
      const middleName = parts.length > 2 ? parts.slice(1, -1).map(part => part[0].toUpperCase() + part.slice(1).toLowerCase()).join(' ') : '';
  
      return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
    }
    return name; 
  };

  const printContent = () => {
    if (printableAreaRef.current) {
      const printContents = printableAreaRef.current.innerHTML;
      // Open a new window
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      // Extract and include MUI styles in the print window
      const documentStyles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            console.warn('Could not load stylesheet:', e);
            return '';
          }
        })
        .join('');
  
      // Write the HTML content to the new window, including the MUI styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Lab Request</title>
            <style>
              ${documentStyles} /* MUI styles included */
              body { font-family: Poppins, Arial, sans-serif; padding: 20px; }
              body {
                -webkit-print-color-adjust: exact; 
              }
              h1 { font-size: 24px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              table, th, td { border: 1px solid black; }
              th, td { padding: 8px; text-align: left; }
              .no-print { display:none !important; }
              .print-logo { display:block !important; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
  
      // Close the document to ensure it renders
      printWindow.document.close();
  
      // Wait until the new window is fully loaded before trying to print
      printWindow.onload = () => {
        // Add a slight delay to ensure everything is rendered properly
        setTimeout(() => {
          // Trigger the print dialog
          printWindow.print();
          // Optionally, close the window after printing
          printWindow.close();
        }, 500); // 500ms delay
      };
    } else {
      console.error('Printable area not found');
    }
  };

  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
      loading={loading}
    >
        <PageHeader
          showBackIcon
          title="Back"
          onPressBackIcon={handleBack} 
        />
          <div 
            style={{ padding: '20px'}} 
            ref={printableAreaRef}
            className='modal-content'
          >
            <div>
              <CardContent style={{padding:0}}>
                {/* <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  {logo && (
                    <img
                      style={{ width: '100%', maxWidth: 200, height: 'auto' }}
                      src={logo}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </div> */}
                <div
                  style={{ margin: '16px 0' }}
                  className='no-print'
                >
                  {/* <PatientInfo wrapperStyle={{flex:1}} customPatientId={labRequest?.patientId}/> */}
                </div>

                <div style={{display:'flex',gap:20,justifyContent:'space-between'}}>
                  <div>
                    <div><Typography style={{fontWeight:600,fontSize:'20px'}}>{practiceSettingsData?.name?.toUpperCase() || ''}</Typography></div>
                    <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Email:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingsData?.email || ''}</Typography></div>
                    <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Contact:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingsData?.contact || ''}</Typography></div>
                    <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Address:</Typography><Typography style={{fontSize:'12px'}}>{getAddress(practiceSettingsData || {})}</Typography></div>
                  </div>
                  <div className="print-logo">
                    <img alt="logo" style={{width:137.42,height:90,objectFit:'contain'}} src={practiceLogoSrc}/>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />  
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Order No. : </strong>{labRequest?.id || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Testing Lab: </strong>{testingLab || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Sending Application: </strong>{sendingApplication || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Request Date/Time : </strong>{requestDateTime || 'N/A'}</Typography>
                    {/* <Typography variant="body2"><strong>Sending Facility: </strong>{sendingFacility || 'N/A'}</Typography> */}
                  </Grid>
                </Grid>


                <Divider style={{ margin: '16px 0' }} />
                <Typography variant="h6" gutterBottom>Sending Facility</Typography>
                <Divider style={{ marginBottom: '8px' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Name: </strong>{sendingFacilityName || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Address: </strong>{sendingFacilityAddress || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Phone Number: </strong>{sendingFacilityPhoneNumber || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Fax Number: </strong>{sendingFacilityFaxNumber || 'N/A'}</Typography>
                  </Grid>
                </Grid>
                <Divider style={{ margin: '16px 0' }} />

                <Divider style={{ margin: '16px 0' }} />
                <Typography variant="h6" gutterBottom>Patient Information</Typography>
                <Divider style={{ marginBottom: '8px' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Name: </strong>{patientName ? formatName(patientName) : 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Phone Number: </strong>{patientPhone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Address: </strong>{patientAddress || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Age: </strong>{getDateDiff(dob,new Date(),{unit:'years'})|| 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Date of Birth: </strong>{dob || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Gender: </strong>{gender || 'N/A'}</Typography>
                  </Grid>
                </Grid>
                <Divider style={{ margin: '16px 0' }} />

        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Provider's Information</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Provider Name: </strong>{providerName ?  `${providerTitle} ${formatName(providerName)}`  : 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Provider NPI: </strong>{npi || 'N/A'}</Typography>
          </Grid>
          {/* <Grid item xs={6}>
            <Typography variant="body2"><strong>Order Process By: </strong>{orderProcessBy ? formatName(orderProcessBy) : 'N/A'}</Typography>
          </Grid> */}
        </Grid>
        <Divider style={{ margin: '16px 0' }} />

        <Divider style={{ margin: '16px 0' }} />

        {/* Patient Information */}
        <Typography variant="h6" gutterBottom>Urgency/Priority</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Priority: </strong>{priority || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Specific timing requirements for testing: </strong>{requireTestingTime || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider style={{ margin: '16px 0' }} />


        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Diagnosis</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="body2"><strong></strong> {diagnosisName && diagnosisDescription ? `${diagnosisName} ${diagnosisDescription}` : 'N/A'}</Typography>
            </Grid>
        </Grid>
        <Divider style={{ margin: '16px 0' }} />

        <Typography variant="h6" gutterBottom>Tests Orders</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {obrSegmentArray?.map((test, index) => (
              <TableRow key={`${test || 'test'}-${index}`}>
                <TableCell>{test}</TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>

        <Divider style={{ margin: '16px 0' }} />

        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Specimen Details</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="body2"><strong>Specimen Type: </strong>{specimenType || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Site of Collection: </strong>{siteOfCollection|| 'N/A'}</Typography>
                <Typography variant="body2"><strong>Collection Date/Time: </strong>{samplingDate || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body2"><strong>Quantity: </strong>{quantity || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Volume: </strong>{volume || 'N/A'}</Typography>
            </Grid>
        </Grid>
        <Divider style={{ margin: '16px 0' }} />        

        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Clinical Indications/Reason for Test</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="body2"><strong>Relevant clinical information : </strong>{relevantClinicalInformation || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Differential diagnoses or suspected conditions: </strong>{suspectedCondition || 'N/A'}</Typography>
            </Grid>
        </Grid>
        <Divider style={{ margin: '16px 0' }} />        
         
        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Payer</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="body2">{payer || 'N/A'}</Typography>
            </Grid>
        </Grid>
        <Divider style={{ margin: '16px 0' }} />        

        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Additional Information</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Allergies or contraindications relevant to the testing: </strong>{allergies || 'N/A'}</Typography>  
              <Typography variant="body2"><strong>Relevant medical history impacting testing: </strong>{zmhSegmentData || 'N/A'}</Typography>
            </Grid>
        </Grid>
        <Divider style={{ margin: '16px 0' }} />        

      </CardContent>
      <LoadingButton
        className="no-print"
        onClick={printContent}
        label="Print"
        style={{ marginRight: '8px' }} 
      />          
      </div>
    </div>
    </Container>
  );
};

export default LabRequest;
