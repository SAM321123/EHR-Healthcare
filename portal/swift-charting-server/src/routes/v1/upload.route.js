const express = require('express');
const auth = require('../../middlewares/auth');
const { uploadController } = require('../../controllers');

const router = express.Router();

router.route('/').post(auth(), uploadController.upload);

module.exports = router;
