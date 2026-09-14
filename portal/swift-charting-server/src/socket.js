/* eslint-disable no-await-in-loop */
/* eslint-disable no-empty */
/* eslint-disable import/no-extraneous-dependencies */
const socketServer = require('socket.io');
const logger = require('./config/logger');
const { dbService } = require('./services');
const { getModels } = require('./utils/connection');
const { deserializeFilter } = require('./utils/socketFilterTypeCast');
const { Server } = require('socket.io');

const subscription = {};

const removeOldSubscriptions = async (io) => {
  for (const model of Object.keys(subscription)) {
    for (const uid of Object.keys(subscription[model] || {})) {
      try {
        // Attempt to fetch the socket associated with the current uid
        const sockets = await io.fetchSockets({ id: uid });

        // Check if the socket is connected
        const isClientConnected = sockets.length > 0;

        // If the client is not connected, remove their subscription
        if (!isClientConnected) {
          delete subscription[model][uid];
        }
      } catch (error) {
        console.error(`Error fetching socket for uid ${uid}:`, error);
      }
    }
  }
};



// Add subscription
const addSubscription = (uid, metadata,io) => {
    // First, remove old subscriptions created before today
    removeOldSubscriptions(io);
  const { model, filter, include, includeFilters, tenantId, pagination, serviceName,order } = metadata.data;

  subscription[model] = subscription[model] || {};
  subscription[model][uid] = { filter, include, tenantId, pagination, serviceName,order };

  (include || []).forEach((inc) => {
    subscription[inc.model] = subscription[inc.model] || {};
    subscription[inc.model][uid] = { filter: includeFilters[inc.model], parentInclusions: { model, uid }, tenantId,createdAt:new Date() };

    (inc.include || []).forEach((_inc) => {
      subscription[`nested_${_inc.model}`] = subscription[`nested_${_inc.model}`] || {};
      subscription[`nested_${_inc.model}`][uid] = { filter: includeFilters[_inc.model], parentInclusions: { model, uid }, tenantId,createdAt:new Date() };
    });
  });
};

const removeSubscription = (uid, metadata,socket) => {
  const { model, include } = metadata.data;

  // Helper function to safely remove a subscription entry
  const removeEntry = (sub, mod, identifier,socket) => {
    socket.leave(uid);
    if (sub[mod] && sub[mod][identifier]) {
      delete sub[mod][identifier];
      // Remove the model itself if no more subscriptions exist under it
      if (Object.keys(sub[mod]).length === 0) {
        delete sub[mod];
      }
    }
  };

  // Remove subscription for the primary model
  removeEntry(subscription, model, uid,socket);

  // Recursively remove subscriptions for all includes and nested includes
  (include || []).forEach((inc) => {
    removeEntry(subscription, inc.model, uid,socket);

    (inc.include || []).forEach((_inc) => {
      removeEntry(subscription, `nested_${_inc.model}`, uid,socket);
    });
  });
};


