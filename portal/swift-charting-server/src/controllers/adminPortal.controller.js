const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const config = require('../config/config');
const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const { dbService, uploadService, emailService, tokenService } = require('../services');
const httpStatus = require('http-status');
const { Op, Sequelize } = require('sequelize');
const { isEmpty } = require('lodash');
const { default: slugify } = require('slugify');
const randomPassword = require('../utils/randomPassword');
const { up } = require('../utils/tenant');
const { createDefaultData } = require('../services/practice.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { tokenTypes } = require('../config/tokens');
const { getStartOfTheDayWithTZ, getEndOfTheDayWithTZ } = require('../utils/dateUtility');
const { isUserExist: isTemplateExist } = require('../services/user.service');
const { getSortAndLimit } = require('../utils');

const getPractices = catchAsync(async (req, res) => {
  const db = initializeModels(sequelize, (master = true));
  const { searchText } = req?.query || {};
  const where = {};
  if (searchText) {
    where.name = { [Op.iLike]: `%${searchText}%` };
  }

  const practices = await dbService.getPaginated({
    model: db.Practice,
    req,
    include: [{ model: db.DatabaseConfig, as: 'databaseConfig' }],
    addOnFilter: where,
  });
  res.send(practices);
});

const getPracticeById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { practiceId } = req.params || {};
  const formattedPracticeId = parseInt(practiceId, 10);
  
  const masterDB = initializeModels(sequelize, true);
  const practice = await dbService.getOneById({
    model: masterDB.Practice,
    id: formattedPracticeId,
  });
  
  const db = getModels(formattedPracticeId);
  const practiceSetting = await dbService.getOne({ 
    model: db.PracticeSetting, 
    include: { model: db.File, as: 'logo' } 
  });
    const result = {
    ...practiceSetting?.toJSON(),
    domainName: practice?.domainName,
  };
  
  res.status(httpStatus.OK).send(result);
});

