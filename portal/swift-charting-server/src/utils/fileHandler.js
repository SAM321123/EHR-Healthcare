/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const formidable = require('formidable');
const logger = require('../config/logger');

const readRequestFiles = (req) => {
  return new Promise((resolve, reject) => {
    const files = [];
    const fields = req.query || {};
    const body = req.body || {};
    const form = new formidable.IncomingForm({maxFileSize: 50 * 1024 * 1024});
    form.on('error', function (err) {
      reject(err);
    });

    form.on('field', function (name, val) {
      fields[name] = val;
    });

    form.onPart = function (part) {
      if (!part.originalFilename) {
        form._handlePart(part);
        return;
      }
      const data = [];
      const fileName = part.filename || part.originalFilename;
      const { mimetype } = part;
      part.on('data', function (buffer) {
        data.push(buffer);
      });

      part.on('end', function () {
        files.push({ filename: fileName, data, name: part.name, mimetype });
      });
    };

    form.on('end', function () {
      if (fields.contents) {
        const contents = fields.contents.split(',').pop();
        const fileBuffer = Buffer.form(contents, 'base64');
        files.push({ filename: fields.name, type: fields.type, data: [fileBuffer] });
      }

      const editorFile = fields?.editorFile ? fields?.editorFile : body?.editorFile || false;
      const thumbnail =  fields?.thumbnail || body?.thumbnail || false;
      return resolve({ files, editorFile, thumbnail, patient: fields?.patient, isPublic: fields?.isPublic || fields?.editorFile });
    });
    form.parse(req);
  });
};

const unSinkFile = ({ path }) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    logger.error('err in unSinkFile', err);
  }
};
module.exports = {
  readRequestFiles,
  unSinkFile,
};
