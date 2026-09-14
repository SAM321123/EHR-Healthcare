const express = require('express');

const { hl7Controller } = require('../../controllers');
const {sendDummyResult} = require('../../../labOrderFiles/dummyResultUpload');

const router = express.Router();

// router
//   .route('/')
//   .post(
//     hl7Controller.convertToHl7
//   )

router.post('/', hl7Controller.sendToLab);

router.post('/sendResult', sendDummyResult);

module.exports = router;
