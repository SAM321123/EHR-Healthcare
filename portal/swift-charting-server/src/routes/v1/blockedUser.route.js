const express = require('express');
const { blockedUserController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { staffValidation } = require('../../validations');

const router = express.Router();

router
    .route('/')
    .get(auth(AUTH_MODULE.staff,{action:AUTH_ACTION.read}),validate(staffValidation.getStaff),blockedUserController.getBlockedUser);

router
    .route('/:staffId')
    .put(
        auth(AUTH_MODULE.staff,{action:AUTH_ACTION.update}),
        blockedUserController.updateBlockedUser)

module.exports = router;
