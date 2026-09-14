const logger = require("../config/logger");
const { download } = require("./download.service");

const getOrganizationLogo = async ({ practiceLogo }) => {
  try {
    const fileName = practiceLogo?.name || '';
    const logoUrl =
      practiceLogo?.type != 'defaultOrganizationLogo'
        ? await download({
            query: {
              fileName,
              base64: true
            }
          })
        : practiceLogo.file;

    return {
      logo: `<img src=cid:${fileName} style="width:200px; height:110px;" alt="logo"/>`,
      practiceLogoAttechment: {
        content: logoUrl,
        filename: fileName,
        type: 'image/png',
        disposition: 'inline',
        cid: fileName,
        encoding: 'base64',

      }
    };
  } catch (err) {
    logger.error('error in getOrganizationLogo:', err);
  }
};


module.exports={
    getOrganizationLogo
}