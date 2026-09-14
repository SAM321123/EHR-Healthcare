const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const config = require('../config/config');
const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const {
  dbService,
  uploadService,
  emailService,
  practiceSubscriptionHistoryService,
  stripeService,
  tokenService,
} = require('../services');
const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { isEmpty, filter } = require('lodash');
const { default: slugify } = require('slugify');
const randomPassword = require('../utils/randomPassword');
const { up } = require('../utils/tenant');
const { createDefaultData } = require('../services/practice.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const Stripe = require('stripe');
const { tokenTypes } = require('../config/tokens');
const dayjs = require('dayjs');

// const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
const stripe = Stripe(config.stripe.stripeSecretKey);

// const verificationCodes = new Map(); // Temporary storage

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

const clinicCreateRequest = catchAsync(async (req, res) => {
  try {
    const { body } = req || {};
    const {
      name,
      email,
      address,
      contact,
      domainName,
      staffFirstName,
      staffLastName,
      staffEmail,
      staffContact,
      staffPassword,
    } = body;

    const masterDB = initializeModels(sequelize, true);

    const practice = {
      name,
      email,
      address,
      contact,
      domainName,
    };

    const isTmpPracticeExists = await masterDB.Temp.findOne({
      where: {
        [Op.or]: [{ email: practice?.email }, { name: practice?.name }, { domainName: practice?.domainName }],
      },
    });
    const isPracticeExists = await masterDB.Practice.findOne({
      where: {
        [Op.or]: [{ email: practice?.email }, { name: practice?.name }, { domainName: practice?.domainName }],
      },
    });

    if (isTmpPracticeExists) {
      await masterDB.Temp.destroy({ where: { id: isTmpPracticeExists.id } });
    }
    // if(isTmpPracticeExists || isPracticeExists){
    if (isPracticeExists) {
      throw new ApiError(httpStatus.CONFLICT, errorMessages.PRACTICE_EMAIL_NAME_EXISTS);
    }

    const tempData = await dbService.createOne({
      model: masterDB.Temp,
      reqParams: { ...body },
    });
    let code;
    if (tempData) {
      const existingCodes = await dbService.getOne({ model: masterDB.Code, filter: { where: { email } } });
      if (existingCodes) {
        await dbService.deleteMany({
          model: masterDB.Code,
          filter: { where: { email } },
        });
      }

      code = await emailService.sendVerificationCodeMail({ email, req });
      const expiresAt = Date.now() + 15 * 60 * 1000;
      await dbService.createOne({
        model: masterDB.Code,
        reqParams: {
          code: code,
          email: body?.email,
          expires: expiresAt,
        },
      });
      // ✅ Store in memory with a timestamp (valid for 5 minutes)
      // verificationCodes.set(email, { code: code, expiresAt: Date.now() + 5 * 60 * 1000 });
    }

    res.status(httpStatus.OK).send({ tempData });
  } catch (error) {
    console.error('Error creating practice:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: error.message,
    });
  }
});

