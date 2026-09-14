const httpStatus = require('http-status');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, patientFormService, formLinkToMailService, zoomSessionService } = require('../services');
const { Op, Sequelize } = require('sequelize');
const ApiError = require('../utils/ApiError');
const { generateRecurringAppointments } = require('../services/appointment.service');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { isUserExist: isTemplateExist } = require('../services/user.service');
const { Email_Templates } = require('../utils/constant');
const { createOrUpdateAppleCalendarEvent } = require('../services/appleCalander.service');
const {  sendAppointmentNotificationAndMail, sendAppointmentNotification, sendAppointmentCompletedNotification } = require('../services/notification.service');
const { notifications } = require('../config/notification');
const { appointmentActions, appointmentStatus } = require('../config/appointment');
const { isEmpty } = require('lodash');

const getEqualityOrInFilter = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return {
      [Op.in]: value,
    };
  }

  if (typeof value === 'string' && value.includes(',')) {
    return {
      [Op.in]: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }

  return value;
};

const createAppointment = catchAsync(async (req, res) => {
  const { user, body } = req;
  const {
    patientIds,
    startRecurringDate,
    endRecurringDate,
    repeatEvery,
    repeatType,
    repeateWeek,
    monthOnDay,
    monthWeek,
    monthWeekDay,
    isOnDay,
    formId,
    practitionerId,
    locationId,
    typeCode = 'individual',
  } = body || {};
  delete body.patientIds;
  const userId = user.id;
  let patientFormId = [];
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  // check out of fiice schedule for the practitioner for the given date and time for location
  const oooSchedule = await dbService.getOne({
    model: db.OutOfOfficeSchedule,
    filter: {
      where: {
        staffId: practitionerId,
        locationId,
        startDateTime: { [Op.lt]: body.endDateTime },
        endDateTime: { [Op.gt]: body.startDateTime },
        isDeleted: false,
      },
    },
  });

  if (oooSchedule) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Practitioner has an out of office schedule during this time');
  }
  if (formId && formId.length > 0) {
    for (i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      for (j = 0; j < formId.length; j++) {
        const singleFormId = formId[j];
        const body = {
          patientId,
          formId: singleFormId.id,
          practitionerId,
          sharedById: userId,
        };
        const patientForm = await patientFormService.createPatientForm(body, { user: user, tenantId: uuid });
        patientFormId.push(patientForm.id);
      }
    }
  }

  const recurringSetting = {
    startRecurringDate: startRecurringDate || '05/01/2024',
    endRecurringDate: endRecurringDate || '07/29/2024',
    repeateEvery: repeatEvery || 1,
    repeateType: repeatType || '',
    repeateWeek: repeateWeek || [],
    monthOnDay: monthOnDay || '',
    monthWeek: monthWeek || [],
    monthWeekDay: monthWeekDay || [],
    isOnDay,
  };
  let allAppointments = [];
  const appointmentBody = {
    ...body,
  };

  if (appointmentBody?.isRecurring) {
    const newRecurringSettingRecord = await dbService.createOne({
      model: db.RecurringSetting,
      reqParams: { ...recurringSetting },
    });
    appointmentBody.recurringSettingId = newRecurringSettingRecord.id;
  }
  allAppointments = generateRecurringAppointments(appointmentBody, recurringSetting, { createForToday: true });
  const temp = allAppointments.map((item) => ({ ...item, createdById: userId }));
  const appointments = await dbService.createBulk({
    model: db.Appointment,
    reqParams: temp,
  });
  if (patientIds && patientIds.length > 0) {
    const appointmentPromises = appointments.map(async (appointment) => {
      await appointment.setPatients(patientIds);
      await appointment.setPatientForms(patientFormId);
    });
    await Promise.all(appointmentPromises);
  }
  const typeCodeValue = appointmentBody.typeCode ?? 'individual';
  const emailTemplate = await isTemplateExist(db.EmailTemplate, {
    where: {
      emailTypeCode: appointmentBody?.isRecurring
        ? Email_Templates.CREATE_RECURRING_APPOINTMENT
        : Email_Templates.CREATE_APPOINTMENT,
      isDeleted: false,
      typeCode: typeCodeValue,
    },
  });
  const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
  let updatedTemplate =''
  if (emailTemplate) {
    updatedTemplate = emailTemplate.template;
    for (const patientId of patientIds) {
      updatedTemplate = await formLinkToMailService.formLinkToMail(
        emailTemplate.template,
        { id: patientId },
        user,
        uuid,
        practitionerId
      );
    }
    }
  const sendTextAlso = appointmentBody?.sendTextAlso || 'to_both';

  if (sendTextAlso !== 'none') {
    const clinicNotificationInfo = notifications.Clinic[appointmentBody?.isRecurring ?appointmentActions.RECURRING_APPOINTMENT_CREATED:appointmentActions.APPOINTMENT_CREATED];
    const patientNotificationInfo = notifications.Patient[appointmentBody?.isRecurring ?appointmentActions.RECURRING_APPOINTMENT_CREATED:appointmentActions.APPOINTMENT_CREATED];
    sendAppointmentNotificationAndMail({
      appointment:appointments[0],
      subject: emailTemplate?.subject,
      replyTo: emailTemplate?.replyTo,
      template: updatedTemplate,
      practiceSetting,
      sendTextAlso,
    },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});
  }

  const calanderAppointmentPromises = [];
  appointments.map(async(appointment) => {
    await zoomSessionService.createZoomSessionOnConfirm(appointment,{tenantId:uuid})
  });


  await Promise.all(calanderAppointmentPromises);
  res.status(httpStatus.CREATED).send('Appointment Created');
});

