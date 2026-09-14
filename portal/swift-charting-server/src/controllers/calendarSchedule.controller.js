const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const { generateRecurringAppointments } = require('../services/appointment.service');


const createCalendarSchedule = catchAsync(async (req, res) => {
  const { user, body } = req;
  const {
    startRecurringDate,
    endRecurringDate,
    repeatEvery,
    repeatType,
    repeateWeek,
    monthOnDay,
    monthWeek,
    monthWeekDay,
    isOnDay,
  } = body || {};
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const calendarScheduleRecurringSetting = {
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
  let allCalendarSchedule = [];
  const calendarScheduleBody = {
    ...body,
  };

  if (calendarScheduleBody?.isRecurring) {
    const newCalendarScheduleRecurringSettingRecord = await dbService.createOne({
      model: db.CalendarScheduleRecurringSetting,
      reqParams: { ...calendarScheduleRecurringSetting },
    });
    calendarScheduleBody.calendarScheduleRecurringSettingId = newCalendarScheduleRecurringSettingRecord.id;
  }
  allCalendarSchedule = generateRecurringAppointments(calendarScheduleBody, calendarScheduleRecurringSetting, { createForToday: true });
  const temp = allCalendarSchedule.map((item) => ({ ...item, createdById: userId }));
  const calendarSchedules = await dbService.createBulk({
    model: db.CalendarSchedule,
    reqParams: temp,
  });


  res.status(httpStatus.CREATED).send('Calendar Schedule Created');
});

const getCalendarSchedule = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {subscribeSocket} = req.query || {};
  const {  startDate, endDate, staffId , locationId} = req.query;
  let filter = {
    where:{

      isDeleted: false,
    }
  };
  
  if (startDate && endDate) {
    filter.where.startDateTime = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    };
  } else if (startDate) {
    filter.where.startDateTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    filter.where.startDateTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }
  if(staffId){
    filter.where.staffId = parseInt(staffId)
  }
  if(locationId){
    filter.where.locationId = parseInt(locationId)
  } 

  const results  = await dbService.getAll({
      model: db.CalendarSchedule,
      filter,
      otherOptions: {
        include: [
          { model: db.CalendarScheduleRecurringSetting, as: 'calendarScheduleRecurringSetting' },
        ]
      }
    });

  res.status(httpStatus.OK).send(results);
});

const updateCalendarSchedule = catchAsync(async (req, res) => {
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
    ...restBody
  } = body || {};


  const userId = user.id;
  const { calendarScheduleId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  let calendarScheduleRecurringSetting;

  if (startRecurringDate) {
    calendarScheduleRecurringSetting = {
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

  const existingSchedule = await dbService.getOneById({
    model: db.CalendarSchedule,
    id: calendarScheduleId,
    include: [
      { model: db.CalendarScheduleRecurringSetting, as: 'calendarScheduleRecurringSetting' },
    ],
  });

  const previousCalendarScheduleRecurringSetting = await existingSchedule.getCalendarScheduleRecurringSetting();
  if (!existingSchedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Schedule not found');
  }
  
  const existingSchedulePlain = existingSchedule.get({ plain: true });
  
  delete existingSchedulePlain.createdById;
  delete existingSchedulePlain.deletedById;
  delete existingSchedulePlain.updateById;
  delete existingSchedulePlain.isDeleted;


  if (calendarScheduleRecurringSetting && body.editSeries) {
    const [, [modifedRecurringSetting] = []] = await dbService.updateById({
      model: db.CalendarScheduleRecurringSetting,
      reqParams: { id: existingSchedulePlain?.calendarScheduleRecurringSettingId, ...calendarScheduleRecurringSetting },
    });
    await dbService.deleteMany({
      model: db.CalendarSchedule,
      filter: {
        where: {
          calendarScheduleRecurringSettingId: modifedRecurringSetting.id,
          startDateTime: {
            [Op.gt]: new Date(), // Check if startDateTime is greater than the current date and time
          },
        },
      },
    });
    await dbService.updateOne({
      model: db.CalendarSchedule,
      filter: {
        where: {
          calendarScheduleRecurringSettingId: modifedRecurringSetting.id,
          startDateTime: {
            [Op.lte]: new Date(), // Check if startDateTime is greater than the current date and time
          },
        },
      },
      updateParams: { calendarScheduleRecurringSettingId: null, isRecurring: false },
    });
    const allCalendarSchedule = generateRecurringAppointments(
      { ...existingSchedulePlain, id: undefined, ...restBody },
      calendarScheduleRecurringSetting
    );


    const temp = allCalendarSchedule.map((item) => ({ ...item, createdById: userId }));
    const calendarSchedules = await dbService.createBulk({
      model: db.CalendarSchedule,
      reqParams: temp,
    });


    const singleSchedule = calendarSchedules[0];
    singleSchedule._previousDataValues = existingSchedule;
    singleSchedule._previousDataValues.calendarScheduleRecurringSetting = previousCalendarScheduleRecurringSetting;
    res.status(httpStatus.OK).send(calendarSchedules);
  } else {
    filter = { where: { id: calendarScheduleId } };

    const updateParams = { ...restBody, updateById: userId, calendarScheduleRecurringSettingId: null, isRecurring: false };

    if (restBody.isDeleted === true) {
      updateParams.deletedById = userId;
    }
    const [, updatedCalendarSchedules] = await dbService.updateOne({
      model: db.CalendarSchedule,
      updateParams,
      filter,
    });

    const updatedCalendarSchedule = updatedCalendarSchedules.filter((item) => item.id === existingSchedule.id)?.[0] || {};
    res.status(httpStatus.OK).send(updatedCalendarSchedule);
  }
});
module.exports = {
    createCalendarSchedule,
    getCalendarSchedule,
    updateCalendarSchedule,
};