const verifyCode = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { email, code } = req.body;

  if (!email && !code) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  // const storedData = verificationCodes.get(email);
  const codeData = await dbService.getOne({ model: masterDB.Code, filter: { where: { email } } });

  const isExpired = codeData?.expires && new Date(codeData.expires) < new Date();

  const verifyCode = await masterDB.Code.findOne({
    where: { email },
  });

  ////////////////////////compare code//////////////////////////////
  const isCodeMatch = await verifyCode.isCodeMatch(code);
  if (!isCodeMatch) {
    res.send({ error: true, message: errorMessages.INVALID_OR_EXPIRE_CODE });
    return;
  }

  // if (!codeData || (codeData?.code !== parseInt(code)) || isExpired){
  //    // Remove expired code
  //   if(codeData && isExpired){
  //     await dbService.deleteOne({
  //       model: masterDB.Code,
  //       filter: { where: { email } },
  //     });
  //   }
  //     throw new ApiError(httpStatus.CONFLICT, errorMessages.INVALID_OR_EXPIRE_CODE);
  // }

  if (isExpired || isCodeMatch) {
    await dbService.deleteOne({
      model: masterDB.Code,
      filter: { where: { email } },
    });
  }
  if (isExpired || isCodeMatch === false || codeData === null) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.INVALID_OR_EXPIRE_CODE);
  }

  const data = await dbService.getOne({ model: masterDB.Temp, filter: { where: { email } } });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  ////////////////to create fresh db////////////////////////////////////////
  const { id } = data;

  const {
    name,
    address,
    contact,
    domainName,
    staffFirstName,
    staffMiddleName,
    staffLastName,
    staffEmail,
    staffContact,
    staffPassword,
  } = data || {};

  const tenantName = slugify(name.toLowerCase(), '_');
  const password = randomPassword();
  const currentDate = new Date();
  const trialExpiresAt = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const practice = {
    name,
    email,
    address,
    contact,
    domainName,
    trialExpiresAt,
  };

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

  const isPracticeExists = await masterDB.Practice.findOne({
    where: {
      [Op.or]: [{ email: practice?.email }, { name: practice?.name }, { domainName: practice?.domainName }],
    },
  });
  if (isPracticeExists) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.PRACTICE_EMAIL_NAME_EXISTS);
  }
  const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData[0].id });
  if (createdPractice[0].id) {
    await dbService.deleteOne({
      model: masterDB.Temp,
      filter: { where: { email } },
    });
  }
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
    /// 3 days of subscription
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
  //////////////////////////////////////////////////////////////////////////

  res.status(httpStatus.CREATED).send({ createdPractice });
});

const runMasterSeed = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { body } = req;
  const { tempPracticeId } = body;

  ///////////TO CHECK IS THERE ANY DATA IN TEMP////////////////
  const tempPractice = await dbService.getOne({ model: masterDB.Temp, filter: { where: { id: tempPracticeId } } });
  if (!tempPractice) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  // await masterDB.Temp.destroy({ where: {  email } });

  const {
    name,
    email,
    address,
    contact,
    domainName,
    staffEmail,
    staffContact,
    staffFirstName,
    staffMiddleName,
    staffLastName,
    staffPassword,
  } = tempPractice || {};

  const tenantName = slugify(name.toLowerCase(), '_');
  const password = randomPassword();
  const currentDate = new Date();
  const trialExpiresAt = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const practice = {
    name,
    email,
    address,
    contact,
    domainName,
    trialExpiresAt,
  };

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

  const isPracticeExists = await masterDB.Practice.findOne({
    where: {
      [Op.or]: [{ email: practice?.email }, { name: practice?.name }, { domainName: practice?.domainName }],
    },
  });
  if (isPracticeExists) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.PRACTICE_EMAIL_NAME_EXISTS);
  }
  const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData[0].id });
  if (createdPractice[0].id) {
    await dbService.deleteOne({
      model: masterDB.Temp,
      filter: { where: { email } },
    });
    // await dbService.deleteOne({
    //   model: masterDB.Code,
    //   filter: { where: { email } },
    // });
  }
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
    // createdPractice[0] = {...createdPractice[0], domainName: practice?.domainName};
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
    const cost = 99.0;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 30 days from start date
    /// 3 days of subscription
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
  res.status(httpStatus.CREATED).send({ createdPractice });
});

const getTempPractice = catchAsync(async (req, res) => {
  const db = initializeModels(sequelize, (master = true));

  const { id } = req?.query || {};
  const where = {};
  if (id) {
    where.id = id;
  }

  const tempPractice = await dbService.getOne({ model: db.Temp, filter: { where: { id } } });
  res.status(httpStatus.OK).send(tempPractice);
});

