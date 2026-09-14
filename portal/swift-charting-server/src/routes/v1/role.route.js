const express = require('express');
const { roleController } = require('../../controllers');

const router = express.Router();

router.route('/').post(roleController.createRole);
router.route('/').get(roleController.getRole);
router.route('/superAdmin').post(roleController.createRoleSuperAdmin);

router.route('/:roleId').put(roleController.updateRole);


module.exports = router;
