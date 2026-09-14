const express = require('express');
const { roleAndPermissionsController } = require('../../controllers');

const router = express.Router();

router.route('/:roleId').get(roleAndPermissionsController.getRoleAndPermissions);
router.route('/:roleId').post(roleAndPermissionsController.createRoleAndPermissions);
router.route('/:roleId').put(roleAndPermissionsController.updateRoleAndPermissions);



module.exports = router;