// const createSubscription = catchAsync(async (req, res) => {
//   const masterDB = initializeModels(sequelize, true);
//   const { body } = req;
//   const { tempPracticeId, practitionerCount, rnCount, cardNo, cost } = body;
//   const prescriberCount = 0;
//   ///////////TO CHECK IS THERE ANY DATA IN TEMP////////////////
//   const tempPractice = await dbService.getOne({model: masterDB.Temp,filter: {where: {id:tempPracticeId}}});
//   if(!tempPractice){
//     throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
//   }
//   ////////////////IF PRACTICE DATA IN TEMP PROCCED WITH PAYMENT////////////////////////////
//   // const result=await stripeService.createPaymentIntent(body, {tenantId:tempPractice?.id});
//   const stripeResult = await stripeService.createCustomerAndSubscription({
//     email: tempPractice.email,
//     practitionerCount,
//     paymentMethodId: body.paymentMethodId, // You should pass this from frontend
//   });

//   let paymentLog;
//   if(stripeResult){
//     paymentLog = {
//       paymentIntentId: stripeResult?.paymentIntent?.id,
//       response: JSON.stringify(stripeResult?.paymentIntent),
//       error: stripeResult?.paymentIntent?.last_payment_error,
//       // status: result?.paymentIntent?.status,
//       // createdById: tempPractice?.id,
//     }
//     // const paymentlog = await db.PaymentLogs.create(log)
//   }

//   const {
//     name, email,
//     address, contact,
//     domainName, staffEmail,
//     staffContact, staffFirstName,
//     staffMiddleName, staffLastName,
//     staffPassword } = tempPractice || {};

//   const tenantName = slugify(name.toLowerCase(), '_');
//   const password = randomPassword();
//   const currentDate = new Date();
//   const trialExpiresAt = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

//   const practice = {
//     name,
//     email,
//     address,
//     contact,
//     domainName,
//     trialExpiresAt
//   };

//   const dbConfig = {
//     // add one common method
//     databaseName: tenantName,
//     databaseUser: config.sequelize.username,
//     databasePassword: config.sequelize.password,
//     databasePort: config.sequelize.port,
//     databaseHost: config.sequelize.host,
//     databaseDialect: config.sequelize.dialect,
//   };

//   ////////////////TO CHECK FOR REDUNDANT PRACTICE////////////////
//   const isPracticeExists = await masterDB.Practice.findOne(
//     {where: {
//       [Op.or]: [
//         { email: email },
//         { name: name },
//         { domainName: domainName },
//       ]
//     }}
//   );

//   if(isPracticeExists){
//     throw new ApiError(httpStatus.CONFLICT, errorMessages.PRACTICE_EMAIL_NAME_EXISTS);
//   }

//   //////////////////////////CREATE DB FOR NEW PRACTICE/////////////////
//   const databaseConfigData = await masterDB.DatabaseConfig.upsert(dbConfig);

//   /////////////////////////////////////////CREATE PRACTICE//////////////////////////
//   const createdPractice = await masterDB.Practice.upsert({ ...practice, databaseConfigId: databaseConfigData[0].id });
//   if(createdPractice[0].id){
//     await dbService.deleteOne({
//       model: masterDB.Temp,
//       filter: { where: { email } },
//     });
//   }
//   console.log('step2------------------->', createdPractice);
//   await up({ tenantName, password, uuid: createdPractice[0].id }); // rename to relatble
//   const clinicDB = getModels(createdPractice[0].id);
//   console.log('step3------------------->', clinicDB);

//   const roles = [
//     { name: 'Clinic Admin', code: 'clinicAdmin', description: 'initial created one', isDefault: true },
//     { name: 'Patient', code: 'patient', description: 'initial created one', isDefault: true },
//     { name: 'Practitioner', code: 'practitioner', description: 'initial created one', isDefault: true },
//     { name: 'RN/Medical assistant', code: 'rn', description: 'initial created one', isDefault: true },
//   ];