const getAppointment = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {subscribeSocket} = req.query || {};
  const { listView, startDate, endDate, practitionerId, statusCode, locationId, patientId, typeCode} = req.query;
  let filter = {
    isDeleted: false,
    ...(patientId
      ? {
          id: {
            [Op.in]: Sequelize.literal(`(
    SELECT "appointmentId" 
    FROM "appointment_patients" 
    WHERE "patientId" ${Array.isArray(patientId) ? 'IN' : '='} ${
              Array.isArray(patientId) ? `(${patientId.join(',')})` : patientId
            }
  )`),
          },
        }
      : {}),
  };

  if (startDate && endDate) {
    filter.startDateTime = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    };
  } else if (startDate) {
    filter.startDateTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    filter.startDateTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  const includeOptions = [
    { model: db.PracticeLocation, as: 'location' },
    { model: db.ZoomSession, as: 'zoomSession' },

    { model: db.Staff, as: 'practitioner', include: [{ model: db.GlobalType, as: 'title' }, { model: db.StaffBookingSetting, as: 'bookingSetting'}] },
    { model: db.GlobalType, as: 'status' },
    { model: db.GlobalType, as: 'copay' },
    { model: db.GlobalType, as: 'type' },
    { model: db.Patient, as: 'patients', include: [{ model: db.GlobalType, as: 'title' },{ model: db.GlobalType, as: 'genderIdentity' },{ model: db.GlobalType, as: 'sexAtBirth' },{ model: db.File, as: 'file' }] },
    { model: db.PatientForm, as: 'patientForms' },
    { model: db.RecurringSetting, as: 'recurringSetting' },
    {
      model: db.DiagnosisProblem,
      as: 'problem',
    },
  ];

  if (listView) {
    result = await dbService.getPaginated({
      model: db.Appointment,
      req,
      allowedFilters: ['statusCode', 'practitionerId'],
      searchFilter: [],
      addOnFilter: filter,
      include: includeOptions,
    });
  } else {
    const whereClause = { where: {} };
    whereClause.where = filter;
    if (practitionerId) {
      whereClause.where.practitionerId = practitionerId;
    }
    const statusFilter = getEqualityOrInFilter(statusCode);
    if (statusFilter) {
      whereClause.where.statusCode = statusFilter;
    }
    const locationFilter = getEqualityOrInFilter(locationId);
    if (locationFilter) {
      whereClause.where.locationId = locationFilter;
    }
    const typeFilter = getEqualityOrInFilter(typeCode);
    if (typeFilter) {
      whereClause.where.typeCode = typeFilter;
    }
    data = await dbService.getAll({
      model: db.Appointment,
      filter: whereClause,
      otherOptions: { include: includeOptions },
      subscribeSocket,
      tenantId:uuid,
    });
    result = data;
  }

  res.status(httpStatus.OK).send(result);
});


