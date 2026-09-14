const axios = require('axios');
const querystring = require('querystring');
const config = require('../../config/config');

/**
 * @faxNumber (Required – 11 digit number)
 * @fileName (Valid File Name)
 * @fileContent (Base64 encoding of file contents)
 * */

const sendFax = async ({ faxNumber, fileName, fileContent }) => {
  const { srFaxUrl, accessId, accessPwd, srFaxSenderEmail, srFaxSenderMobile } = config.srFaxConfig;

  const data = {
    access_id: accessId,
    access_pwd: accessPwd,
    action: 'Queue_Fax',
    sCallerID: srFaxSenderMobile,
    sSenderEmail: srFaxSenderEmail,
    sFaxType: 'SINGLE',
    sToFaxNumber: faxNumber,
    sFileName_1: fileName,
    sFileContent_1: fileContent,
  };

  const stringifyData = querystring.stringify(data);

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  try {
    const response = await axios.post(srFaxUrl, stringifyData, options);
    return response.data;
  } catch (error) {
    return { error };
  }
};

module.exports = sendFax;
