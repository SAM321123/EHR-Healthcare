const express = require('express');
const auth = require('../../middlewares/auth');
const { practiceController } = require('../../controllers');
const { AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router.route('/').get(auth(AUTH_MODULE.practice), practiceController.getPractices);

router.route('/:practiceId').get(auth('getPractice'), practiceController.getPracticeById);

module.exports = router;
