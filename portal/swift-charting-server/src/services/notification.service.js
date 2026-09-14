/* eslint-disable camelcase */
const axios = require('axios');
const admin = require('firebase-admin');
const config = require('../config/config');
const logger = require('../config/logger');
const { getDynamicNotificationMessage, notifications } = require('../config/notification');
const dbService = require('./db.service');
const { getModels } = require('../utils/connection');
const { topics,getDynamicNotificationTopic } = require('../config/notificationTopic');
const { getFullName, getDynamicTemplate, decodeHtml } = require('../utils');
const { getAccessToken } = require('./googleAuth.service');
const { generateRecurringSummary } = require('../utils/appointmentUtility');
const { formatDate, timeFormatter, dateFormatter } = require('../utils/dateUtility');
const { sendEmail } = require('./email.service');
const { Sequelize } = require('sequelize');
const { UI_URLS } = require('../utils/constant');
const { encrypt } = require('../utils/encryption');

(() => {
  if (config.firebaseAdminServiceAccountPrivateKey && config.firebaseAdminServiceAccount)
    admin.initializeApp({
      credential: admin.credential.cert({
        private_key: config.firebaseAdminServiceAccountPrivateKey,
        ...JSON.parse(config.firebaseAdminServiceAccount),
      }),
    });
})();

const handleTopicSubscription = async (props) => {
  const { device, user: { role: userRoles = [], practice } = '', subscribeToTopic = false } = props || {};
  Object.values(topics).forEach((ele) => {
    const { topic = '', roles = [] } = ele || {};
    const hasCommonRole = userRoles.some((role) => roles.includes(role));
    const resolvedTopic = getDynamicNotificationTopic({ topic, params: { practice } });
    if (hasCommonRole) {
      if (subscribeToTopic) {
        admin
          .messaging()
          .subscribeToTopic(device, resolvedTopic)
          .then(async function (response) {
            console.log('Successfully subscribed to topic:', response);
          })
          .catch(function (error) {
            console.log('Error subscribing to topic:', error);
          });
      } else {
        admin
          .messaging()
          .unsubscribeFromTopic(device, resolvedTopic)
          .then(async function (response) {
            console.log('Successfully unsubscribed from topic:', response);
          })
          .catch(function (error) {
            console.log('Error unsubscribed from topic:', error);
          });
      }
    }
  });
};

const createNotification = async (body,{tenantId}) => {
  const db = getModels(tenantId);
  return dbService.createOne({ model: db.Notification, reqParams: body });
};

const getUserDevices = async ({ addOnFilter,tenantId }) => {
  const db = getModels(tenantId);
  const result = await dbService.getAll({model:db.UserDevice,filter:{...addOnFilter}});
  return result;
};
const getNotificationBody = (params) => {
  const {
    deviceId,
    title,
    message,
    dry_run,

    data,
    topic,
    type,
  } = params;

  if (!deviceId && !topic) {
    throw new Error('deviceId or topic must be provided to send notification');
  }

  // Construct the FCM HTTP v1 API request body
  const notificationBody = {
    message: {
      notification: {
        title,
        body: message,
      },
      data: {
        ...data,  // Additional data to send with notification
        type,
      },
    },
  };

  // Add device ID or topic as the target for the message
  if (Array.isArray(deviceId)) {
    notificationBody.message.tokens = deviceId;  // For multiple devices
  } else if (deviceId) {
    notificationBody.message.token = deviceId;  // For a single device
  }

  if (topic) {
    notificationBody.message.topic = topic;  // For sending to a topic
  }

  if (dry_run) {
    notificationBody.validate_only = true;  // Validate-only mode for testing without sending
  }

  return notificationBody;
};