// Socket server configuration
const configure = function (server, app) {
  const io = socketServer(server, { cors: { origin: "*", credentials: true } });
  io.on('connection', (socket) => {
    socket.on('join', ({ uid, _metaData }) => {

      addSubscription(uid, _metaData,io);
      socket.join(uid, () => socket.emit('joined', uid));


    });

    socket.on('leave', ({ uid, _metaData = {} }) => {
      removeSubscription(uid,_metaData,socket)
    });
    
  });
  
    // Set up the interval to clean up old subscriptions every hour
    setInterval(() => {
      removeOldSubscriptions(io); // Pass `io` to check active connections
    }, 3600000); // Run every hour (3600000ms)
    

  // Resolve Sequelize models
  const getModel = (db, modelName) => {
    const pascalCaseModelName = modelName
      .toLowerCase()
      .replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
    return db[pascalCaseModelName];
  };

  const resolveIncludeModels = (db, includes) => {
    if (!includes || !Array.isArray(includes)) return undefined;
    return includes.map((item) => {
      const resolvedModel = getModel(db, item.model);
      if (!resolvedModel || !resolvedModel.getTableName) {
        throw new Error(`Model ${item.model} not found or is not a valid Sequelize model.`);
      }
      const resolvedNestedIncludes = resolveIncludeModels(db, item.include);
      return { ...item, model: resolvedModel, ...(resolvedNestedIncludes && { include: resolvedNestedIncludes }) };
    });
  };

  const resolveOrderModels = (db, order=[]) => {
    return order.map(item => {
        return item.map(subItem => {
            // Check if subItem is an object and has a model property
            if (typeof subItem === 'object' && typeof subItem.model === 'string') {
                // Get the actual model from the db using the string name
                const model = getModel(db, subItem.model);
                return { model, as: subItem.as }; // Return the model object and alias
            }
            return subItem; // Return the item as-is if it's not a model object
        });
    });
};

  const filterOnlyChatsSubscription = ({data,filteredSubscription})=>{
    const onlyMessagesSubscription = filteredSubscription.filter(item => {
      const filterConditions = item?.filter["$and"];
    const parentQuery = subscription[item?.parentInclusions?.model]?.[item?.parentInclusions?.uid];


      if (filterConditions) {
        // Look for a condition where chatId matches the data.chatId
        const chatIdCondition = filterConditions.find(condition => 
          condition?.chatId == data.chatId
        );

        // If chatId condition exists and matches, return true
        return chatIdCondition !== undefined;
      }
      if(parentQuery){
        const parentFilterCondition = parentQuery?.filter?.where?.["$and"]?.filter(item=>item?.["$or"])?.[0]?.["$or"];
        if (parentFilterCondition) {
          // Look for a condition where chatId matches the data.chatId
          const chatIdCondition = parentFilterCondition.find(condition => 
            condition?.receiverId == data.receiverId
          );

          // If chatId condition exists and matches, return true
          return chatIdCondition !== undefined;
        }
      }

      return false;
    });
    return onlyMessagesSubscription;
  }

  const filterOnlyUserChatsSubscription = ({data,filteredSubscription})=>{
    const onlyMessagesSubscription = filteredSubscription.filter((item)=>{
      return item?.parentInclusions?.model==='chat';
    })
    return onlyMessagesSubscription;
  }

  const filterNotificationSubscription = ({data,filteredSubscription}) => {
    const onlyMessagesSubscription = filteredSubscription.filter((item)=>{
      const {filter={}} = item || {}
      return filter?.where?.userId == data.userId;
    })
    return onlyMessagesSubscription;
  }


  const getGroupIdArray = ({ model,data }) => {
    try {
      const userFilter = subscription[model] || {};
      const userFilterNested = subscription[`nested_${model}`] || {};

      let temp = [
        ...Object.entries(userFilter).map(([key, value]) => ({ key, ...value })),
        ...Object.entries(userFilterNested).map(([key, value]) => ({ key, ...value })),
        ];
        if(model==='notification'){
          temp = filterNotificationSubscription({data,filteredSubscription:temp})
        }
      if(model==='user'){
        temp = filterOnlyUserChatsSubscription({data,filteredSubscription:temp})
      }
      if (model === 'message') {
        temp = filterOnlyChatsSubscription({data,filteredSubscription:temp})
      }
      return temp
    } catch (err) {
      logger.error('Error in getGroupIdArray', err);
    }
  };

  const getQueryData =async (model,groupIdArray) => {
const results = await Promise.all(
  groupIdArray.map(async (groupId) => {
        const { key: uid, parentInclusions, pagination = {}, tenantId, serviceName, filter, include,order } = groupId;

        if (!tenantId) {
          logger.warn('No tenantId found for groupId:', groupId);
          return { result: undefined, uid };
        }

        const db = getModels(tenantId);
        const parentQuery = subscription[parentInclusions?.model]?.[parentInclusions?.uid];

        try {
          const newInclude = resolveIncludeModels(db, parentQuery?.include || include);
          const newOrder = resolveOrderModels(db, parentQuery?.order || order);


          const temp = await dbService?.[parentQuery?.serviceName || serviceName]?.({
            model: getModel(db, parentInclusions?.model || model),
            req: { clinicUuid: tenantId, query: { subscribeSocket: true, ...pagination } },
            subscribeSocket: true,
            addOnFilter: deserializeFilter(parentQuery?.filter || filter),
            filter: deserializeFilter(parentQuery?.filter || filter),
            tenantId,
            otherOptions: { include: newInclude || [],...(newOrder.length? {order:newOrder} :{}) },
            include:newInclude || [],
            ...(newOrder.length? {order:newOrder} :{})
          });

          if (!temp) logger.error(`Error: dbService.${parentQuery?.serviceName || serviceName} returned undefined for model ${model}.`);

          const queryData = { result: temp, uid, groupId,test:subscription[parentInclusions?.model]?.[parentInclusions?.uid]||{} };
          const { result } = queryData || {}
            if (uid) io.to(uid).emit('data', { data: result, uid, groupId });
        } catch (error) {
          logger.error('Error during dbService fetch:', error);
          return { result: undefined, uid, error: error.message };
        }
      })
    )
    return results;
  }

  app.post('/notifyGroup', async (req, res) => {
    try {
      const { body } = req;
      const { modelName: model,data } = body;
      const groupIdArray = getGroupIdArray({ model,data });
      await getQueryData(model,groupIdArray);

    } catch (error) {
      logger.error('Error in /notifyGroup:', error);
    }
  });
};

// Socket server configuration
const configureMessage = function (server, app) {
      // Initialize Socket.IO server
      const io = new Server(server, {
        path: '/socket/messages', // custom path as per your setup
        cors: {
          origin: '*', // Adjust according to your security settings
          methods: ['GET', 'POST'],
        },
      });

      // Handle Socket.IO connections
      io.on('connection', (socket) => {

        // Join a room
        socket.on('joinRoom', ({ room }) => {
          socket.join(room);
        });

        // Handle incoming messages and broadcast to the room
        socket.on('sendMessage', ({ room, msg, userId, sentAt }) => {
          // Broadcast the message to other users in the room
          io.to(room).emit('roomMessage', { room, msg, userId, sentAt});
        });

        // Handle disconnect
        socket.on('disconnect', () => {
        });
      });
}

module.exports = { configure,configureMessage };