//   const rolePromises = []
//   for(let role of roles){
//     const {code,...restRole} = role || {}
//     rolePromises.push(dbService.upsert({model:clinicDB.Role,filter:{where:{code}},reqParams:{...restRole}}));
//   }
//   await Promise.all(rolePromises);
//   const clinicRole = await clinicDB.Role.findOne({ where: { code: 'clinicAdmin' } });
//   const clinicAdminUser = await dbService.upsert({
//     model: clinicDB.User,
//     filter: { where: { email: staffEmail } },
//     reqParams: {
//         firstName: staffFirstName,
//         middleName: staffMiddleName,
//         lastName: staffLastName,
//         password: staffPassword,
//         // password: randomPassword(),
//         tenantId: createdPractice[0].id,
//     },
//   });
//   await clinicAdminUser.item.setRoles([clinicRole.id])

//   await dbService.upsert({model:clinicDB.PracticeSetting,filter:{where:{name}},reqParams:{email, contact, address}});
//   await dbService.upsert({model:clinicDB.PracticeLocation,filter:{where:{name}},reqParams:{address}});
//   await createDefaultData({ clinicDB, masterDB,tenantId:createdPractice[0].id });
//   const staff = await clinicDB.Staff.upsert({
//     titleCode:'dr',
//     firstName: staffFirstName,
//     middleName: staffMiddleName,
//     lastName: staffLastName,
//     email: staffEmail,
//     userId: clinicAdminUser.item.id,
//     contact: staffContact,
//   });

//   if(staff){
//     const newStaff = {
//       titleCode:'dr',
//       firstName: staffFirstName,
//       middleName: staffMiddleName,
//       lastName: staffLastName,
//       email: staffEmail,
//       userId: clinicAdminUser.item.id,
//       contact: staffContact,
//       password: staffPassword,
//     }
//     createdPractice[0] = {
//       ...createdPractice[0].get({ plain: true }),
//       domainName: practice?.domainName
//     };
//     const { generatePasswordToken,expires } = await tokenService.generatePasswordToken(clinicAdminUser.item);
//     await clinicDB.Token.create({
//       token: generatePasswordToken,
//       userId: clinicAdminUser.item.id,
//       expires,
//       type: tokenTypes.GENERATE_PASSWORD,
//     });
//     emailService.sendWelcomeEmailToClinicAdmin(createdPractice[0].id, createdPractice[0], { staff: newStaff, token: generatePasswordToken });
//   }

//   if(createdPractice[0].id){
//     const startDate = new Date();
//     const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start date

//     ///////////////////////ADD SUBSCRIPTION DATA///////////////////
//     const subscription = await dbService.createOne({
//       model: masterDB.Subscription,
//       reqParams: {
//         practiceId:createdPractice[0].id,
//         startDate,
//         endDate,
//         practitionerCount,
//         rnCount,
//         prescriberCount,
//         cardNo,
//         cost,
//         subscriptionId: stripeResult?.subscriptionId,
//         ...paymentLog
//       }
//     });
//   }

//   res.status(httpStatus.CREATED).send({createdPractice});
// });

