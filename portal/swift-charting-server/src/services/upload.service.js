/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable security/detect-non-literal-fs-filename */
const uuid = require('uuid').v4;
const pathNPM = require('path');

const fs = require('fs');

const { s3BucketConfig, staticPath, serverURL, gcsEncryptionKey } = require('../config/config');

const logger = require('../config/logger');
const { readRequestFiles, unSinkFile } = require('../utils/fileHandler');
const { createThumbnail } = require('../utils/imageUtility');
// const { gcsStorage } = require('../utils/getGCS');
const dbService = require('./db.service');
const { getModels } = require('../utils/connection');

// const uploadFileToGCS = async ({ bucket, path, destinationPath }) => {
//   try {
//     const key = Buffer.from(gcsEncryptionKey, 'base64');
//     const result = await gcsStorage.bucket(bucket).upload(path, {
//       destination: destinationPath,
//       // public: true,
//       encryptionKey: key,
//     });
//     const { metadata: { name } = {} } = result && result.length && result[0];
//     return { key: name };
//   } catch (error) {
//     logger.error('Upload To GCS Erorr', error);
//     throw error;
//   }
// };

// const uploadFile = async ({ bucket, file, fileName, userId, thumbnail, mimetype, practice, isPatient, isPublic }) => {
//   let thumbnailFile;
//   let mainFile;
//   const path = `${staticPath}/${fileName}`;
//   const arrayValue = fileName && fileName.split('.');
//   const extension = arrayValue && arrayValue.length && arrayValue[arrayValue.length - 1];
//   try {
//     fs.writeFileSync(path, Buffer.concat(file.data));
//   } catch (e) {
//     logger.error('Writing file error trying again', e);
//     fs.mkdirSync(staticPath);
//     fs.writeFileSync(path, Buffer.concat(file.data));
//   }

//   let destinationPath = `clinic_${practice}`;
//   if (isPublic) {
//     destinationPath = `${destinationPath}/public`;
//   } else {
//     destinationPath = isPatient ? `${destinationPath}/patient/${userId}` : `${destinationPath}/others`;
//   }

//   try {
//     const result = await uploadFileToGCS({
//       bucket,
//       path,
//       destinationPath: `${destinationPath}/${fileName}`,
//     });
//     mainFile = { key: result.key };
//   } catch (e) {
//     logger.error('Uplaod To GCS CATCH ERROR>>>>>>>', e);
//   }
//   unSinkFile({ path });

//   if (extension !== 'pdf' && extension !== 'mp4' && thumbnail) {
//     const { compressData, imageType } = await createThumbnail({ file, fileName });
//     const directoryPathV1 = pathNPM.join(staticPath, uuid());
//     fs.mkdirSync(directoryPathV1, { recursive: true });
//     const inputFilePathV1 = pathNPM.join(directoryPathV1, fileName);
//     fs.writeFileSync(inputFilePathV1, Buffer.concat([compressData]));
//     try {
//       const result = await uploadFileToGCS({
//         bucket,
//         path: inputFilePathV1,
//         destinationPath: `${destinationPath}/Thumbnail/${fileName}`,
//       });
//       unSinkFile({ path: inputFilePathV1 });
//       thumbnailFile = { key: result.key };
//       return {
//         name: fileName,
//         file: mainFile && mainFile.key,
//         thumbnail: thumbnailFile && thumbnailFile.key,
//         imageType: imageType || 'portrait',
//         mimetype,
//       };
//     } catch (e) {
//       unSinkFile({ path: inputFilePathV1 });
//       logger.error('Upload File ERROR>>>>>>>', e);
//     }
//     return {};
//   }
//   return {
//     name: fileName,
//     file: mainFile && mainFile.key,
//     imageType: 'portrait',
//     mimetype,
//   };
// };

const uploadFileLocal = async ({ file, fileName, thumbnail, mimetype }) => {
  const path = `${staticPath}/${fileName}`;
  const arrayValue = fileName && fileName.split('.');
  const extension = arrayValue && arrayValue.length && arrayValue[arrayValue.length - 1];
  try {
    fs.writeFileSync(path, Buffer.concat(file.data));
  } catch (e) {
    logger.error('Writing file error trying again', e);
    fs.mkdirSync(staticPath);
    fs.writeFileSync(path, Buffer.concat(file.data));
  }

  if (extension !== 'pdf' && extension !== 'mp4' && thumbnail) {
    const { compressData, imageType } = await createThumbnail({ file, fileName });
    const directoryPathV1 = pathNPM.join(staticPath, uuid());
    fs.mkdirSync(directoryPathV1, { recursive: true });
    const inputFilePathV1 = pathNPM.join(directoryPathV1, `_thumbnail${fileName}`);
    fs.writeFileSync(inputFilePathV1, Buffer.concat([compressData]));
    return {
      name: fileName,
      file: fileName,
      thumbnail: `_thumbnail${fileName}`,
      imageType: imageType || 'portrait',
      mimetype,
    };
  }
  return {
    name: fileName,
    file: fileName,
    imageType: 'portrait',
    mimetype,
  };
};
const upload = async (req) => {
  const { files, thumbnail,editorFile } = await readRequestFiles(req);
  const { user } = req || {};
  const { clinicUuid } = req;
  const db = getModels(clinicUuid);
  // const { id: userId } = user;
  const result = [];

  await Promise.all(
    files.map(async (file) => {
      const fileName = file.filename;
      const { mimetype } = file;
      let bucketResponse;

      const uploadParams = {
        file: { ...file },
        fileName,
        thumbnail,
        mimetype,
      };

      try {
        bucketResponse = await uploadFileLocal(uploadParams);
        result.push(bucketResponse);
      } catch (e) {
        logger.error('upload Error', e);
        throw e;
      }
    })
  );
  const recordData = await dbService.createBulk({ model: db.File, reqParams: result });
  if (editorFile) {
    const publicDownloadFile = `${serverURL}download/public?fileName=${result[0].name}`;
    return { url: publicDownloadFile };
  }
  return recordData;
};

module.exports = {
  upload,
};