const getProvidersAppointment = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {subscribeSocket} = req.query || {};
  const { listView, startDate, endDate, practitionerId, statusCode, locationId, patientId, typeCode} = req.query;
  let filter = {
    isDeleted: false,
    ...(patientId
      ? {
          id: {
            [Op.in]: Sequelize.literal(`(
    SELECT "appointmentId" 
    FROM "appointment_patients" 
    WHERE "patientId" ${Array.isArray(patientId) ? 'IN' : '='} ${
              Array.isArray(patientId) ? `(${patientId.join(',')})` : patientId
            }
  )`),
          },
        }
      : {}),
  };

  if (startDate && endDate) {
    filter.startDateTime = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    };
  } else if (startDate) {
    filter.startDateTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    filter.startDateTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  const includeOptions = [
    { model: db.PracticeLocation, as: 'location' },
    { model: db.ZoomSession, as: 'zoomSession' },

    { model: db.Staff, as: 'practitioner', include: [{ model: db.GlobalType, as: 'title' }, { model: db.StaffBookingSetting, as: 'bookingSetting'}] },
    { model: db.GlobalType, as: 'status' },
    { model: db.GlobalType, as: 'copay' },
    { model: db.GlobalType, as: 'type' },
    { model: db.Patient, as: 'patients', include: [{ model: db.GlobalType, as: 'title' },{ model: db.GlobalType, as: 'genderIdentity' },{ model: db.GlobalType, as: 'sexAtBirth' },{ model: db.File, as: 'file' }] },
    { model: db.PatientForm, as: 'patientForms' },
    { model: db.RecurringSetting, as: 'recurringSetting' },
    {
      model: db.DiagnosisProblem,
      as: 'problem',
    },
  ];

  if (listView) {
    result = await dbService.getPaginated({
      model: db.Appointment,
      req,
      allowedFilters: ['statusCode', 'practitionerId'],
      searchFilter: [],
      addOnFilter: filter,
      include: includeOptions,
    });
  } else {
    const whereClause = { where: {} };
    whereClause.where = filter;
    whereClause.where.statusCode = {
      [Op.not]: appointmentStatus.CANCELED, // Use Op.not to exclude the specific status code
    };
  
    if (practitionerId) {
      whereClause.where.practitionerId = practitionerId;
    }
    const statusFilter = getEqualityOrInFilter(statusCode);
    if (statusFilter) {
      whereClause.where.statusCode = statusFilter;
    }
    const locationFilter = getEqualityOrInFilter(locationId);
    if (locationFilter) {
      whereClause.where.locationId = locationFilter;
    }
    const typeFilter = getEqualityOrInFilter(typeCode);
    if (typeFilter) {
      whereClause.where.typeCode = typeFilter;
    }
    data = await dbService.getAll({
      model: db.Appointment,
      filter: whereClause,
      otherOptions: { 
        attributes: ['createdAt', 'startDateTime', 'endDateTime'], // Specify the keys to include
        //include: includeOptions 
        },
      subscribeSocket,
      tenantId:uuid,
    });
    result = data;
  }

  res.status(httpStatus.OK).send(result);
});

const getAppointmentById = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const appointment = await dbService.getOneById({
    model: db.Appointment,
    id: appointmentId,
    include: [
      {
        model: db.Patient,
        as: 'patients',
        include: [{ model: db.File, as: 'file' }],
      },
      {
        model: db.Staff,
        as: 'practitioner',
      },
      { model: db.PracticeLocation, as: 'location' },
      { model: db.GlobalType, as: 'status' },
      { model: db.GlobalType, as: 'type' },
      { model: db.RecurringSetting, as: 'recurringSetting' },
      {
        model: db.DiagnosisProblem,
        as: 'problem',
      },
    ],
  });
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Diagnosis not found');
  }
  res.status(httpStatus.OK).send(appointment);
});

