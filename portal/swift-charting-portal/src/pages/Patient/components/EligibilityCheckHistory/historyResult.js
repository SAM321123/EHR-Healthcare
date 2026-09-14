import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';


import ParseX12Data from './Parser/parserX12';
import { findX12Details } from 'src/utils/decryption/X12Parser';

const ViewHistoryResultData = ({
  modalCloseAction = () => {},
  refetchData,
  defaultData,
}) => {
  const hasResponseData = typeof defaultData === 'string' && defaultData.trim();
  const result = hasResponseData ? ParseX12Data(defaultData) : {};
  const errorDetails = findX12Details(result,"AAA_");
  const expireDetails = findX12Details(result,"DTP_DependentDate_");
  const dependentEBDetails = findX12Details(result,"EB_2110D_DependentEBInfo_");

 const formatKey = (key) => key.replace(/_/g, ' '); // Replace underscores with spaces
 const formatValue = (value) => {
   const bracketIndex = value.indexOf('[');
   const rawValue= bracketIndex > -1
   ? value.substring(bracketIndex + 1, value.length - 1) // Extract text within brackets
   : value
   const dateRangePattern = /^\d{8}-\d{8}$/;
   if (dateRangePattern?.test(rawValue)) {
     const [startDate, endDate] = value.split('-');
     
     // Function to format a date into MM/DD/YYYY
     const formatDate = (dateString) => {
       const year = dateString.slice(0, 4);
       const month = dateString.slice(4, 6);
       const day = dateString.slice(6, 8);
       return `${month}/${day}/${year}`;
     };
 
     const formattedStartDate = formatDate(startDate);
     const formattedEndDate = formatDate(endDate);
 
     return `${formattedStartDate} - ${formattedEndDate}`;
   }
   return rawValue;
 };


// Group benefits by EB01_EBInfo
const groupByBenefitType = (data) => {
  return data.reduce((acc, benefit) => {
      const benefitType = benefit?.EB01_EBInfo || "Unknown";
      if (!acc[benefitType]) {
          acc[benefitType] = [];
      }
      acc[benefitType].push(benefit);
      return acc;
  }, {});
};

// Extract messages from a benefit
const extractMessages = (benefit) => {
  const messages = [];
  Object.keys(benefit).forEach((key) => {
      if (key.startsWith("MSG_MessageText_")) {
          messages.push(benefit[key].MSG01_Text);
      }
  });
  return messages;
};

// Example usage
const groupedBenefits = groupByBenefitType(dependentEBDetails);
const groupedBenefitsArray = Object.values(groupedBenefits);

const JsonToHtmlLayer = ({ x12, level = 0 }) => {
    const nextLevel = level + 1;
  
    if (typeof x12 === "object" && !Array.isArray(x12)) {
      return (
        <>
          {Object.keys(x12).map((node, index) => (
            <div
              key={`level_${level}_${index}`}
              style={{
                marginTop: "2px",
                marginBottom: "2px",
                marginLeft: level > 0 ? "20px" : "0",
              }}
            >
              <b>{node}</b>
              {typeof x12[node] === "string" ? (
                <span>
                  : <b style={{ color: "red" }}>{x12[node]}</b>
                </span>
              ) : null}
              <JsonToHtmlLayer x12={x12[node]} level={nextLevel} />
            </div>
          ))}
        </>
      );
    } else if (Array.isArray(x12)) {
      return (
        <>
          {x12.map((node, index) => (
            <div
              key={`array_level_${level}_${index}`}
              style={{
                marginTop: "2px",
                marginBottom: "2px",
                marginLeft: "20px",
              }}
            >
              <b style={{ color: "red" }}>{node}</b>
            </div>
          ))}
        </>
      );
    }
  
    return null;
  };
 
  if (!hasResponseData) {
    return (
      <Box>
        <CardContent>
          <p>No eligibility result is available yet. Please run Check Eligibility first.</p>
        </CardContent>
      </Box>
    );
  }

  return (
    <Box>
      <CardContent>
        {/* <JsonToHtmlLayer x12={result} /> */}

        {errorDetails && errorDetails.length > 0 && (
          <div>
            <h2>Error Details:</h2>
            {errorDetails.map((error, index) => (
              <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                {Object.entries(error).map(([key, value]) => (
                  <p key={key}>
                    <strong>{formatKey(key)}:</strong> {formatValue(value)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        <div>
          <h2>Insurance Date Period Details:</h2>
          {expireDetails && expireDetails.length > 0 ? (
            expireDetails.map((item, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                {Object.entries(item).map(([key, value]) => (
                  <p key={key}>
                    <strong>{formatKey(key)}:</strong> {formatValue(value)}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p>We are not getting Insurance Date Period Details. Please check it on payer side.</p>
          )}
        </div>

        <div>
          <h1>Benefits Details:</h1>
          {dependentEBDetails && dependentEBDetails.length > 0 ? (
            groupedBenefitsArray.flatMap(group => group).map((benefit, index) => (
              <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                <h4>Benefit {index + 1}</h4>
                <p><strong>Service Type:</strong> {benefit?.EB03_ServiceType}</p>
                <p><strong>Coverage Level:</strong> {benefit?.EB02_BenefitCoverageLevel || "N/A"}</p>
                <p><strong>Coverage Benefit Amount:</strong> {benefit?.EB07_BenefitAmount || "N/A"}</p>
                <div>
                  <strong>Messages:</strong>
                  <ul>
                    {extractMessages(benefit).map((msg, msgIndex) => (
                      <li key={msgIndex} style={{ color: "red", padding: "5px" }}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p>We are not getting Benefits Details. Please check it on payer side.</p>
          )}
        </div>

      </CardContent>
    </Box>
  );
};
 
export default ViewHistoryResultData;
 
