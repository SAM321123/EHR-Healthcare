/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const { isEmpty } = require('lodash');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');
const { default: slugify } = require('slugify');
const { capitalizeFirstLetterOfEachWord } = require('../utils');
const pick = require('../utils/pick');
const { notifications } = require('../config/notification');
const { sendNewMessageNotification, updateNotification } = require('../services/notification.service');

const createChats = catchAsync(async (req, res) => {
  const { body } = req || {};
  const { senderId, userId: receiverId, isActive = true, message } = body;
  const channelId = 'channel-' + senderId + '-' + receiverId;
  const channelId2 = 'channel-' + receiverId + '-' + senderId;
  const { id: userId } = req.user || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const chatExist = await dbService.getOne({
    model: db.Chat,
    filter: {
      where: {
        [Op.or]: [{ channelId: channelId }, { channelId: channelId2 }],
      },
    },
  });
  if (chatExist) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.CHAT_CHANNEL_EXIST);
  }
  let createChat = await dbService.createOne({
    model: db.Chat,
    reqParams: { senderId, receiverId, channelId, isActive, createdById: userId },
  });
  if (createChat) {
    const createdMessage = await dbService.createOne({
      model: db.Message,
      reqParams: { senderId, receiverId, chatId: createChat?.id, messageText: message, isActive, createdById: userId },
    });
    createChat = await dbService.getOneById({
      model: db.Chat,
      id: createChat.id,
      include: [
        {
          model: db.User,
          as: 'Sender',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
          include: [
            {
              model: db.Staff,
              as: 'staff',
              attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
              include: [
                { model: db.User, as: 'user', attributes: ['lastActivity'] },
                { model: db.File, as: 'file', attributes: ['file'] },
                { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
              ],
            },
            {
              model: db.Patient,
              as: 'patient',
              attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
              include: [
                { model: db.User, as: 'user', attributes: ['lastActivity'] },
                { model: db.File, as: 'file', attributes: ['file'] },
                { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
              ],
            },
          ],
        },
        {
          model: db.User,
          as: 'Receiver',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
          include: [
            {
              model: db.Staff,
              as: 'staff',
              attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
              include: [
                { model: db.User, as: 'user', attributes: ['lastActivity'] },
                { model: db.File, as: 'file', attributes: ['file'] },
                { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
              ],
            },
            {
              model: db.Patient,
              as: 'patient',
              attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
              include: [
                { model: db.User, as: 'user', attributes: ['lastActivity'] },
                { model: db.File, as: 'file', attributes: ['file'] },
                { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
              ],
            },
          ],
        },
        {
          model: db.Message,
          as: 'Messages',
          attributes: ['id', 'messageText', 'createdAt'],
          required: false,
          limit: 1,
          order: [['createdAt', 'DESC']],
          where: { isDeleted: false },
        },
        {
          model: db.Message,
          as: 'UnreadMessages',
          attributes: ['id', 'senderId', 'receiverId'],
          required: false,
        },
      ],
    });
  }
  res.status(httpStatus.CREATED).send(createChat);
});

const getChats = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getAll({
    model: db.Chat,
    req,
    allowedFilters: ['receiverId'],
    searchFilter: ['allergy'],
    include: [
      {
        model: db.Message,
        as: 'messages',
      },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getChatsById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  if(!uuid){
    return res.status(httpStatus.OK).send({ message: 'Super Admin' });
  }
    const { id: userId } = req.user || {};
    const searchText = pick(req.query, ['searchText']);
    const searchValue = searchText?.searchText;
    const { subscribeSocket = false } = req.query || {};
    console.log('searchText >>>>>>>>>>>>>>>>>>>>>>>>>', searchText);
    const db = getModels(uuid);
    try {
      const searchConditions =
        searchValue && typeof searchValue === 'string' && searchValue.trim() !== ''
          ? {
              [Op.or]: [
                { '$Sender.firstName$': { [Op.iLike]: `%${searchValue}%` } },
                { '$Sender.lastName$': { [Op.iLike]: `%${searchValue}%` } },
                { '$Receiver.firstName$': { [Op.iLike]: `%${searchValue}%` } },
                { '$Receiver.lastName$': { [Op.iLike]: `%${searchValue}%` } },
              ],
            }
          : {};
      const result = await dbService.getAll({
        model: db.Chat,
        subscribeSocket,
        tenantId: uuid,
        otherOptions: {
          include: [
            {
              model: db.User,
              as: 'Sender',
              attributes: ['id', 'firstName', 'lastName'],
              required: false,
              include: [
                {
                  model: db.Staff,
                  as: 'staff',
                  attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
                  include: [
                    { model: db.User, as: 'user', attributes: ['lastActivity'] },
                    { model: db.File, as: 'file', attributes: ['file'] },
                    { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
                  ],
                },
                {
                  model: db.Patient,
                  as: 'patient',
                  attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
                  include: [
                    { model: db.User, as: 'user', attributes: ['lastActivity'] },
                    { model: db.File, as: 'file', attributes: ['file'] },
                    { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
                  ],
                },
              ],
            },
            {
              model: db.User,
              as: 'Receiver',
              attributes: ['id', 'firstName', 'lastName'],
              required: false,
              include: [
                {
                  model: db.Staff,
                  as: 'staff',
                  attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
                  include: [
                    { model: db.User, as: 'user', attributes: ['lastActivity'] },
                    { model: db.File, as: 'file', attributes: ['file'] },
                    { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
                  ],
                },
                {
                  model: db.Patient,
                  as: 'patient',
                  attributes: ['id', 'firstName', 'middleName', 'lastName', 'otherTitle'],
                  include: [
                    { model: db.User, as: 'user', attributes: ['lastActivity'] },
                    { model: db.File, as: 'file', attributes: ['file'] },
                    { model: db.GlobalType, as: 'title', attributes: ['name', 'code'] },
                  ],
                },
              ],
            },
            {
              model: db.Message,
              as: 'Messages',
              attributes: ['id', 'messageText', 'createdAt'],
              // required: false,
              limit: 1,
              order: [['createdAt', 'DESC']],
              where: { isDeleted: false },
            },
            {
              model: db.Message,
              as: 'UnreadMessages',
              attributes: ['id', 'senderId', 'receiverId','createdAt'],
              // required: false,
            },
          ],
          order: [[{ model: db.Message, as: 'UnreadMessages' }, 'createdAt', 'DESC']],
        },
        filter: {
          where: {
            [Op.and]: [
              {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }],
              },
              searchConditions,
            ],
          },
  
          logging: console.log, // Log the SQL query for debugging
        },
      });
      if (result?.results?.length === 0) {
        console.log('No records found matching the query conditions.');
      }
  
      res.status(httpStatus.OK).send(result);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(httpStatus.NOT_FOUND).send({ message: error.message });
    }

});

const getChatsMessages = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { id: userId } = req.user || {};
  const chatId = req.params.chatId; // Assuming route is defined as /api/messages/:chatId

  const db = getModels(uuid);
  try {
    const result = await dbService.getPaginated({
      model: db.Message,
      req,
      addOnFilter: {
        [Op.and]: [
          {
            [Op.or]: [{ senderId: userId }, { receiverId: userId }], // Existing OR condition
          },
          {
            chatId, // Add your additional condition here, e.g., matching a specific chatId
            // Add more conditions if needed
          },
        ],
      },
      allowedFilters: [],
      searchFilter: ['message'],
      include: [
        {
          model: db.User, // Include User model
          as: 'SenderInfo', // Alias used in the association
          attributes: ['id', 'firstName', 'lastName'], // Fetch specific user attributes
          required: false,
          // include:[{model:db.Staff,as:'staff',attributes:['id'],include:[{model:db.File,as:'file',attributes:['file']}]},{model:db.Patient,as:'patient',include:[{model:db.File,as:'file'}]}]
        },
        {
          model: db.User,
          as: 'ReceiverInfo',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
          // include:[{model:db.Staff,as:'staff',attributes:['id'],include:[{model:db.File,as:'file',attributes:['file']}]},{model:db.Patient,as:'patient',include:[{model:db.File,as:'file'}]}]
        },
      ],
    });

    if (result.length === 0) {
      console.log('No records found matching the query conditions.');
    }

    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(httpStatus.NOT_FOUND).send({ message: error.message });
  }
});

const sendMessage = catchAsync(async (req, res) => {
  const { body } = req || {};
  const { senderId, receiverId, message } = body;
  const channelId = 'channel-' + senderId + '-' + receiverId;
  const channelId2 = 'channel-' + receiverId + '-' + senderId;
  const { id: userId } = req.user || {};
  const chatId = req.params.chatId; // Assuming route is defined as /api/messages/:chatId

  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  try {
    const chatChannelExist = await dbService.getOne({
      model: db.Chat,
      filter: {
        where: {
          [Op.or]: [{ channelId: channelId }, { channelId: channelId2 }],
        },
      },
    });

    if (chatChannelExist.id != chatId) {
      throw new ApiError(httpStatus.CONFLICT, errorMessages.CHAT_NOT_EXIST);
    }

    const createdMessage = await dbService.createOne({
      model: db.Message,
      reqParams: { senderId, receiverId, chatId, messageText: message, createdById: userId },
    });

    sendNewMessageNotification({ createdMessage }, { tenantId: uuid });
    res.status(httpStatus.CREATED).send(createdMessage);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(httpStatus.NOT_FOUND).send({ message: error.message });
  }
});

const markChatRead = catchAsync(async (req, res) => {
  const { body } = req || {};
  const { receiverId } = body;
  const { id: userId } = req.user || {};
  const chatId = req.params.chatId;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  try {
    const updatedMessages = await dbService.updateOne({
      model: db.Message,
      updateParams: { isRead: true, updatedById: userId },
      filter: { where: { chatId, receiverId, isRead: false } },
      options: { individualHooks: false },
    });
    updateNotification({ clinicUuid: uuid, params: {}, body: { data: { chatId } } });
    res.status(httpStatus.OK).send(updatedMessages);
  } catch (err) {
    res.status(httpStatus.OK).send([]);
  }
});

let io; // Declare io to be accessible throughout the module

function setupSocketConnection(socketIoInstance) {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle joining a room
    socket.on('joinRoom', ({ room }) => {
      if (room) {
        socket.join(room);
        console.log(`Client joined room: ${room}`);
      }
    });

    // Handle leaving a room
    socket.on('leaveRoom', ({ room }) => {
      if (room) {
        socket.leave(room);
        console.log(`Client left room: ${room}`);
      }
    });

    // Handle sending a message
    socket.on('sendMessage', ({ room, msg }) => {
      if (room) {
        // Broadcast the message to the specific room
        io.to(room).emit('roomMessage', { room, msg });
        console.log(`Message sent to room ${room}: ${msg}`);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

const deleteChatMessages = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { chatId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { laboratoryTestIds, ...rest } = body || {};
  console.log('chatId >>>>>>>>>>>>>>>>>>>', chatId);
  const existingChat = await dbService.getOne({
    model: db.Message,
    filter: {
      where: { chatId: chatId },
    },
  });
  if (!existingChat) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessages._NOT_FOUND(`Chat Messages`));
  }

  const updateParams = { ...rest, updatedById: userId };
  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  const [, [updatedChatMessages]] = await dbService.updateOne({
    model: db.Message,
    updateParams,
    filter: { where: { chatId } },
  });
  res.status(httpStatus.OK).send(updatedChatMessages);
});

const getExistingChat = catchAsync(async(req, res) => {
  const { body } = req || {};
  const senderId = req?.user?.id;
  const receiverId = req.params.patientId;
  const channelId = 'channel-' + senderId + '-' + receiverId;
  const channelId2 = 'channel-' + receiverId + '-' + senderId;
  const { id: userId } = req.user || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const chatExist = await dbService.getOne({
    model: db.Chat,
    filter: {
      where: {
        [Op.or]: [{ channelId: channelId }, { channelId: channelId2 }],
      },
    },
  });
  if (chatExist) {
    res.status(httpStatus.OK).send(chatExist);
  }else{
    res.status(httpStatus.OK).send(false);
  }
})

module.exports = {
  createChats,
  getChats,
  getChatsById,
  getChatsMessages,
  sendMessage,
  setupSocketConnection,
  deleteChatMessages,
  markChatRead,
  getExistingChat
};