const updateAppointment = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  let {
    startRecurringDate,
    endRecurringDate,
    repeatEvery,
    repeatType,
    repeateWeek,
    monthOnDay,
    monthWeek,
    monthWeekDay,
    isOnDay,
    patientIds,
    fromCalender,
    formId,
    practitionerId,
    locationId,
    ...restBody
  } = body || {};
  const userId = user.id;
  const { appointmentId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
  
  let recurringSetting;

  if (startRecurringDate) {
    recurringSetting = {
      startRecurringDate: startRecurringDate || '05/01/2024',
      endRecurringDate: endRecurringDate || '07/29/2024',
      repeateEvery: repeatEvery || 1,
      repeateType: repeatType || '',
      repeateWeek: repeateWeek || [],
      monthOnDay: monthOnDay || '',
      monthWeek: monthWeek || [],
      monthWeekDay: monthWeekDay || [],
      isOnDay,
    };
  }

  const existingAppointment = await dbService.getOneById({
    model: db.Appointment,
    id: appointmentId,
    include: [
      { model: db.PracticeLocation, as: 'location' },
      { model: db.Staff, as: 'practitioner', include: [{ model: db.GlobalType, as: 'title' }] },
      { model: db.GlobalType, as: 'status' },
      { model: db.GlobalType, as: 'copay' },
      { model: db.GlobalType, as: 'type' },
      { model: db.Patient, as: 'patients', include: [{ model: db.GlobalType, as: 'title' }] },
      { model: db.PatientForm, as: 'patientForms' },
      { model: db.RecurringSetting, as: 'recurringSetting' },
      {
        model: db.DiagnosisProblem,
        as: 'problem',
      },
    ],
  });
    const oooSchedule = await dbService.getOne({
    model: db.OutOfOfficeSchedule,
    filter: {
      where: {
        staffId: practitionerId || existingAppointment?.practitionerId,
        locationId: locationId || existingAppointment?.locationId,
        startDateTime: { [Op.lt]: body.endDateTime },
        endDateTime: { [Op.gt]: body.startDateTime },
        isDeleted: false,
      },
    },
  });

  if (oooSchedule) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Practitioner has an out of office schedule during this time');
  }
  
  const oldPatients = await existingAppointment.getPatients();
  const oldPatientsIds = oldPatients.map((item) => item.id);
  const previousRecurringSetting = await existingAppointment.getRecurringSetting();
  if (!existingAppointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  const existingAppointmentPlain = existingAppointment.get({ plain: true });

  delete existingAppointmentPlain.createdById;
  delete existingAppointmentPlain.deletedById;
  delete existingAppointmentPlain.updateById;
  delete existingAppointmentPlain.isActive;
  delete existingAppointmentPlain.isDeleted;
  
  let addedForm = [];
  let removedForm = [];
  let newPatientFormId = [];
  let existingForms = [];
  let alreadyPresentPatientForm = [];
  let existingPatientForm = [];
  
  for (const patientForm of existingAppointment.patientForms) {
    existingForms.push(patientForm.formData);
    existingPatientForm.push(patientForm.id);
  }
  if (formId && formId.length > 0) {
    const existingFormSet = new Set(existingForms.map((item) => item.id));
    const newFormSet = new Set(formId.map((item) => item.id));
    
    alreadyPresentPatientForm = existingAppointment.patientForms
    .filter((item) => newFormSet.has(item.formId))
    .map((item) => item.id);
    addedForm = formId.filter((item) => !existingFormSet.has(item.id));

    removedForm = existingAppointment.patientForms.filter((item) => !newFormSet.has(item.formId));
    removedForm = removedForm.map((item) => item.id);
  }
  if(formId?.length === 0){
    const newFormSet = new Set(formId.map((item) => item.id));
    alreadyPresentPatientForm = existingAppointment.patientForms
    removedForm = existingAppointment.patientForms.filter((item) => !newFormSet.has(item.formId));
    removedForm = removedForm.map((item) => item.id);
  }
  

  if (recurringSetting && body.editSeries) {
    const [, [modifedRecurringSetting] = []] = await dbService.updateById({
      model: db.RecurringSetting,
      reqParams: { id: existingAppointmentPlain?.recurringSettingId, ...recurringSetting },
    });
    await dbService.deleteMany({
      model: db.Appointment,
      filter: {
        where: {
          recurringSettingId: modifedRecurringSetting.id,
          startDateTime: {
            [Op.gt]: new Date(), // Check if startDateTime is greater than the current date and time
          },
        },
      },
    });
    await dbService.updateOne({
      model: db.Appointment,
      filter: {
        where: {
          recurringSettingId: modifedRecurringSetting.id,
          startDateTime: {
            [Op.lte]: new Date(), // Check if startDateTime is greater than the current date and time
          },
        },
      },
      updateParams: { recurringSettingId: null, isRecurring: false },
    });
    const allAppointments = generateRecurringAppointments(
      { ...existingAppointmentPlain, id: undefined, ...restBody },
      recurringSetting
    );
    if (patientIds && patientIds.length > 0) {
      if (restBody.typeCode) {
        if (formId && formId.length === 0) {
          formId = [...existingForms];
        }
        for (const patientId of patientIds) {
          for (i = 0; i < formId.length; i++) {
            const singleFormId = formId[i];
            const body = {
              patientId,
              formId: singleFormId.id,
              practitionerId: restBody?.practitionerId || existingAppointment?.practitionerId,
              sharedById: userId,
            };
            const patientForm = await patientFormService.createPatientForm(body, { user: user, tenantId: uuid });
            newPatientFormId.push(patientForm.id);
          }
        }
      }
    } else {
      if (!restBody.typeCode) {
        if (addedForm.length) {
          for (const oldPatientsId of oldPatientsIds) {
            for (i = 0; i < addedForm.length; i++) {
              const singleFormId = addedForm[i];
              const body = {
                patientId: oldPatientsId,
                formId: singleFormId.id,
                practitionerId: restBody?.practitionerId || existingAppointment?.practitionerId,
                sharedById: userId,
              };
              const patientForm = await patientFormService.createPatientForm(body, { user: user, tenantId: uuid });
              newPatientFormId.push(patientForm.id);
            }
          }
        }
        if (alreadyPresentPatientForm.length) {
          newPatientFormId = [...newPatientFormId, ...alreadyPresentPatientForm];
          
        }
        if(formId?.length === 0){
          if (!isEmpty(removedForm)) {            
            newPatientFormId = newPatientFormId.filter(
              (item) => !removedForm.includes(item.id)
            );
          }
        }
        if (!formId && formId?.length === 0) {
          newPatientFormId = [...existingPatientForm];
        }
      }
    } 
    const temp = allAppointments.map((item) => ({ ...item, createdById: userId }));
    const appointments = await dbService.createBulk({
      model: db.Appointment,
      reqParams: temp,
    });
    const appointmentPromises = appointments.map(async (appointment) => {
      if (patientIds && patientIds.length > 0) {
        await appointment.setPatients(patientIds);
      } else {
        await appointment.setPatients(oldPatientsIds);
      }
      await appointment.addPatientForms(newPatientFormId);
    });
    await Promise.all(appointmentPromises);

    const singleAppointment = appointments[0];
    singleAppointment._previousDataValues = existingAppointment;
    singleAppointment._previousDataValues.recurringSetting = previousRecurringSetting;
    const calanderAppointmentPromises = [];

    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.RESCHEDULE_RECURRING_APPOINTMENT, isDeleted: false },
    });

    const clinicNotificationInfo = notifications.Clinic[appointmentActions.RECURRING_APPOINTMENT_RESCHUDLED];
    const patientNotificationInfo = notifications.Patient[appointmentActions.RECURRING_APPOINTMENT_RESCHUDLED];

    sendAppointmentNotificationAndMail({
      appointment:singleAppointment,
      subject: emailTemplate?.subject,
        replyTo: emailTemplate?.replyTo,
        template: emailTemplate?.template,
        practiceSetting,

    },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});

    appointments.map(async(appointment) => {
      await zoomSessionService.createZoomSessionOnConfirm(appointment,{tenantId:uuid})
    });
    await Promise.all(calanderAppointmentPromises);
    res.status(httpStatus.OK).send(appointments);
  } else {
   const filter = { where: { id: appointmentId } };

    if (patientIds && patientIds.length > 0) {
      if (
        formId.length > 0 && !restBody.typeCode
      ) {
        for (const patientId of patientIds) {
          for (i = 0; i < formId.length; i++) {
            const singleFormId = formId[i];
            const body = {
              patientId,
              formId: singleFormId.id,
              practitionerId: restBody?.practitionerId || existingAppointment?.practitionerId,
              sharedById: userId,
            };
            const patientForm = await patientFormService.createPatientForm(body, { user: user, tenantId: uuid });
            newPatientFormId.push(patientForm.id);
          }
        }
      }
    } else {
      if (
        addedForm &&
        addedForm.length > 0 &&
       !restBody.typeCode
      ) {
        for (const oldPatientsId of oldPatientsIds) {
          for (i = 0; i < addedForm.length; i++) {
            const singleFormId = addedForm[i];
            const body = {
              patientId: oldPatientsId,
              formId: singleFormId.id,
              practitionerId: restBody?.practitionerId || existingAppointment?.practitionerId,
              sharedById: userId,
            };
            const patientForm = await patientFormService.createPatientForm(body, { user: user, tenantId: uuid });
            newPatientFormId.push(patientForm.id);
          }
        }
      }
    }
    const updateParams = { ...restBody, updateById: userId, recurringSettingId: null, isRecurring: false };

    if (restBody.isDeleted === true) {
      updateParams.deletedById = userId;
    }
    const [, updatedAppointments] = await dbService.updateOne({
      model: db.Appointment,
      updateParams,
      filter,
    });
    const appointmentPromises = updatedAppointments.map(async (appointment) => {
      if (patientIds && patientIds.length > 0) {
        await appointment.setPatients(patientIds);
      }
      if (appointment.typeCode) {
        await appointment.removePatientForms(removedForm);
        await appointment.addPatientForms(newPatientFormId);
      } else {
        appointment.setPatientForms([]);
      }
    });
    await Promise.all(appointmentPromises);

    const updatedAppointment = updatedAppointments.filter((item) => item.id === existingAppointment.id)?.[0] || {};
    const isRescheduled = !moment(existingAppointment.startDateTime).isSame(moment(updatedAppointment.startDateTime));
    if (isRescheduled) {

      const emailTemplate = await isTemplateExist(db.EmailTemplate, {
        where: { emailTypeCode: Email_Templates.RESCHEDULE_APPOINTMENT, isDeleted: false },
      });
      updatedAppointment._previousDataValues = existingAppointment;

      const clinicNotificationInfo = notifications.Clinic[appointmentActions.APPOINTMENT_RESCHEDULED];
      const patientNotificationInfo = notifications.Patient[appointmentActions.APPOINTMENT_RESCHEDULED];
      sendAppointmentNotificationAndMail({
        appointment:updatedAppointment,
        template: emailTemplate?.template,
          subject: emailTemplate?.subject,
          replyTo: emailTemplate?.replyTo,
          practiceSetting,
      },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});

    }
    if (restBody?.statusCode === 'confirmed') {
      const emailTemplate = await isTemplateExist(db.EmailTemplate, {
        where: {
          emailTypeCode: Email_Templates.APPROVED_APPOINTMENT,
          typeCode: existingAppointment.typeCode,
          isDeleted: false,
        },
      });
      const clinicNotificationInfo = notifications.Clinic[appointmentStatus.CONFIRMED];
      const patientNotificationInfo = notifications.Patient[appointmentStatus.CONFIRMED];
      sendAppointmentNotificationAndMail({
        appointment:updatedAppointment,
        template: emailTemplate?.template,
          subject: emailTemplate?.subject,
          replyTo: emailTemplate?.replyTo,
          practiceSetting,
      },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});
    }else if(restBody?.statusCode === 'on_going'){
      let zoomNotification = '';
      let startFrom = false;
      if(restBody?.role == 'practitioner'){
        zoomNotification = notifications.Patient[appointmentStatus.ON_GOING];
        startFrom = true;
      }else{
        zoomNotification = notifications.Clinic[appointmentStatus.ON_GOING];
      }
      sendAppointmentNotification(
        {appointment:updatedAppointment},
        {tenantId:uuid,zoomNotification,startFrom}
      );
      
    }else if(restBody?.statusCode === 'complete'){
      let startFrom = false;
      if(restBody?.role == 'practitioner'){
        
        startFrom = true;
      }else{
      }
      const patientoomNotification = notifications.Patient[appointmentStatus.COMPLETE];
      const clinicZoomNotification = notifications.Clinic[appointmentStatus.COMPLETE];

      sendAppointmentCompletedNotification(
        {appointment:updatedAppointment},
        {tenantId:uuid,patientoomNotification,clinicZoomNotification,startFrom}
      );
      
    }else if (restBody?.statusCode === 'canceled') {
      const emailTemplate = await isTemplateExist(db.EmailTemplate, {
        where: { emailTypeCode: Email_Templates.REJECTED_APPOINTMENT, isDeleted: false },
      });

      const clinicNotificationInfo = notifications.Clinic[appointmentStatus.CANCELED];
      const patientNotificationInfo = notifications.Patient[appointmentStatus.CANCELED];
     
      sendAppointmentNotificationAndMail({
        appointment:updatedAppointment,
        template: emailTemplate?.template,
        subject: emailTemplate?.subject,
        replyTo: emailTemplate?.replyTo,
        practiceSetting,
      },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});
    }else if(!isRescheduled){
      const clinicNotificationInfo = notifications.Clinic[restBody?.statusCode? appointmentActions.APPOINTMENT_STATUS:appointmentActions.APPOINTMENT_UPDATED];
      const patientNotificationInfo = notifications.Patient[restBody?.statusCode? appointmentActions.APPOINTMENT_STATUS:appointmentActions.APPOINTMENT_UPDATED];

      sendAppointmentNotificationAndMail({
        appointment:updatedAppointment,
      },{tenantId:uuid,clinicNotificationInfo,patientNotificationInfo});
    }
    await zoomSessionService.createZoomSessionOnConfirm(updatedAppointment,{tenantId:uuid})


    res.status(httpStatus.OK).send(updatedAppointment);
  }
});

