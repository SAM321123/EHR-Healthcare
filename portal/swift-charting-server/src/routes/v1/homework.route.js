const express = require('express');
const homeworkController = require('../../controllers/homework.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { homeworkValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.homework, { action: AUTH_ACTION.create }),
    validate(homeworkValidation.createHomework),
    homeworkController.createHomework
  )
  .get(
    auth(AUTH_MODULE.homework, { action: AUTH_ACTION.read }),
    validate(homeworkValidation.getHomework),
    homeworkController.getHomework
  );

  router
  .route('/:homeworkId')
  .put(
    auth(AUTH_MODULE.homework, { action: AUTH_ACTION.update }),
    validate(homeworkValidation.updateHomework),
    homeworkController.updateHomework
  )
module.exports = router;