const createPractice = catchAsync(async (req, res) => {
  try {
    const { body } = req || {};

    // body.domainName = 'aabbccdd'

    const {
      name,
      email,
      address,
      contact,
      staffFirstName,
      staffMiddleName,
      staffLastName,
      staffEmail,
      staffContact,
      staffPassword,
      databaseName,
      databaseUser,
      databasePassword,
      databasePort,
      databaseHost,
      databaseDialect,
    } = body;
    const domainName = String(body.domainName).toLowerCase();
    const { id: userId } = req.user || {};
    const uuid = req.clinicUuid;
    const masterDB = initializeModels(sequelize, true);

    const tenantName = slugify(name.toLowerCase(), '_');
    const password = randomPassword();
    const practice = {
      name,
      email,
      address,
      contact,
      domainName,
    };
    // const dbConfig = {
    //   // add one common method
    //   databaseName: tenantName,
    //   databaseUser,
    //   databasePassword: config.sequelize.password,
    //   databasePort,
    //   databaseHost,
    //   databaseDialect,
    // };
    const dbConfig = {
      // add one common method
      databaseName: tenantName,
      databaseUser: config.sequelize.username,
      databasePassword: config.sequelize.password,
      databasePort: config.sequelize.port,
      databaseHost: config.sequelize.host,
      databaseDialect: config.sequelize.dialect,
    };

    const databaseConfigData = await masterDB.DatabaseConfig.upsert(dbConfig);
    console.log('step1------------------->', databaseConfigData);

    const isPracticeExists = await masterDB.Practice.findOne({
      where: {
        [Op.or]: [{ email: practice?.email }, { name: practice?.name }, { domainName: practice?.domainName }],
      },
    });
    if (isPracticeExists) {
      throw new ApiError(httpStatus.CONFLICT, errorMessages.PRACTICE_EMAIL_NAME_EXISTS);
    }
    const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData[0].id });
    console.log('step2------------------->', createdPractice);

    await up({ tenantName, password, uuid: createdPractice[0].id }); // rename to relatble
    const clinicDB = getModels(createdPractice[0].id);
    console.log('step3------------------->', clinicDB);
    const roles = [
      { name: 'Clinic Admin', code: 'clinicAdmin', description: 'initial created one', isDefault: true },
      { name: 'Patient', code: 'patient', description: 'initial created one', isDefault: true },
      { name: 'Practitioner', code: 'practitioner', description: 'initial created one', isDefault: true },
      { name: 'RN/Medical assistant', code: 'rn', description: 'initial created one', isDefault: true },
    ];
    const rolePromises = [];
    for (let role of roles) {
      const { code, ...restRole } = role || {};
      rolePromises.push(dbService.upsert({ model: clinicDB.Role, filter: { where: { code } }, reqParams: { ...restRole } }));
    }
    await Promise.all(rolePromises);
    const clinicRole = await clinicDB.Role.findOne({ where: { code: 'clinicAdmin' } });
    const clinicAdminUser = await dbService.upsert({
      model: clinicDB.User,
      filter: { where: { email: staffEmail } },
      reqParams: {
        firstName: staffFirstName,
        middleName: staffMiddleName,
        lastName: staffLastName,
        password: staffPassword,
        // password: randomPassword(),
        tenantId: createdPractice[0].id,
      },
    });
    await clinicAdminUser.item.setRoles([clinicRole.id]);

    await dbService.upsert({
      model: clinicDB.PracticeSetting,
      filter: { where: { name } },
      reqParams: { email, contact, address },
    });
    await dbService.upsert({ model: clinicDB.PracticeLocation, filter: { where: { name } }, reqParams: { address } });
    await createDefaultData({ clinicDB, masterDB, tenantId: createdPractice[0].id });
    const staff = await clinicDB.Staff.upsert({
      titleCode: 'dr',
      firstName: staffFirstName,
      middleName: staffMiddleName,
      lastName: staffLastName,
      email: staffEmail,
      userId: clinicAdminUser.item.id,
      contact: staffContact,
    });
    if (staff) {
      const newStaff = {
        titleCode: 'dr',
        firstName: staffFirstName,
        middleName: staffMiddleName,
        lastName: staffLastName,
        email: staffEmail,
        userId: clinicAdminUser.item.id,
        contact: staffContact,
        password: staffPassword,
      };
      // createPractice[0] = {...createPractice[0], domainName: practice?.domainName};
      createdPractice[0] = {
        ...createdPractice[0].get({ plain: true }),
        domainName: practice?.domainName,
      };

      const { generatePasswordToken, expires } = await tokenService.generatePasswordToken(clinicAdminUser.item);

      await clinicDB.Token.create({
        token: generatePasswordToken,
        userId: clinicAdminUser.item.id,
        expires,
        type: tokenTypes.GENERATE_PASSWORD,
      });

      emailService.sendWelcomeEmailToClinicAdmin(createdPractice[0].id, createdPractice[0], {
        staff: newStaff,
        token: generatePasswordToken,
      });
    }

    if (createdPractice[0].id) {
      const cost = '99.00';
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start date
      ///////////////////////ADD SUBSCRIPTION DATA///////////////////
      const trialSubscription = await dbService.createOne({
        model: masterDB.TrialSubscription,
        reqParams: {
          practiceId: createdPractice[0].id,
          startDate,
          endDate,
          cost,
        },
      });
    }

    const staffInstance = staff?.[0];
    const practices = createdPractice?.[0];
    if (staffInstance && practices) {
      const staffData = staffInstance.dataValues;
      const clinicName = await dbService.getClinicNameById({ model: masterDB.Practice, clinicId: practices.id });
      const clinicRole = await clinicDB.Role.findOne({ where: { code: 'clinicAdmin' }, attributes: ['name'] });
      const titleName = await dbService.getTitleNameByTitleCode({
        model: clinicDB.GlobalType,
        titleCode: staffData.titleCode,
      });
      await dbService.createOne({
        model: masterDB.ClinicStaff,
        reqParams: {
          title: titleName,
          clinicId: practices.id,
          clinicName,
          staffId: staffData.id,
          firstName: staffData.firstName,
          middleName: staffData.middleName,
          lastName: staffData.lastName,
          email: staffData.email,
          role: clinicRole?.name,
          isPrescriber: staffData.isPrescriber,
        },
      });
    }
    res.status(httpStatus.CREATED).send({ createdPractice });
  } catch (error) {
    console.error('Error creating practice:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: error.message,
      // message: "Error creating practice",
    });
  }
  // await importDiagnosisProblem({clinicDB,tenantId:createdPractice[0].id});

  // Trigger Mail Here For Welcome

  ///////////////Practice/////////////////
  // const practice = await dbService.createOne({
  //   model: db.Practice,
  //   reqParams: body,
  // });

  ///////////////Clinic Admin//////////////////////////
  // let clinicAdmin;
  // if(practice){
  //   clinicAdmin = await dbService.createOne({
  //     model: db.ClinicAdmin,
  //     reqParams: { name:clinicAdminName, email:clinicAdminEmail, contact:clinicAdminContact, practiceId: practice.id}
  //   })
  // }
});

