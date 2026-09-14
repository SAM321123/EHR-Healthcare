
const { downloadService } = require('../services');
const catchAsync = require('../utils/catchAsync');


const download = catchAsync(async (req, res) => {
  await downloadService.download(req, res);
});

const downloadPublic = catchAsync(async (req, res) => {
  req.query.public = true;
  await downloadService.download(req, res);
});

module.exports = {
  download,
  downloadPublic,
};
