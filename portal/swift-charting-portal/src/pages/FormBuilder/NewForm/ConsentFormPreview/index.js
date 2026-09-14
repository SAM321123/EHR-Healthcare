import React from 'react';
import Box from 'src/components/Box';
import Esignature from 'src/components/E-Signature';
import Typography from 'src/components/Typography';
import { decodeHtml } from 'src/lib/utils';
import { v4 } from 'uuid';


function ConsentSignature(props) {
    return (
      <Box sx={{display:'flex',justifyContent:'center',alignItems:'center'}}><Esignature {...props}/></Box>
    )
  }
const handleRenderOutput = (data) => {
  // Convert the HTML string to a DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = data;

  // Find and replace instances of the specific span elements
  const spanElements = tempDiv.querySelectorAll(
    '.consent-checkbox-container, .consent-input-container'
  );
  spanElements.forEach((spanElement) => {
    const inputElement = document.createElement('input');
    const spanClass = spanElement.classList.contains('consent-checkbox-container')
      ? 'checkbox'
      : 'text';
    inputElement.type = spanClass;
    spanElement.classList.forEach((cls) => {
      inputElement.classList.add(cls);
    });
    spanElement.parentNode.replaceChild(inputElement, spanElement);
  });

  // Return the modified HTML content
  return tempDiv.innerHTML;
};

const ConsentFormPreview = ({formData}={}) => {
    const {consentForm,signatureLabel,enablePatientSignature,enablePractitionerSignature} = formData || {};
  const decodedData = decodeHtml(consentForm ||''); // Replace this with the actual HTML string you need to render
  const preview = handleRenderOutput(decodedData);

  return (
    <div  key={v4()}>{decodedData && <div
    key={v4()}
      sx={{ paddingLeft: 3, paddingRight: 3 }}
      dangerouslySetInnerHTML={{ __html: preview }}
    />}
    <div style={{display:'flex',flexDirection:'column',gap:30,marginTop:45}}>
    {enablePatientSignature && <div>
        <Typography style={{fontWeight:600,marginBottom:20}}>Patient's Signature</Typography>
        <ConsentSignature label={signatureLabel}
        /></div>}

        {enablePractitionerSignature && <div>
        <Typography style={{fontWeight:600,marginBottom:20}}>Provider's Signature</Typography>
        <ConsentSignature/></div>}
        </div>
    </div>
  );
};

export default ConsentFormPreview;
