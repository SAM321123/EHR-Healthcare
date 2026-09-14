/* eslint-disable eqeqeq */
const { isEmpty } = require('lodash');
const { serverURL } = require('../config/config');
const { roles } = require('../config/roles');
const Entities = require('html-entities');
const moment = require('moment');
const { DOMParser } = require('xmldom'); // Import DOMParser from xmldom
const httpStatus = require('http-status');
const { errorMessages } = require('../config/error');
const os = require('os');


const getModelFromRole = ({ role = '', db }) => {
  let model = '';
  if (role === roles.PATIENT) {
    model = db.Patient;
  } 
  else if (role === roles.SUPER_ADMIN){
    model = db.User;
  }
  else {
    model = db.Staff;
  }
  return model;
};

const getSortAndLimit = (query, { applySorting=true }) => {
  const { sortBy = 'id:-1', limit = 10, page = 1 } = query || {};
  const obj = { page, limit };
  if (sortBy && applySorting) {
    const temp = sortBy.split(':');
    obj.order = [[temp[0], temp[1] == '-1' ? 'DESC' : 'ASC']];
  }
  return obj;
};


function decodeHtml(html) {
  const decodedHTML = Entities.decode(html, { level: 'html5' });
  return decodedHTML;
}

// const getDynamicTemplate = ({ text, params }) => {
//   const modifedText = text;
//   return modifedText.replace(/\[([a-zA-Z]*)\]/g, (match, key) => {
//     return params[key] || '';
//   });
// };
const getDynamicTemplate = ({ text, params }) => {
  if (!text) return '';

  return text.replace(/\[([^\]]+)\]/g, (match, key) => {
    const cleanKey = key.trim();

    return Object.prototype.hasOwnProperty.call(params, cleanKey)
      ? params[cleanKey]
      : '';
  });
};

