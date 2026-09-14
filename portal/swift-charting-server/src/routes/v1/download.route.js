const express = require('express');
const { downloadController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.route('/').get(downloadController.download);
router.route('/public').get(downloadController.downloadPublic);

module.exports = router;
