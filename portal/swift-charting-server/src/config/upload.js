const fs = require('fs');
const path = require('path');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const logoCandidates = [
  path.join(__dirname, '../lib/images/swiftChartingDefaultLogo.png'),
  path.join(__dirname, '../../../swift-charting-portal/src/assets/images/logo_back.png'),
  path.join(__dirname, '../../../../src/assets/images/logo.png'),
];

const isValidPng = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
};

const logoPath = logoCandidates.find(isValidPng);

if (!logoPath) {
  throw new Error('Unable to locate a valid default SwiftCharting logo PNG.');
}

const defaultOrganizationLogo = fs.readFileSync(logoPath).toString('base64');
 
module.exports = {
  defaultOrganizationLogo,
};