const createSubscription = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { body } = req;
  const practiceId = req.clinicUuid;
  const { practitionerCount, rnCount, cardNo, prescriberCount, cost } = body;
  ///////////TO CHECK IS THERE ANY DATA IN  PRACTICE////////////////
  const practice = await dbService.getOne({
    model: masterDB.Practice,
    filter: { where: { id: practiceId } },
  });
  if (!practice) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  ////////////////IF PRACTICE DATA, PROCCED WITH PAYMENT////////////////////////////
  const stripeResult = await stripeService.createCustomerAndSubscription({
    email: practice.email,
    name: practice.name,
    practitionerCount,
    rnCount,
    prescriberCount,
    paymentMethodId: body.paymentMethodId, // You should pass this from frontend
  });

  let paymentLog;
  // if(stripeResult){
  //   paymentLog = {
  //     paymentIntentId: stripeResult?.paymentIntent?.id,
  //     response: JSON.stringify(stripeResult?.paymentIntent),
  //     error: stripeResult?.paymentIntent?.last_payment_error,
  //     // status: result?.paymentIntent?.status,
  //     // createdById: tempPractice?.id,
  //   }
  //   // const paymentlog = await db.PaymentLogs.create(log)
  // }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start date

  //////////////////////REMOVE TRIAL SUBSCRIPTION DATA///////////
  await dbService.deleteOne({
    model: masterDB.TrialSubscription,
    filter: { where: { practiceId: practice?.id } },
  });
  ///////////////////////////////////////////////////////////////

  ///////////////////////ADD SUBSCRIPTION DATA///////////////////
  const subscription = await dbService.createOne({
    model: masterDB.Subscription,
    reqParams: {
      practiceId,
      startDate,
      endDate,
      practitionerCount,
      rnCount,
      prescriberCount,
      cardNo,
      cost,
      subscriptionId: stripeResult?.subscriptionId,
      ...paymentLog,
    },
  });

  res.status(httpStatus.CREATED).send({ subscription });
});

const getSubscriptionData = catchAsync(async (req, res) => {
  try {
    const uuid = req.clinicUuid;
    const { id } = req.query || {};

    const practiceUuid = id || uuid;
    const masterDB = initializeModels(sequelize, true);

    const practice = await dbService.getOne({
      model: masterDB.Practice,
      filter: {
        where: { id: practiceUuid },
      },
      include: [{ model: masterDB.TrialSubscription, as: 'trialSubscription' }],
      attributes: ['domainName'],
    });

    if (!practice?.trialSubscription) {
      const subscription = await dbService.getOne({
        model: masterDB.Subscription,
        filter: {
          where: { practiceId: practiceUuid },
        },
        include: [
          {
            model: masterDB.Practice,
            as: 'practice',
            attributes: ['id', 'createdAt'],
          },
        ],
      });

      if (!subscription) {
        if (practice?.domainName === 'app') {
          console.log('No subscription for this practice');
          /////////////to make existing practice work///////////////////
          const subscription = { isActive: true };
          return res.status(httpStatus.OK).send(subscription);
        } else {
          throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
        }
      }
      return res.status(httpStatus.OK).send(subscription);
    } else {
      const today = new Date();

      //if subscription canceled
      const isTrialPeriodOver =
        practice?.trialSubscription?.endDate && today > new Date(practice?.trialSubscription?.endDate);
      return res.status(httpStatus.OK).send({
        isTrial: true,
        isActive: false,
        trialEndDate: practice?.trialSubscription?.endDate,
        isTrialPeriodOver,
        data: practice?.trialSubscription,
      });
    }
  } catch (err) {
    console.log('error------->', err);
  }
});

const getSubscription = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { id } = req.query || {};

  const practiceUuid = id || uuid;

  const masterDB = initializeModels(sequelize, true);

  const practice = await dbService.getOne({
    model: masterDB.Practice,
    filter: {
      where: { id: uuid },
    },
    attributes: ['domainName'],
  });

  const subscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: {
      where: { practiceId: practiceUuid },
    },
    include: [
      {
        model: masterDB.Practice,
        as: 'practice',
        attributes: ['id', 'createdAt'],
      },
      {
        model: masterDB.SubscriptionHistory,
        as: 'subscriptionHistory',
        required: false,
      },
      {
        model: masterDB.GlobalType,
        as: 'reasonForCancel',
        attributes: ['name', 'description'],
      },
    ],
    order: [[{ model: masterDB.SubscriptionHistory, as: 'subscriptionHistory' }, 'id', 'DESC']],
    subscribeSocket: true,
  });

  if (!subscription.results) {
    if (practice?.domainName === 'app') {
      console.log('No subscription exists for this practice');
      res.status(httpStatus.OK).send('No subscription exists for this practice');
    } else {
      const trialSubscription = await dbService.getOne({
        model: masterDB.TrialSubscription,
        filter: {
          where: { practiceId: practiceUuid },
        },
      });
      if (!trialSubscription) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
    }
  }

  if (subscription.results) {
    const grouped = Object.values(
      subscription?.results?.subscriptionHistory.reduce((acc, row) => {
        // Convert to plain object if using Sequelize instance
        const data = row.get({ plain: true });

        // Use only DATE (not time)
        const start = new Date(data.startDate).toISOString().split('T')[0];
        const end = new Date(data.endDate).toISOString().split('T')[0];
        const key = `${data.practiceId}_${start}_${end}`;

        if (!acc[key]) acc[key] = [];
        acc[key].push(data);

        return acc;
      }, {})
    );

    subscription.results.subscriptionHistory = grouped;
    res.status(httpStatus.OK).send({ subscription, history: grouped });
  }
});

