import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container, Grid, Typography, Card, CircularProgress, CardActions, TextField, Divider, Table, TableHead, TableRow, TableCell, TableBody, List, ListItem, ListItemText, Box, Paper, CardContent } from '@mui/material';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import { decrypt } from 'src/lib/encryption';
import useCRUD from 'src/hooks/useCRUD';
import { LAB_REPORT, LABS_RADIOLOGY_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageHeader from 'src/components/PageHeader';
import logo from 'src/assets/images/logo.png';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { isEmpty } from 'lodash';
import { getImageUrl, showSnackbar, getDateDiff } from 'src/lib/utils';
import { getAddress, regTextArea, successMessage } from 'src/lib/constants';
import { useForm } from 'react-hook-form';
import { capitalize } from 'lodash';

const LabReport = ({ customLabRadiologyId, onClose, onRefresh = () => {} }) => {
  const { labRadiologyId } = useParams();
  const [notes, setNotes] = useState(''); 
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
            <title>Print Lab Report</title>
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

  const [
    labReport,
    ,
    loading,
    callPatientLabReportAPI,
  ] = useCRUD({
    id: `${LAB_REPORT}-${memoLabRadiologyId}`,
    url: `${API_URL.labReport}/${memoLabRadiologyId}`,
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

  const [
    updateLabReport,
    ,
    updateLoading,
    callPatientUpdateLabReportAPI,
    clearData,
  ] = useCRUD({
    id: `${LAB_REPORT}-${labReport?.id}`,
    url: `${API_URL.labReport}/${labReport?.id}`,
    type: REQUEST_METHOD.update,
  });
  
  useEffect(() => {
    if (!isEmpty(updateLabReport)) {
      showSnackbar({
        message: successMessage.update,
        severity: 'success',
      });
      clearData(true);
      onRefresh();
        callPatientLabReportAPI();
    }
  }, [onRefresh, updateLabReport, clearData]);

  useEffect(() => {
    if (memoLabRadiologyId) {
      callPracticeSettingsAPI();
      callPatientLabReportAPI();
    }
  }, [memoLabRadiologyId]);


  const handleBack = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(-1);
  };

  if (loading) {
    return <CircularProgress />;
  }

  const hl7ResultParsedData = labReport?.labResult;
  const mshSegments = hl7ResultParsedData?.MSH || [];
  const pidSegments = hl7ResultParsedData?.PID || [];
  const orcSegments = hl7ResultParsedData?.ORC || [];
  const obrSegments = hl7ResultParsedData?.OBR || [];
  const obxSegments = hl7ResultParsedData?.OBX || [];
  const dgSegments = hl7ResultParsedData?.DG1 || [];
  const in1Segments = hl7ResultParsedData?.IN1 || [];
  const al1Segments = hl7ResultParsedData?.AL1 || []; 
  const zmhSegments = hl7ResultParsedData?.ZMH || [];


  const labInfo = mshSegments[0]?.[5];
  const labSystem = mshSegments[0]?.[4];
  const sendingApplication = mshSegments[0]?.[4];
  const sendingFacility = mshSegments[0]?.[5];
  const patientName = pidSegments[0]?.[5];
  const gender = pidSegments[0]?.[8];
  const patientPhone = pidSegments[0]?.[13];
  const patientAddress = pidSegments[0]?.[11];
  const dobObject = moment(pidSegments[0]?.[7], 'YYYYMMDDHHmmss');
  const dob = dobObject.format('MMMM D, YYYY');
  const physician = orcSegments[0]?.[10];
  const samplingDateObject = moment(obrSegments[0]?.[7], 'YYYYMMDDHHmmss');
  const samplingDate = samplingDateObject.format('MMMM D, YYYY HH:mm:ss');
  const testingName = obrSegments[0]?.[4];
  const testDateTimeObject = moment(obrSegments[0]?.[7], 'YYYYMMDDHHmmss');
  // const testDateTimeObject = moment(obrSegments[0]?.[14], 'YYYYMMDDHHmmss');
  const resultDateTimeObject = moment(obxSegments[0]?.[13], 'YYYYMMDDHHmmss');
  // const resultDateTimeObject = moment(obrSegments[0]?.[22], 'YYYYMMDDHHmmss');
  const testDateTime = testDateTimeObject.format('MMMM D, YYYY HH:mm:ss');
  const resultDateTime = resultDateTimeObject.format('MMMM D, YYYY HH:mm:ss');
  const quantity = obrSegments[0]?.[37];
  const volume = obrSegments[0]?.[9];
  const specimenType = obrSegments[0]?.[15];

  const diagnosisName = dgSegments[0]?.[2];
  const diagnosisDescription = dgSegments[0]?.[4];

  const payer = in1Segments[0]?.[3];

  const al1Data = al1Segments?.map((segment, index) => {
    const allergiesDescription = segment?.[3]; 
    return allergiesDescription;
  });
  const allergies = al1Data?.join(',');

  const zmhData = zmhSegments?.map((segment, index) => {
    const medicalHistoryDescription = segment?.[2]; // ZMH-2: Medical History Description
    const cleanedDescription = medicalHistoryDescription?.replace('Patient has history of', '').trim();
    return cleanedDescription;
  });
  const zmhSegmentData = zmhData?.join(',');

  
  const providerInfo = orcSegments[0]?.[10];
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

  const totalTest = obrSegments?.length;
 
  const labelStyle = {
    fontWeight: 'bold',
    display: 'inline',
  };

  const valueStyle = {
    display: 'inline',
    marginLeft: '5px',
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
  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        </div>
        <div style={{display:'flex',gap:20,justifyContent:'space-between'}}>
          <div>
            <div><Typography style={{fontWeight:600,fontSize:'20px'}}>{practiceSettingsData?.name?.toUpperCase() || ''}</Typography></div>
            <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Email:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingsData?.email || ''}</Typography></div>
            <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Contact:</Typography><Typography style={{fontSize:'12px'}}>{practiceSettingsData?.contact || ''}</Typography></div>
            <div style={{display:'flex',gap:5}}><Typography style={{fontWeight:600,fontSize:'12px'}}>Address:</Typography><Typography style={{fontSize:'12px'}}>{getAddress(practiceSettingsData || {})}</Typography></div>
          </div>
          <div className="print-logo">
            <img alt="logo" style={{width:60,height:60,objectFit:'contain'}} src={practiceLogoSrc}/>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />  
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Order No. : </strong>{labReport?.labRadiologyId || 'N/A'}</Typography>   
            <Typography variant="body2"><strong>Sending Application: </strong>{sendingApplication || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2"><strong>Result Date/Time:</strong> {resultDateTime || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Sending Facility: </strong>{sendingFacility || 'N/A'}</Typography>
          </Grid>
        </Grid>


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


        <Divider style={{ margin: '16px 0' }} />
        <Typography variant="h6" gutterBottom>Specimen Details</Typography>
        <Divider style={{ marginBottom: '8px' }} />
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="body2"><strong>Specimen Type: </strong>{specimenType || 'N/A'}</Typography>
                {/* <Typography variant="body2"><strong>Site of Collection: </strong>{siteOfCollection|| 'N/A'}</Typography> */}
                <Typography variant="body2"><strong>Collection Date/Time: </strong>{samplingDate || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body2"><strong>Quantity: </strong>{quantity || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Volume: </strong>{volume || 'N/A'}</Typography>
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

        {/* <Divider style={{ margin: '16px 0' }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2"><strong>Patient Name:</strong> {patientName ? formatName(patientName) : 'N/A'}</Typography>
            <Typography variant="body2"><strong>Gender:</strong> {ageGender || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Date Of Birth:</strong> {dob || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Physician:</strong> {physician ? formatName(physician) : 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2"><strong>Result Date/Time:</strong> {resultDateTime || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Sampling Date/Time:</strong> {samplingDate || 'N/A'}</Typography>
          </Grid>
        </Grid> */}

        <Divider style={{ margin: '24px 0' }} />
        <Typography variant="h5" gutterBottom>Test Results</Typography>
        <Divider style={{ margin: '24px 0' }} />
        {obrSegments.length ? (
          <>
            <Grid container spacing={2}>
              {obrSegments?.map((test, index) => (
                <Grid item xs={12} key={index}>
                  <Paper style={{ padding: '16px', marginBottom: '16px' }}>
                    <Typography variant="h6" gutterBottom>
                      {test[4]}
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Test</TableCell>
                          <TableCell>Result</TableCell>
                          <TableCell>Units</TableCell>
                          <TableCell>Reference Range</TableCell>
                          <TableCell>Abnormal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {obxSegments
                          .filter(result => result[3].startsWith(test[4].split(' ')[0]))
                          .map((result, index) => (
                            <TableRow key={index}>
                              <TableCell>{result[3]}</TableCell>
                              <TableCell>{result[5]}</TableCell>
                              <TableCell>{result[6]}</TableCell>
                              <TableCell>{result[7]}</TableCell>
                              <TableCell>{result[8]}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Divider style={{ margin: '16px 0' }} />  
          </>
        ) : (
          <Typography variant="body1" style={{ marginTop: '16px' }}>No test results available.</Typography>
        )}
        {labReport?.clinicNote !== null && (
          <>
            <Typography variant="h6" gutterBottom>Clinical Notes</Typography>
            <Divider style={{ marginBottom: '24px' }} />
            <Typography variant="body2">{labReport?.clinicNote || 'N/A'}</Typography>
            <Divider style={{ margin: '24px 0' }} />
          </>
        )}
        <CardActions
          sx={{
            justifyContent: 'flex-start',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          <LoadingButton
            className="no-print"
            onClick={printContent}
            label="Print"
          />
        </CardActions>
      </div>
    </Container>
  );
};
export default LabReport;