function capitalizeFirstLetterOfEachWord(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const getFullName = (data) => {
  if(!data) return 'N/A';
  const { firstName = '', lastName = '', middleName = '' } = data || {};
  const fullName = `${firstName} ${middleName ? `${middleName} ` : ''}${lastName}`;
  return fullName.trim(); // Trim any extra spaces at the beginning or end
};
const getPatientPhone = (data)=>{
  if(!data) return 'N/A';
  return data.phone || data.workPhone || data.homePhone || data.textMessagePhone || data.preferredPhone || data.alternativePhone || 'N/A';
}

const getPatientSex = (data)=>{
  if(!data) return 'N/A';
  if(data?.sexAtBirth?.code ==='gender_at_birth_other'){
    return `${data.otherSexAtBirth} (Other)`
  } 
  return data?.sexAtBirth?.name || 'N/A'
}

const genralStatus = {
  COMPLETE: 'Complete',
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  SENT: 'Sent',
};
const generalClaimStatus = {
  PENDING: 'claim_status_pending',
  ACCEPTED: 'claim_status_accepted',
  REJECTED: 'claim_status_rejected'
};

const billingType={
  SELF:'self',
  INSURED:'insured',
};

const isPatient = (user)=>{
  return user?.role?.code ===roles.PATIENT
}

const getImageUrl = (file, {  downloadFile = true, base64 = false} = {}) => {
  if (!file) {
    return;
  }

  let imageUrl = `${serverURL}download/public?fileName=${file}`;

  if (downloadFile && !base64) {
    imageUrl = `${imageUrl}&downloadFile=${true}`;
  }

  if (base64) {
    imageUrl = `${imageUrl}&base64=${true}`;
  }

  // eslint-disable-next-line consistent-return
  return imageUrl;
};

const capitalize = (str) => str && str[0].toUpperCase() + str.slice(1);

const getFormType = (code) => {
  return {
    isConsentForm: code === 'FT_CONSENT_FORMS',
    isNoteTemplate: code === 'FT_NOTE_TEMPLATES',
  };
};


const isRoleSignatureEnabled = (role, submittedByRole) => {
  const signatureField = `${role}Signature`;
  return (
    submittedByRole === roles[role.toUpperCase()] &&
    patientFormData?.formData?.[`enable${capitalize(role)}Signature`] &&
    !patientFormData?.patientFormSubmission?.[signatureField] &&
    patientFormData?.[role]?.id === submittedBy
  );
};

const isSignatureRequired = (patientFormData, submittedByRole) => {
  if (patientFormData?.formData?.makeSignatureOptional) return false;
  return ['patient', 'practitioner'].some(isRoleSignatureEnabled);
};

const modulePermission = (roleAndPermission) => {  
    const result = roleAndPermission.reduce((modulePermission, module) => {
      if(module?.RoleAndPermission){
        const moduleName = module?.RoleAndPermission?.module?.code;
        const permissionName = module?.RoleAndPermission?.permissions?.code;
    
        if (modulePermission.hasOwnProperty(moduleName)) {
          if (!modulePermission[moduleName].permission.includes(permissionName)) {
            modulePermission[moduleName].permission.push(permissionName);
          }
        } else {
          modulePermission[moduleName] = {
          permission: [permissionName],
          route: module.RoleAndPermission.module.route,
          apiRoute: module.RoleAndPermission.module.apiRoute,
          }  
        }
        return modulePermission;
      }else{
        return {};
      }
    }, {});
    return result;
};


const shareFromCategoryMap = {
  'FT_QUESTIONNAIRES': 'fc_shared_questionnaire',
  'FT_CONSENT_FORMS': 'fc_shared_consent_form',
  'FT_NOTE_TEMPLATES': 'fc_shared_note_template',
  'FT_HISTORY_TEMPLATES': 'fc_shared_history_template',
  'FT_ENCOUNTER_TEMPLATES': 'fc_shared_encounter_tempates',
};

const getAddress = (data)=>{
  const { description, locality, state, country, postalCode } = data?.address || {};
  const addressParts = [description ,locality, state, country, postalCode]?.filter(
    Boolean
  );
  const formattedAddress = addressParts.join(', ');
  return formattedAddress
}

const normalizeDateInput = (input) => {

  console.log('->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.',input);
  if (!input) return null;

  // Replace any `/` with `-`
  let normalized = input.replace(/\//g, '-');

  // Handle formats:
  // 1. YYYY-MM-DD
  // 2. YYYY-MM
  // 3. MM-DD-YYYY
  // 4. MM-YYYY
  // 5. DD-MM-YYYY
  // 6. DD-YYYY
  // 7. MM/DD/YYYY
  // 8. DD/MM/YYYY
  // 9. MM/DD
  // 10. MM-DD
  // 11. DD-MM
  // 12. DD/MM
  const regexPatterns = [
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: '$1-$2-$3' }, // YYYY-MM-DD
    { regex: /^(\d{4})-(\d{2})$/, format: '$1-$2' }, // YYYY-MM
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: '$3-$1-$2' }, // MM-DD-YYYY
    { regex: /^(\d{2})-(\d{4})$/, format: '$2-$1' }, // MM-YYYY
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: '$3-$1-$2' }, // DD-MM-YYYY
    { regex: /^(\d{2})-(\d{4})$/, format: '$2-$1' }, // DD-YYYY
    { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: '$3-$1-$2' }, // MM/DD/YYYY
    { regex: /^(\d{1,2})\/(\d{4})$/, format: '$2-$1' }, // MM/YYYY
    { regex: /^(\d{1,2})\/(\d{1,2})$/, format: '$1-$2' }, // MM/DD without default year
    { regex: /^(\d{1,2})-(\d{1,2})$/, format: '$1-$2' }, // MM-DD without default year
    { regex: /^(\d{1,2})-(\d{1,2})$/, format: '$2-$1' }, // DD-MM without default year
    { regex: /^(\d{1,2})\/(\d{1,2})$/, format: '$2-$1' }, // DD/MM without default year
  ];

  for (const { regex, format } of regexPatterns) {
    const match = normalized.match(regex);
    if (match) {
      return format.replace(/\$(\d)/g, (_, index) => match[index]); // Returns the standardized format
    }
  }

  return null; // Return null if no valid format is found
};


const getSexAtBirth = (sexAtBirthCode) => {
    if (sexAtBirthCode.toLowerCase().includes("female")) {
      return "F";
    } else if (sexAtBirthCode.toLowerCase().includes("male")) {
      return "M";
    } else {
      return "U";
    }
  };
  
  const removeUSCountryCode =(phoneNumber)=> {
    const phoneStr = phoneNumber?.toString();
    return phoneStr?.startsWith('1') && phoneStr?.length === 11 ? Number(phoneStr?.slice(1)) : null; 
}
const checkAddressCountryCode = (country)=> country === 'US'