const updateSubscription = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { user, body } = req;
  const { signature, practiceId } = body || {};
  const uuid = req.clinicUuid;
  const masterDb = initializeModels(sequelize, true);
  const userId = user.id;

  const existingPracticeSubscription = await dbService.getOne({
    model: masterDb.Subscription,
    filter: { where: { practiceId: uuid } },
  });

  if (!existingPracticeSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Practice Subscription not found');
  }

  // Create the history before clearing the existing items
  try {
    await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
      tenantId: uuid,
      data: {
        ...existingPracticeSubscription.toJSON(),
        subscriptionId: existingPracticeSubscription?.id,
        signature,
      },
    });
  } catch (err) {
    console.log('🚀 ~ updatePracticeSubscription ~ err:', err);
  }

  const newData = body.data || {};

  newData.practitionerCount = parseInt(newData.practitionerCount);
  newData.rnCount = parseInt(newData.rnCount);

  await dbService.updateById({
    model: masterDB.Subscription,
    reqParams: {
      id: existingPracticeSubscription?.id,
      ...newData,
      updatedById: userId,
    },
  });

  res.status(httpStatus.OK).send(existingPracticeSubscription);
});

const updateSubscriptionStatus = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { user, body } = req;
  const { data } = body || {};
  const { id } = req.params;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessages.INVALID_REQUEST);
  }

  const subscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: { where: { practiceId: id } },
  });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  //////////////////////// Stripe subscription update /////////////////////////
  let subscriptionStatus;
  if (subscription?.subscriptionId) {
    if (data.isActive === false) {
      // Pause the subscription in Stripe
      subscriptionStatus = await stripe.subscriptions.update(subscription.subscriptionId, {
        pause_collection: {
          behavior: 'mark_uncollectible',
        },
      });
    } else if (data.isActive === true) {
      // Resume the paused subscription
      subscriptionStatus = await stripe.subscriptions.update(subscription.subscriptionId, {
        pause_collection: null,
      });
    }
    if (data.isCancel) {
      let reason;
      let otherReason;
      let updateParams = {};

      if (data?.cancelReason !== 'subscription_cancel_reason_other') {
        reason = await dbService.getOne({
          model: masterDB.GlobalType,
          filter: { where: { code: data?.cancelReason } },
        });
        reason = reason?.name;
        updateParams = { isCancel: data?.isCancel, cancelReason: data?.cancelReason };
      } else {
        otherReason = data?.otherCancelReason;
        updateParams = { cancelReason: data?.cancelReason, otherCancelReason: data?.otherCancelReason };
      }

      /////////////////////////to store reason code///////////////////////////
      const result = await dbService.updateOne({
        model: masterDB.Subscription,
        updateParams,
        filter: { where: { id: subscription?.id } },
      });

      // Cancel the subscription in Stripe
      await stripe.subscriptions.update(subscription.subscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          cancel_reason: reason || '',
          other_reason: otherReason || '',
        },
      });
    }
  }
  ///////////////////////////////////////////////////////////////////////////

  ////////////////////////create susbcription history///////////////////////////
  // const subscriptionStatusUpdate = await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
  //   data: {
  //     ...subscription
  //   },
  // });
  /////////////////////////////////////////////////////////////////////////////
  res.status(httpStatus.OK).send(subscriptionStatus);
});