const updatePracticeById = catchAsync(async (req, res) => {
  let { body = {}, user, params, clinicUuid: uuid } = req;

  // const { id: userId } = user;
  const userId = 1;
  const { practiceId } = params || {};
  const formattedPracticeId = parseInt(practiceId, 10);
  const masterDB = initializeModels(sequelize, true);
  const clinicDB = getModels(formattedPracticeId);
  const practice = await dbService.getOneById({
    model: masterDB.Practice,
    id: practiceId,
  });
  if (!practice) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  if (!isEmpty(body)) {
    let logoId;
    const { logo } = body || {};
    if (logo) {
      logoId = logo;
      body = { ...body, logoId };
    }
    const updateParams = { ...body, updateById: userId };
    if (body.isDeleted === true) {
      updateParams.deletedById = userId;
    }

    await dbService.updateOne({
      model: masterDB.Practice,
      updateParams,
      filter: { where: { id: practiceId } },
    });

    const practiceSetting = await clinicDB.PracticeSetting.findOne();
    await dbService.updateOne({
      model: clinicDB.PracticeSetting,
      updateParams,
      filter: { where: { id: practiceSetting?.id } },
    });
  }
  res.status(httpStatus.OK).send(practice);
});

const uploadPracticeLogo = catchAsync(async (req, res) => {
  const { params } = req;
  const { practiceId } = params || {};
  const formattedPracticeId = parseInt(practiceId, 10);
  const masterDB = initializeModels(sequelize, true);
  const clinicDB = getModels(formattedPracticeId);
  const practice = await dbService.getOneById({
    model: masterDB.Practice,
    id: formattedPracticeId,
  });
  if (!practice) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  req.clinicUuid = formattedPracticeId;
  const uploadResult = await uploadService.upload(req);
  await res.send(uploadResult);
});

const getClinicLoginLogs = catchAsync(async (req, res) => {
  const { from, to, timezone, practiceId } = req?.query || {};
  const db = practiceId ? getModels(parseInt(practiceId, 10)) : initializeModels(sequelize, (master = true));
  let whereClause = {};

  if (from && to) {
    whereClause = {
      ...whereClause,
      loginTime: {
        [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
      },
    };
  }

  const result = await dbService.getPaginated({
    model: db.LoginLogs,
    req,
    allowedFilters: ['email'],
    searchFilter: ['email'],
    addOnFilter: whereClause,
  });

  res.status(httpStatus.OK).send(result);
});

const getClinicStaff = catchAsync(async (req, res) => {
  const { clinicId, isActive } = req.query || {};
  const db = initializeModels(sequelize, (master = true));
  let whereClause = {};

  if (clinicId) {
    whereClause.clinicId = clinicId;
  }

  if (isActive !== undefined) {
    whereClause.isActive = isActive === 'true';
  }

  const result = await dbService.getPaginated({
    model: db.ClinicStaff,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName', 'email', 'clinicName'],
    searchFilter: ['firstName', 'lastName', 'middleName', 'email', 'clinicName'],
    addOnFilter: whereClause,
  });

  res.status(httpStatus.OK).send(result);
});
const getClinicStaffCSV = catchAsync(async (req, res) => {
  const { clinicId, isActive } = req.query;
  const db = initializeModels(sequelize, (master = true));
  const whereClause = {};
  if (clinicId) whereClause.clinicId = clinicId;
  if (isActive !== undefined) whereClause.isActive = isActive === 'true';

  const result = await db.ClinicStaff.findAll({
    where: whereClause,
    attributes: ['firstName', 'lastName', 'clinicName','email'],
    order: [['createdAt', 'DESC']],
  });

  const escapeCSV = (value = '') =>
    `"${String(value).replace(/"/g, '""')}"`;

  const header = 'First Name,Last Name,Clinic Name,Email\n';

  const rows = result
    .map(r =>
      [
        escapeCSV(r.firstName),
        escapeCSV(r.lastName),
        escapeCSV(r.clinicName),
        escapeCSV(r.email),
      ].join(',')
    )
    .join('\n');

  const csvData = header + rows;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=clinic-staff.csv'
  );

  res.status(200).send(csvData);
});