const allergiesList = (allergyList)=>{
  if(isEmpty(allergyList)){
    return null
  }
  return allergyList?.map(item => item?.allergy).join('; ');
}
const problemList = (diagnosisList)=>{
  if(isEmpty(diagnosisList)){
    return null
  }
  return diagnosisList?.map(item => item).join('; ');
}

const parseRXE =(inputData)=> {  
// const inputData = `<string>MSH|^~\&|MDToolbox||PRAC||202011131430||ADT^A08|1234567890|P|2.3|1234567890  
// PID|1|1|1|Patient^Test^R||20000513|M|||123 S Apple St^^Capetown^NV^12345||(555)5551111|  
// DG1|1||047.8^CNS Infection||  
// RXE|30^^^20141028|12345^Lisinopril 10 mg tablets^RxNorm||||Tablet|^take 1 a day|||10|tablets|1|101232311||343234||||||||||||||||||||||</string>`;
  // Remove the <string> tags from the input data, if present
  const hl7Data = inputData.replace(/<\/?string>/g, '').trim();
  
  const segments = hl7Data.split("\n"); // Split input data by line breaks
  const rxeData = [];

  segments.forEach(segment => {
    if (segment.startsWith('RXE')) {  // Look for RXE segment
      const fields = segment.split('|'); // Split the RXE segment by '|'
      
      // Split the drugCode field into drugCode, drugName, and drugSystem
      const [drugCode, drugName, drugSystem ,nationalDrugCode] = fields[2].split('^');

      const [days, , , date] = fields[1].split('^');
      const [markCompleteStatus, ] = fields[40].split(':');

      const createdOn = date
      ? `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`
      : '';
      const rxeObject = {
        days: days, 
        drugCode: drugCode, // 12345 acc. drugSystem
        drugName: drugName || '', // Lisinopril 10 mg tablets
        nationalDrugCode: nationalDrugCode || '', // NDC
        createdOn: createdOn || '',
        drugSystem: drugSystem || '', // RxNorm
        dosageForm: fields[6], // Tablet
        dosageInstruction: fields[7].replace('^', ''), // take 1 a day (remove any extra characters)
        quantity: fields[10] || '', // 10
        unit:fields[11] || '',
        refill: fields[12] || '',
        providerNpi: fields[13] || '',
        prescribingID: fields[15] || '',
        markCompleteStatus: markCompleteStatus || ''
        // Add other fields here as needed
      };

      rxeData.push(rxeObject); // Add the parsed RXE object to the result array
    }
  });

  return rxeData; // Return the array containing all parsed RXE objects
}



const ccdDataParser = (xml) => {
  // Parse the XML string into a DOM object
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  // Extract rows from the table body, skipping the header row
  const rows = Array.from(doc.getElementsByTagName('tr')).slice(1);

  // Map each row to a medication object if it meets specific criteria
  return rows
    .map((row) => {
      const cols = row.getElementsByTagName('td');
      // Ensure the row has exactly 5 columns and valid content
      if (
        cols.length === 5 &&
        cols[1].textContent.trim() !== '' && // Example: drugName should not be empty
        cols[3].textContent.trim() !== '' // Example: status should not be empty
      ) {
        return {
          createdOn: cols[0].textContent.trim(),
          drugName: cols[1].textContent.trim(),
          dosageInstruction: cols[2].textContent.trim(),
          status: cols[3].textContent.trim(),
        };
      }
      return null; // Exclude invalid rows
    })
    .filter(Boolean); // Remove null values
};
const cleanIp= (ip)=> {
  if (typeof ip !== 'string') return ip;

  // IPv4-mapped IPv6
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');


  return ip;

}
const loginAttempt = {
  loginFailedCount: 3
};


module.exports = {
  cleanIp,
  getModelFromRole,
  getSortAndLimit,
  decodeHtml,
  getDynamicTemplate,
  capitalizeFirstLetterOfEachWord,
  getFullName,
  genralStatus,
  billingType,
  getImageUrl,
  isPatient,
  getPatientPhone,
  getPatientSex,
  capitalize,
  getFormType,
  isSignatureRequired,
  modulePermission,
  shareFromCategoryMap,
  getAddress,
  normalizeDateInput,
  getSexAtBirth,
  removeUSCountryCode,
  checkAddressCountryCode,
  allergiesList,
  problemList,
  parseRXE,
  ccdDataParser,
  generalClaimStatus,
  loginAttempt,
};
