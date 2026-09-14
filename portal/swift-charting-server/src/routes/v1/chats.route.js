const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { allergiesValidation } = require('../../validations');
const { chatsController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.chats, { action: AUTH_ACTION.create }),
   // validate(allergiesValidation.createAllergies),
   chatsController.createChats
  )
  .get(auth(AUTH_MODULE.chats,validate(), { action: AUTH_ACTION.read }), chatsController.getChatsById);

router
  .route('/mark-chat-read/:chatId')
  .post(
    auth(AUTH_MODULE.chats, { action: AUTH_ACTION.create }),
   chatsController.markChatRead
  )

router
  .route('/:chatId')
  .post(
    auth(AUTH_MODULE.chats, { action: AUTH_ACTION.create }),
   // validate(allergiesValidation.createAllergies),
   chatsController.sendMessage
  ).put(
    auth(AUTH_MODULE.chats, { action: AUTH_ACTION.update }),
    // validate(labsRadiologyValidation.updateLabsRadiology),
    chatsController.deleteChatMessages
  ).get(
    auth(AUTH_MODULE.chats, { action: AUTH_ACTION.read }),
    validate(),
    chatsController.getChatsMessages
  );

router
  .route('/isExistingChat/:patientId')
  .get(auth(AUTH_MODULE.chats, { action: AUTH_ACTION.read }),
  chatsController.getExistingChat
  );  

module.exports = router;