const sendDeviceNotification = async ({ params, notificationConfig }) => {
  const notificationBody = getNotificationBody(params, notificationConfig);
  if (!notificationBody) {
    return null;
  }
  let response;
  try {
    if (notificationConfig?.notificationMethod) {
      response = await notificationConfig.notificationMethod(notificationBody);
    } else {
      const token = await getAccessToken()
      response = await axios.post('https://fcm.googleapis.com/v1/projects/swift-charting/messages:send', notificationBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.token || notificationConfig.leagecy_server_key}`,
        },
      });
    }
    return { response };
  } catch (err) {
    return { error: err.message };
  }
};

const sendTopicNotification = async (params,{tenantId}) => {
  const { notificationConfig } = config;
  const { data, title, type, message, additionalParams, topic, ...restParams } = params;

  const notificationParams = {
    title,
    message,
    data,
    click_action: 'https://www.google.com',
    topic,
    to: `/topics/${topic}`,
    type,
    ...restParams,
  };

  await sendDeviceNotification({ params: notificationParams, notificationConfig });

  const notificationInsert = {
    topic,
    type,
    title,
    message,
    data,
    date: new Date(),
    ...additionalParams,
  };

  await createNotification(notificationInsert,{tenantId});
};

const sendUserNotification = async (params,{tenantId}) => {
  const { skippedOptions, notificationConfig } = config;
  if (skippedOptions?.skipSendNotification) {
    logger.info('SEND NOTIFICATION IS SKIPPED. METHOD CALLED FOR SEND NOTIFICATION WITH TITLE:', params?.title);
    return { response: 'Notification Skipped' };
  }

  const {
    userIds = [],
    data,
    title,
    type,
    additionalParams,
    skipWebNotification = false,
    skipDeviceNotification = false,
    message,
    ...restParams
  } = params;

  let { alert } = params;

  let notificationInsert = {
    type,
    title,
    message,
    data,
  };
  if (alert !== undefined) {
    if (typeof alert === 'string') {
      alert = JSON.parse(alert);
    }
    notificationInsert.alert = alert;
  }

  if (restParams?.topic) {
    return sendTopicNotification(params,{tenantId});
  }

  const userInfos = userIds;
  if (!userInfos?.length) {
    return;
  }

  const batches = [];
  const batchSize = 10; // Adjust the batch size as per your requirements

  // Create batches of userInfos
  for (let i = 0; i < userInfos.length; i += batchSize) {
    batches.push(userInfos.slice(i, i + batchSize));
  }

  // Process each batch in parallel
  await Promise.all(
    batches.map(async (batch) => {
      const notifications = [];

      batch.forEach(({ id: userId, message: singleUserMessage }) => {
        if (!userId) return;
        const userMessage=singleUserMessage || message;
          notificationInsert = {
            ...notificationInsert,
            message: userMessage,
            };

        if (skipDeviceNotification) return;

        notifications.push({ userId, singleUserMessage:userMessage });
      });


      const results = [];

      for(const { userId, singleUserMessage } of notifications){
        const devices = await getUserDevices({ addOnFilter: { where:{userId: userId} },tenantId })

        if (devices?.length) {
          devices.forEach((userDevice) => {
            const { ios, android, ...restNotificationParams } = restParams || {};

            if (skipWebNotification && userDevice.type === 'web') {
              return;
            }
            if (userDevice.type === 'ios') {
              Object.assign(restNotificationParams, ios);
            } else if (userDevice.type === 'android') {
              Object.assign(restNotificationParams, android);
            } else if (notificationConfig.client_url && restNotificationParams.data && restNotificationParams.data.id) {
              restNotificationParams.click_action = 'https://www.google.com';
              restNotificationParams.icon = './ic_notification_transparent.png';
            }

            const notificationParams = {
              deviceId: userDevice.device,
              deviceType: userDevice.type,
              title,
              message: singleUserMessage,
              data,
              click_action: 'https://www.google.com',
              type,
              ...restNotificationParams,
            };

            results.push(
              sendDeviceNotification({ params: notificationParams, notificationConfig }).then(({ response, error }) => {
                return {
                  userId,
                  response,
                  deviceType: userDevice.type,
                  device: userDevice.device,
                  error,
                  singleUserMessage
                };
              })
            );
          });
        }
      };

      // Store results in the database
      const allNotifications = await Promise.all(results);
      const notificationsToSave = {};

      allNotifications.forEach(({ userId, response, deviceType, device, error,singleUserMessage }) => {
        if (notificationsToSave[userId]) {
          notificationsToSave[userId]?.deviceInfo?.push({
            deviceId: device,
            deviceType,
          });
        } else {
          notificationsToSave[userId] = {
            userId,
            date: new Date(),
            deviceInfo: [
              {
                deviceId: device,
                deviceType,
              },
            ],
            ...additionalParams,
            ...notificationInsert,
            message:singleUserMessage,
          };
        }
      });

      for (let item of Object.values(notificationsToSave)) {
        await createNotification({
          ...item,
        },{tenantId});
      }
    })
  );
};

const getSubscribedTopicsForUser = ({ userRoles }) => {
  const subscribedTopicsForUser = [];
  Object.values(topics).forEach((item) => {
    const { topic, roles } = item || {};
    const hasCommonRole = userRoles.some((role) => roles.includes(role.code));
    if (hasCommonRole) {
      subscribedTopicsForUser.push(getDynamicNotificationTopic({ topic }));
    }
  });
  return subscribedTopicsForUser;
};

const sendMeetingInvitationNotification = async (params) => {
  const { userIds = [], user, appointmentId } = params || {};
  const { title, message, type } = notifInfo.MEETING_INVITE || {};
  const notificationInfo = {
    title,
    message: getDynamicNotificationMessage({
      text: message,
      params: { name: user },
    }),
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { appointmentId },
  };
  await sendUserNotification(notificationInfo);
};

const sendAppointmentCreatedNotification = async (params,{tenantId}) => {
  const { appointment} = params || {};
  const practitioner = await appointment.getPractitioner();
  const patients = await appointment.getPatients();
  const patientName = patients.reduce((acc,item)=>getFullName(item)+','+acc,'');
  const practitionerName = getFullName(practitioner);
  const clinicNotifInfo =notifications.Clinic.APPOINTMENT_CREATED || {};
  const patientNotifInfo = notifications.Patient.APPOINTMENT_CREATED || {};

  const { title, message, type } = clinicNotifInfo;
  let {message:patientMessage} = patientNotifInfo || {};


  const userMessage = getDynamicNotificationMessage({
    text: message,
    params: { patientName },
  });
  patientMessage = getDynamicNotificationMessage({
    text: patientMessage,
    params: { practitionerName },
  });
  const userIds = [
    {
      id: practitioner?.userId,
      message: userMessage,
    },
    ...(patients.map(item=>({id:item?.userId,message:patientMessage})))
  ];

  const notificationInfo = {
    title,
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { appointmentId:appointment.id },
  };
  await sendUserNotification(notificationInfo,{tenantId});
};

const sendAppointmentNotification = async (params,{zoomNotification,startFrom,tenantId}={}) => {
  let { appointment } = params || {};
  const patients = await appointment.getPatients();
  const patientName = patients.reduce((acc,item)=>getFullName(item)+','+acc,'');
  const practitioner = await appointment.getPractitioner();
  const appointmentStatus = await appointment.getStatus();

  const userIds = [];

  let { title, message, type } = zoomNotification;
  title=getDynamicTemplate({text:title,params:{statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name}})
  // console.log('appointmentStatus---->',appointment);
  if(startFrom){
    for(const patient of patients){
      const userMessage = getDynamicTemplate({
        text: message,
        params: { patientName,statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,title:appointment?.title},
      });
      userIds.push({id:patient.userId,message:userMessage});
    }  
  }else{
    const userMessage = getDynamicTemplate({
      text: message,
      params: { patientName,statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,name:getFullName(practitioner),title:appointment?.title},
    });
    userIds.push({id:practitioner?.userId,message:userMessage});
  }

  const notificationInfo = {
    title,
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { appointmentId:appointment.id.toString() },
  };
  await sendUserNotification(notificationInfo,{tenantId});

}

const sendAppointmentCompletedNotification =  async (params,{patientoomNotification,clinicZoomNotification,startFrom,tenantId}={}) => {
  let { appointment } = params || {};
  const patients = await appointment.getPatients();
  const patientName = patients.reduce((acc,item)=>getFullName(item)+','+acc,'');
  const practitioner = await appointment.getPractitioner();
  const appointmentStatus = await appointment.getStatus();

  const userIds = [];

  let { title, message, type } = patientoomNotification;
  title=getDynamicTemplate({text:title,params:{statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name}})
  // console.log('appointmentStatus---->',appointment);
    for(const patient of patients){
      const userMessage = getDynamicTemplate({
        text: message,
        params: { patientName,statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,title:appointment?.title},
      });
      userIds.push({id:patient.userId,message:userMessage});
    }  
    const userMessage = getDynamicTemplate({
      text: message,
      params: { patientName,statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,name:getFullName(practitioner),title:appointment?.title},
    });
    userIds.push({id:practitioner?.userId,message:userMessage});

  const notificationInfo = {
    title,
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { appointmentId:appointment.id.toString() },
  };
  await sendUserNotification(notificationInfo,{tenantId});

}

const sendAppointmentNotificationAndMail = async (params,{clinicNotificationInfo,patientNotificationInfo,tenantId}={}) => {

  let { appointment,practiceSetting,template, subject,replyTo, sendTextAlso } = params || {};
  let { startDateTime,endDateTime, _previousDataValues } = appointment || {};
  const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
let practitionerRecurringSummery='';
let practitionerPreviousRecurringSummery=''
  const patients = await appointment.getPatients();
        const practitioner = await appointment.getPractitioner();
        const recurringSetting = await appointment.getRecurringSetting();
        const location = await appointment.getLocation();
        const appointmentType = await appointment.getType();
        const appointmentStatus = await appointment.getStatus();
        const appointmentSession = await appointment.getZoomSession();
        const sessionId = appointmentSession?.id;
          const { clientURL } = config;
  const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
  // const clientURLForPractice = clientURL.replace('localhost', `${practiceSetting?.practiceSetting?.domainName}.localhost`); // for localhost
      const meetingLink =!sessionId ? ' ': `${clientURLForPractice}/${UI_URLS.zoomSession}/${encrypt(String(sessionId))}`;
        if (!patients || !patients.length || !practitioner) {
          throw new Error(`Invalid appointment object: missing patient or practitioner`)
        }

          
        const {
          firstName: practionerFirstName = '',
          middleName: practitionerMiddleName = ' ',
          lastName: practitionerLastName = '',
          timezone:practitionerTimezone,
        } = practitioner || {};
        const practitionerEmail = practitioner?.email;
  
        const practitionerName = getFullName({
          firstName: practionerFirstName,
          middleName: practitionerMiddleName,
          lastName: practitionerLastName,
        });
  
    if (recurringSetting) {
      practitionerRecurringSummery =generateRecurringSummary(recurringSetting,practitionerTimezone);
    }
    if(_previousDataValues.recurringSetting){
      const previousRecurringSetting =_previousDataValues.recurringSetting;
      if (previousRecurringSetting) {
        practitionerPreviousRecurringSummery =generateRecurringSummary(previousRecurringSetting,practitionerTimezone);
      }
    }


  let { title, message, type } = clinicNotificationInfo;
  title=getDynamicTemplate({text:title,params:{statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name}})
  let {message:patientMessage} = patientNotificationInfo || {};

  const patientName = patients.reduce((acc,item)=>getFullName(item)+','+acc,'');

  const appointmentStartDatePractitioner = formatDate(startDateTime, {
    timezone: practitionerTimezone ||'US',
    format: dateFormatter.MMDDYYYY_WITH_SLASHES,
  });

  const appointmentStartTimePractitioner = formatDate(startDateTime, {
    timezone: practitionerTimezone ||'US',
    format: timeFormatter.hhmma,
  });

  const userMessage = getDynamicTemplate({
    text: message,
    params: { patientName,statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,startDate:appointmentStartDatePractitioner,startTime:appointmentStartTimePractitioner, recurringSummary:practitionerRecurringSummery,
      previousRecurringSummary:practitionerPreviousRecurringSummery, },
  });

  const userIds = [];
  const notifyPractitioner = !sendTextAlso || sendTextAlso === 'to_both' || sendTextAlso === 'to_practitioner';
  const notifyPatient = !sendTextAlso || sendTextAlso === 'to_both' || sendTextAlso === 'to_patient';

  if (notifyPractitioner) {
    userIds.push({
      id: practitioner?.userId,
      message: userMessage,
    });
  }
  if (template && practitionerEmail && notifyPractitioner) {

  const practitionerSubject = getDynamicTemplate({
    text: subject,
    params: {
      practitionerName,
      patientName,
    },
  });
let practitionerTemplate = decodeHtml(template);

let practitionerHtml = getDynamicTemplate({
  text: practitionerTemplate,
  params: {
    patientFirstName: practionerFirstName,
    patientMiddleName: practitionerMiddleName || '',
    patientLastName: practitionerLastName,

    patientName,
    practitionerName,

    practionerFirstName,
    practionerMiddleName: practitionerMiddleName || '',
    practionerLastName: practitionerLastName,

    appointmentType: appointmentType?.name || '',
    location: location?.name || '',

    startDate: appointmentStartDatePractitioner,
    startTime: appointmentStartTimePractitioner,

    recurringSummary: practitionerRecurringSummery,
    previousRecurringSummary: practitionerPreviousRecurringSummery,

    meetingLink,
    logo,
    clientURL: clientURLForPractice,
  },
});

practitionerHtml = practitionerHtml.replace(
  /(<strong[^>]*>)\s*Doctor:\s*(<\/strong>)\s*Dr\.\s[^<]*/,
  `$1Patient:$2 ${patientName}`
);

  await sendEmail({
    uuid: tenantId,
    to: practitionerEmail,
    replyTo,
    subject: practitionerSubject,
    html: practitionerHtml  ,
    attachments: [practiceLogoAttechment],
  });

}
  for(const patient of patients){ 
    if (!notifyPatient) break;
    let recurringSummary = '';
    let previousRecurringSummary = '';
    const { email = '', firstName = '', middleName = '', lastName = '',timezone:patientTimeZone } = patient || {};
    if (!email) {
      throw new Error(`Invalid patient object: missing email`)
    }
      
  const appointmentStartDate = formatDate(startDateTime, {
    timezone: patientTimeZone,
    format: dateFormatter.MMDDYYYY_WITH_SLASHES,
  });

  const appointmentStartTime = formatDate(startDateTime, {
    timezone: patientTimeZone,
    format: timeFormatter.hhmma,
  });
  const appointmentEndTime = formatDate(endDateTime, {
    timezone: patientTimeZone,
    format: timeFormatter.hhmma,
  });
  let previousAppointmentStart = '';
  let previousAppointmentTime = '';
  let previousAppointmentEndTime ='';
  if (_previousDataValues) {
    const {endDateTime: previousEndDateTime} = _previousDataValues;
    const { startDateTime: previousStartDateTime } = _previousDataValues;
    previousAppointmentStart = formatDate(previousStartDateTime, {
      timezone: patientTimeZone,
      format: dateFormatter.MMDDYYYY_WITH_SLASHES,
    });
    previousAppointmentTime = formatDate(previousStartDateTime, {
      timezone: patientTimeZone,
      format: timeFormatter.hhmma,
    });
    previousAppointmentEndTime = formatDate(previousEndDateTime , {
      timezone: patientTimeZone,
      format: timeFormatter.hhmma,
    })
    if (recurringSetting) {
      recurringSummary =generateRecurringSummary(recurringSetting,patientTimeZone);
    }

    if(_previousDataValues.recurringSetting){
    const previousRecurringSetting =_previousDataValues.recurringSetting;
    if (previousRecurringSetting) {
      previousRecurringSummary =generateRecurringSummary(previousRecurringSetting,patientTimeZone);
    }
  }
  }
  const patientName = getFullName({ firstName, middleName, lastName });

  const dynamicPatientMessage = getDynamicTemplate({
    text: patientMessage,
    params: {
      patientFirstName: firstName,
      patientMiddleName: middleName || ' ',
      patientLastName: lastName,
      patientName:patientName,
      appointmentType:appointmentType?.name || '',
      location: location.name,
      startDate: appointmentStartDate,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      previousStartDate:previousAppointmentStart,
      previousStartTime:previousAppointmentTime, 
      previousEndTime:previousAppointmentEndTime,
      patientTimeZone,
      recurringSummary,
      previousRecurringSummary,
      statusTitle:appointmentStatus?.name,statusText:appointmentStatus?.name,
      practitionerName:practitionerName,
      logo,
      clientURL:clientURLForPractice, // Ensure clientURL is defined
    },
  });
  userIds.push({id:patient.userId,message:dynamicPatientMessage});

  if(template){
    template = decodeHtml(template);
    const dynamicSubject = getDynamicTemplate({ text: subject, params: { patientName, practitionerName } });
    const dynamicTemplate = getDynamicTemplate({
      text: template,
      params: {
        patientFirstName: firstName,
        patientMiddleName: middleName || ' ',
        patientLastName: lastName,
        practionerFirstName: practionerFirstName,
        practionerMiddleName: practitionerMiddleName || ' ',
        practionerLastName: practitionerLastName,
        appointmentType:appointmentType?.name || '',
        location: location.name,
        logo,
        clientURL:clientURLForPractice, // Ensure clientURL is defined
        startDate: appointmentStartDate,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
        previousStartDate:previousAppointmentStart,
        previousStartTime:previousAppointmentTime, 
        previousEndTime:previousAppointmentEndTime,
        patientTimeZone,
        recurringSummary,
        previousRecurringSummary,
        meetingLink,
      },
    });

    sendEmail({
      uuid: tenantId,
      to: email,
      replyTo,
      subject: dynamicSubject,
      html: dynamicTemplate,
      attachments: [practiceLogoAttechment],
    }).then(()=>{
        console.log(`Email sent to ${email}`);
    }).catch(sendError=>{
        console.error(`Failed to send email to ${email}:`, sendError);
    });
  }
  }

  const notificationInfo = {
    title,
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { appointmentId:appointment.id.toString() },
  };
  await sendUserNotification(notificationInfo,{tenantId});
};

const updateNotification = async (req) => {
  const { user, params,body } = req;
  const {data ={}} = body || {}
  const { notificationId } = params || {};
  const filter = {}
  if(data.chatId){
    filter.where=Sequelize.where(Sequelize.json('data.chatId'), data.chatId)
    filter.where.isRead = false
  }
  else{
    filter.where={id:notificationId};
  }
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const notification = await dbService.updateOne({
    model: db.Notification,
    filter,
    updateParams: { isRead: true },
    options:{individualHooks:false},
  });
  return notification;
};

const markAllNotificationsRead = async (req) => {
  const { user,clinicUuid:uuid } = req;
  const { id} = user || {};
  const db = getModels(uuid);
  const notifications = await dbService.updateOne({
    model: db.Notification,
    filter: { where: {userId: id , isRead: false }},
    updateParams: { isRead: true },
    getUpdatedData: true,
  });
  return notifications;
};

const getUnreadNotifications = async (user, query,{tenantId}) => {
  const { id, } = user || {};
  const { subscribeSocket } = query || {};
  const db = getModels(tenantId);
  const doc = await dbService.getAll({
    model: db.Notification,
    filter: {  where:{userId: id , isRead: false} },
    subscribeSocket,
    tenantId,
  });
  return doc;
};

const sendMedicationNotification=async({patientMedication}={},{tenantId,patientNotificationInfo})=>{

const userIds =[];
const { title, message, type } = patientNotificationInfo;
const patient = await patientMedication.getPatient();
const prescriber = await patientMedication.getPrescriber();

const prescriberName = getFullName(prescriber);

 const dynamicPatientMessage = getDynamicTemplate({text:message,params:{prescriberName}})

 userIds.push({id:patient.userId,message:dynamicPatientMessage})
const notificationInfo = {
  title,
  userIds: [...userIds],
  type,
  android: {},
  ios: {},
  data: { medicationId:patientMedication.id.toString() },
};
 sendUserNotification(notificationInfo,{tenantId});

}

const sendLabOrderNotification=async({labsRadiology}={},{tenantId,patientNotificationInfo})=>{

  const userIds =[];
  const { title, message, type } = patientNotificationInfo;
  const patient = await labsRadiology.getPatient();
  const provider = await labsRadiology.getProvider();
  
  const providerName = getFullName(provider);
  
   const dynamicPatientMessage = getDynamicTemplate({text:message,params:{providerName}})
  
   userIds.push({id:patient.userId,message:dynamicPatientMessage})
  const notificationInfo = {
    title,
    userIds: [...userIds],
    type,
    android: {},
    ios: {},
    data: { labRadiologyId:labsRadiology.id.toString() },
  };
   sendUserNotification(notificationInfo,{tenantId});
  
  }


const sendNewMessageNotification=async({createdMessage}={},{tenantId})=>{

  const userIds =[];
  const sender = await createdMessage.getSenderInfo();
  const {receiverId,senderId,messageText} =createdMessage || {}
  
  const senderName = getFullName(sender);
  
   const dynamicMessage = notifications.Message.NEW_MESSAGE({message:messageText,from:senderName})
  
   userIds.push({id:receiverId,message:dynamicMessage.message})
  const notificationInfo = {
    title:dynamicMessage.title,
    userIds: [...userIds],
    type:dynamicMessage.type,
    android: {},
    ios: {},
    data: { chatId:createdMessage.chatId.toString(),id:createdMessage.id.toString(),senderId:senderId.toString() },
  };
   sendUserNotification(notificationInfo,{tenantId});
  
  }

  const sendInviteNotification = async ({sessionId,invitedUsers,fromUser},{tenantId})=>{
    const db = getModels(tenantId);
    const sessionDetail =await  dbService.getOneById({model:db.ZoomSession,id:sessionId,include:[{model:db.Appointment,as:'appointment'}]});
    console.log("🚀 ~ sendInviteNotification ~ sessionDetail:", sessionDetail)
    if(!sessionDetail) return;
   const appointment = sessionDetail.appointment || {};
   const notifcationContent =  notifications.ZoomInvite.ZOOM_INVITE({sessionName:appointment.title,from:getFullName(fromUser)});
   const userIds = [];
   for(let invitedUser of invitedUsers){
    userIds.push({id:invitedUser.userId,message:notifcationContent.message});
   }
   const notificationInfo = {
    title:notifcationContent.title,
    userIds: [...userIds],
    type:notifcationContent.type,
    android: {},
    ios: {},
    data: { sessionId },
  };
   sendUserNotification(notificationInfo,{tenantId});
  };

module.exports = {
  sendUserNotification,
  sendMeetingInvitationNotification,
  updateNotification,
  markAllNotificationsRead,
  handleTopicSubscription,
  sendAppointmentCreatedNotification,
  getUnreadNotifications,
  getSubscribedTopicsForUser,
  sendAppointmentNotificationAndMail,
  sendMedicationNotification,
  sendLabOrderNotification,
  sendNewMessageNotification,
  sendInviteNotification,
  sendAppointmentNotification,
  sendAppointmentCompletedNotification,
};
