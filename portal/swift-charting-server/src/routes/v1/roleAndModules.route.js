const express = require('express');
const { roleAndModuleController } = require('../../controllers');

const router = express.Router();

router.route('/:roleId').get(roleAndModuleController.getRoleAndModules);

module.exports = router;