const getClinicAppointment = catchAsync(async (req, res) => {
  const { clinicId, from, to,timezone , practitionerId } = req?.query || {};
  let result;
  if (!clinicId) {
    return res.status(httpStatus.OK).send({
      results: [],
      totalResults: 0,
      page: 1,
      limit: 0,
    });
  }
  const db = getModels(parseInt(clinicId, 10));
  let filter = {
    isDeleted: false,
  };
  if (from && to) {
    filter.startDateTime = {
      [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
    };
  } else if (from) {
    filter.startDateTime = {
      [Op.gte]: getStartOfTheDayWithTZ(from, { timezone }),
    };
  } else if (to) {
    filter.startDateTime = {
      [Op.lte]: getEndOfTheDayWithTZ(to, { timezone }),
    };
  }
  const includeOptions = [
    { model: db.Staff, as: 'practitioner' },
    { model: db.GlobalType, as: 'status' },
    { model: db.GlobalType, as: 'type' },
    { model: db.Patient, as: 'patients', include: [{ model: db.GlobalType, as: 'title' }, { model: db.GlobalType, as: 'genderIdentity' }, { model: db.GlobalType, as: 'sexAtBirth' }, { model: db.File, as: 'file' }] },
  ];
  result = await dbService.getPaginated({
    model: db.Appointment,
    req,
    allowedFilters: ['practitionerId'],
    addOnFilter: filter,
    include: includeOptions,
  });

  res.status(httpStatus.OK).send(result);
});
const getCliniwiseStaff = catchAsync(async (req, res) => {
  const { role ,clinicId  } = req?.query || {};
    if (!clinicId) {
    return res.status(httpStatus.OK).send({
      results: [],
      totalResults: 0,
      page: 1,
      limit: 0,
    });
  }
  const db = getModels(parseInt(clinicId, 10));


  let whereClause = {};
  if (role) {
    whereClause = { code: req.query.role };
  }
  const result = await dbService.getPaginated({
    model: db.Staff,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName'],
    searchFilter: ['firstName', 'lastName', 'middleName'],
    include: [
      {
        model: db.User,
        as: 'user',
        // include:[{model:db.Role,as:'roles',where:{code:req.query.role}}]
        include: [{ model: db.Role, as: 'roles', where: whereClause }],
      },
      { model: db.GlobalType, as: 'title' },
      { model: db.GlobalType, as: 'genderIdentity' },
      { model: db.File, as: 'file' },
      { model: db.StaffBookingSetting, as: 'bookingSetting' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getClinicEmailLogs = catchAsync(async (req, res) => {
  const { from, to, timezone, clinicId } = req?.query || {};
  const db = clinicId ? getModels(parseInt(clinicId, 10)) : initializeModels(sequelize, (master = true));
  let whereClause = {};

  if (from && to) {
    whereClause.dateTime = {
      [Op.between]: [getStartOfTheDayWithTZ(from, { timezone }), getEndOfTheDayWithTZ(to, { timezone })],
    };
  } else if (to) {
    whereClause.dateTime = {
      [Op.lte]: getEndOfTheDayWithTZ(to, { timezone }),
    };
  }
  else if (from) {
    whereClause.dateTime = {
      [Op.gte]: getStartOfTheDayWithTZ(from, { timezone }),
    };
  }
  const result = await dbService.getPaginated({
    model: db.EmailAudit,
    req,
    allowedFilters: ['email', 'subject'],
    searchFilter: ['email', 'subject'],
    addOnFilter: whereClause,
  });

  res.status(httpStatus.OK).send(result);
});

const getClinicCronLogs = catchAsync(async (req, res) => {
  const { from, to, timezone, clinicId, method, searchText } = req?.query || {};

  if (!clinicId) {
    return res.status(httpStatus.OK).send({
      results: [],
      totalResults: 0,
      page: 1,
      limit: 0,
    });
  }

  const db = getModels(parseInt(clinicId, 10));
  const whereClause = {};

  if (from && to) {
    whereClause.createdAt = {
      [Op.between]: [
        getStartOfTheDayWithTZ(from, { timezone }),
        getEndOfTheDayWithTZ(to, { timezone }),
      ],
    };
  } else if (to) {
    whereClause.createdAt = {
      [Op.lte]: getEndOfTheDayWithTZ(to, { timezone }),
    };
  } else if (from) {
    whereClause.createdAt = {
      [Op.gte]: getStartOfTheDayWithTZ(from, { timezone }),
    };
  }

  if (method) {
    whereClause.method = method;
  }

  if (searchText) {
    const searchPattern = `%${searchText}%`;
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      {
        [Op.or]: [
          { method: { [Op.iLike]: searchPattern } },
          { status: { [Op.iLike]: searchPattern } },
          { timeTaken: { [Op.iLike]: searchPattern } },
          Sequelize.where(
            Sequelize.cast(Sequelize.col('error'), 'text'),
            { [Op.iLike]: searchPattern }
          ),
        ],
      },
    ];
  }

  const pagination = getSortAndLimit(
    { ...req.query, sortBy: req.query?.sortBy || 'createdAt:-1' },
    { applySorting: true }
  );

  const result = await db.CronLog.paginate({
    where: whereClause,
    ...pagination,
  });

  res.status(httpStatus.OK).send(result);
});

const createEmailTemplate = catchAsync(async (req, res) => {
  const { body } = req || {};
  const masterDB = initializeModels(sequelize, true);
  const { name } = body;
  const whereClause = { name, isDeleted: false };
  const existingEmailType = await isTemplateExist(masterDB.AdminEmailTemplate, { where: whereClause });
  if (existingEmailType) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_TYPE_EXIST);
  }
  const emailTemplate = await dbService.createOne({
    model: masterDB.AdminEmailTemplate,
    reqParams: { ...req.body },
  });
  res.status(httpStatus.CREATED).send(emailTemplate);
});

const getEmailTemplates = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const emailTemplates = await dbService.getPaginated({
    model: masterDB.AdminEmailTemplate,
    req,
    searchFilter: ['name', 'subject'],
  });
  res.status(httpStatus.OK).send(emailTemplates);
});

const updateEmailTemplate = catchAsync(async (req, res) => {
  const { user, body } = req || {};
  const masterDB = initializeModels(sequelize, true);
  const existingEmailTemplate = await isTemplateExist(masterDB.AdminEmailTemplate, {
    where: { id: req.params.templateId, isDeleted: false },
  });

  if (!existingEmailTemplate) {
    return res.status(httpStatus.NOT_FOUND).send({
      message: 'Email template not found',
    });
  }

  const updateParams = { id: req.params.templateId, ...body };
  const updatedEmailTemplate = await dbService.updateById({
    model: masterDB.AdminEmailTemplate,
    reqParams: { ...updateParams },
  });
  res.status(httpStatus.OK).send(updatedEmailTemplate);
});
module.exports = {
  getPractices,
  getPracticeById,
  createPractice,
  updatePracticeById,
  uploadPracticeLogo,
  getClinicLoginLogs,
  getClinicStaff,
  getClinicStaffCSV,
  getClinicAppointment,
  getCliniwiseStaff,
  getClinicEmailLogs,
  getClinicCronLogs,
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
};
