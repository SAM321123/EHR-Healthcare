const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { uploadService } = require('../services');

const upload = catchAsync(async (req, res) => {
  console.log("🚀 ~ upload ~ req:", req)
  try {
    const uploadResult = await uploadService.upload(req);
    await res.send(uploadResult);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
});

module.exports = {
  upload,
};