const createSubscriptionAfterCancel = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize, true);
  const { user, body } = req;
  const uuid = req.clinicUuid;
  const { practitionerCount = 0, rnCount = 0, cardNo = 0, prescriberCount = 0, cost = 0 } = body;
  ///////////TO CHECK IS THERE ANY DATA IN practice////////////////
  const practice = await dbService.getOne({ model: masterDB.Practice, filter: { where: { id: uuid } } });
  if (!practice) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  ////////////////////existing subscription///////////////////////////////
  const existingSubscription = await dbService.getOne({
    model: masterDB.Subscription,
    filter: { where: { practiceId: uuid } },
  });

  const today = new Date();

  if (existingSubscription?.endDate && today < new Date(existingSubscription.endDate)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New subscription can only be created after current cycle ends');
  }

  ////////////////IF PRACTICE DATA IN PROCCED WITH PAYMENT////////////////////////////
  const result = await stripeService.createPaymentIntent(body, { tenantId: uuid });
  const stripeResult = await stripeService.createSubscriptionInStripeAfterCancel({
    email: practice.email,
    practitionerCount,
    rnCount,
    prescriberCount,
    cardNo,
    cost,
    paymentMethodId: body.paymentMethodId, // You should pass this from frontend
  });

  ////////////////////////create susbcription history///////////////////////////
  const subscriptionStatusUpdate = await practiceSubscriptionHistoryService.createPracticeSubscriptionHistory({
    data: {
      ...existingSubscription,
    },
  });

  ///////////////////////ADD SUBSCRIPTION DATA///////////////////
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start date

  const updateParams = {
    practiceId: uuid,
    startDate,
    endDate,
    practitionerCount,
    rnCount,
    prescriberCount,
    cardNo,
    isActive: true,
    isCancel: false,
    cost,
    subscriptionId: stripeResult?.subscriptionId,
  };

  await dbService.updateOne({
    model: masterDB.Subscription,
    updateParams,
    filter: {
      where: { id: existingSubscription?.id },
    },
  });

  res.status(httpStatus.CREATED).send({ subscriptionStatusUpdate });
});

const getSubscriptionInvoices = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { id } = req.params || {};
  const practiceUuid = id || uuid;
  const { month, year } = req.query;
  const masterDB = initializeModels(sequelize, true);

  // Use current month/year if not provided
  const selectedMonth = month !== undefined ? Number(month) : dayjs().month(); // 0-based
  const selectedYear = year !== undefined ? Number(year) : dayjs().year();

  const startDate = dayjs().year(selectedYear).month(selectedMonth).startOf('month').toDate();
  const endDate = dayjs().year(selectedYear).month(selectedMonth).endOf('month').toDate();

  const practice = await dbService.getOne({
    model: masterDB.Practice,
    filter: {
      where: { id: uuid },
    },
    attributes: ['domainName'],
  });

  const subscription = await dbService.getAll({
    model: masterDB.SubscriptionPayment,
    filter: {
      where: {
        practiceId: practiceUuid,
        paymentDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    },
  });

  res.status(httpStatus.OK).send(subscription);
});

module.exports = {
  getPractices,
  clinicCreateRequest,
  verifyCode,
  runMasterSeed,
  getTempPractice,
  createSubscription,
  getSubscription,
  updateSubscription,
  updateSubscriptionStatus,
  getSubscriptionData,
  createSubscriptionAfterCancel,
  getSubscriptionInvoices,
};
