const httpStatus = require('http-status');
const { Op, Sequelize } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const normalizeCptCode = (cptCode) => (typeof cptCode === 'string' ? cptCode.trim() : '');
const hasOwnProperty = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

const resolveUseForBillingCode = (payload = {}, existingProcedureCode = null) => {
  if (hasOwnProperty(payload, 'useForBillingCode')) {
    return payload.useForBillingCode === true || payload.useForBillingCode === 'true';
  }

  if (hasOwnProperty(payload, 'cptCode')) {
    return !!normalizeCptCode(payload.cptCode);
  }

  if (existingProcedureCode) {
    if (typeof existingProcedureCode.useForBillingCode === 'boolean') {
      return existingProcedureCode.useForBillingCode;
    }

    return !!normalizeCptCode(existingProcedureCode.cptCode);
  }

  return false;
};

const buildUseForBillingCodeFilter = (queryValue) => {
  if (queryValue === undefined) {
    return {};
  }

  const cptCodeValue = Sequelize.fn(
    'TRIM',
    Sequelize.fn('COALESCE', Sequelize.col('cptCode'), '')
  );

  if (queryValue === true || queryValue === 'true') {
    return {
      [Op.or]: [
        { useForBillingCode: true },
        {
          [Op.and]: [
            { useForBillingCode: { [Op.is]: null } },
            Sequelize.where(cptCodeValue, { [Op.ne]: '' }),
          ],
        },
      ],
    };
  }

  return {
    [Op.or]: [
      { useForBillingCode: false },
      {
        [Op.and]: [
          { useForBillingCode: { [Op.is]: null } },
          Sequelize.where(cptCodeValue, ''),
        ],
      },
    ],
  };
};

const checkDuplicateCptCode = async ({ db, cptCode, excludeId = null }) => {
  const normalizedCptCode = normalizeCptCode(cptCode);

  if (!normalizedCptCode) return;

  const where = {
    [Op.and]: [
      Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('cptCode'))),
        normalizedCptCode.toLowerCase()
      ),
      { isDeleted: { [Op.or]: [null, false] } },
    ],
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const existingProcedureCode = await db.ProcedureCode.findOne({ where });

  if (existingProcedureCode) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages._EXIST('CPT code'));
  }
};

const getProcedureCode = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const addOnFilter = buildUseForBillingCodeFilter(req?.query?.useForBillingCode);
    const result = await dbService.getPaginated({
      model: db.ProcedureCode,
      req,
      searchFilter: ['name', 'cptCode'],
      addOnFilter,
    });
    res.status(httpStatus.OK).send(result);
  });

  const createProcedureCode = catchAsync(async (req, res) => {
    const {user,body} = req ;
    const {id:userId} = user || {};
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const useForBillingCode = resolveUseForBillingCode(body);
    const normalizedCptCode = normalizeCptCode(body?.cptCode);

    if (useForBillingCode) {
      await checkDuplicateCptCode({ db, cptCode: normalizedCptCode });
    }

    const total = (body?.qty * body?.price) || 0;
    const payload = {
      ...body,
      cptCode: useForBillingCode ? normalizedCptCode : '',
      total,
      useForBillingCode,
      createdById: userId,
    };

    const createdData = await dbService.createOne({
      model: db.ProcedureCode,
     reqParams: payload
    });
    res.status(httpStatus.OK).send(createdData);
  });

  const updateProcedureCode = catchAsync(async (req, res) => {
    const {user,params,body} = req ;
    const {id:userId} = user || {};
    const uuid = req.clinicUuid;
    const {procedureCodeId } = params || {};
    const db = getModels(uuid);

    const exsistingProcedureCode = await dbService.getOneById({model:db.ProcedureCode,id:procedureCodeId});
    const useForBillingCode = resolveUseForBillingCode(body, exsistingProcedureCode);
    const normalizedCptCode = hasOwnProperty(body, 'cptCode')
      ? normalizeCptCode(body.cptCode)
      : normalizeCptCode(exsistingProcedureCode?.cptCode);

    if (useForBillingCode) {
      await checkDuplicateCptCode({
        db,
        cptCode: normalizedCptCode,
        excludeId: procedureCodeId,
      });
    }

    const total = ((body?.qty || exsistingProcedureCode?.qty) * (body?.price || exsistingProcedureCode.price)) || 0;
    const payload = {
      id: procedureCodeId,
      ...body,
      cptCode: useForBillingCode ? normalizedCptCode : '',
      total,
      useForBillingCode,
      updatedById: userId,
    };

    const [,updatedData] = await dbService.updateById({
      model: db.ProcedureCode,
     reqParams: payload
    });
    res.status(httpStatus.OK).send(updatedData);
  });
  
  const getProcedureCodeById = catchAsync(async (req, res) => {
    const {params} = req;
    const uuid = req.clinicUuid;
    const {procedureCodeId} = params || {}
    const db = getModels(uuid);
    const result = await dbService.getOneById({
      model: db.ProcedureCode,
      id:procedureCodeId,
    });
    res.status(httpStatus.OK).send(result);
  });
module.exports = {
    getProcedureCode,
    createProcedureCode,
    updateProcedureCode,
    getProcedureCodeById,
};
