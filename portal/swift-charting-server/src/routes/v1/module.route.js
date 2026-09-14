const express = require('express');
const { moduleController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .post(moduleController.createModule)
  .get(moduleController.getModule);

router
  .route('/:moduleId')
  .put(moduleController.updateModule)


module.exports = router;