const createAppleCalanderEvent = catchAsync(async (req, res) => {
  const { params } = req;
  const uuid = req.clinicUuid;
  const { appointmentId } = params || {};

  const db = getModels(uuid);
  const appointment = await dbService.getOneById({ model: db.Appointment, id: appointmentId });

  const { icsBuffer, eventId } = await createOrUpdateAppleCalendarEvent(appointment, { tenantId: uuid });

  if (icsBuffer) {
    // Set the headers to prompt a file download
    res.setHeader('Content-disposition', `attachment; filename=event_${eventId}.ics`);
    res.setHeader('Content-type', 'text/calendar');
    res.status(httpStatus.OK).send(icsBuffer);
  } else {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Failed to generate the calendar event' });
  }
});

const createAppointmentNotes = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { note, appointmentId } = body || {};
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const appointmentExists = await dbService.getOneById({
    model: db.Appointment,
    id: appointmentId,
  })

  if(!appointmentExists){
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  const notes = await dbService.createOne({
    model: db.AppointmentNotes,
    reqParams: { appointmentId, note, createdById: userId },
  })
  let allNotes
  if(notes){
    allNotes = await dbService.getAll({
      model: db.AppointmentNotes,
      id: appointmentId,
    })
  }

  res.status(httpStatus.CREATED).send(allNotes);

});

const getAppointmentNotes = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const appointmentExists = await dbService.getOneById({
    model: db.Appointment,
    id: appointmentId,
  });
  
  if(!appointmentExists){
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  
  const appointmentNotes = await dbService.getAll({
    model: db.AppointmentNotes,
    filter: {where: {appointmentId}}
  })

  res.status(httpStatus.OK).send(appointmentNotes);

});

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointment,
  getAppointment,
  getProvidersAppointment,
  createAppleCalanderEvent,
  createAppointmentNotes,
  getAppointmentNotes,
};
