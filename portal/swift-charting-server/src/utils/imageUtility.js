/* eslint-disable security/detect-non-literal-fs-filename */
const sharp = require('sharp');
const sizeOf = require('image-size');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');
const { unSinkFile } = require('./fileHandler');
const logger = require('../config/logger');
const { staticPath } = require('../config/config');

const getGalleryThumbnailDimensions = (dimensions) => {
  const { resourceWidth, resourceHeight } = dimensions;
  let thumbWidth = resourceWidth;
  let thumbHeight = resourceHeight;
  const maxValue = resourceWidth > resourceHeight ? resourceWidth : resourceHeight;
  if (maxValue > 300) {
    if (resourceWidth > resourceHeight) {
      if (resourceWidth / resourceHeight >= 2) {
        thumbHeight = 256;
        thumbWidth = Math.trunc((resourceWidth / resourceHeight) * thumbHeight);
      } else {
        thumbWidth = 256;
        thumbHeight = Math.trunc((resourceHeight / resourceWidth) * thumbWidth);
      }
    } else if (resourceHeight / resourceWidth >= 2) {
      thumbWidth = 256;
      thumbHeight = Math.trunc((resourceHeight / resourceWidth) * thumbWidth);
    } else {
      thumbHeight = 256;
      thumbWidth = Math.trunc((resourceWidth / resourceHeight) * thumbHeight);
    }
  }

  return { width: thumbWidth, height: thumbHeight };
};

const compressImageBySharp = ({ inputFilePath, dimensions }) => {
  return new Promise((resolve, reject) => {
    const { height, width } = dimensions;
    sharp(inputFilePath)
      .resize({
        width,
        height,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.cubic,
      })
      .withMetadata()
      .toBuffer()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createThumbnail = async ({ file, fileName }) => {
  let imageType;
  const directoryPath = path.join(staticPath, uuid()); // Create the directory path
  fs.mkdirSync(directoryPath, { recursive: true });
  const inputFilePath = path.join(directoryPath, fileName);
  fs.writeFileSync(inputFilePath, Buffer.concat(file.data));
  let resourceDimensions;
  try {
    resourceDimensions = await sizeOf(file.data[0]);
  } catch (err) {
    logger.error('Error on getting size of file', err);
  }
  const { height: resourceHeight = '', width: resourceWidth = '' } = resourceDimensions || {};
  let dimensions;
  if (resourceWidth && resourceHeight) {
    if (resourceWidth > resourceHeight) {
      imageType = 'landscape';
    } else {
      imageType = 'portrait';
    }
    dimensions = getGalleryThumbnailDimensions({
      resourceWidth,
      resourceHeight,
    });
  } else {
    dimensions = { width: 200, height: 200 };
  }
  const compressData = await compressImageBySharp({
    inputFilePath,
    dimensions,
  });
  unSinkFile({ path: inputFilePath });
  return { compressData, imageType };
};
module.exports = {
  getGalleryThumbnailDimensions,
  compressImageBySharp,
  createThumbnail,
};
