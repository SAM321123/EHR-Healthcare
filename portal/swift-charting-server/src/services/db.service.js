const httpStatus = require('http-status');
const { Sequelize, Op } = require('sequelize');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const pick = require('../utils/pick');
const { getSortAndLimit } = require('../utils');
const { isEmpty } = require('lodash');
const { processIncludes, serializeFilter, getQueryMetaData } = require('../utils/socketFilterTypeCast');
const { doc } = require('prettier');

const deleteOne = async ({ model, filter }) => {
  try {
    const deletedRows = await model.destroy(filter);
    if (!deletedRows) {
      throw new Error('Record not found');
    }
    return deletedRows;
  } catch (err) {
    logger.error('error in deleteOne', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
  }
};

const deleteMany = async ({ model, filter }) => {
  try {
    const deletedRows = await model.destroy(filter);
    if (!deletedRows) {
      throw new Error('Records not found');
    }
    return deletedRows;
  } catch (err) {
    logger.error('error in deleteMany', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Records not found');
  }
};

const updateOne = async ({ model, filter, updateParams, options = {} }) => {
  try {
    const [updatedRows, updatedData] = await model.update(updateParams, {
      ...filter,
      returning: true,
      individualHooks: true,
      ...options,
    });
    return [updatedRows, updatedData];
  } catch (err) {
    logger.error('error in updateOne', err);
    if (err?.message === 'Validation error') {
      throw new ApiError(httpStatus.NOT_FOUND, err?.message);
    }
    throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
  }
};

const updateById = async ({ model, reqParams }) => {
  try {
    const { id, ...rest } = reqParams;
    const [updatedRows, updatedData] = await model.update(rest, {
      where: { id },
      returning: true,
      individualHooks: true,
    });
    return [updatedRows, updatedData];
  } catch (err) {
    logger.error('error in updateById', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
  }
};

const createOne = async ({ model, reqParams, include = [] }) => {
  try {
    const createdRows = await model.create(reqParams, { include, individualHooks: true });
    return createdRows;
  } catch (err) {
    logger.error('error in createOne', model);
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, err);
  }
};

const createBulk = async ({ model, reqParams }) => {
  try {
    const createdRows = await model.bulkCreate(reqParams, { individualHooks: true });
    return createdRows;
  } catch (err) {
    logger.error('error in createOne', model);
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, err);
  }
};
const getOneById = async ({ model, id, include = '', order, subscribeSocket, tenantId }) => {
  try {
    const doc = await model.findByPk(id, { include, order });
    if (subscribeSocket) {
      // Build the _metaData object
      const _metaData = getQueryMetaData({ filter: { where: { id } }, include, model, serviceName: 'getOne', tenantId });
      return {
        results: doc,
        _metaData,
      };
    }
    return doc;
  } catch (err) {
    logger.error('error in getOneById', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
  }
};

const getOne = async ({ model, filter, include = '', tenantId, subscribeSocket }) => {
  try {
    const query = {
      ...filter,
      include,
    };
    const doc = await model.findOne(query);
    if (subscribeSocket) {
      // Build the _metaData object
      const _metaData = getQueryMetaData({ filter, include, model, serviceName: 'getOne', tenantId });
      return {
        results: doc,
        _metaData,
      };
    }
    return doc;
  } catch (err) {
    logger.error('error in getOne', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Record not found');
  }
};

const getAll = async ({ model, filter, otherOptions = {}, subscribeSocket, tenantId }) => {
  try {
    const query = {
      ...filter,
      ...otherOptions,
    };
    const docs = await model.findAll(query);
    if (subscribeSocket) {
      // Build the _metaData object
      const _metaData = getQueryMetaData({ filter, model, serviceName: 'getAll', tenantId, ...otherOptions });
      return {
        results: docs,
        _metaData,
      };
    }
    return docs;
  } catch (err) {
    logger.error('error in getAll', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Records not found');
  }
};

const upsert = async ({ model, filter, reqParams = {} }) => {
  try {
    const query = {
      ...filter,
    };
    const foundItem = await model.findOne(query);
    if (!foundItem) {
      const item = await createOne({ model, reqParams: { ...reqParams, ...(query?.where || {}) } });
      return { item, created: true, updated: false };
    } else {
      const [rows, [item]] = await updateOne({ model, updateParams: reqParams, filter });
      return { item, created: false, updated: true };
    }
  } catch (err) {
    logger.error('error in upsert', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Records not found');
  }
};
const getPaginated = async ({
  model,
  allowedFilters = [],
  addOnFilter = {},
  req,
  searchFilter = [],
  include = [],
  applySorting = true,
  customOrder,
  attributes,
}) => {
  const filterOptions = pick(req.query, allowedFilters);
  const searchValue = pick(req.query, ['searchText']);
  const subscribeSocket = req?.query?.subscribeSocket || false;

  const pagination = getSortAndLimit(req.query, { applySorting });
  const filter = {
    isDeleted: {
      [Op.or]: [null, false],
    },
    ...addOnFilter,
  };

  if (Object.keys(filterOptions).length) {
    filter[Op.and] = [{ ...filterOptions }];
  }
  if (Object.keys(searchValue).length && Array.isArray(searchFilter) && searchFilter.length) {
    filter[Op.and] = filter[Op.and] ? [...filter[Op.and]] : [];
    const regexFilter = [];
    searchFilter.forEach((_search) => {
      if (typeof _search !== 'object') {
        regexFilter.push({
          [_search]: {
            [Op.iLike]: `%${searchValue.searchText}%`,
          },
        });
      }
      if (_search.type === 'number' && !Number.isNaN(Number(searchValue.searchText))) {
        regexFilter.push({ [_search.field]: parseInt(searchValue.searchText, 10) });
      }

      if (_search.type === 'date') {
        regexFilter.push(
          Sequelize.where(Sequelize.fn('TO_CHAR', Sequelize.col('dob'), 'YYYY-MM-DD'), {
            [Op.iLike]: `%${searchValue.searchText}%`, // Flexible date matching
          })
        );
      }
    });
    filter[Op.and].push({
      [Op.or]: regexFilter,
    });
  }

  try {
    const query = {
      where: filter,
      ...(customOrder ? { order: customOrder } : {}),
      ...pagination,
      include,
      attributes,
    };
    const doc = await model.paginate(query);
    if (subscribeSocket) {
      // Build the _metaData object
      const _metaData = getQueryMetaData({
        filter,
        include,
        model,
        customOrder,
        pagination,
        serviceName: 'getPaginated',
        tenantId: req.clinicUuid,
        attributes,
      });
      doc._metaData = _metaData;
    }
    return doc;
  } catch (err) {
    logger.error('error in getPaginated', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Records not found');
  }
};
const getCounts = async ({ model, filter }) => {
  try {
    const docsCount = await model.count(filter);
    return docsCount;
  } catch (err) {
    logger.error('error in getCounts', err);
    throw new ApiError(httpStatus.NOT_FOUND, 'Records not found');
  }
};

const getClinicNameById = async ({ model, clinicId }) => {
  if (!clinicId) return null;
  const clinic = await model.findOne({
    where: { id: clinicId },
    attributes: ['name'],
    raw: true,
  });
  return clinic?.name || null;
};

const getRoleNamesByIds = async ({ model, roleIds = [] }) => {
  if (!Array.isArray(roleIds) || !roleIds.length) return [];
  const roles = await model.findAll({
    where: { id: roleIds },
    attributes: ['name'],
    raw: true,
  });
  return roles.map((r) => r.name);
};

const getTitleNameByTitleCode = async ({ model, titleCode }) => {
  if (!titleCode) return null;
  const title = await model.findOne({
    where: { code: titleCode },
    attributes: ['name'],
    raw: true,
  });
  return title?.name || null;
};

module.exports = {
  deleteOne,
  updateOne,
  updateById,
  createOne,
  getOneById,
  getOne,
  getAll,
  getPaginated,
  deleteMany,
  createBulk,
  upsert,
  getCounts,
  getClinicNameById,
  getRoleNamesByIds,
  getTitleNameByTitleCode,
};
